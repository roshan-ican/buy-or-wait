import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';
import { repositories } from '../../../data/repositories';
import { useAsync } from '../../../hooks/useAsync';

const columnWidths = [120, 140, 130, 110, 90];

/** E5 · Preview before analysis */
export function PreviewScreen({ navigation }: RootScreenProps<'BulkPreview'>) {
  const rows = useAsync(() => repositories.bulkAnalysis.getPreviewRows(), []) ?? [];
  const total = repositories.bulkAnalysis.getCurrentJob()?.total_rows ?? rows.length;
  const startAnalysis = async () => {
    await repositories.bulkAnalysis.start();
    navigation.navigate('BulkProgress');
  };
  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} />}
      footer={<Button label={`Analyse ${total} requests`} onPress={startAnalysis} />}
    >
      <Text style={styles.title}>Check the data first</Text>
      <Text style={styles.subtitle}>{total} rows · swipe the table sideways</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={[styles.headCell, { width: columnWidths[0] }]}>REQUEST</Text>
            <Text style={[styles.headCell, { width: columnWidths[1] }]}>TYPE</Text>
            <Text style={[styles.headCell, { width: columnWidths[2] }]}>AMOUNT</Text>
            <Text style={[styles.headCell, { width: columnWidths[3] }]}>NEEDED BY</Text>
            <Text style={[styles.headCell, { width: columnWidths[4] }]}>STATUS</Text>
          </View>
          {rows.map((row, i) => (
            <View key={row.id} style={[styles.row, i < rows.length - 1 && styles.rowDivider]}>
              <Text style={[styles.cellMuted, { width: columnWidths[0] }]}>{row.id}</Text>
              <Text style={[styles.cell, { width: columnWidths[1] }]}>{row.type}</Text>
              <Text style={[styles.cellBold, { width: columnWidths[2] }]}>{row.amount}</Text>
              <Text style={[styles.cellMuted, { width: columnWidths[3] }]}>{row.neededBy}</Text>
              <Text style={[styles.cellStatus, { width: columnWidths[4] }]}>{row.status}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <Text style={styles.moreRows}>…{Math.max(0, total - rows.length)} more rows</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 32, lineHeight: 36, color: colors.textPrimary, marginBottom: 6 },
  subtitle: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, marginBottom: 20 },
  tableScroll: { flexGrow: 0, marginHorizontal: -spacing.xxxl },
  table: { minWidth: 660, paddingHorizontal: spacing.xxxl },
  headerRow: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headCell: { fontFamily: fontFamily.sans, fontSize: 12, letterSpacing: 0.4, color: colors.textTertiary },
  row: { flexDirection: 'row', paddingVertical: 13, alignItems: 'center' },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: colors.dividerSoft },
  cell: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.textPrimary },
  cellMuted: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.textSecondary },
  cellBold: { fontFamily: fontFamily.sansSemiBold, fontSize: 14, color: colors.textPrimary },
  cellStatus: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.positive },
  moreRows: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.textTertiary, paddingTop: 16 },
});
