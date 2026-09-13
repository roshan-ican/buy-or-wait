import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ListRow } from '../../../components/ui/ListRow';
import { SegmentBar } from '../../../components/ui/ProgressBar';
import { StatusDot } from '../../../components/ui/StatusTag';
import { StatusPill } from '../../../components/ui/Pill';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';
import { repositories } from '../../../data/repositories';
import { useAsync } from '../../../hooks/useAsync';

/** E7 · Summary */
export function SummaryScreen({ navigation }: RootScreenProps<'BulkSummary'>) {
  const s = useAsync(() => repositories.bulkAnalysis.getSummary(), []);

  if (!s) return <Screen><Text style={styles.insightText}>Preparing your results…</Text></Screen>;

  return (
    <Screen
      footer={
        <View style={styles.footerRow}>
          <Button label="Download" variant="outline" flex={1} onPress={() => navigation.navigate('BulkDownload')} />
          <Button label="View results" flex={1.2} onPress={() => navigation.navigate('BulkResultsTable')} />
        </View>
      }
    >
      <StatusPill label="ANALYSIS COMPLETE" tone="positive" />
      <Text style={styles.title}>{s.totalRequests} requests, read one at a time.</Text>

      <SegmentBar
        height={12}
        segments={[
          { value: s.safeCount, color: colors.positive },
          { value: s.cautionCount, color: colors.cautionBar },
          { value: s.waitCount, color: colors.danger },
        ]}
      />

      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <StatusDot tone="positive" />
          <Text style={styles.legendCount}>{s.safeCount}</Text>
          <Text style={styles.legendLabel}>safe to proceed</Text>
        </View>
        <View style={styles.legendRow}>
          <StatusDot tone="caution" />
          <Text style={styles.legendCount}>{s.cautionCount}</Text>
          <Text style={styles.legendLabel}>need caution or a plan</Text>
        </View>
        <View style={styles.legendRow}>
          <StatusDot tone="danger" />
          <Text style={styles.legendCount}>{s.waitCount}</Text>
          <Text style={styles.legendLabel}>should wait</Text>
        </View>
      </View>

      <Card padding={0} style={{ marginBottom: 26 }}>
        <View style={{ paddingHorizontal: 20 }}>
          <ListRow label="Requested across source currencies" value={s.totalAnalysedAed.toLocaleString()} />
          <ListRow
            label="Safe to proceed with"
            value={s.safeToProceedAed.toLocaleString()}
            valueColor={colors.positive}
          />
          <ListRow label="Need a change to work" value={`${s.needsChangeCount} requests`} last />
        </View>
      </Card>

      <Text style={styles.sectionLabel}>WHAT STANDS OUT</Text>
      <View style={{ gap: spacing.sm }}>
        {s.insights.map((insight, i) => (
          <Card key={i} tone="fill">
            <Text style={styles.insightText}>{insight}</Text>
          </Card>
        ))}
      </View>

      <Text style={styles.footnote}>Insights are a summary. The row-by-row recommendations are the answer.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 40, lineHeight: 43, color: colors.textPrimary, marginVertical: 20 },
  legend: { gap: spacing.smd, marginTop: spacing.smd, marginBottom: spacing.xxl },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.smd },
  legendCount: { fontFamily: fontFamily.serif, fontSize: 26, width: 44, color: colors.textPrimary },
  legendLabel: { fontFamily: fontFamily.sans, fontSize: 16, color: colors.textSecondary },
  sectionLabel: { fontFamily: fontFamily.sans, fontSize: 13, letterSpacing: 0.6, color: colors.textTertiary, marginBottom: 12 },
  insightText: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, color: colors.textPrimary },
  footnote: { fontFamily: fontFamily.sans, fontSize: 14, lineHeight: 21, color: colors.textTertiary, marginTop: spacing.lgl },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
});
