import { knownUpcoming, mockProfile } from '../mockData';
import { KnownUpcomingItem, Profile, RecentDecision } from '../types';
import { browserStorage } from '../browserStorage';
import { listRecentDecisions } from '../recentDecisions';

export interface HomeSnapshot {
  moneyLeftThisMonth: number;
  moneyLeftAboveFloor: number;
  recentDecisions: RecentDecision[];
}

export interface ProfileRepository {
  getProfile(): Promise<Profile>;
  getHomeSnapshot(): Promise<HomeSnapshot>;
  getKnownUpcoming(): Promise<KnownUpcomingItem[]>;
  saveProfile(profile: Profile): Promise<void>;
  getProfileSync(): Profile;
  /** False until the user has actually completed onboarding once — used to tell a real saved value apart from the worked-example defaults. */
  hasSavedProfile(): boolean;
}

/**
 * Reads the profile the onboarding flow would have collected. This is a
 * static, in-memory stand-in — swapping it for a real API-backed repository
 * later requires no screen changes.
 */
export class LocalProfileRepository implements ProfileRepository {
  getProfileSync(): Profile {
    return browserStorage.get<Profile>('profile') ?? mockProfile;
  }

  hasSavedProfile(): boolean {
    return browserStorage.get<Profile>('profile') != null;
  }

  async getProfile(): Promise<Profile> {
    return this.getProfileSync();
  }

  async saveProfile(profile: Profile): Promise<void> {
    browserStorage.set('profile', profile);
  }

  async getHomeSnapshot(): Promise<HomeSnapshot> {
    const profile = this.getProfileSync();
    const expenses = [...profile.essentialExpenses, ...profile.flexibleExpenses, ...profile.optionalExpenses]
      .reduce((sum, item) => sum + item.amount, 0);
    const moneyLeft = profile.monthlySalary + profile.otherMonthlyIncome - expenses - profile.monthlyCommitments;
    return {
      moneyLeftThisMonth: moneyLeft,
      moneyLeftAboveFloor: Math.max(0, profile.currentSavings + moneyLeft - profile.minimumBalance),
      recentDecisions: listRecentDecisions(),
    };
  }

  async getKnownUpcoming(): Promise<KnownUpcomingItem[]> {
    return knownUpcoming;
  }
}
