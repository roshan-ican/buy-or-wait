"""Check output.csv against the hard rules in problem_statement.md (no labels needed).

Usage (from the repo root):  python3 code/evaluation/validate_output.py [path/to/output.csv]
"""
from __future__ import annotations

import csv
import sys
from collections import Counter
from datetime import date
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STATUSES = {"affordable_now", "affordable_with_plan", "affordable_later", "not_affordable"}
METHODS = {"full_payment", "partial_payment", "installments", "wait", "not_recommended"}


def main(path: Path) -> int:
    requests = {r["request_id"]: r for r in csv.DictReader(open(ROOT / "dataset" / "requests.csv", encoding="utf-8"))}
    options = {}
    for o in csv.DictReader(open(ROOT / "dataset" / "request_payment_options.csv", encoding="utf-8")):
        options.setdefault(o["request_id"], []).append(o)
    rows = list(csv.DictReader(open(path, encoding="utf-8")))
    problems: list[str] = []
    if {r["request_id"] for r in rows} != set(requests):
        problems.append("request_id set does not match requests.csv")
    for row in rows:
        rid = row["request_id"]
        req = requests[rid]
        amount = Decimal(req["requested_amount"])
        safe = Decimal(row["amount_safe_to_pay"])
        status, method = row["affordability_status"], row["recommended_payment_method"]
        plan = [] if row["payment_plan"] == "none" else [
            (date.fromisoformat(p.split(":")[0]), Decimal(p.split(":")[1])) for p in row["payment_plan"].split("|")]
        if not Decimal(0) <= safe <= amount:
            problems.append(f"{rid}: amount_safe_to_pay out of range")
        if status not in STATUSES or method not in METHODS:
            problems.append(f"{rid}: invalid status/method")
        if plan != sorted(plan):
            problems.append(f"{rid}: plan not chronological")
        if status == "affordable_now" and row["earliest_date_for_full_payment"] != req["request_date"]:
            problems.append(f"{rid}: affordable_now must have earliest == request_date")
        if method == "not_recommended" and (plan or status != "not_affordable"):
            problems.append(f"{rid}: not_recommended must have no plan and not_affordable")
        if method == "partial_payment":
            if status != "affordable_with_plan" or len(plan) != 2 or sum(a for _, a in plan) != amount \
                    or plan[0][1] != safe or plan[1][0].isoformat() != row["earliest_date_for_full_payment"] \
                    or plan[1][0] > date.fromisoformat(req["desired_completion_date"]):
                problems.append(f"{rid}: partial_payment rules violated")
        if method == "installments":
            match = any(len(plan) == int(o["number_of_payments"]) and plan[0][0].isoformat() == o["first_payment_date"]
                        and all(a == Decimal(o["payment_amount"]) for _, a in plan)
                        for o in options.get(rid, []) if o["payment_method"] == "installments")
            if not match:
                problems.append(f"{rid}: installments do not match a supplied option")
        changes = row["spending_changes_needed"]
        if changes != "none" and len(changes.split("|")) > 3:
            problems.append(f"{rid}: more than three spending changes")
        if not row["decision_explanation"].strip():
            problems.append(f"{rid}: empty explanation")
    print(f"rows: {len(rows)}")
    print("status:", dict(Counter(r["affordability_status"] for r in rows)))
    print("method:", dict(Counter(r["recommended_payment_method"] for r in rows)))
    print("with spending changes:", sum(r["spending_changes_needed"] != "none" for r in rows))
    print(f"rule violations: {len(problems)}")
    for problem in problems:
        print("  -", problem)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "output.csv"))
