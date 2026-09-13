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

/** D6 · Education */
export function EducationScreen({ navigation }: RootScreenProps<'Education'>) {
  const [hasInstalments, setHasInstalments] = useState(true);

  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} />}
      footer={<Button label="Check it" onPress={() => navigation.popToTop()} />}
    >
      <Text style={styles.title}>A course or a qualification</Text>

      <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
        <LabeledField label="WHAT" value="CFA Level 1" serifValue={false} />
        <LabeledField label="TOTAL COST" emphasized prefix="AED" value="4,800" />
        <LabeledField label="PAY BY" value="14 November" serifValue={false} />
      </View>

      <Text style={styles.sectionTitle}>Does the school offer instalments?</Text>
      <View style={styles.pillRow}>
        <Pill label="Yes, 3 payments" selected={hasInstalments} onPress={() => setHasInstalments(true)} />
        <Pill label="No" selected={!hasInstalments} onPress={() => setHasInstalments(false)} />
      </View>

      <Card style={{ backgroundColor: colors.positiveTint, borderWidth: 0 }}>
        <Text style={styles.noteText}>
          You have two months before the deadline. Three payments of 1,600 starting now is comfortable and beats
          paying in one go in November, when the car insurance also lands.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 32, lineHeight: 36, color: colors.textPrimary, marginBottom: 22 },
  sectionTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 15, color: colors.textPrimary, marginBottom: 10 },
  pillRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: 22 },
  noteText: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, color: colors.textPrimary },
});
