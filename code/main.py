from __future__ import annotations

import csv
from pathlib import Path

from engine.evaluator import OUTPUT_COLUMNS, default_engine


def run() -> Path:
    repo_root = Path(__file__).resolve().parent.parent
    output_path = repo_root / "output.csv"
    engine = default_engine()
    requests = list(engine.dataset.requests.values())
    results = []
    for index, request in enumerate(requests, start=1):
        result = engine.evaluate_row(request)
        results.append(result)
        print(f"[{index}/{len(requests)}] {request['request_id']}: {result['affordability_status']}")
    with output_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=OUTPUT_COLUMNS)
        writer.writeheader()
        writer.writerows(results)
    print(f"Wrote {len(results)} decisions to {output_path}")
    return output_path


if __name__ == "__main__":
    run()
