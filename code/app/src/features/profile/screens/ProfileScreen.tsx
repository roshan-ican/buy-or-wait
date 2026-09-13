import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { ListRow } from '../../../components/ui/ListRow';
import { colors, fontFamily, spacing } from '../../../theme';
import { useAsync } from '../../../hooks/useAsync';
import { repositories } from '../../../data';
import { MainTabScreenProps } from '../../../navigation/types';

/**
 * Not one of the design's mockup screens (only the nav-bar icon is shown
 * there) — this is a minimal read-only summary of the onboarding data so the
 * "Profile" tab has a real destination, built from the same components as
 * everything else so it still looks native to the system.
 */
export function ProfileScreen(_props: MainTabScreenProps<'Profile'>) {
  const profile = useAsync(() => repositories.profile.getProfile(), []);
  if (!profile) return <Screen />;

  const essentialTotal = profile.essentialExpenses.reduce((s, e) => s + e.amount, 0);
  const flexibleTotal = profile.flexibleExpenses.reduce((s, e) => s + e.amount, 0);
  const optionalTotal = profile.optionalExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <Screen>
      <Text style={styles.title}>Your profile</Text>
      <Text style={styles.subtitle}>What the forecast is built on.</Text>

      <Card padding={0} style={styles.card as any}>
        <View style={styles.cardBody}>
          <ListRow label="Monthly salary" value={`${profile.currency} ${profile.monthlySalary.toLocaleString()}`} />
          <ListRow label="Essential spending" value={essentialTotal.toLocaleString()} />
          <ListRow label="Flexible spending" value={flexibleTotal.toLocaleString()} />
          <ListRow label="Optional spending" value={optionalTotal.toLocaleString()} />
          <ListRow label="Current savings" value={profile.currentSavings.toLocaleString()} />
          <ListRow label="Minimum balance to keep" value={profile.minimumBalance.toLocaleString()} last />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 32, color: colors.textPrimary, marginBottom: 6 },
  subtitle: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, marginBottom: spacing.xxl },
  card: {},
  cardBody: { paddingHorizontal: 20 },
});
