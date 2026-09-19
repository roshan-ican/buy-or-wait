/**
 * Proves the Jev pipe works end to end: auth, network, SDK, typing.
 * Uses your local profile when present, the committed example otherwise.
 */
import { judgePurchase, type PurchaseState } from '../jev/client.js';
import { loadProfile, monthlySurplus } from '../profiles/index.js';

const { profile, source } = await loadProfile();
const surplus = monthlySurplus(profile);

const state: PurchaseState = {
  item: 'Sony A7 IV mirrorless camera',
  price: 6000,
  category: 'Electronics',
  monthlySalary: profile.monthlySalary,
  monthlySurplus: surplus,
  currentSavings: profile.currentSavings,
  currency: profile.currency,
};

console.log(`\nProfile (${source}): ${state.currency} ${state.monthlySalary}/mo, ` +
  `${surplus.toFixed(2)} surplus, ${state.currentSavings} saved`);
console.log(`Item: ${state.item} — ${state.currency} ${state.price.toLocaleString()} ` +
  `(${((state.price / state.monthlySalary) * 100).toFixed(0)}% of a month's salary)\n`);

const started = Date.now();
const { answers, confidence, usage } = await judgePurchase(state);
const elapsed = Date.now() - started;

console.log('need or want :', answers.needLevel.choice);
console.log('  spread     :', answers.needLevel.probabilities ?? '(none returned)');
console.log('urgency      :', answers.urgency.score.toFixed(2), '/ 3');
console.log('regret risk  :', answers.regretRisk.score.toFixed(2), '/ 3');
console.log('useful life  :', answers.usefulLife.score.toFixed(2), '/ 3');
console.log('price fair   :', `${(answers.priceReasonable.probability * 100).toFixed(0)}% likely`);

console.log('\nconfidence   :', confidence ?? '(not reported)');
console.log('tokens       :', usage.inputTokens, 'in /', usage.outputTokens, 'out');
console.log('latency      :', `${elapsed}ms\n`);
