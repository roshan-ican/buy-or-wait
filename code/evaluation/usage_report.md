# Final Full-Dataset Token Usage

The final run that produced the root-level `output.csv` (`python3 code/main.py`) makes **no model calls**.
All decisions come from the deterministic engine in `code/engine/`.

| Metric | Value |
|---|---:|
| Provider | None (deterministic run) |
| Model | None |
| Requests evaluated | 250 |
| Model calls | 0 |
| Input tokens | 0 |
| Output tokens | 0 |
| Total tokens | 0 |
| Average tokens per request | 0 |
| Estimated total model cost | $0.00 |
| Estimated model cost per request | $0.00 |

## How unstructured evidence is handled without per-run model calls

- **Messages (215, English + Indonesian):** parsed by deterministic phrase rules in `code/engine/facts.py`
  into typed facts (salary change, moved payday, income ended, pending refund, rent increase, etc.).
  Embedded instructions (for example "pay the release charge") are classified as untrusted and ignored.
- **Images (16 events with blank amounts):** amounts are read once and stored in
  `code/engine/cache/image_amounts.json`. They were extracted by reading the images with a multimodal
  assistant during development and cross-checked with on-device OCR (macOS Vision, `code/engine/ocr/ocr.swift`);
  the OCR candidate and whether it agreed are recorded per image. Each entry stores the SHA-256 of its image, and the engine uses the entry only if the file on disk still matches. A new or changed image is read with OCR instead. If the cache is missing, the engine
  falls back to OCR. The final run reads the cache, so it uses no tokens.

The one-time image review happened inside the development chat session; it is not billed to the evaluation run
and has no separate API usage record.
