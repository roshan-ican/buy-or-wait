import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { SegmentBar } from '../../../components/ui/ProgressBar';
import { colors, fontFamily, spacing } from '../../../theme';
import { useAsync } from '../../../hooks/useAsync';
import { repositories } from '../../../data';
import { MainTabScreenProps } from '../../../navigation/types';

/** B1 · Home */
export function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const snapshot = useAsync(() => repositories.profile.getHomeSnapshot(), []);
  const profile = useAsync(() => repositories.profile.getProfile(), []);

  if (!snapshot || !profile) return <Screen />;

  const essentialTotal = profile.essentialExpenses.reduce((s, e) => s + e.amount, 0);
  const flexibleTotal = profile.flexibleExpenses.reduce((s, e) => s + e.amount, 0);
  const optionalTotal = profile.optionalExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <Screen>
      <View style={styles.topRow}>
        <Text style={styles.monthLabel}>{new Date().toLocaleString('en-US', { month: 'long' })}</Text>
        <View style={styles.avatar} />
      </View>

      <Text style={styles.moneyLeftLabel}>MONEY LEFT THIS MONTH</Text>
      <Text style={styles.moneyLeftValue}>
        {profile.currency} {snapshot.moneyLeftThisMonth.toLocaleString()}
      </Text>
      <Text style={styles.moneyLeftNote}>{snapshot.moneyLeftAboveFloor.toLocaleString()} above your floor</Text>

      <SegmentBar
        segments={[
          { value: essentialTotal, color: colors.navy },
          { value: flexibleTotal, color: colors.accent },
          { value: optionalTotal, color: colors.accentSoft },
        ]}
      />
      <View style={styles.legendRow}>
        <Text style={styles.legendItem}>■ Essential {essentialTotal.toLocaleString()}</Text>
        <Text style={[styles.legendItem, { color: colors.accent }]}>■ Flexible {flexibleTotal.toLocaleString()}</Text>
        <Text style={[styles.legendItem, { color: colors.accentSoft }]}>■ Optional {optionalTotal.toLocaleString()}</Text>
      </View>

      <Card tone="neutral" style={styles.ctaCard as any}>
        <Text style={styles.ctaTitle}>Thinking about{'\n'}spending money?</Text>
        <Pressable style={styles.ctaButton} onPress={() => navigation.navigate('RequestType')}>
          <Text style={styles.ctaButtonLabel}>Ask about a decision</Text>
        </Pressable>
      </Card>


      <Text style={styles.recentLabel}>RECENT</Text>
      {snapshot.recentDecisions.length === 0 ? (
        <Text style={styles.emptyRecent}>Decisions you check will show up here.</Text>
      ) : null}
      <View style={{ gap: spacing.sm }}>
        {snapshot.recentDecisions.map((item) => (
          <View key={item.id} style={styles.recentRow}>
            <View style={styles.recentTextCol}>
              <Text style={styles.recentTitle}>{item.title}</Text>
              <Text style={styles.recentSubtitle}>{item.subtitle}</Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: item.badgeTone === 'positive' ? colors.positiveTint : colors.cautionTint },
              ]}
            >
              <Text
                style={[
                  styles.badgeLabel,
                  { color: item.badgeTone === 'positive' ? colors.positive : colors.caution },
                ]}
              >
                {item.badge}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 34, paddingTop: 8 },
  monthLabel: { fontFamily: fontFamily.sans, fontSize: 16, color: colors.textSecondary },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.divider },
  moneyLeftLabel: { fontFamily: fontFamily.sans, fontSize: 13, letterSpacing: 0.6, color: colors.textTertiary, marginBottom: 6 },
  moneyLeftValue: { fontFamily: fontFamily.serif, fontSize: 68, lineHeight: 68, color: colors.textPrimary, marginBottom: 6 },
  moneyLeftNote: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.positive, marginBottom: 26 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.mdl, marginTop: spacing.smd, marginBottom: 34 },
  legendItem: { fontFamily: fontFamily.sans, fontSize: 13, color: colors.textSecondary },
  ctaCard: { backgroundColor: colors.navy, borderWidth: 0, borderRadius: 22, padding: 24, marginBottom: 28 },
  ctaTitle: { fontFamily: fontFamily.serif, fontSize: 26, lineHeight: 30, color: colors.textInverse, marginBottom: 16 },
  ctaButton: { backgroundColor: colors.surface, borderRadius: 14, height: 50, alignItems: 'center', justifyContent: 'center' },
  ctaButtonLabel: { fontFamily: fontFamily.sansSemiBold, fontSize: 16, color: colors.navy },
  recentLabel: { fontFamily: fontFamily.sans, fontSize: 13, letterSpacing: 0.6, color: colors.textTertiary, marginBottom: 12 },
  recentRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.mdl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentTextCol: { flex: 1, marginRight: spacing.smd },
  emptyRecent: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary },
  recentTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 16, color: colors.textPrimary },
  recentSubtitle: { fontFamily: fontFamily.sans, fontSize: 13, color: colors.textTertiary, marginTop: 2 },
  badge: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 },
  badgeLabel: { fontFamily: fontFamily.sansSemiBold, fontSize: 12 },
});
