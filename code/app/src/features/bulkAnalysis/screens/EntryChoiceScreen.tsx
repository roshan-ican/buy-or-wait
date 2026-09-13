import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';

/** E1 · Two ways in */
export function EntryChoiceScreen({ navigation }: RootScreenProps<'EntryChoice'>) {
  return (
    <Screen header={<BackHeader icon="close" onBack={() => navigation.goBack()} />}>
      <Text style={styles.title}>How much are we looking at?</Text>

      <Pressable style={styles.card} onPress={() => navigation.navigate('RequestType')}>
        <Text style={styles.icon}>＋</Text>
        <Text style={styles.cardTitle}>One decision</Text>
        <Text style={styles.cardBody}>Answer a few questions and get a recommendation you can act on today.</Text>
      </Pressable>

      <Pressable style={[styles.card, styles.cardSelected]} onPress={() => navigation.navigate('BulkUpload')}>
        <Text style={[styles.icon, styles.iconSelected]}>▤</Text>
        <Text style={styles.cardTitle}>A file of decisions</Text>
        <Text style={styles.cardBody}>
          Upload a spreadsheet and every row comes back with its own recommendation, plus a CSV you can keep.
        </Text>
      </Pressable>

      <Text style={styles.footnote}>
        Both use the same forecast: your income, essentials, commitments and the balance you protect.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 34, lineHeight: 38, color: colors.textPrimary, marginBottom: 26 },
  card: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 22,
    padding: spacing.xxl,
    marginBottom: spacing.smd,
  },
  cardSelected: { borderColor: colors.accent, backgroundColor: colors.accentTint },
  icon: { fontSize: 24, marginBottom: 14, color: colors.textPrimary },
  iconSelected: { color: colors.accent },
  cardTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 20, color: colors.textPrimary, marginBottom: 6 },
  cardBody: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 21, color: colors.textSecondary },
  footnote: { fontFamily: fontFamily.sans, fontSize: 14, lineHeight: 21, color: colors.textTertiary, marginTop: spacing.xl },
});
