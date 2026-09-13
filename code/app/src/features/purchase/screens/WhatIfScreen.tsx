import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { colors, fontFamily, spacing } from '../../../theme';
import { whatIfOptions } from '../../../data';
import { RootScreenProps } from '../../../navigation/types';

/** C6 · What if */
export function WhatIfScreen({ navigation }: RootScreenProps<'PurchaseWhatIf'>) {
  const [selected, setSelected] = useState('discount');

  return (
    <Screen
      header={<BackHeader icon="close" onBack={() => navigation.goBack()} />}
      footer={
        <Button
          label="Apply to my plan"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
        />
      }
    >
      <Text style={styles.title}>What if…</Text>
      <Text style={styles.subtitle}>Change one thing and watch the answer move.</Text>

      <View style={{ gap: spacing.sm, marginBottom: spacing.xxl }}>
        {whatIfOptions.map((option) => {
          const isSelected = option.id === selected;
          return (
            <Pressable
              key={option.id}
              onPress={() => setSelected(option.id)}
              style={[styles.optionRow, isSelected ? styles.optionRowSelected : styles.optionRowPlain]}
            >
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{option.label}</Text>
              <Text style={[styles.optionDelta, isSelected && styles.optionDeltaSelected]}>{option.delta}</Text>
            </Pressable>
          );
        })}
      </View>

      <Card style={{ borderRadius: 20, padding: 22 }}>
        <Text style={styles.thenLabel}>THEN</Text>
        <Text style={styles.thenTitle}>Pay in full becomes safe.</Text>
        <Text style={styles.thenBody}>
          At 5,100 you would still hold 1,400 in cash plus 2,000 savings — just under your floor on cash alone, so
          the app would still nudge you to a 3-month plan at 1,700 a month.
        </Text>
        <View style={styles.thenStatsRow}>
          <View>
            <Text style={styles.thenStatLabel}>SHARE OF SALARY</Text>
            <Text style={styles.thenStatValue}>42.5%</Text>
          </View>
          <View>
            <Text style={styles.thenStatLabel}>EARLIEST SAFE DATE</Text>
            <Text style={styles.thenStatValue}>28 Sep</Text>
          </View>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 36, lineHeight: 40, color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, marginBottom: 26 },
  optionRow: {
    borderRadius: 16,
    paddingVertical: spacing.mdl,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionRowPlain: { borderWidth: 1, borderColor: colors.border },
  optionRowSelected: { borderWidth: 1.5, borderColor: colors.accent, backgroundColor: colors.accentTint },
  optionLabel: { fontFamily: fontFamily.sans, fontSize: 16, color: colors.textSecondary },
  optionLabelSelected: { fontFamily: fontFamily.sansSemiBold, color: colors.textPrimary },
  optionDelta: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary },
  optionDeltaSelected: { fontFamily: fontFamily.sansSemiBold, color: colors.accent },
  thenLabel: { fontFamily: fontFamily.sans, fontSize: 13, letterSpacing: 0.6, color: colors.textTertiary, marginBottom: 10 },
  thenTitle: { fontFamily: fontFamily.serif, fontSize: 30, lineHeight: 34, color: colors.textPrimary, marginBottom: 14 },
  thenBody: { fontFamily: fontFamily.sans, fontSize: 16, lineHeight: 23, color: colors.textSecondary, marginBottom: 18 },
  thenStatsRow: {
    flexDirection: 'row',
    gap: 20,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderTopColor: colors.dividerSoft,
    paddingTop: 16,
  },
  thenStatLabel: { fontFamily: fontFamily.sans, fontSize: 12, color: colors.textTertiary, marginBottom: 2 },
  thenStatValue: { fontFamily: fontFamily.serif, fontSize: 26, color: colors.textPrimary },
});
