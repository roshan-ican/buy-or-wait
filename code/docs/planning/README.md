# Planning

`buy_or_wait_flow.excalidraw` is the original whiteboard for this project. Open it at https://excalidraw.com
(menu → Open) or with the Excalidraw VS Code extension. Its main points are summarised below.

## 1. First idea: monthly money left

```text
Profile: salary (required), expenses, current savings, EMIs (optional)
        ↓ store and evaluate
money left = salary − expenses − EMIs
        ↓
money left ≥ item price → "Yes, you can buy immediately"
otherwise               → "Wait" (item price ÷ money left = months to wait)
```

Worked example: salary 12,000; food 1,500 + rent 3,500 + transport 800 + bills 700 + other 1,000 = 7,500;
money left 4,500. A 6,000 item on a 6-month plan costs 1,000/month, leaving 3,500/month, which is very comfortable.
Savings of 2,000 could also cover part of it.

Price as a share of salary (6,000 ÷ 12,000 = 50%):

| Share of monthly pay | Verdict |
|---|---|
| 20–30% | very comfortable |
| 30–50% | possible with a plan |
| over 50% | heavy expense; wait unless savings are good |

Expenses fall into three groups: **essential** (food, transport, rent), **flexible** (entertainment) and
**optional** (travel, shopping).

## 2. Enhancements

- Include current expenses and spending in future plans.
- Compare pay in full, partial payment, 3- and 6-month plans, and waiting; pick the safest one and give the reason.
- When waiting, say what would help (e.g. "reduce optional spending") and give the earliest safe date.
- Classify each item as a want or a need.
- "You can afford this if you cut shopping or travel for the next 2 months."
- What-if: salary rises, 6-month plan chosen, spending reduced, price drops 15%.

## 3. Architecture

```text
React Native app → Server ─┬─ single request → evaluate now
                           └─ upload CSV → background analyzer → analyse each row one by one with the same flow
```

## How it became the submission

The "background analyzer" became the queued bulk mode on this branch. The monthly arithmetic grew into the dated
cash-flow forecast in `code/engine`. It covers recurring events, pending and scheduled items, exchange rates,
messages and images, payment options, the minimum balance, spending changes and the earliest safe date. The app and
the single-request monthly check are on the `main` branch. See `code/README.md` → Architecture.
