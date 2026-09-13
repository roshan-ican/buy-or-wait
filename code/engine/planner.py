"""Plan selection, spending changes and the short explanation, per the challenge rules."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, timedelta
from decimal import ROUND_DOWN, Decimal
from itertools import combinations

from .forecast import Forecast, Stream

ZERO = Decimal("0")
CENT = Decimal("0.01")


@dataclass
class Change:
    action: str               # stop | reduce_to
    stream_key: str
    event_id: str
    new_amount: Decimal       # 0 for stop
    saving_per_payment: Decimal
    label: str

    def token(self) -> str:
        if self.action == "stop":
            return f"stop:{self.event_id}"
        return f"reduce_to:{self.event_id}:{plain(self.new_amount)}"


@dataclass
class Plan:
    method: str
    payments: list[tuple[date, Decimal]]
    total: Decimal
    option_id: str = ""
    changes: list[Change] = field(default_factory=list)


def plain(value: Decimal) -> str:
    value = value.quantize(CENT, rounding=ROUND_DOWN)
    return f"{value:.2f}" if value != value.to_integral_value() else str(int(value))


def money(value: Decimal) -> str:
    value = value.quantize(CENT, rounding=ROUND_DOWN)
    if value == value.to_integral_value():
        return f"{int(value):,}"
    return f"{value:,.2f}"


def trimmed(value: Decimal) -> str:
    value = value.quantize(CENT, rounding=ROUND_DOWN)
    text = format(value.normalize(), "f")
    return text


def long_date(day: date) -> str:
    return f"{day.day} {day.strftime('%B')} {day.year}"


def short_reason(result: dict[str, str], currency: str, minimum: str) -> str:
    """One-line 'why' for a decision row, derived only from the decision fields."""
    status = result["affordability_status"]
    method = result["recommended_payment_method"]
    earliest = result["earliest_date_for_full_payment"]
    floor = f"{currency} {money(Decimal(minimum))}"
    if status == "affordable_now":
        return f"OK: paying today still keeps your {floor} minimum."
    if status == "affordable_later":
        return f"Better wait: a full payment is only safe from {long_date(date.fromisoformat(earliest))}."
    if status == "not_affordable":
        return f"Not OK: no option keeps your {floor} minimum within the forecast."
    if result["spending_changes_needed"] != "none":
        count = len(result["spending_changes_needed"].split("|"))
        return f"OK with changes: cut {count} flexible expense{'s' if count > 1 else ''} first to protect {floor}."
    if method == "partial_payment":
        return f"OK in two parts: only {currency} {money(Decimal(result['amount_safe_to_pay']))} is safe today."
    return f"OK with a plan: one payment breaks your {floor} minimum, installments do not."


class Planner:
    def __init__(self, request: dict, profile: dict, options: list[dict], forecast: Forecast):
        self.request = request
        self.profile = profile
        self.options = options
        self.forecast = forecast
        self.amount = Decimal(request["requested_amount"])
        self.floor = Decimal(profile["minimum_balance_to_keep"])
        self.currency = profile["home_currency"]
        self.start = date.fromisoformat(request["request_date"])
        self.deadline = date.fromisoformat(request["desired_completion_date"])
        self.accepted = set(filter(None, profile["payment_methods_user_will_consider"].split("|")))
        self.max_months = int(profile["max_installment_months"] or 0)
        self.allows_partial = request["allows_partial_payment"].strip().lower() == "true"
        self.base_lows = forecast.lows()

    # ------------------------------------------------------------- safety
    def safe(self, payments: list[tuple[date, Decimal]], lows: dict[date, Decimal]) -> bool:
        ordered = sorted(payments)
        paid = ZERO
        index = 0
        for day in sorted(lows):
            while index < len(ordered) and ordered[index][0] <= day:
                paid += ordered[index][1]
                index += 1
            if lows[day] - paid < self.floor:
                return False
        return all(when <= self.forecast.end for when, _ in ordered)

    def safe_now(self) -> Decimal:
        headroom = min(self.base_lows.values()) - self.floor
        return max(ZERO, min(self.amount, headroom)).quantize(CENT, rounding=ROUND_DOWN)

    def earliest_full(self) -> date | None:
        days = sorted(self.base_lows)
        suffix_min: dict[date, Decimal] = {}
        running = None
        for day in reversed(days):
            running = self.base_lows[day] if running is None else min(running, self.base_lows[day])
            suffix_min[day] = running
        for day in days:
            if suffix_min[day] - self.amount >= self.floor:
                return day
        return None

    # ------------------------------------------------------------- candidates
    def candidates(self, lows: dict[date, Decimal], safe_now: Decimal, earliest: date | None,
                   changes: list[Change]) -> list[Plan]:
        plans: list[Plan] = []
        if "full_payment" in self.accepted and self.safe([(self.start, self.amount)], lows):
            plans.append(Plan("full_payment", [(self.start, self.amount)], self.amount, changes=changes))
        if "installments" in self.accepted and self.max_months:
            for option in self.options:
                if option["payment_method"] != "installments":
                    continue
                count = int(option["number_of_payments"])
                if count > self.max_months:
                    continue
                first = date.fromisoformat(option["first_payment_date"])
                every = int(option["payment_frequency_days"] or 30)
                each = Decimal(option["payment_amount"])
                schedule = [(first + timedelta(days=every * i), each) for i in range(count)]
                if schedule[-1][0] > self.deadline or not self.safe(schedule, lows):
                    continue
                plans.append(Plan("installments", schedule, Decimal(option["total_payable_amount"]),
                                  option["payment_option_id"], changes))
        if not changes:
            if ("partial_payment" in self.accepted and self.allows_partial and ZERO < safe_now < self.amount
                    and earliest and earliest <= self.deadline):
                schedule = [(self.start, safe_now), (earliest, self.amount - safe_now)]
                if earliest > self.start and self.safe(schedule, lows):
                    plans.append(Plan("partial_payment", schedule, self.amount))
            if "full_payment" in self.accepted and earliest and self.start < earliest <= self.deadline:
                plans.append(Plan("wait", [(earliest, self.amount)], self.amount))
        return plans

    @staticmethod
    def rank(plan: Plan):
        return (len(plan.changes) > 0, plan.total, plan.payments[0][0], len(plan.payments), plan.option_id)

    # ------------------------------------------------------------- spending changes
    def change_options(self) -> list[Change]:
        protect = set(filter(None, self.profile["expense_categories_to_protect"].split("|")))
        can_reduce = set(filter(None, self.profile["expense_categories_user_is_willing_to_reduce"].split("|")))
        can_stop = set(filter(None, self.profile["expense_categories_user_is_willing_to_stop"].split("|")))
        options: list[Change] = []
        projected = {flow.stream_key for flow in self.forecast.flows if flow.stream_key}
        for key, stream in self.forecast.streams.items():
            if stream.direction != "debit" or stream.removed or key not in projected:
                continue
            event = stream.last_event
            flexibility = event.get("flexibility", "fixed")
            if stream.category in protect or flexibility == "fixed":
                continue
            per_payment = max((-f.amount for f in self.forecast.flows if f.stream_key == key), default=ZERO)
            label = event["description"].strip()
            if "stoppable" in flexibility and stream.category in can_stop:
                options.append(Change("stop", key, event["event_id"], ZERO, per_payment, label))
            minimum = event.get("minimum_allowed_amount", "").strip()
            if "reducible" in flexibility and stream.category in can_reduce and minimum:
                new_amount = Decimal(minimum)
                if new_amount < per_payment:
                    options.append(Change("reduce_to", key, event["event_id"], new_amount,
                                          per_payment - new_amount, label))
        return options

    def with_changes(self, changes: list[Change]) -> dict[date, Decimal]:
        adjust = {c.stream_key: c.new_amount for c in changes}
        return self.forecast.lows(adjust)

    # ------------------------------------------------------------- decide
    def decide(self) -> dict[str, str]:
        safe_now = self.safe_now()
        earliest = self.earliest_full()
        plans = self.candidates(self.base_lows, safe_now, earliest, [])
        if not plans:
            options = self.change_options()
            ranked_sets = []
            for size in (1, 2, 3):
                for combo in combinations(options, size):
                    if len({c.stream_key for c in combo}) < size:
                        continue
                    lows = self.with_changes(list(combo))
                    total_cut = sum((self._total_cut(c) for c in combo), ZERO)
                    for plan in self.candidates(lows, safe_now, earliest, list(combo)):
                        ranked_sets.append((total_cut, size, self.rank(plan), [c.event_id for c in combo], plan))
            if ranked_sets:
                ranked_sets.sort(key=lambda item: (item[0], item[1], item[2], item[3]))
                plans = [ranked_sets[0][4]]
        best = min(plans, key=self.rank) if plans else None
        return self._output(best, safe_now, earliest)

    def _total_cut(self, change: Change) -> Decimal:
        flows = [f for f in self.forecast.flows if f.stream_key == change.stream_key]
        return sum((min(-f.amount, -f.amount - change.new_amount) if change.action == "reduce_to" else -f.amount
                    for f in flows), ZERO)

    def _output(self, plan: Plan | None, safe_now: Decimal, earliest: date | None) -> dict[str, str]:
        if plan is None:
            method, status, schedule, changes = "not_recommended", "not_affordable", "none", "none"
        else:
            method = plan.method
            if method == "full_payment" and not plan.changes:
                status = "affordable_now"
            elif method == "wait":
                status = "affordable_later"
            else:
                status = "affordable_with_plan"
            schedule = "|".join(f"{d.isoformat()}:{plain(a)}" for d, a in plan.payments)
            changes = "|".join(c.token() for c in plan.changes) or "none"
        return {
            "request_id": self.request["request_id"],
            "amount_safe_to_pay": trimmed(safe_now),
            "affordability_status": status,
            "recommended_payment_method": method,
            "payment_plan": schedule,
            "earliest_date_for_full_payment": earliest.isoformat() if earliest else "",
            "spending_changes_needed": changes,
            "decision_explanation": self._explain(plan, safe_now),
        }

    def _explain(self, plan: Plan | None, safe_now: Decimal) -> str:
        cur, floor = self.currency, money(self.floor)
        if plan is None:
            only_partial = self.accepted == {"partial_payment"} and self.allows_partial and safe_now > 0
            if only_partial:
                return (f"Do not proceed with the {cur} {money(self.amount)} request. Although {cur} "
                        f"{money(safe_now)} is available today, the full amount cannot be completed safely within 90 days.")
            return (f"Do not make this payment by {long_date(self.deadline)}. None of the available options keeps "
                    f"the {cur} {floor} minimum protected.")
        if plan.method == "full_payment" and not plan.changes:
            return f"Pay {cur} {money(self.amount)} today. This leaves at least {cur} {floor} available over the next 90 days."
        prefix = ""
        if plan.changes:
            steps = []
            for change in plan.changes:
                label = change.label[0].lower() + change.label[1:]
                steps.append(f"stop the {label}" if change.action == "stop"
                             else f"reduce the {label} to {cur} {money(change.new_amount)}")
            joined = ", ".join(steps[:-1]) + (" and " if len(steps) > 1 else "") + steps[-1]
            prefix = f"{joined[0].upper()}{joined[1:]}, then "
        if plan.method == "full_payment":
            return (f"{prefix}pay {cur} {money(self.amount)} today. "
                    f"This leaves at least {cur} {floor} available.")
        if plan.method == "installments":
            first_day, each = plan.payments[0]
            lead = f"{prefix}use" if prefix else "Use"
            return (f"{lead} {len(plan.payments)} installments of {cur} {money(each)}, starting {long_date(first_day)}. "
                    f"This leaves at least {cur} {floor} available.")
        if plan.method == "partial_payment":
            (_, now), (later_day, later) = plan.payments
            return (f"Pay {cur} {money(now)} today and the remaining {cur} {money(later)} on {long_date(later_day)}. "
                    f"This completes the full request and keeps the {cur} {floor} minimum protected.")
        day = plan.payments[0][0]
        return (f"Pay {cur} {money(self.amount)} in full on {long_date(day)}. Paying earlier would take the balance "
                f"below the {cur} {floor} minimum.")
