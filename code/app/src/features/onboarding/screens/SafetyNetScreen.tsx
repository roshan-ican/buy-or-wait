import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DotSlider } from '../../../components/ui/ProgressBar';
import { IconGlyph } from '../../../components/ui/IconGlyph';
import { LabeledField } from '../../../components/ui/LabeledField';
import { colors, fontFamily, spacing } from '../../../theme';
import { repositories } from '../../../data';
import { RootScreenProps } from '../../../navigation/types';

/** A4 · Savings, EMIs, floor */
export function SafetyNetScreen({ navigation }: RootScreenProps<'SafetyNet'>) {
  const initial = repositories.profile.getProfileSync();
  const [savings, setSavings] = useState(String(initial.currentSavings));
  const [commitments, setCommitments] = useState(String(initial.monthlyCommitments));
  const [minimum, setMinimum] = useState(String(initial.minimumBalance));
  const minimumValue = Math.max(0, Number(minimum) || 0);
  const rangeMax = Math.max(initial.minimumBalanceRangeMax, Number(savings) || 0, minimumValue, 1);
  const progress = minimumValue / rangeMax;
  const finish = async () => {
    await repositories.profile.saveProfile({
      ...initial,
      currentSavings: Math.max(0, Number(savings) || 0),
      monthlyCommitments: Math.max(0, Number(commitments) || 0),
      minimumBalance: minimumValue,
      minimumBalanceRangeMax: rangeMax,
    });
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} progress={1} progressLabel="3 of 3" />}
      footer={
        <Button label="Finish setup" onPress={finish} />
      }
    >
      <Text style={styles.title}>Your safety net</Text>
      <Text style={styles.subtitle}>This is what the app protects. It will not recommend anything that breaks through it.</Text>

      <LabeledField label="CURRENT SAVINGS" prefix={initial.currency} value={savings} editable keyboardType="numeric" onChangeText={setSavings} />

      <Text style={styles.sectionLabel}>EXISTING EMIS & COMMITMENTS</Text>
      <LabeledField label="MONTHLY EMI TOTAL" prefix={initial.currency} value={commitments} editable keyboardType="numeric" onChangeText={setCommitments} />

      <Text style={styles.sectionLabelTight}>MINIMUM BALANCE YOU NEVER WANT TO CROSS</Text>
      <LabeledField label="PROTECTED BALANCE" prefix={initial.currency} value={minimum} emphasized editable keyboardType="numeric" onChangeText={setMinimum} />
      <View style={{ height: 14 }} />
      <DotSlider progress={progress} onChange={(p) => setMinimum(String(Math.round(p * rangeMax)))} />
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>0</Text>
        <Text style={styles.sliderLabel}>{rangeMax.toLocaleString()}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 34, lineHeight: 38, color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, marginBottom: 30 },
  sectionLabel: { fontFamily: fontFamily.sansSemiBold, fontSize: 13, color: colors.textSecondary, marginTop: 26, marginBottom: 10 },
  sectionLabelTight: { fontFamily: fontFamily.sansSemiBold, fontSize: 13, color: colors.textSecondary, marginTop: 26, marginBottom: 6 },
  addRow: { padding: 0, marginBottom: 0 },
  addRowInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.smd, padding: spacing.lgl },
  addLabel: { fontFamily: fontFamily.sans, fontSize: 16, color: colors.textSecondary },
  bigValue: { fontFamily: fontFamily.serif, fontSize: 40, color: colors.textPrimary, marginBottom: 14 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  sliderLabel: { fontFamily: fontFamily.sans, fontSize: 13, color: colors.textTertiary },
});
