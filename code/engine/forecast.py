"""Cash forecast reconstructed from history, scheduled items and message facts."""
from __future__ import annotations

import calendar
import statistics
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date, timedelta
from decimal import Decimal

from .data import Dataset
from .facts import Fact

ZERO = Decimal("0")

NON_RECURRING_INCOME = ("commission", "bonus", "arrears", "prize", "reimbursement", "proceeds", "refund", "reversal")
# Unconfirmed variable income (gig/freelance) is never counted as future income.
GIG_INCOME = ("platform payout", "app earnings", "marketplace payout", "project payment", "contract payment",
              "milestone payment", "invoice payment", "independent work", "retainer payment")
TEMPORARY_INCOME = ("seasonal", "peak-season", "temporary assignment")
ENDED_INCOME = ("final employer", "previous employer")
PAUSED_INCOME = ("before leave",)
RECURRING_DEBIT_TYPES = ("expense", "subscription", "debt_payment")


@dataclass
class ForecastConfig:
    horizon_days: int = 85   # calibrated on sample_requests.csv (84-86 match best; see README)
    inactive_grace_days: int = 10


@dataclass
class Stream:
    key: str
    direction: str
    category: str
    kind: str                 # interval | monthly
    step: int                 # days (interval) or day-of-month (monthly)
    items: list[tuple[date, Decimal, dict]]
    currency: str
    removed: bool = False
    amount_overrides: list[tuple[date, Decimal]] = field(default_factory=list)  # from-date -> amount
    next_override: Decimal | None = None
    moved_next: date | None = None
    start_after: date | None = None

    @property
    def last_event(self) -> dict:
        return self.items[-1][2]

    def next_after(self, day: date) -> date:
        if self.kind == "interval":
            return day + timedelta(days=self.step)
        year, month = day.year, day.month + 1
        if month > 12:
            year, month = year + 1, 1
        return date(year, month, min(self.step, calendar.monthrange(year, month)[1]))


@dataclass
class Flow:
    day: date
    amount: Decimal          # signed: credit > 0, debit < 0
    label: str
    category: str
    source: str              # recurring | scheduled | pending | fact | outstanding
    stream_key: str | None = None


@dataclass
class Forecast:
    request_date: date
    end: date
    opening: Decimal
    flows: list[Flow]
    streams: dict[str, Stream]

    def lows(self, adjust: dict[str, Decimal] | None = None) -> dict[date, Decimal]:
        """End-of-day balance for every day in the window (optionally with capped stream amounts)."""
        by_day: dict[date, Decimal] = defaultdict(Decimal)
        for flow in self.flows:
            amount = flow.amount
            if adjust and flow.stream_key in adjust and amount < 0:
                amount = -min(-amount, adjust[flow.stream_key])
            by_day[flow.day] += amount
        balance = self.opening
        result: dict[date, Decimal] = {}
        day = self.request_date
        while day <= self.end:
            balance += by_day.get(day, ZERO)
            result[day] = balance
            day += timedelta(days=1)
        return result


