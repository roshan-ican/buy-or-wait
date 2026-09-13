import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { Pill } from '../../../components/ui/Pill';
import { Toggle } from '../../../components/ui/Toggle';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';
import { repositories } from '../../../data';

const timings = ['No rush', 'This month', 'A set date'];

/** C2 · Want or need, and when */
export function WantOrNeedScreen({ navigation }: RootScreenProps<'PurchaseWantOrNeed'>) {
  const draft = repositories.singleDecision.getDraft();
  const [isWant, setIsWant] = useState(draft.needLevel === 'want');
  const [timing, setTiming] = useState('No rush');
  const [offerOn, setOfferOn] = useState(true);

  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} progress={2 / 3} progressLabel="Purchase" />}
      footer={<Button label="Next" onPress={() => {
        repositories.singleDecision.saveDraft({ ...draft, needLevel: isWant ? 'want' : 'need' });
        navigation.navigate('PurchasePaymentOptions');
      }} />}
    >
      <Text style={styles.title}>Is this a need or a want?</Text>
      <Text style={styles.subtitle}>Honest answers get better advice. No judgement either way.</Text>

      <View style={styles.pairRow}>
        <Pressable onPress={() => setIsWant(false)} style={[styles.pairCard, !isWant && styles.pairCardSelected]}>
          <Text style={[styles.pairTitle, !isWant && styles.pairTitleSelected]}>Need</Text>
          <Text style={[styles.pairBody, !isWant && styles.pairBodySelected]}>
            Work, health, or something breaks without it
          </Text>
        </Pressable>
        <Pressable onPress={() => setIsWant(true)} style={[styles.pairCard, isWant && styles.pairCardSelected]}>
          <Text style={[styles.pairTitle, isWant && styles.pairTitleSelected]}>Want {isWant ? '✓' : ''}</Text>
          <Text style={[styles.pairBody, isWant && styles.pairBodySelected]}>
            Life is fine without it, but you would enjoy it
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>When do you need it?</Text>
      <View style={styles.pillRow}>
        {timings.map((t) => (
          <Pill key={t} label={t} selected={timing === t} onPress={() => setTiming(t)} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Is there an offer running?</Text>
      <Text style={styles.sectionSubtitle}>A deadline changes whether waiting is worth it.</Text>
      <View style={styles.offerRow}>
        <Text style={styles.offerLabel}>15% off, ends 30 Sep</Text>
        <Toggle value={offerOn} onValueChange={setOfferOn} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 34, lineHeight: 38, color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, marginBottom: 20 },
  pairRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: 32 },
  pairCard: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg },
  pairCardSelected: { borderWidth: 1.5, borderColor: colors.navy, backgroundColor: colors.navy },
  pairTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 17, color: colors.textPrimary, marginBottom: 4 },
  pairTitleSelected: { color: colors.textInverse },
  pairBody: { fontFamily: fontFamily.sans, fontSize: 14, lineHeight: 19, color: colors.textTertiary },
  pairBodySelected: { color: colors.textInverseMuted },
  sectionTitle: { fontFamily: fontFamily.serif, fontSize: 26, color: colors.textPrimary, marginBottom: 6 },
  sectionSubtitle: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.textTertiary, marginBottom: 14 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: 32 },
  offerRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: spacing.mdl,
    paddingHorizontal: spacing.lgl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerLabel: { fontFamily: fontFamily.sans, fontSize: 16, color: colors.textSecondary },
});
