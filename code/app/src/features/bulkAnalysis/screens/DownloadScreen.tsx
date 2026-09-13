import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { IconGlyph } from '../../../components/ui/IconGlyph';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';
import { repositories } from '../../../data/repositories';

const addedColumns = [
  'amount_safe_to_pay',
  'affordability_status',
  'recommended_payment_method',
  'payment_plan',
  'earliest_date_for_full_payment',
  'spending_changes_needed',
  'decision_explanation',
];

/** E10 · Your file — download (UI-only: toggles a local "saved" state, no real file I/O). */
export function DownloadScreen({ navigation }: RootScreenProps<'BulkDownload'>) {
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState('');
  const job = repositories.bulkAnalysis.getCurrentJob();

  const download = async () => {
    setError('');
    try {
      await repositories.bulkAnalysis.download();
      setDownloaded(true);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Download failed.');
    }
  };

  return (
    <Screen
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button label="↓  Download output.csv" onPress={download} />
          <View style={styles.secondaryRow}>
            <Button label="Share" variant="outline" flex={1} size="md" />
            <Button
              label="View results"
              variant="outline"
              flex={1}
              size="md"
              onPress={() => navigation.navigate('BulkResultsTable')}
            />
          </View>
        </View>
      }
    >
      <Text style={styles.checkmark}>✓</Text>
      <Text style={styles.title}>Your file is ready.</Text>
      <Text style={styles.body}>
        {job?.completed_rows ?? 0} requests analysed and formatted for the HackerRank output contract.
      </Text>

      <Card style={{ marginBottom: 22 }}>
        <View style={styles.fileRow}>
          <IconGlyph glyph="▤" size={16} color={colors.accent} circleSize={38} circleColor={colors.accentTint} />
          <View>
            <Text style={styles.fileName}>output.csv</Text>
            <Text style={styles.fileMeta}>{job?.completed_rows ?? 0} rows · 8 columns</Text>
          </View>
        </View>
        <Text style={styles.addedLabel}>ADDED COLUMNS</Text>
        <Text style={styles.addedColumns}>{addedColumns.join(' · ')}</Text>
      </Card>

      {downloaded ? (
        <Card style={{ backgroundColor: colors.positiveTint, borderWidth: 0, marginBottom: 14 }}>
          <Text style={styles.savedText}>✓ output.csv saved to your downloads</Text>
        </Card>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.footnote}>
        Change your profile or exclude rows and generate it again — the old file stays in your history.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  checkmark: { fontSize: 40, marginBottom: 18 },
  title: { fontFamily: fontFamily.serif, fontSize: 38, lineHeight: 41, color: colors.textPrimary, marginBottom: 12 },
  body: { fontFamily: fontFamily.sans, fontSize: 16, lineHeight: 23, color: colors.textSecondary, marginBottom: 28 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.smd, marginBottom: 16 },
  fileName: { fontFamily: fontFamily.sansSemiBold, fontSize: 16, color: colors.textPrimary },
  fileMeta: { fontFamily: fontFamily.sans, fontSize: 13, color: colors.textTertiary },
  addedLabel: { fontFamily: fontFamily.sans, fontSize: 13, letterSpacing: 0.4, color: colors.textTertiary, marginBottom: 8 },
  addedColumns: { fontFamily: fontFamily.sans, fontSize: 14, lineHeight: 24, color: colors.textSecondary },
  savedText: { fontFamily: fontFamily.sansSemiBold, fontSize: 15, color: colors.positive },
  error: { fontFamily: fontFamily.sans, fontSize: 14, lineHeight: 20, color: colors.danger, marginBottom: 14 },
  footnote: { fontFamily: fontFamily.sans, fontSize: 14, lineHeight: 21, color: colors.textTertiary },
  secondaryRow: { flexDirection: 'row', gap: spacing.sm },
});
