import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Card } from '../../../components/ui/Card';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';
import { repositories } from '../../../data/repositories';

/** E2 · Upload */
export function UploadScreen({ navigation }: RootScreenProps<'BulkUpload'>) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const chooseFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setBusy(true);
      setError('');
      try {
        await repositories.bulkAnalysis.upload(file);
        navigation.navigate('BulkStructureCheck');
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'The upload failed.');
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };

  return (
    <Screen header={<BackHeader onBack={() => navigation.goBack()} />}>
      <Text style={styles.title}>Analyse your financial requests</Text>
      <Text style={styles.subtitle}>Upload a file and we will evaluate each request for you.</Text>

      <Pressable style={styles.dropzone} onPress={chooseFile} disabled={busy}>
        <Text style={styles.dropIcon}>▤</Text>
        <Text style={styles.dropTitle}>Drop your file here</Text>
        <Text style={styles.dropOr}>or</Text>
        <View style={styles.chooseButton}>
          <Text style={styles.chooseButtonLabel}>{busy ? 'Uploading…' : 'Choose a file'}</Text>
        </View>
      </Pressable>

      <View style={styles.formatsRow}>
        <Text style={styles.formatsLabel}>Supported formats</Text>
        <Text style={styles.formatsValue}>CSV, XLSX</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card tone="fill">
        <Text style={styles.noteText}>
          Your profile stays in this browser. The local analysis server evaluates each request and returns a decision table.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 34, lineHeight: 38, color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontFamily: fontFamily.sans, fontSize: 16, color: colors.textSecondary, marginBottom: 30 },
  dropzone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderDashedBlue,
    backgroundColor: '#F7F8FC',
    borderRadius: 24,
    paddingVertical: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 18,
  },
  dropIcon: { fontSize: 34, color: colors.accent, marginBottom: 16 },
  dropTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 18, color: colors.textPrimary, marginBottom: 4 },
  dropOr: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.textTertiary, marginBottom: 22 },
  chooseButton: { backgroundColor: colors.navy, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 26 },
  chooseButtonLabel: { fontFamily: fontFamily.sansSemiBold, fontSize: 16, color: colors.textInverse },
  formatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 26,
  },
  formatsLabel: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.textTertiary },
  formatsValue: { fontFamily: fontFamily.sansSemiBold, fontSize: 14, color: colors.textPrimary },
  noteText: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  error: { fontFamily: fontFamily.sans, fontSize: 14, lineHeight: 20, color: colors.danger, marginBottom: 16 },
});
