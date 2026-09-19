/**
 * The semantic judgements Jev makes about a purchase.
 *
 * All of these go in ONE evaluate() call: they share the same state and are
 * answered independently, so adding a question costs almost nothing while
 * adding a request costs a round trip.
 *
 * `as const` is load-bearing — it is what makes `answers.needLevel.choice`
 * type as 'need' | 'want' instead of string.
 */
export const purchaseQuestions = {
  needLevel: {
    type: 'choice',
    instructions:
      'Classify this purchase for an ordinary salaried person. Judge the item itself, not whether they can afford it.',
    criteria: {
      need: 'Essential for daily living, work, health, safety or a legal obligation. Going without it causes real disruption.',
      want: 'Discretionary. Nice to have, but daily life continues unchanged without it.',
    },
  },

  urgency: {
    type: 'score',
    instructions:
      'How soon does this purchase genuinely need to happen? Judge the nature of the item, not the price.',
    criteria: [
      'No time pressure at all. Could be postponed indefinitely with no consequence.',
      'Mild time pressure. Better sooner, but months of delay are harmless.',
      'Real time pressure. Delaying a few weeks starts to cost money, work or comfort.',
      'Immediate. Replacing something broken and essential, or a hard deadline.',
    ],
  },

  regretRisk: {
    type: 'score',
    instructions:
      'How likely is this buyer to regret this purchase within six months? Consider impulse appeal, how fast it dates, and how often it would actually be used.',
    criteria: [
      'Very unlikely to regret. Lasting, frequently used, holds its value.',
      'Some risk. Useful, but enthusiasm may fade.',
      'Notable risk. Impulse appeal, seasonal interest or quick obsolescence.',
      'High risk. Classic impulse buy, likely unused within months.',
    ],
  },

  priceReasonable: {
    type: 'boolean',
    instructions:
      'Is the stated price reasonable for this kind of item at typical current market rates?',
    criteria: {
      true: 'Within the normal range, or a good deal.',
      false: 'Clearly above the normal range for this kind of item.',
    },
  },

  usefulLife: {
    type: 'score',
    instructions: 'Roughly how long will this item stay genuinely useful to the buyer?',
    criteria: [
      'Consumed or obsolete within months.',
      'Around a year of useful life.',
      'Several years of useful life.',
      'Long-lived. Five years or more, or effectively permanent.',
    ],
  },
} as const;
