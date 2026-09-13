import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { SegmentBar } from '../../../components/ui/ProgressBar';
import { StatusPill } from '../../../components/ui/Pill';
import { StatusTag } from '../../../components/ui/StatusTag';
import { colors, fontFamily, spacing } from '../../../theme';
import { repositories } from '../../../data';
import { recordRecentDecision } from '../../../data/recentDecisions';
import { RootScreenProps } from '../../../navigation/types';

/** C5 · The recommendation */
export function RecommendationScreen({ navigation }: RootScreenProps<'PurchaseRecommendation'>) {
  const decision = repositories.singleDecision.getDecision();
  const draft = repositories.singleDecision.getDraft();
  const profile = repositories.profile.getProfileSync();
  if (!decision) return <Screen><Text style={styles.body}>No decision is available yet.</Text></Screen>;
  const label = decision.status === 'buy_now' ? 'YES — BUY NOW' : decision.status === 'use_plan' ? 'YES — WITH A PLAN' : 'WAIT';
  const tone = decision.status === 'wait' ? 'danger' : 'positive';
  const finish = () => {
    recordRecentDecision({
      title: draft.item,
      subtitle: `${draft.category} · ${profile.currency} ${draft.price.toLocaleString()}`,
      badge:
        decision.status === 'use_plan'
          ? `${decision.recommendedMonths}-MO PLAN`
          : decision.status === 'buy_now'
            ? 'BUY NOW'
            : 'WAIT',
      badgeTone: decision.status === 'wait' ? 'caution' : 'positive',
    });
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };
  return (
    <Screen
      header={
        <BackHeader
          onBack={() => navigation.goBack()}
          trailing={<Text style={styles.saveLabel}>Save</Text>}
        />
      }
      footer={
        <View style={styles.footerRow}>
          <Button label="What if…" variant="outline" flex={0.85} onPress={() => navigation.navigate('PurchaseWhatIf')} />
          <Button
            label={decision.status === 'use_plan' ? `Use ${decision.recommendedMonths}-month plan` : decision.status === 'buy_now' ? 'Buy now' : 'Back home'}
            flex={1.5}
            compactLabel
            onPress={finish}
          />
        </View>
      }
    >
      <StatusPill label={label} tone={tone} />
      <Text style={styles.headline}>{decision.headline}</Text>
      <Text style={styles.body}>{decision.explanation}</Text>

      <Card style={styles.shareCard}>
        <View style={styles.shareRow}>
          <View>
            <Text style={styles.shareLabel}>SHARE OF SALARY</Text>
            <Text style={styles.shareValue}>{decision.salaryPercentage.toFixed(1)}%</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.shareLabel}>MONEY LEFT AFTER</Text>
            <Text style={[styles.shareValue, { color: colors.positive }]}>{profile.currency} {Math.max(0, decision.monthlySurplus - (decision.monthlyPayment ?? 0)).toLocaleString()}</Text>
          </View>
        </View>
        <SegmentBar
          height={8}
          segments={[
            { value: 30, color: colors.positive },
            { value: 10, color: colors.positiveSoft },
            { value: 10, color: colors.cautionBar },
            { value: 50, color: colors.danger },
          ]}
        />
        <View style={styles.shareScale}>
          {['0%', '30%', '40%', '50%', '100%'].map((t) => (
            <Text key={t} style={styles.shareScaleLabel}>
              {t}
            </Text>
          ))}
        </View>
        <Text style={styles.shareNote}>
          {draft.item} costs {decision.salaryPercentage.toFixed(1)}% of one month’s salary. The recommendation also protects your minimum balance.
        </Text>
      </Card>

      <Text style={styles.compareLabel}>EVERY OPTION, COMPARED</Text>
      <View style={{ gap: spacing.xs, marginBottom: spacing.xxl }}>
        <Card tone={decision.status === 'wait' ? 'danger' : 'positive'} padding={spacing.lgl}>
          <View style={styles.compareRow}>
            <Text style={styles.compareTitle}>{decision.status === 'use_plan' ? `${decision.recommendedMonths} months · ${profile.currency} ${decision.monthlyPayment?.toLocaleString()} / month` : decision.status === 'buy_now' ? `Pay ${profile.currency} ${draft.price.toLocaleString()} now` : 'Wait and save first'}</Text>
            <StatusTag label={decision.status === 'wait' ? 'WAIT' : 'SAFEST'} tone={decision.status === 'wait' ? 'danger' : 'positive'} />
          </View>
          <Text style={styles.compareBody}>{decision.explanation}</Text>
        </Card>
      </View>

      <Card tone="fill" style={{ marginBottom: spacing.lgl }}>
        <Text style={styles.blockLabel}>IF YOU WANT IT SOONER</Text>
        <Text style={styles.blockBody}>
          Your safe amount today is <Text style={styles.blockBold}>{profile.currency} {decision.safeNow.toLocaleString()}</Text>.
          {decision.earliestMonths ? ` Saving your monthly surplus would fund the full purchase in about ${decision.earliestMonths} month(s).` : ''}
        </Text>
      </Card>

      <Card tone="accentFill">
        <Text style={[styles.blockLabel, { color: colors.accent }]}>ONE MORE THING</Text>
        <Text style={styles.blockBody}>
          You marked this a <Text style={styles.blockBold}>{draft.needLevel}</Text>. It is a good decision either way —
          nothing here breaks if you skip it.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  saveLabel: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textSecondary },
  headline: { fontFamily: fontFamily.serif, fontSize: 40, lineHeight: 43, color: colors.textPrimary, marginVertical: 14 },
  body: { fontFamily: fontFamily.sans, fontSize: 17, lineHeight: 25, color: colors.textSecondary, marginBottom: 26 },
  shareCard: { marginBottom: 26, borderRadius: 20 },
  shareRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  shareLabel: { fontFamily: fontFamily.sans, fontSize: 12, letterSpacing: 0.4, color: colors.textTertiary },
  shareValue: { fontFamily: fontFamily.serif, fontSize: 30, color: colors.textPrimary },
  shareScale: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  shareScaleLabel: { fontFamily: fontFamily.sans, fontSize: 11, color: colors.textTertiary },
  shareNote: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.textSecondary, marginTop: 10 },
  compareLabel: { fontFamily: fontFamily.sans, fontSize: 13, letterSpacing: 0.6, color: colors.textTertiary, marginBottom: 12 },
  compareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  compareTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 16, color: colors.textPrimary },
  compareBody: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.textSecondary },
  blockLabel: { fontFamily: fontFamily.sans, fontSize: 13, letterSpacing: 0.6, color: colors.textTertiary, marginBottom: 10 },
  blockBody: { fontFamily: fontFamily.sans, fontSize: 16, lineHeight: 23, color: colors.textPrimary },
  blockBold: { fontFamily: fontFamily.sansSemiBold },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
});
