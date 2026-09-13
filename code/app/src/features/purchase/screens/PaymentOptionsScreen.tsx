import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { CheckRow } from '../../../components/ui/CheckRow';
import { Divider } from '../../../components/ui/Divider';
import { Toggle } from '../../../components/ui/Toggle';
import { colors, fontFamily, spacing } from '../../../theme';
import { paymentOptions } from '../../../data';
import { RootScreenProps } from '../../../navigation/types';
import { repositories } from '../../../data/repositories';

/** C3 · Ways you could pay */
export function PaymentOptionsScreen({ navigation }: RootScreenProps<'PurchasePaymentOptions'>) {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(paymentOptions.map((o) => [o.id, o.available])),
  );
  const [useSavings, setUseSavings] = useState(false);
  const evaluate = () => {
    const draft = repositories.singleDecision.getDraft();
    const selectedPlans = [checked['3mo'] ? 3 : 0, checked['6mo'] ? 6 : 0].filter(Boolean);
    repositories.singleDecision.saveDraft({ ...draft, selectedPlans });
    navigation.navigate('PurchaseAnalysing');
  };

  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} progress={1} progressLabel="Purchase" />}
      footer={<Button label="Work it out" onPress={evaluate} />}
    >
      <Text style={styles.title}>Which of these are actually available?</Text>
      <Text style={styles.subtitle}>Only the ones you tick get compared.</Text>

      <View style={{ gap: spacing.sm }}>
        {paymentOptions.map((option) => (
          <CheckRow
            key={option.id}
            label={option.label}
            hint={option.hint}
            checked={checked[option.id]}
            onPress={() => setChecked((c) => ({ ...c, [option.id]: !c[option.id] }))}
          />
        ))}
      </View>

      <View style={styles.savingsSection}>
        <Divider soft />
        <View style={styles.savingsRow}>
          <View style={styles.savingsTextCol}>
            <Text style={styles.savingsTitle}>Can it use your savings?</Text>
            <Text style={styles.savingsBody}>
              You have 2,000 set aside. It will only suggest this if nothing safer works.
            </Text>
          </View>
          <Toggle value={useSavings} onValueChange={setUseSavings} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 34, lineHeight: 38, color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, marginBottom: 26 },
  savingsSection: { marginTop: 28 },
  savingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.mdl, paddingTop: 24 },
  savingsTextCol: { flex: 1 },
  savingsTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 4 },
  savingsBody: { fontFamily: fontFamily.sans, fontSize: 14, lineHeight: 19, color: colors.textTertiary, maxWidth: 230 },
});
