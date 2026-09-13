import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { colors, fontFamily } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';
import { repositories } from '../../../data';

/** C4 · Working it out (auto-advances, like the source design's loading state) */
export function AnalysingScreen({ navigation }: RootScreenProps<'PurchaseAnalysing'>) {
  const [error, setError] = useState('');
  const profile = repositories.profile.getProfileSync();
  const expenses = [...profile.essentialExpenses, ...profile.flexibleExpenses, ...profile.optionalExpenses]
    .reduce((sum, item) => sum + item.amount, 0);
  const surplus = profile.monthlySalary + profile.otherMonthlyIncome - expenses - profile.monthlyCommitments;
  useEffect(() => {
    let active = true;
    repositories.singleDecision.evaluate(profile)
      .then(() => { if (active) navigation.replace('PurchaseRecommendation'); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Evaluation failed.'); });
    return () => { active = false; };
  }, [navigation]);

  return (
    <Screen variant="dark" scroll={false}>
      <View style={styles.center}>
        <Text style={styles.headline}>
          Checking five{'\n'}ways to pay{'\n'}against your{'\n'}next six months.
        </Text>
        <View style={styles.checklist}>
          <Text style={styles.done}>✓  Money left: {profile.currency} {surplus.toLocaleString()} a month</Text>
          <Text style={styles.done}>✓  Floor: {profile.currency} {profile.minimumBalance.toLocaleString()} protected</Text>
          <Text style={styles.done}>✓  Existing commitments: {profile.currency} {profile.monthlyCommitments.toLocaleString()}</Text>
          <Text style={styles.pending}>·  Comparing plans…</Text>
        </View>
        <ProgressBar progress={0.72} color={colors.textInverseFaint} trackColor={colors.navyLine} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  headline: { fontFamily: fontFamily.serif, fontSize: 42, lineHeight: 46, color: colors.textInverse, marginBottom: 36 },
  checklist: { gap: 18, marginBottom: 44 },
  done: { fontFamily: fontFamily.sans, fontSize: 16, color: colors.textInverseFaint },
  pending: { fontFamily: fontFamily.sans, fontSize: 16, color: colors.navyMutedAlt },
  error: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.danger, marginTop: 20 },
});
