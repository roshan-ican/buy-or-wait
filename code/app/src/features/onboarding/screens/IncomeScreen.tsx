import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { LabeledField } from '../../../components/ui/LabeledField';
import { Pill } from '../../../components/ui/Pill';
import { colors, fontFamily, spacing } from '../../../theme';
import { repositories } from '../../../data';
import { RootScreenProps } from '../../../navigation/types';

function ordinal(day: number) {
  if (day % 10 === 1 && day !== 11) return `${day}st`;
  if (day % 10 === 2 && day !== 12) return `${day}nd`;
  if (day % 10 === 3 && day !== 13) return `${day}rd`;
  return `${day}th`;
}

/** A2 · Income */
export function IncomeScreen({ navigation }: RootScreenProps<'Income'>) {
  const initial = repositories.profile.getProfileSync();
  const hasSaved = repositories.profile.hasSavedProfile();

  const [salary, setSalary] = useState(hasSaved ? String(initial.monthlySalary) : '');
  const [otherIncome, setOtherIncome] = useState(hasSaved && initial.otherMonthlyIncome ? String(initial.otherMonthlyIncome) : '');
  const [payFrequency, setPayFrequency] = useState(initial.payFrequency);
  const [payDay, setPayDay] = useState(String(initial.payDay));

  const continueSetup = async () => {
    const monthlySalary = Number(salary.replaceAll(',', ''));
    if (!Number.isFinite(monthlySalary) || monthlySalary <= 0) return;
    const parsedDay = Math.min(31, Math.max(1, Math.round(Number(payDay)) || 28));
    await repositories.profile.saveProfile({
      ...initial,
      monthlySalary,
      otherMonthlyIncome: Math.max(0, Number(otherIncome.replaceAll(',', '')) || 0),
      payFrequency,
      payDay: parsedDay,
    });
    navigation.navigate('Expenses');
  };

  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} progress={1 / 3} progressLabel="1 of 3" />}
      footer={<Button label="Continue" onPress={continueSetup} />}
    >
      <Text style={styles.title}>What comes in each month?</Text>
      <Text style={styles.subtitle}>Take-home pay after tax and deductions.</Text>

      <LabeledField
        label="MONTHLY SALARY"
        required
        labelVariant="section"
        prefix={initial.currency}
        value={salary}
        editable
        keyboardType="numeric"
        onChangeText={setSalary}
        placeholderText="12,000"
      />
      <View style={{ height: spacing.xxl }} />
      <LabeledField
        label="OTHER REGULAR INCOME"
        optionalNote="optional"
        labelVariant="section"
        prefix={initial.currency}
        value={otherIncome}
        editable
        keyboardType="numeric"
        onChangeText={setOtherIncome}
        placeholderText="0"
      />
      <View style={styles.pillRow}>
        <Pill label="Paid monthly" selected={payFrequency === 'monthly'} onPress={() => setPayFrequency('monthly')} />
        <Pill
          label={`Paid on the ${ordinal(Number(payDay) || 28)}`}
          selected={payFrequency === 'fixed_day'}
          onPress={() => setPayFrequency('fixed_day')}
        />
      </View>
      {payFrequency === 'fixed_day' ? (
        <View style={{ marginTop: spacing.mdl }}>
          <LabeledField
            label="DAY OF THE MONTH"
            value={payDay}
            editable
            keyboardType="numeric"
            onChangeText={setPayDay}
            serifValue={false}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 36, lineHeight: 40, color: colors.textPrimary, marginBottom: 10 },
  subtitle: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, marginBottom: 36 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.mdl },
});
