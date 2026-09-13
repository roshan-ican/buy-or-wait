import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { IconGlyph } from '../../../components/ui/IconGlyph';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';
import { repositories } from '../../../data/repositories';

const mappedColumns = ['request_type', 'requested_amount', 'desired_completion_date', 'allows_partial_payment'];

/** E3 · Structure check */
export function StructureCheckScreen({ navigation }: RootScreenProps<'BulkStructureCheck'>) {
  const job = repositories.bulkAnalysis.getCurrentJob();
  const checks = [
    { id: 'read', text: 'File read' },
    { id: 'rows', text: `${job?.total_rows ?? 0} rows detected` },
    { id: 'cols', text: `${job?.columns?.length ?? 0} columns detected` },
    { id: 'types', text: 'Required request fields recognised' },
  ];
  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} />}
      footer={
        <View style={styles.footerRow}>
          <Button label="Review" variant="outline" flex={1} onPress={() => navigation.goBack()} />
          <Button label="Continue" flex={1} onPress={() => navigation.navigate('BulkIssues')} />
        </View>
      }
    >
      <View style={styles.fileRow}>
        <IconGlyph glyph="▤" size={17} color={colors.accent} circleSize={40} circleColor={colors.accentTint} />
        <View>
          <Text style={styles.fileName}>{job?.file_name ?? 'requests.csv'}</Text>
          <Text style={styles.fileMeta}>{job?.total_rows ?? 0} rows · just now</Text>
        </View>
      </View>

      <View style={{ gap: spacing.smd, marginBottom: spacing.xxl }}>
        {checks.map((c) => (
          <View key={c.id} style={styles.checkRow}>
            <Text style={styles.checkMark}>✓</Text>
            <Text style={styles.checkText}>{c.text}</Text>
          </View>
        ))}
      </View>

      <Card padding={0} style={{ marginBottom: 20 }}>
        <View style={{ paddingHorizontal: 18 }}>
          {mappedColumns.map((col, i) => (
            <View key={col} style={[styles.mappedRow, i < mappedColumns.length - 1 && styles.mappedRowDivider]}>
              <Text style={styles.mappedCol}>{col}</Text>
              <Text style={styles.mappedStatus}>mapped</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={{ backgroundColor: colors.cautionTint, borderWidth: 0 }}>
        <Text style={styles.warningText}>
          <Text style={styles.warningBold}>Financial context connected.</Text> Income, balances, events and payment
          options are resolved from the challenge dataset for each user ID.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.smd, marginBottom: 24 },
  fileName: { fontFamily: fontFamily.sansSemiBold, fontSize: 17, color: colors.textPrimary },
  fileMeta: { fontFamily: fontFamily.sans, fontSize: 13, color: colors.textTertiary },
  checkRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.smd },
  checkMark: { color: colors.positive },
  checkText: { fontFamily: fontFamily.sans, fontSize: 16, color: colors.textPrimary },
  mappedRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11 },
  mappedRowDivider: { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: colors.dividerSoft },
  mappedCol: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textSecondary },
  mappedStatus: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.positive },
  warningText: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, color: colors.textPrimary },
  warningBold: { fontFamily: fontFamily.sansSemiBold },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
});
