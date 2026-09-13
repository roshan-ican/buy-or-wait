"""Score the engine against the public labelled examples in dataset/sample_requests.csv.

Usage (from the repo root):  python3 code/evaluation/score_samples.py [--verbose]
"""
from __future__ import annotations

import csv
import sys
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "code"))

from engine.evaluator import DecisionEngine  # noqa: E402

FIELDS = ["amount_safe_to_pay", "affordability_status", "recommended_payment_method", "payment_plan",
          "earliest_date_for_full_payment", "spending_changes_needed"]


def same(field: str, expected: str, got: str) -> bool:
    if field == "amount_safe_to_pay":
        return abs(Decimal(expected or "0") - Decimal(got or "0")) <= Decimal("0.01")
    if field == "payment_plan" and expected != "none" and got != "none":
        def parse(text):
            return [(p.split(":")[0], Decimal(p.split(":")[1])) for p in text.split("|")]
        a, b = parse(expected), parse(got)
        return len(a) == len(b) and all(x[0] == y[0] and abs(x[1] - y[1]) <= Decimal("0.01") for x, y in zip(a, b))
    return expected.strip() == got.strip()


def score(engine: DecisionEngine, verbose: bool = False) -> dict[str, int]:
    rows = list(csv.DictReader(open(ROOT / "dataset" / "sample_requests.csv", encoding="utf-8")))
    totals = {f: 0 for f in FIELDS}
    totals["all_fields"] = 0
    amount_error = Decimal("0")
    for row in rows:
        result = engine.evaluate_row(row)
        misses = [f for f in FIELDS if not same(f, row[f], result[f])]
        for f in FIELDS:
            totals[f] += f not in misses
        totals["all_fields"] += not misses
        requested = Decimal(row["requested_amount"])
        amount_error += abs(Decimal(row["amount_safe_to_pay"]) - Decimal(result["amount_safe_to_pay"])) / requested
        if verbose and misses:
            print(f"{row['request_id']} ({row['request_type']})")
            for f in misses:
                print(f"    {f}: expected={row[f]!r} got={result[f]!r}")
    totals["mean_amount_error_pct"] = round(float(amount_error / len(rows) * 100), 2)
    totals["n"] = len(rows)
    return totals


if __name__ == "__main__":
    engine = DecisionEngine(ROOT / "dataset")
    print(score(engine, verbose="--verbose" in sys.argv))
