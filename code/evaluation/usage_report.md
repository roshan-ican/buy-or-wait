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

## Gemini on this branch (bulk-agent)

Gemini (`gemini-3.1-flash-lite`, Google AI Studio free tier) is used in two ways. Neither changes the `output.csv`
above, which still makes **0 model calls**.

1. **Runtime fallback** (`engine/gemini.py`): called only for a message no phrase rule recognises, or for an image
   whose SHA-256 is not in the reviewed cache. On the current dataset every message and image is covered, so
   `python3 code/main.py` reports `0 calls`.
2. **Evaluation cross-check** (`python3 code/evaluation/gemini_crosscheck.py`, or `evaluation/main.py --gemini`):
   Gemini independently reads all 215 messages (batched 25 per request) and all 16 images.

| Cross-check run | Calls | Input tokens | Output tokens | Total tokens |
|---|---:|---:|---:|---:|
| Messages (215, batched) | 9 | 19,407 | 11,603 | 31,010 |
| Images (16) | 16 | 18,674 | 403 | 19,077 |
| **Total** | **25** | **38,081** | **12,006** | **50,087** |

- **Average:** about 2,004 tokens per request-level evidence item (50,087 tokens ÷ 25 calls). Spread across the
  250 requests it is about 200 tokens per request.
- **Cost:** $0.00 billed on the free tier. The paid-tier price of this model was not checked, so no paid estimate is
  given.
- **Reruns:** every response is cached in `engine/cache/gemini/`, so a rerun is 25 cache hits and 0 tokens.
- **Result:** messages agree 214/215 and images 15/16 (`evaluation/gemini_crosscheck.json`). The cross-check found
  one real rule bug: `message_92` (a settled investment sale) was labelled a pending gig payout, and the rule order
  is now fixed. It had no effect on `output.csv`. The remaining message difference (`message_02`) has no amounts. The
  image difference (`image_07`) is "Total 8528.10" vs the paid "Grand Total (RS): 8528".