class Forecaster:
    def __init__(self, dataset: Dataset, config: ForecastConfig | None = None):
        self.dataset = dataset
        self.config = config or ForecastConfig()

    # ----------------------------------------------------------------- helpers
    def _native(self, event: dict) -> Decimal | None:
        raw = event["amount"].strip()
        if raw:
            return Decimal(raw)
        return self.dataset.image_amounts.get(event["event_id"])

    def _home_amount(self, event: dict, home: str, on: date | None = None) -> Decimal | None:
        native = self._native(event)
        if native is None:
            return None
        when = on or date.fromisoformat(event["settlement_date"] or event["event_date"])
        return self.dataset.convert(native, event["currency"], home, when)

    @staticmethod
    def _estimate(amounts: list[Decimal], direction: str) -> Decimal:
        """Fixed amounts stay exact; variable spending uses its average, salary its typical (median) value."""
        if len(set(amounts[-4:])) == 1:
            return amounts[-1]
        if direction == "credit":
            return Decimal(str(statistics.median(amounts)))
        return sum(amounts) / len(amounts)

    # ----------------------------------------------------------------- streams
    def _detect_streams(self, events: list[dict], request_date: date, excluded: set[str], home: str) -> list[Stream]:
        groups: dict[tuple[str, str], list[tuple[date, Decimal, dict]]] = defaultdict(list)
        failed_markers: dict[str, list[date]] = defaultdict(list)
        for event in events:
            if event["status"] == "failed" and event["direction"] == "debit":
                failed_markers[event["category"]].append(date.fromisoformat(event["event_date"]))
        for event in events:
            if event["event_id"] in excluded or event["status"] != "settled":
                continue
            description = event["description"].lower()
            when = date.fromisoformat(event["settlement_date"] or event["event_date"])
            if when > request_date:
                continue
            native = self._native(event)
            if native is None:
                continue
            if event["direction"] == "debit" and event["event_type"] in RECURRING_DEBIT_TYPES:
                groups[("debit", event["category"])].append((when, native, event))
            elif event["direction"] == "credit" and event["event_type"] == "income":
                if any(word in description for word in NON_RECURRING_INCOME + GIG_INCOME):
                    continue
                groups[("credit", event["category"])].append((when, native, event))

        streams: list[Stream] = []
        for (direction, category), items in groups.items():
            items.sort(key=lambda item: item[0])
            currencies = {item[2]["currency"] or home for item in items}
            if len(currencies) == 1:
                currency = currencies.pop()
            else:
                # Mixed currencies: compare like with like by converting each item on its own date.
                currency = home
                items = [(when, self.dataset.convert(amount, event["currency"], home, when), event)
                         for when, amount, event in items]
            if direction == "debit":
                if len(items) >= 4:
                    # One-off purchases in a recurring category (e.g. a bulk shop) are not part of the pattern.
                    typical = statistics.median([item[1] for item in items])
                    items = [item for item in items if item[1] <= typical * Decimal("2.5")]
                # A failed attempt still consumed that billing period; projection resumes after it.
                last = items[-1][0]
                for failed_day in failed_markers.get(category, []):
                    if last < failed_day <= request_date:
                        marker = dict(items[-1][2], status="failed_marker", event_date=failed_day.isoformat(),
                                      settlement_date=failed_day.isoformat())
                        items.append((failed_day, items[-1][1], marker))
                every = self._interval(items)
                if every:
                    streams.append(Stream(f"debit:{category}", direction, category, "interval", every, items, currency))
                    continue
            clusters = self._clusters(items)
            for dom, cluster in clusters.items():
                if len(cluster) < 2 and not (direction == "credit" and len(clusters) == 1):
                    continue
                streams.append(Stream(f"{direction}:{category}:{dom}", direction, category, "monthly", dom,
                                      cluster, currency))
        return streams

    @staticmethod
    def _interval(items: list[tuple[date, Decimal, dict]]) -> int | None:
        dates = sorted({item[0] for item in items})
        if len(dates) < 3:
            return None
        gaps = [(right - left).days for left, right in zip(dates, dates[1:])]
        middle = statistics.median(gaps[-6:])
        if middle <= 24 and all(abs(gap - middle) <= 3 for gap in gaps[-4:]):
            return int(round(middle))
        return None

    @staticmethod
    def _clusters(items: list[tuple[date, Decimal, dict]]) -> dict[int, list[tuple[date, Decimal, dict]]]:
        """Group monthly items by their scheduled day (event_date), tolerating short-month clamping."""
        clusters: dict[int, list] = defaultdict(list)
        for item in items:
            day = date.fromisoformat(item[2]["event_date"]).day if item[2].get("event_date") else item[0].day
            anchor = next((existing for existing in clusters if abs(existing - day) <= 2), day)
            clusters[anchor].append(item)
        # A cluster projects from the day its latest payment actually settled (e.g. a moved payday).
        return {cluster[-1][0].day: cluster for cluster in clusters.values()}

    # ----------------------------------------------------------------- build
    def build(self, request: dict[str, str]) -> Forecast:
        user = request["user_id"]
        profile = self.dataset.profiles[user]
        home = profile["home_currency"]
        request_date = date.fromisoformat(request["request_date"])
        end = request_date + timedelta(days=self.config.horizon_days)
        events = self.dataset.events_by_user.get(user, [])
        facts = [f for f in self.dataset.facts_by_user.get(user, [])
                 if f.sent_at <= request_date and (not f.request_id or f.request_id == request["request_id"])]

        excluded = self._internal_transfers(events) if any(f.kind == "internal_transfer" for f in facts) else set()
        streams = self._detect_streams(events, request_date, excluded, home)
        flows: list[Flow] = []
        explicit: list[tuple[str, str, date]] = []

        # Scheduled records land on their date; pending debits are reserved today; pending credits are ignored.
        linked_failed = {e["linked_event_id"] for e in events if e["status"] == "scheduled" and e["linked_event_id"]}
        for event in events:
            status = event["status"]
            if status not in ("pending", "scheduled") or event["direction"] not in ("debit", "credit"):
                continue
            if "duplicate" in event["description"].lower() or (event["direction"] == "credit" and status == "pending"):
                continue
            when = date.fromisoformat(event["settlement_date"] or event["event_date"])
            amount = self._home_amount(event, home, when)
            if amount is None:
                continue
            if status == "pending" or when < request_date:
                when = request_date
            if when > end:
                continue
            sign = Decimal("1") if event["direction"] == "credit" else Decimal("-1")
            flows.append(Flow(when, sign * amount, event["description"], event["category"], status))
            explicit.append((event["direction"], event["category"], when))
            if event["direction"] == "credit" and event["event_type"] == "income":
                self._anchor_salary(streams, event, when)

        # Failed debits that a message says are still outstanding
        for fact in facts:
            if fact.kind == "failed_debit_outstanding" and fact.related_event_id not in linked_failed:
                event = self.dataset.events_by_id.get(fact.related_event_id)
                if event and event["status"] == "failed":
                    amount = self._home_amount(event, home)
                    if amount is not None:
                        flows.append(Flow(request_date, -amount, event["description"], event["category"], "outstanding"))

        self._apply_facts(streams, facts, request_date, flows, home)

        for stream in streams:
            if not stream.removed:
                flows.extend(self._project(stream, request_date, end, home, explicit))

        opening = Decimal(profile["current_available_balance"])
        return Forecast(request_date, end, opening, sorted(flows, key=lambda f: f.day), {s.key: s for s in streams})

    @staticmethod
    def _anchor_salary(streams: list[Stream], event: dict, when: date) -> None:
        salary = [s for s in streams if s.direction == "credit" and s.category == event["category"]]
        if not salary:
            return
        target = min(salary, key=lambda s: min(abs(when.day - s.step), 31 - abs(when.day - s.step)))
        target.items.append((when, Decimal(event["amount"] or "0"), event))
        target.items.sort(key=lambda item: item[0])
        if target.kind == "monthly":
            target.step = when.day

    @staticmethod
    def _internal_transfers(events: list[dict]) -> set[str]:
        excluded: set[str] = set()
        settled = [e for e in events if e["status"] == "settled" and e["amount"]]
        for debit in settled:
            if debit["direction"] != "debit":
                continue
            for credit in settled:
                if credit["direction"] == "credit" and credit["amount"] == debit["amount"] and \
                        abs((date.fromisoformat(credit["event_date"]) - date.fromisoformat(debit["event_date"])).days) <= 3:
                    excluded.update({debit["event_id"], credit["event_id"]})
        return excluded

    @staticmethod
    def _primary_salary(streams: list[Stream]) -> Stream | None:
        salary = [s for s in streams if s.direction == "credit" and not s.removed]
        if not salary:
            return None
        return max(salary, key=lambda s: (len(s.items), s.items[-1][1]))

    def _apply_facts(self, streams: list[Stream], facts: list[Fact], request_date: date,
                     flows: list[Flow], home: str) -> None:
        for fact in sorted(facts, key=lambda f: f.sent_at):
            primary = self._primary_salary(streams)
            kind = fact.kind
            if kind in ("employment_ended", "contract_ended"):
                for stream in streams:
                    if stream.direction == "credit":
                        stream.removed = True
            elif kind == "household_income_ended" and primary:
                for stream in streams:
                    if stream.direction == "credit" and stream is not primary:
                        stream.removed = True
                if fact.amount:
                    primary.amount_overrides.append((request_date, fact.amount))
            elif kind == "salary_increase" and primary and fact.amount:
                # An explicit amendment with an effective date wins over history.
                primary.amount_overrides.append((fact.effective_date or request_date, fact.amount))
            elif kind == "base_salary_only" and primary and fact.amount:
                # A restatement that conflicts with settled payroll: keep the financially safer amount.
                settled = Decimal(str(statistics.median([item[1] for item in primary.items])))
                primary.amount_overrides.append((request_date, min(fact.amount, settled)))
            elif kind in ("next_salary_reduced", "temporary_pay") and primary and fact.amount:
                primary.next_override = fact.amount
            elif kind == "regular_salary_with_arrears" and primary and fact.amount:
                primary.next_override = fact.amount + (fact.second_amount or ZERO)
                primary.amount_overrides.append((request_date, fact.amount))
            elif kind == "salary_date_change" and primary and fact.effective_date:
                primary.moved_next = fact.effective_date
            elif kind == "salary_resumes" and fact.amount and fact.effective_date:
                if primary:
                    primary.amount_overrides.append((fact.effective_date, fact.amount))
                    primary.start_after = fact.effective_date - timedelta(days=1)
                    primary.removed = False
                else:
                    self._add_confirmed_salary(streams, fact, flows, home)
            elif kind in ("first_salary", "foreign_salary_confirmed") and fact.amount and fact.effective_date:
                self._add_confirmed_salary(streams, fact, flows, home, replace=primary)
            elif kind == "invoice_approved" and fact.amount and fact.effective_date:
                amount = self.dataset.convert(fact.amount, fact.currency or home, home, fact.effective_date)
                flows.append(Flow(fact.effective_date, amount, "Approved invoice payment", "income", "fact"))
            elif kind == "rent_increase" and fact.percent:
                for stream in streams:
                    if stream.direction == "debit" and stream.category in ("rent", "housing"):
                        base = stream.items[-1][1]
                        stream.amount_overrides.append(
                            (request_date, (base * (1 + fact.percent / 100)).quantize(Decimal("0.01"))))

    def _add_confirmed_salary(self, streams: list[Stream], fact: Fact, flows: list[Flow], home: str,
                              replace: Stream | None = None) -> None:
        if replace is not None:
            replace.moved_next = fact.effective_date
            replace.next_override = fact.amount
            replace.amount_overrides.append((fact.effective_date, fact.amount))
            replace.currency = fact.currency or replace.currency
            replace.removed = False
            return
        amount = self.dataset.convert(fact.amount, fact.currency or home, home, fact.effective_date)
        flows.append(Flow(fact.effective_date, amount, "Confirmed salary", "salary", "fact"))
        anchor = {"event_id": f"fact:{fact.message_id}", "currency": fact.currency or home,
                  "description": "Confirmed salary", "category": "salary", "flexibility": "fixed",
                  "minimum_allowed_amount": "", "amount": str(fact.amount)}
        streams.append(Stream(f"credit:salary:fact:{fact.message_id}", "credit", "salary", "monthly",
                              fact.effective_date.day, [(fact.effective_date, fact.amount, anchor)],
                              fact.currency or home, start_after=fact.effective_date))

    # ----------------------------------------------------------------- projection
    def _project(self, stream: Stream, request_date: date, end: date, home: str,
                 explicit: list[tuple[str, str, date]]) -> list[Flow]:
        last_day = stream.items[-1][0]
        cadence = stream.step if stream.kind == "interval" else 31
        if stream.start_after is None and (request_date - last_day).days > cadence + self.config.inactive_grace_days:
            return []
        description = stream.last_event["description"].lower()
        if stream.direction == "credit":
            if any(word in description for word in ENDED_INCOME + PAUSED_INCOME) and stream.start_after is None:
                return []
            if any(word in description for word in TEMPORARY_INCOME):
                return []

        natives = [item[1] for item in stream.items if item[2].get("status") not in ("scheduled", "failed_marker")] or \
                  [item[1] for item in stream.items]
        base = self._estimate(natives, stream.direction)
        if stream.direction == "credit" and stream.items[-1][2].get("status") == "scheduled":
            base = stream.items[-1][1]

        if stream.start_after and stream.start_after >= last_day:
            nxt = (stream.start_after + timedelta(days=stream.step)) if stream.kind == "interval" \
                else self._same_or_next(stream, stream.start_after)
        else:
            nxt = stream.next_after(last_day)
        dates: list[date] = []
        while nxt <= end:
            if nxt >= request_date:
                dates.append(nxt)
            nxt = stream.next_after(nxt)

        flows: list[Flow] = []
        sign = Decimal("1") if stream.direction == "credit" else Decimal("-1")
        for index, day in enumerate(dates):
            amount = base
            for start, value in sorted(stream.amount_overrides):
                if day >= start:
                    amount = value
            if index == 0:
                if stream.next_override is not None:
                    amount = stream.next_override
                if stream.moved_next is not None:
                    day = stream.moved_next
            if day > end or any(d == stream.direction and c == stream.category and abs((w - day).days) <= 5
                                for d, c, w in explicit):
                continue
            home_amount = self.dataset.convert(amount, stream.currency, home, day)
            flows.append(Flow(day, sign * home_amount, stream.last_event["description"],
                              stream.category, "recurring", stream.key))
        return flows

    @staticmethod
    def _same_or_next(stream: Stream, day: date) -> date:
        candidate = date(day.year, day.month, min(stream.step, calendar.monthrange(day.year, day.month)[1]))
        return candidate if candidate > day else stream.next_after(candidate)
