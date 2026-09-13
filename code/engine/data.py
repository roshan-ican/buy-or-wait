from __future__ import annotations

import csv
from collections import defaultdict
from datetime import date
from decimal import Decimal
from pathlib import Path
from typing import Iterable

from .facts import Fact, interpret
from .images import resolve_image_amounts


class Dataset:
    def __init__(self, dataset_dir: Path):
        self.dataset_dir = dataset_dir
        self.profiles = self._index(self._read("financial_profiles.csv"), "user_id")
        self.requests = self._index(self._read("requests.csv"), "request_id")
        self.events_by_user = self._group(self._read("financial_events.csv"), "user_id")
        self.events_by_id = {e["event_id"]: e for events in self.events_by_user.values() for e in events}
        self.options_by_request = self._group(self._read("request_payment_options.csv"), "request_id")
        self.messages = self._read("messages.csv")
        self.facts_by_user: dict[str, list[Fact]] = defaultdict(list)
        for message in self.messages:
            self.facts_by_user[message["user_id"]].append(interpret(message))
        self.images = self._read("images.csv")
        self.image_amounts = resolve_image_amounts(dataset_dir, self.images)
        self.rates: dict[tuple[str, str], list[tuple[date, Decimal]]] = defaultdict(list)
        for row in self._read("exchange_rates.csv"):
            self.rates[(row["from_currency"], row["to_currency"])].append(
                (date.fromisoformat(row["rate_date"]), Decimal(row["rate"]))
            )
        for series in self.rates.values():
            series.sort()

    def convert(self, amount: Decimal, currency: str, home: str, on: date) -> Decimal:
        """Convert with the rate dated on `on` (latest earlier rate if that exact date is missing)."""
        if not currency or currency == home:
            return amount
        direct = self._rate(currency, home, on)
        if direct is not None:
            return amount * direct
        inverse = self._rate(home, currency, on)
        if inverse is not None:
            return amount / inverse
        raise KeyError(f"No exchange rate {currency}->{home} on or before {on}")

    def _rate(self, source: str, target: str, on: date) -> Decimal | None:
        best = None
        for rate_date, rate in self.rates.get((source, target), []):
            if rate_date <= on:
                best = rate
            else:
                break
        if best is None and self.rates.get((source, target)):
            best = self.rates[(source, target)][0][1]
        return best

    def _read(self, name: str) -> list[dict[str, str]]:
        path = self.dataset_dir / name
        if not path.exists():
            return []
        with path.open(newline="", encoding="utf-8") as handle:
            return list(csv.DictReader(handle))

    @staticmethod
    def _index(rows: Iterable[dict[str, str]], key: str) -> dict[str, dict[str, str]]:
        return {row[key]: row for row in rows}

    @staticmethod
    def _group(rows: Iterable[dict[str, str]], key: str) -> dict[str, list[dict[str, str]]]:
        grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
        for row in rows:
            grouped[row[key]].append(row)
        return dict(grouped)
