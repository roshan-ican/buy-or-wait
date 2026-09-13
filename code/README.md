# Buy or Wait — bulk decision agent

For every request in `dataset/requests.csv`, this backend decides whether the user can safely pay now, pay with a
plan, wait, or should not proceed. It writes `output.csv` in the exact schema from `problem_statement.md`.

- **Engine:** deterministic Python engine (standard library only).
- **Gemini:** a fallback reader for unfamiliar messages and receipt images, and an independent cross-check.
- **Bulk API:** a FastAPI server that queues an uploaded CSV and evaluates it row by row in the background.

How it was built, step by step: [`HOW_IT_WAS_BUILT.md`](HOW_IT_WAS_BUILT.md).

## Run

Run from the repository root, with `code/` next to `dataset/`:

```bash
python3 code/evaluation/main.py               # full workflow: run all requests -> validate -> score samples
python3 code/main.py                          # writes ./output.csv (250 rows)
python3 code/evaluation/validate_output.py     # checks every hard rule in problem_statement.md
python3 code/evaluation/score_samples.py --verbose   # accuracy vs dataset/sample_requests.csv
```

Python 3.9+. The engine needs no packages and no API key to reproduce `output.csv`.

### Optional: Gemini

Put `GEMINI_API_KEY=...` in a repo-root `.env` (never commit it) or export it. `GEMINI_MODEL` overrides the
default `gemini-3.1-flash-lite`, and `GEMINI_DISABLED=1` turns Gemini off.

```bash
python3 code/evaluation/main.py --gemini       # adds step 4: Gemini cross-checks every message and image
python3 code/evaluation/gemini_crosscheck.py   # the cross-check on its own
```

### Optional: bulk API

```bash
python3 -m pip install -r code/requirements.txt
python3 -m uvicorn server:app --app-dir code --host 127.0.0.1 --port 8000

curl -F file=@dataset/requests.csv http://127.0.0.1:8000/api/v1/analysis/upload     # -> {"id": "job_…", …}
curl -X POST http://127.0.0.1:8000/api/v1/analysis/start/<job_id>
curl http://127.0.0.1:8000/api/v1/analysis/status/<job_id>                          # queued / completed / failed rows
curl http://127.0.0.1:8000/api/v1/analysis/results/<job_id>                         # rows + one-line reason + summary
curl -o output.csv http://127.0.0.1:8000/api/v1/analysis/download/<job_id>
```

Walkthrough of the bulk flow: https://drive.google.com/file/d/1Ljn_cQ8_aPV7vxi02PmqUFL1njeSYVv5/view?usp=sharing

## Architecture

```text
  requests.csv
       │
       ├──────────────────────────────┐
       ▼                              ▼
  python3 code/main.py          FastAPI (code/server.py)
  (terminal batch runner)       upload → start → job queue (asyncio.Queue)
       │                              │
       │                              ▼
       │                        background worker, one row at a time
       └──────────────┬───────────────┘
                      ▼
          DecisionEngine.evaluate_row (code/engine)
            1. evidence  facts.py · images.py · gemini.py
            2. forecast  forecast.py
            3. plan      planner.py
                      │
                      ▼
                  output.csv ──► evaluation/validate_output.py · score_samples.py · gemini_crosscheck.py
```

- The queue only decides *when* rows run; it contains no affordability logic.
- The API and `main.py` produce identical rows. A row that fails in the API is reported and does not stop the job.

| Path | Purpose |
|---|---|
| `main.py` | Evaluates every request and writes `output.csv` at the repo root; prints Gemini usage |
| `server.py` | Bulk API: upload, start, status, results, download |
| `engine/data.py` | Loads every dataset file, including exchange rates, messages, images and payment options |
| `engine/facts.py` | Messages → typed facts (phrase rules, Gemini for unrecognised wording) |
| `engine/images.py` | Blank event amounts from receipt images (reviewed cache → Gemini vision → OCR) |
| `engine/gemini.py` | Gemini client: JSON-schema answers, disk cache, token accounting |
| `engine/forecast.py` | Day-by-day cash forecast |
| `engine/planner.py` | Payment plan choice, spending changes, explanation |
| `evaluation/` | Workflow runner, rule validator, sample scorer, Gemini cross-check, usage report |

## How a decision is made

1. **Evidence**
   - **Messages:** phrase rules in English and Indonesian turn each message into a typed fact, such as a raise, a moved
     payday, an ended job, a rent increase or a failed bill that is still due. A message no rule recognises is
     labelled by Gemini, which can only choose one of the same fact types.
   - **Images:** a blank event amount comes from the reviewed image cache, used only when the image's SHA-256
     matches. Otherwise Gemini vision reads it, and on-device OCR is the last resort.
   - **Untrusted text:** instructions inside messages or images are ignored.
2. **Forecast:** starting from `current_available_balance`, the engine builds a day-by-day cash flow.
   - **Recurring expenses:** detected from settled history (weekly, every N days, or monthly by scheduled day).
     One-off spikes above 2.5× the typical amount are removed, and amounts use the average of history.
   - **Failed debits:** a failed debit uses up its billing period, unless a message says the bill is still due.
   - **Pending and scheduled items:** pending debits are reserved today. Pending credits, bonuses, commissions,
     prizes, refunds and unrealized gains are ignored, and so are duplicate charges. Scheduled items land on their
     settlement date, and foreign currency uses that date's rate.
   - **Salary:** the typical (median) payroll amount lands on its payday. Ended, paused and seasonal income stops.
     Message facts apply raises, moved paydays, one-off reduced pay, resumed pay and first salaries. Unconfirmed
     gig income is not counted.
3. **Plan**
   - **Safe amount:** `amount_safe_to_pay` = lowest forecast balance minus the minimum, capped at the requested amount.
   - **Candidates:** full payment, supplied installment options (≤ `max_installment_months` and finished by the
     deadline), partial payment and wait. Only methods the user accepts are considered.
   - **Ranking:** no spending changes, then lowest total, earliest start, fewest payments and lowest option id.
   - **Spending changes:** if nothing is safe, try up to three stop/reduce changes on non-protected flexible expenses
     the user allows, choosing the smallest total cut.
4. **Explanation:** one sentence in the style of the sample answers. The API also returns a one-line reason.

## Results and known limits

- **Public samples:** on the 25 examples in `dataset/sample_requests.csv`, status matches 23/25, method 24/25,
  plan 23/25, earliest date 22/25 and spending changes 22/25. Mean `amount_safe_to_pay` error is ≈ 3.0% of the
  requested amount.
- **85-day window:** the forecast covers **85 days**, not the literal 90 in `problem_statement.md`. The sample
  answers consistently leave out payments on days 87–90, and windows of 84–86 days match them best. With 90 days the
  samples score 20/21/20/18/21 with ≈ 6.3% error. Set `ForecastConfig.horizon_days = 90` to use the literal window.
- **Other estimators:** none of the alternative spending estimators we tested fit better (highest past amount,
  highest of the last four, most recent amount, rounding up, 75th percentile).
- **Gemini cross-check:** Gemini agrees with the rules on 214/215 messages and with the reviewed amounts on 15/16
  images. It found one rule-order bug (`message_92`), now fixed, which had no effect on `output.csv`.
- **Model calls in the main run:** 0 on this dataset, because the rules and the reviewed cache cover every
  message and image. Token details are in `evaluation/usage_report.md`.
- **Limits:**
  - Phrase rules are tuned to the dataset's message templates; unfamiliar wording relies on Gemini.
  - OCR works only on macOS.
  - Cent-level `amount_safe_to_pay` rarely matches the reference answers.
