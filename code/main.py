from __future__ import annotations

import csv
from pathlib import Path

from engine import gemini
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
    usage = gemini.USAGE.as_dict()
    print(f"Gemini ({usage['model']}): {usage['calls']} calls, {usage['cache_hits']} cache hits, "
          f"{usage['input_tokens']} input + {usage['output_tokens']} output tokens")
    return output_path


if __name__ == "__main__":
    run()
