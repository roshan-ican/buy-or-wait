import { experimental_evaluate as evaluate } from 'ai';
import { purchaseQuestions } from './questions.js';

/**
 * Everything Jev is allowed to see when judging a purchase.
 * Declared as a `type`, not an `interface`, so it satisfies the SDK's
 * JSON-object constraint on `state`.
 */
export type PurchaseState = {
  item: string;
  price: number;
  category?: string;
  monthlySalary: number;
  monthlySurplus: number;
  currentSavings: number;
  currency: string;
};

type EvaluateResult = Awaited<ReturnType<typeof evaluate<typeof purchaseQuestions>>>;

export type PurchaseAnswers = EvaluateResult['answers'];

export type PurchaseJudgement = {
  answers: PurchaseAnswers;
  /** 0-1, how concentrated the distribution is. Gate the UI on this. */
  confidence: number | undefined;
  usage: EvaluateResult['usage'];
};

/**
 * The only place in the codebase that talks to Jev.
 * Swap the model or the SDK here; nothing else should need to change.
 */
export async function judgePurchase(
  state: PurchaseState,
  options: { abortSignal?: AbortSignal } = {},
): Promise<PurchaseJudgement> {
  const result = await evaluate({
    model: 'typesafe-ai/jev',
    state,
    questions: purchaseQuestions,
    abortSignal: options.abortSignal,
    // ZDR requires a Vercel Pro/Enterprise plan; opt in with JEV_ZDR=true.
    // Without it the provider may retain the state we send, so keep the state
    // minimal — it should never carry names, account numbers or raw statements.
    ...(process.env.JEV_ZDR === 'true'
      ? { providerOptions: { gateway: { zeroDataRetention: true } } }
      : {}),
  });

  const meta = result.providerMetadata?.typesafe as { confidence?: number } | undefined;

  return { answers: result.answers, confidence: meta?.confidence, usage: result.usage };
}
