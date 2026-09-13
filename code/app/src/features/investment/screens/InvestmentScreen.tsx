import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DotSlider } from '../../../components/ui/ProgressBar';
import { LabeledField } from '../../../components/ui/LabeledField';
import { Pill } from '../../../components/ui/Pill';
import { SelectRow } from '../../../components/ui/SelectRow';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';

const horizons = ['Under a year', '1–3 years', '5+ years'];

/** D2 · Investment */
export function InvestmentScreen({ navigation }: RootScreenProps<'Investment'>) {
  const [horizon, setHorizon] = useState('5+ years');
  const [riskComfort, setRiskComfort] = useState(0.55);

  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} />}
      footer={<Button label="Check it" onPress={() => navigation.popToTop()} />}
    >
      <Text style={styles.title}>Putting money in</Text>
      <Text style={styles.subtitle}>It checks your liquidity, not the investment. No return is promised here.</Text>

      <View style={{ gap: spacing.sm }}>
        <LabeledField label="AMOUNT" emphasized prefix="AED" value="2,000" />
        <SelectRow label="TYPE" value="Index fund" />
      </View>

      <Text style={styles.sectionTitle}>When might you need this money back?</Text>
      <View style={styles.pillRow}>
        {horizons.map((h) => (
          <Pill key={h} label={h} selected={horizon === h} onPress={() => setHorizon(h)} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Comfort with losing value for a while</Text>
      <DotSlider progress={riskComfort} onChange={setRiskComfort} />
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>Low</Text>
        <Text style={styles.sliderLabel}>High</Text>
      </View>

      <Card tone="danger" style={{ marginTop: spacing.xl }}>
        <Text style={styles.noteText}>
          This 2,000 is your entire emergency fund. Investing all of it leaves nothing for an unexpected month.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 32, lineHeight: 36, color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, marginBottom: 22 },
  sectionTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 15, color: colors.textPrimary, marginVertical: 14 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  sliderLabel: { fontFamily: fontFamily.sans, fontSize: 13, color: colors.textTertiary },
  noteText: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, color: colors.textPrimary },
});
