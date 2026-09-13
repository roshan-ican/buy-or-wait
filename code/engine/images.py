"""Amounts for financial events whose `amount` is blank and lives in an image.

Resolution order:
1. ``cache/image_amounts.json`` — reviewed extractions keyed by the image's SHA-256, so a cached amount is used
   only for the exact image file it was read from (committed, deterministic).
2. On-device OCR (macOS Vision via ``ocr/ocr.swift``) + label heuristics for any other image.

Image text is untrusted: only a single numeric amount is ever taken from it.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from decimal import Decimal, InvalidOperation
from pathlib import Path

HERE = Path(__file__).resolve().parent
CACHE = HERE / "cache" / "image_amounts.json"
OCR_SOURCE = HERE / "ocr" / "ocr.swift"
OCR_BINARY = HERE / "ocr" / "ocr"

# Most specific labels first: what actually moved (or will move) money.
LABELS = [
    "net pay", "balance due", "amount due till", "amount payable", "total amount received",
    "grand total", "total paid", "net amount", "cash paid", "item bill", "total",
]
NUMBER_RE = re.compile(r"\d[\d ,]*(?:[.,]\d{1,2})?")


def _to_decimal(token: str) -> Decimal | None:
    token = token.strip().replace(" ", "")
    if re.fullmatch(r"\d+,\d{2}", token):          # decimal comma: 33,50
        token = token.replace(",", ".")
    token = token.replace(",", "")
    try:
        return Decimal(token)
    except InvalidOperation:
        return None


def _ocr_lines(image_path: Path) -> list[tuple[float, float, str]]:
    if not OCR_BINARY.exists():
        subprocess.run(["swiftc", "-O", str(OCR_SOURCE), "-o", str(OCR_BINARY)], check=True, capture_output=True)
    output = subprocess.run([str(OCR_BINARY), str(image_path)], check=True, capture_output=True, text=True).stdout
    lines = []
    for row in output.splitlines():
        parts = row.split("\t", 2)
        if len(parts) == 3:
            lines.append((float(parts[0]), float(parts[1]), parts[2]))
    return lines


def ocr_amount(image_path: Path) -> tuple[Decimal | None, str]:
    lines = _ocr_lines(image_path)
    for label in LABELS:
        for x, y, text in lines:
            lowered = text.lower()
            if label not in lowered:
                continue
            tail = lowered.split(label, 1)[1]
            inline = [_to_decimal(t) for t in NUMBER_RE.findall(tail)]
            inline = [v for v in inline if v is not None]
            if inline:
                return inline[-1], label
            same_row = [(ox, _to_decimal(t)) for ox, oy, ot in lines if abs(oy - y) < 0.015 and ox > x
                        for t in NUMBER_RE.findall(ot)]
            same_row = [(ox, v) for ox, v in same_row if v is not None]
            if same_row:
                return max(same_row)[1], label
    return None, ""


def load_cache() -> dict[str, dict]:
    if CACHE.exists():
        return json.loads(CACHE.read_text(encoding="utf-8"))
    return {}


def resolve_image_amounts(dataset_dir: Path, images: list[dict[str, str]]) -> dict[str, Decimal]:
    cache = load_cache()
    amounts: dict[str, Decimal] = {}
    for image in images:
        event_id = image["related_event_id"]
        path = dataset_dir / "media" / "images" / f"{image['image_id']}.png"
        if not path.exists():
            continue  # no image file, no evidence
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        entry = cache.get(image["image_id"])
        if entry and entry.get("amount") is not None and entry.get("sha256") == digest:
            amounts[event_id] = Decimal(str(entry["amount"]))
            continue
        try:
            value, _ = ocr_amount(path)
        except (OSError, subprocess.CalledProcessError):
            value = None
        if value is not None:
            amounts[event_id] = value
    return amounts
