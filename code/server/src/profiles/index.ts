import type { Profile } from './types.js';
import { exampleProfile } from './example.js';

export * from './types.js';
export { exampleProfile };

/**
 * The profile scripts run against: your own `me.local.ts` when it exists,
 * otherwise the committed example. Keeps real figures out of the repo while
 * letting local runs use them.
 */
export async function loadProfile(): Promise<{ profile: Profile; source: string }> {
  try {
    const local = (await import('./me.local.js')) as { myProfile: Profile };
    return { profile: local.myProfile, source: 'me.local.ts' };
  } catch {
    return { profile: exampleProfile, source: 'example.ts' };
  }
}
