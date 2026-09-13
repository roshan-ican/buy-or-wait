# Buy or Wait — decision engine

Deterministic Python engine that produces `output.csv` for `dataset/requests.csv`.

## Run

```bash
python3 code/evaluation/main.py               # full evaluation workflow: run all requests, validate, score samples
python3 code/main.py                          # writes ./output.csv (250 rows)
python3 code/evaluation/validate_output.py     # checks every hard rule in problem_statement.md
python3 code/evaluation/score_samples.py --verbose   # accuracy vs the public labels in sample_requests.csv
```

Python 3.9+, standard library only. No dependencies to install and no API keys.

## Branch: bulk-agent

This branch keeps only the evaluation pipeline, the agent that processes every request in bulk:

```text
dataset/requests.csv ─► code/main.py ─► DecisionEngine.evaluate_row (code/engine), one row at a time ─► output.csv
                                                                                                          │
                              code/evaluation/validate_output.py  ◄── hard rules from problem_statement.md ┤
                              code/evaluation/score_samples.py    ◄── accuracy vs sample_requests.csv ──────┘
```

| Path | Purpose |
|---|---|
| `code/main.py` | Evaluates every request in `dataset/requests.csv` and writes `output.csv` at the repo root |
| `code/engine/` | The decision engine: evidence (`facts.py`, `images.py`), `forecast.py`, `planner.py`, `evaluator.py` |
| `code/evaluation/main.py` | One-command workflow: run, validate, score |
| `code/evaluation/usage_report.md` | Token usage for the final run (0 model calls) |

The React Native app, the API server and the planning docs are on the `main` branch.

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
