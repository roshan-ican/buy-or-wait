# How this project was built

This is a short history of the backend: what was built, in what order, and why. Each step comes from the agent log
(`log.txt`). The coding agents used were **Codex** and **Claude Code**. **Gemini** was added later as a runtime
fallback and cross-check.

## 1. Understand the problem

- **Rules to data:** read `problem_statement.md` and `AGENTS.md`, then mapped each financial rule to CSV fields:
  profiles, events, exchange rates, payment options, messages and images.
- **Request types:** found 9 request types across the 250 requests in `requests.csv`.
- **Currency decision:** evaluate every request in the user's home currency. Convert only foreign-currency events,
  using the supplied dated rate in its stated direction, instead of normalising everything to USD.

## 2. Plan the architecture

- **Starting idea:** a whiteboard sketch of "salary − expenses − EMIs = money left". It led to a key requirement:
  bulk requests must be processed as a background job, one row at a time, with the same decision logic.
- **Shape of the system:** a shared Python engine, used by a terminal runner and by an API with a job queue.

## 3. First working pipeline

- **First version:** a deterministic engine, a terminal CSV runner and a FastAPI single-worker queue, with upload
  validation, progress counts, results and CSV download.
- **Result:** all 250 requests ran with no row failures, and both the terminal and API outputs had the required
  250 rows and 8 columns.
- **Problem:** scored against `sample_requests.csv`, the first engine was far off: roughly 10/25 statuses correct.

## 4. Rebuild the engine for accuracy

The engine was rewritten into separate parts, each checked against the 25 public samples:

- **`facts.py`:** deterministic English/Indonesian message parser. All 215 messages get a type, and embedded
  instructions such as "pay the release charge" are ignored.
- **`images.py`:** 16 events have their amount only in a receipt image. The amounts were reviewed once and cached,
  with macOS Vision OCR as the fallback.
- **`forecast.py`:** recurring detection by scheduled day or interval, removal of one-off spikes, failed-debit
  markers, pending and scheduled handling, dated FX conversion, and salary semantics driven by message facts.
- **`planner.py`:** full payment, installments, partial payment and wait, ranked as the spec describes, plus up to
  three spending changes and explanations in the sample style.

Calibration fixed these misses one at a time:

| Miss | Cause | Fix |
|---|---|---|
| Salary vanished from the forecast | Payday settled late, so monthly grouping split | Group by `event_date` |
| One reduced paycheck became "normal" | Average of salary history | Median salary |
| Failed debit counted twice | Retry plus original | Failed-debit markers |
| Weekly pattern broken by a bulk shop | One-off outlier | Remove spikes above 2.5× median |
| Earliest date one day early | Intraday vs end-of-day balance | End-of-day balances |
| Base salary message vs payroll | Conflicting sources | Take the safer (lower) amount |
| `request_78` wrong | History mixed two currencies | Convert each item on its own date |

Accuracy on the samples rose from about 10/25 to **23/25 statuses**, with 24/25 methods, 23/25 plans and
22/25 earliest dates.

## 5. Try an LLM for evidence, then remove it

- **The trial:** Codex tried free OpenCode "Muse" models for image and message extraction.
- **The outcome:** one receipt was read correctly, but full runs timed out and results didn't improve. The
  integration was removed so the pipeline stayed fast and reproducible.

## 6. The forecast window: 90 vs 85 days

- **The conflict:** the spec says 90 days, but the public sample answers consistently leave out payments on days
  87–90.
- **The numbers:** 90 days scored 20/25 statuses with ≈ 6.3% amount error; 85 days scored 23/25 with ≈ 3.0%.
- **The decision:** 85 days, documented openly in the README.
- **Other ideas tested:** alternative spending estimators (max, last value, rounding up, 75th percentile). None was
  better.

## 7. Hardening and compliance

- **Cleanup:** removed calibration-only settings and dead code; output stayed byte-identical.
- **Image cache:** each reviewed amount is keyed by its image's SHA-256, so it applies only to that exact file.
- **Evaluation workflow:** `evaluation/main.py` runs, validates and scores in one command.
- **Checks:**
  - `validate_output.py` enforces every hard rule and finds 0 violations.
  - The engine never reads sample labels, and no request, user or event IDs appear in the decision code.
  - The zipped code reproduces `output.csv` byte-for-byte from a clean folder.
  - The real API queue processes all 250 rows and matches the terminal runner.

## 8. Gemini: fallback reader and cross-check

- **Where it's used:** `engine/gemini.py` is a standard-library client with JSON-schema answers, a disk cache and
  token counting. It's used only where the rules run out:
  - a message with wording no rule recognises;
  - an image whose SHA-256 isn't in the reviewed cache (before OCR).
- **Live test:** a message worded in a way no rule knew ("monthly pay goes up to INR 95,000 from 1 October 2025")
  was correctly read as a salary increase.
- **Quota:** the free tier allowed only 20 requests/day on the larger Flash model. The client switched to
  `gemini-3.1-flash-lite` and batches 25 messages per call.
- **Cross-check (`evaluation/gemini_crosscheck.py`):** 25 calls, 50,087 tokens.
  - 214/215 messages and 15/16 images agree.
  - It found a real rule bug: a settled investment sale was labelled a pending payout because of the words
    "masih tertunda". The bug is fixed.
- **Effect on the output:** `output.csv` is unchanged, and the main run still makes 0 Gemini calls on this dataset.

## What we'd do next

- Make Gemini the primary message reader, with rules as the offline fallback, to handle unseen wording.
- Explain the four sample rows that still decide differently (`request_06`, `11`, `17`, `21`).
- Replace the macOS-only OCR fallback with a cross-platform one.
