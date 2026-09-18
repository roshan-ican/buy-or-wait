# Buy or Wait

An Expo + TypeScript app that answers one question for a single purchase: **buy now, use an installment plan, or wait**.

## Run

```bash
cd code/app
npm install
npm run web      # or: npm run ios / npm run android / npm start
```

## How a decision is made

`code/app/src/data/decide.ts` is deterministic and runs entirely in the app:

1. **Monthly surplus** = salary + other income − expenses − commitments.
2. **Safe now** = surplus + savings above the minimum balance you want to keep.
3. If the price fits in *safe now* → **buy now**.
4. Otherwise the shortest installment plan whose monthly payment fits the surplus → **use that plan**.
5. Otherwise → **wait**, with the number of months until it becomes affordable.
