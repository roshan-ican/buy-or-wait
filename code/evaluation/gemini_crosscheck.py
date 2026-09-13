"""Cross-check the deterministic evidence readers with Gemini.

- Messages: Gemini labels every message independently; compared with the phrase-rule kind.
- Images: Gemini reads every image; compared with the reviewed amount cache.

Disagreements are written to ``evaluation/gemini_crosscheck.json`` for review. Responses are cached in
``engine/cache/gemini`` so a rerun spends no tokens. Needs GEMINI_API_KEY (environment or repo-root .env).

Usage (from the repo root):  python3 code/evaluation/gemini_crosscheck.py
"""
from __future__ import annotations

import csv
import json
import sys
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "code"))

from engine import gemini  # noqa: E402
from engine.facts import classify, classify_many_with_gemini  # noqa: E402
from engine.images import gemini_amount, load_cache  # noqa: E402

BATCH = 25
REPORT = Path(__file__).resolve().parent / "gemini_crosscheck.json"


def main() -> int:
    if not gemini.enabled():
        print("GEMINI_API_KEY is not set; nothing to cross-check.")
        return 1
    messages = list(csv.DictReader(open(ROOT / "dataset" / "messages.csv", encoding="utf-8")))
    images = list(csv.DictReader(open(ROOT / "dataset" / "images.csv", encoding="utf-8")))
    events = {e["event_id"]: e for e in csv.DictReader(open(ROOT / "dataset" / "financial_events.csv", encoding="utf-8"))}

    labels: list[dict | None] = []
    for start in range(0, len(messages), BATCH):
        labels.extend(classify_many_with_gemini([m["message_text"] for m in messages[start:start + BATCH]]))
    message_rows = []
    for message, label in zip(messages, labels):
        rule = classify(message["message_text"])
        got = (label or {}).get("kind")
        message_rows.append({"message_id": message["message_id"], "rules": rule, "gemini": got, "agree": rule == got,
                             "text": message["message_text"][:160]})

    cache = load_cache()

    def read(image: dict[str, str]):
        event = events.get(image["related_event_id"], {})
        context = ", ".join(filter(None, (event.get("description"), event.get("category"), event.get("currency"))))
        path = ROOT / "dataset" / "media" / "images" / f"{image['image_id']}.png"
        return gemini_amount(path.read_bytes(), context) if path.exists() else None

    amounts = [read(image) for image in images]
    image_rows = []
    for image, amount in zip(images, amounts):
        reviewed = cache.get(image["image_id"], {}).get("amount")
        agree = amount is not None and reviewed is not None and Decimal(str(reviewed)) == amount
        image_rows.append({"image_id": image["image_id"], "reviewed": reviewed,
                           "gemini": str(amount) if amount is not None else None, "agree": agree})

    summary = {
        "messages": {"total": len(message_rows), "agree": sum(r["agree"] for r in message_rows)},
        "images": {"total": len(image_rows), "agree": sum(r["agree"] for r in image_rows)},
        "usage": gemini.USAGE.as_dict(),
    }
    REPORT.write_text(json.dumps({
        "summary": summary,
        "message_disagreements": [r for r in message_rows if not r["agree"]],
        "images": image_rows,
    }, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))
    if gemini.LAST_ERROR[0]:
        print("Last API error:", gemini.LAST_ERROR[0])
    print(f"Details: {REPORT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
