import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Sheet } from '../../../components/ui/Sheet';
import { StatusDot } from '../../../components/ui/StatusTag';
import { colors, fontFamily, spacing } from '../../../theme';
import { PlanTone, ResultRow } from '../../../data/types';
import { RootScreenProps } from '../../../navigation/types';
import { repositories } from '../../../data/repositories';
import { useAsync } from '../../../hooks/useAsync';

const columnWidths = [22, 120, 120, 150, 110];

type Filter = 'all' | PlanTone;

const toneLabel: Record<PlanTone, string> = { positive: 'SAFE', caution: 'CAUTION', danger: 'WAIT' };

/** E8 · Results table (with the E9 row-detail sheet) */
export function ResultsTableScreen({ navigation }: RootScreenProps<'BulkResultsTable'>) {
  const [filter, setFilter] = useState<Filter>('all');
  const [openRow, setOpenRow] = useState<ResultRow | null>(null);
  const resultRows = useAsync(() => repositories.bulkAnalysis.getResultRows(), []) ?? [];

  const counts = useMemo(() => ({
    positive: resultRows.filter((row) => row.tone === 'positive').length,
    caution: resultRows.filter((row) => row.tone === 'caution').length,
    danger: resultRows.filter((row) => row.tone === 'danger').length,
  }), [resultRows]);
  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: `All ${resultRows.length}` },
    { id: 'positive', label: `🟢 ${counts.positive}` },
    { id: 'caution', label: `🟡 ${counts.caution}` },
    { id: 'danger', label: `🔴 ${counts.danger}` },
  ];

  const rows = useMemo(
    () => (filter === 'all' ? resultRows : resultRows.filter((r) => r.tone === filter)),
    [filter, resultRows],
  );

  return (
    <Screen
      header={
        <BackHeader
          onBack={() => navigation.goBack()}
          trailing={
            <Pressable onPress={() => navigation.navigate('BulkDownload')}>
              <Text style={styles.downloadLink}>↓ output.csv</Text>
            </Pressable>
          }
        />
      }
    >
      <Text style={styles.title}>Row by row</Text>

      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setFilter(f.id)}
            style={[styles.filterPill, filter === f.id ? styles.filterPillSelected : styles.filterPillPlain]}
          >
            <Text style={[styles.filterLabel, filter === f.id && styles.filterLabelSelected]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={{ width: columnWidths[0] }} />
            <Text style={[styles.headCell, { width: columnWidths[1] }]}>REQUEST</Text>
            <Text style={[styles.headCell, { width: columnWidths[2] }]}>SAFE NOW</Text>
            <Text style={[styles.headCell, { width: columnWidths[3] }]}>METHOD</Text>
            <Text style={[styles.headCell, { width: columnWidths[4] }]}>EARLIEST</Text>
          </View>
          {rows.map((row, i) => (
            <Pressable
              key={row.id}
              onPress={() => setOpenRow(row)}
              style={[styles.rowBlock, i < rows.length - 1 && styles.rowDivider]}
            >
              <View style={styles.row}>
                <View style={{ width: columnWidths[0] }}>
                  <StatusDot tone={row.tone} size={9} />
                </View>
                <View style={{ width: columnWidths[1] }}>
                  <Text style={styles.cellTitle}>{row.title}</Text>
                  <Text style={styles.cellSubtitle}>{row.type}</Text>
                </View>
                <Text style={[styles.cellBold, { width: columnWidths[2] }]}>{row.safeNow}</Text>
                <Text style={[styles.cellMuted, { width: columnWidths[3] }]}>{row.method}</Text>
                <Text style={[styles.cellMuted, { width: columnWidths[4] }]}>{row.earliest}</Text>
              </View>
              {row.reason ? (
                <Text style={[styles.reason, { color: toneColor(row.tone) }]} numberOfLines={2}>
                  {row.reason}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <Text style={styles.footnote}>Tap any row for the full reasoning.</Text>

      <Sheet visible={!!openRow} onClose={() => setOpenRow(null)}>
        {openRow ? (
          <View>
            <View style={styles.sheetHeader}>
              <StatusDot tone={openRow.tone} size={12} />
              <Text style={[styles.sheetTag, { color: toneColor(openRow.tone) }]}>{toneLabel[openRow.tone]}</Text>
              <Text style={styles.sheetId}>{openRow.id}</Text>
            </View>
            <Text style={styles.sheetHeadline}>{openRow.detail.headline}</Text>
            <Text style={styles.sheetBody}>{openRow.detail.explanation}</Text>
            <View style={styles.sheetTable}>
              <View style={styles.sheetRow}>
                <Text style={styles.sheetRowLabel}>Requested</Text>
                <Text style={styles.sheetRowValue}>{openRow.detail.requested}</Text>
              </View>
              <View style={styles.sheetRow}>
                <Text style={styles.sheetRowLabel}>Requested amount</Text>
                <Text style={styles.sheetRowValue}>{openRow.detail.inAed}</Text>
              </View>
              <View style={styles.sheetRow}>
                <Text style={styles.sheetRowLabel}>Safe to pay now</Text>
                <Text style={[styles.sheetRowValue, { color: colors.positive }]}>{openRow.detail.safeNow}</Text>
              </View>
              <View style={[styles.sheetRow, styles.sheetRowLast]}>
                <Text style={styles.sheetRowLabel}>Balance after</Text>
                <Text style={styles.sheetRowValue}>{openRow.detail.balanceAfter}</Text>
              </View>
            </View>
            <View style={styles.sheetFootnoteCard}>
              <Text style={styles.sheetFootnote}>{openRow.detail.footnote}</Text>
            </View>
          </View>
        ) : null}
      </Sheet>
    </Screen>
  );
}

function toneColor(tone: PlanTone) {
  return tone === 'positive' ? colors.positive : tone === 'caution' ? colors.caution : colors.danger;
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 30, lineHeight: 34, color: colors.textPrimary, marginBottom: 14 },
  downloadLink: { fontFamily: fontFamily.sansSemiBold, fontSize: 15, color: colors.accent },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: 18 },
  filterPill: { borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14 },
  filterPillSelected: { backgroundColor: colors.navy },
  filterPillPlain: { borderWidth: 1, borderColor: colors.border },
  filterLabel: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.textSecondary },
  filterLabelSelected: { color: colors.textInverse },
  tableScroll: { flexGrow: 0, marginHorizontal: -spacing.xxxl },
  table: { minWidth: 640, paddingHorizontal: spacing.xxxl },
  headerRow: { flexDirection: 'row', gap: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  headCell: { fontFamily: fontFamily.sans, fontSize: 12, letterSpacing: 0.4, color: colors.textTertiary },
  rowBlock: { paddingVertical: 12 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  reason: { fontFamily: fontFamily.sansSemiBold, fontSize: 13, marginTop: 6, marginLeft: 30, maxWidth: 560 },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: colors.dividerSoft },
  cellTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 14, color: colors.textPrimary },
  cellSubtitle: { fontFamily: fontFamily.sans, fontSize: 12, color: colors.textTertiary },
  cellBold: { fontFamily: fontFamily.sansSemiBold, fontSize: 14, color: colors.textPrimary },
  cellMuted: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.textSecondary },
  footnote: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.textTertiary, marginTop: 16 },

  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sheetTag: { fontFamily: fontFamily.sansBold, fontSize: 13, letterSpacing: 0.5 },
  sheetId: { fontFamily: fontFamily.sans, fontSize: 13, color: colors.textTertiary, marginLeft: 'auto' },
  sheetHeadline: { fontFamily: fontFamily.serif, fontSize: 32, lineHeight: 36, color: colors.textPrimary, marginBottom: 12 },
  sheetBody: { fontFamily: fontFamily.sans, fontSize: 16, lineHeight: 23, color: colors.textSecondary, marginBottom: 22 },
  sheetTable: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingHorizontal: 18, marginBottom: 16 },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderBottomColor: colors.dividerSoft,
  },
  sheetRowLast: { borderBottomWidth: 0 },
  sheetRowLabel: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textSecondary },
  sheetRowValue: { fontFamily: fontFamily.sansSemiBold, fontSize: 15, color: colors.textPrimary },
  sheetFootnoteCard: { backgroundColor: colors.neutralFill, borderRadius: 16, padding: 18 },
  sheetFootnote: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
});
