import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { LabeledField } from '../../../components/ui/LabeledField';
import { colors, fontFamily, spacing } from '../../../theme';
import { repositories } from '../../../data';
import { ExpenseItem, Profile } from '../../../data/types';
import { RootScreenProps } from '../../../navigation/types';

type ExpenseKey = 'essentialExpenses' | 'flexibleExpenses' | 'optionalExpenses';

export function ExpensesScreen({ navigation }: RootScreenProps<'Expenses'>) {
  const [profile, setProfile] = useState(repositories.profile.getProfileSync());
  const tiers: { key: ExpenseKey; dotColor: string; title: string; note: string }[] = [
    { key: 'essentialExpenses', dotColor: colors.navy, title: 'ESSENTIAL', note: 'never touched' },
    { key: 'flexibleExpenses', dotColor: colors.accent, title: 'FLEXIBLE', note: 'can be trimmed' },
    { key: 'optionalExpenses', dotColor: colors.accentSoft, title: 'OPTIONAL', note: 'first to pause' },
  ];
  const total = useMemo(
    () => [...profile.essentialExpenses, ...profile.flexibleExpenses, ...profile.optionalExpenses]
      .reduce((sum, item) => sum + item.amount, 0),
    [profile],
  );

  const updateExpense = (key: ExpenseKey, id: string, value: string) => {
    setProfile((current) => ({
      ...current,
      [key]: current[key].map((item: ExpenseItem) =>
        item.id === id ? { ...item, amount: Math.max(0, Number(value) || 0) } : item),
    } as Profile));
  };

  const continueSetup = async () => {
    await repositories.profile.saveProfile(profile);
    navigation.navigate('SafetyNet');
  };

  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} progress={2 / 3} progressLabel="2 of 3" />}
      footer={
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{profile.currency} {total.toLocaleString()}</Text>
          </View>
          <Button label="Continue" flex={1} onPress={continueSetup} />
        </View>
      }
    >
      <Text style={styles.title}>Where does it go?</Text>
      <Text style={styles.subtitle}>Enter monthly amounts. Only flexible and optional spending may be reduced.</Text>

      {tiers.map((tier) => (
        <View key={tier.key} style={styles.tierBlock}>
          <View style={styles.tierHeader}>
            <View style={[styles.dot, { backgroundColor: tier.dotColor }]} />
            <Text style={styles.tierTitle}>{tier.title}</Text>
            <Text style={styles.tierNote}>· {tier.note}</Text>
          </View>
          <Card padding={0} style={styles.tierCard}>
            {profile[tier.key].map((item) => (
              <View key={item.id} style={styles.rowPad}>
                <LabeledField
                  label={item.label.toUpperCase()}
                  prefix={profile.currency}
                  value={String(item.amount)}
                  editable
                  keyboardType="numeric"
                  onChangeText={(value) => updateExpense(tier.key, item.id, value)}
                />
              </View>
            ))}
          </Card>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 34, lineHeight: 38, color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, marginBottom: 26 },
  tierBlock: { marginBottom: 22 },
  tierHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 2 },
  tierTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 13, letterSpacing: 0.6, color: colors.textPrimary },
  tierNote: { fontFamily: fontFamily.sans, fontSize: 13, color: colors.textTertiary },
  tierCard: { paddingHorizontal: 10, paddingVertical: 5 },
  rowPad: { marginVertical: 5 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.mdl },
  totalLabel: { fontFamily: fontFamily.sans, fontSize: 12, color: colors.textTertiary },
  totalValue: { fontFamily: fontFamily.serif, fontSize: 26, color: colors.textPrimary },
});
