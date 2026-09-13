import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { LabeledField } from '../../../components/ui/LabeledField';
import { Pill } from '../../../components/ui/Pill';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';

/** D1 · Family transfer */
export function FamilyTransferScreen({ navigation }: RootScreenProps<'FamilyTransfer'>) {
  const [recurring, setRecurring] = useState(true);

  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} />}
      footer={<Button label="Check it" onPress={() => navigation.navigate('FamilyTransferResult')} />}
    >
      <Text style={styles.title}>Sending money home</Text>

      <View style={{ gap: spacing.sm }}>
        <LabeledField label="AMOUNT" emphasized prefix="AED" value="1,200" />
        <LabeledField label="WHO" value="Mother" serifValue={false} />
        <LabeledField label="NEEDED BY" value="Before the 25th" serifValue={false} />
      </View>

      <Text style={styles.sectionTitle}>One-off or every month?</Text>
      <View style={styles.pillRow}>
        <Pill label="One-off" selected={!recurring} onPress={() => setRecurring(false)} />
        <Pill label="Every month" selected={recurring} onPress={() => setRecurring(true)} />
      </View>

      <Card tone="caution" style={{ backgroundColor: colors.cautionTint, borderWidth: 0 }}>
        <Text style={styles.noteText}>
          A recurring 1,200 is 27% of your free cash. It gets checked against all six months, not just this one.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 32, lineHeight: 36, color: colors.textPrimary, marginBottom: 24 },
  sectionTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 15, color: colors.textPrimary, marginVertical: 14 },
  pillRow: { flexDirection: 'row', gap: spacing.xs },
  noteText: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, color: colors.textPrimary },
});
