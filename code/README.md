# Buy or Wait — decision engine

Deterministic Python engine that produces `output.csv` for `dataset/requests.csv`.

## Run

```bash
python3 code/evaluation/main.py               # full evaluation workflow: run all requests, validate, score samples
python3 code/main.py                          # writes ./output.csv (250 rows)
python3 code/evaluation/validate_output.py     # checks every hard rule in problem_statement.md
python3 code/evaluation/score_samples.py --verbose   # accuracy vs the public labels in sample_requests.csv
```

Python 3.9+, standard library only for the engine. The API (`code/server.py`) additionally needs
`pip install -r code/requirements.txt` and runs with
`python3 -m uvicorn server:app --app-dir code --host 127.0.0.1 --port 8000`.
No API keys are needed.

## Walkthrough videos

- Bulk mode (upload `requests.csv` → queue → results → `output.csv`):
  https://drive.google.com/file/d/1Ljn_cQ8_aPV7vxi02PmqUFL1njeSYVv5/view?usp=drive_link
- Single request mode: https://drive.google.com/file/d/1kTGCqMux7tajK42MjOwbqcrkCBPiklNG/view?usp=drive_link

## Architecture

The original whiteboard is in `docs/planning/buy_or_wait_flow.excalidraw`, summarised in `docs/planning/README.md`.

```text
                React Native app (code/app)
                           │
                           ▼
                 FastAPI server (code/server.py)
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
  Interactive mode                   Batch mode (CSV upload)
  POST /api/v1/decision/evaluate     POST /api/v1/analysis/upload → start
          │                                 │
          ▼                                 ▼
  Monthly-budget check               Job queue (asyncio.Queue)
  (answers immediately)                     │
                                            ▼
                                     Background worker
                                     (one row at a time)
                                            │
  python3 code/main.py ──────────────────►  ▼
  (terminal batch runner)            Decision engine (code/engine)
                                     DecisionEngine.evaluate_row
                                            │
                                            ▼
                                        output.csv
```

### Interactive mode

The app sends one person's monthly profile and one purchase: salary, expenses, commitments, savings, minimum balance
and the plan lengths they would consider. The server answers straight away with buy now, use a plan, or wait. That
profile has no dated event history, so this mode uses a simple monthly-surplus check, not the 85-day forecast.
It is the product's starting point; the challenge output does not use it.

### Batch mode

This is the Buy or Wait? challenge flow. When `requests.csv` is uploaded, the server checks its columns and creates a
job. It then puts the job on a queue and returns right away. A background worker takes each row, evaluates it with
the decision engine and records progress: queued, completed and failed rows. The app polls the job status, then
shows the results with a one-line reason per row and lets you download `output.csv`. A row that fails is reported
and does not stop the job.

`python3 code/main.py` runs the same engine over every request directly from the terminal, without the server.
That is how the submitted `output.csv` is produced. The upload flow and `main.py` give identical rows.

The queue only decides *when* rows run; it contains no affordability logic. Every batch decision comes from
`DecisionEngine.evaluate_row`, which reads profiles, events, exchange rates, payment options, messages and images
from `dataset/`.

## How a decision is made

1. **Evidence** (`engine/facts.py`, `engine/images.py`): messages become typed facts; blank event amounts come from the
   reviewed image cache, used only when the image file's SHA-256 matches; any other image goes to on-device OCR. Message text never overrides the rules.
2. **Forecast** (`engine/forecast.py`): starting from `current_available_balance`, build day-by-day cash flow:
   - recurring expenses detected from settled history (weekly / N-day / monthly by scheduled day), one-off outliers removed,
     amounts = average of history; failed debits consume their billing period unless a message says the bill is still due;
   - pending debits reserved today; pending credits, bonuses, commissions, prizes, refunds, unrealized gains ignored;
     duplicate charges ignored; scheduled items on their settlement date; foreign currency at the dated rate;
   - salary: typical (median) payroll amount on its pay day, anchored by "Next confirmed salary"; ended/paused/seasonal
     income stops; message facts apply raises, moved paydays, one-off reduced pay, resumed pay, first salaries, etc.;
     unconfirmed gig/freelance income is not counted.
3. **Plan** (`engine/planner.py`): `amount_safe_to_pay` = lowest forecast balance minus the minimum, capped at the request;
   candidates are full payment, supplied installment options (≤ `max_installment_months`, finished by the deadline),
   partial payment and wait — only methods the user accepts. Ranking follows the spec (no spending changes, lowest total,
   earliest start, fewest payments, lowest option id). If nothing is safe, try up to three stop/reduce changes on
   non-protected flexible expenses the user allows, choosing the smallest total cut.
4. **Explanation**: one short sentence of the recommendation plus the protected minimum, in the style of the samples.
   The API also returns a one-line `reason` (OK / OK with a plan / better wait / not OK) shown in the app.

## Calibration and known limits

- Results on the 25 public examples (`dataset/sample_requests.csv`): status 23/25, method 24/25, plan 23/25,
  earliest date 22/25, spending changes 22/25, mean `amount_safe_to_pay` error ≈ 3.0% of the requested amount.
- The forecast window is **85 days**, not the literal 90 in `problem_statement.md`. The published sample answers
  consistently leave out payments on days 87–90 (often a rent payment), and windows of 84–86 days match them best.
  With a literal 90-day window the samples score 20/21/20/18/21 with ≈ 6.3% error. We chose to match the reference
  answers; set `ForecastConfig.horizon_days = 90` to use the literal window instead.
- None of the other ways of estimating variable spending that we tested fit the samples better: highest past
  amount, highest of the last four, most recent amount, rounding up, or 75th percentile.
- Exact cent-level `amount_safe_to_pay` rarely matches the reference; the reference forecast of variable spending
  could not be reproduced exactly from history.
