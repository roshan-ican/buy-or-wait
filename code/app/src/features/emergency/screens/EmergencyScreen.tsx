import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { LabeledField } from '../../../components/ui/LabeledField';
import { Pill, StatusPill } from '../../../components/ui/Pill';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';

const categories = ['Medical', 'Home repair', 'Car', 'Other'];
const stageOptions = ['Yes', 'No', 'Not sure'];

/** D7 · Emergency */
export function EmergencyScreen({ navigation }: RootScreenProps<'Emergency'>) {
  const [category, setCategory] = useState('Medical');
  const [staged, setStaged] = useState('Yes');

  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} />}
      footer={<Button label="Find a way to cover it" variant="danger" onPress={() => navigation.navigate('EmergencyResult')} />}
    >
      <StatusPill label="URGENT" tone="danger" />
      <Text style={styles.title}>What has happened?</Text>
      <Text style={styles.subtitle}>This one will not tell you to wait. It works out how to cover it.</Text>

      <View style={styles.pillRow}>
        {categories.map((c) => (
          <Pill key={c} label={c} tone="danger" selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>

      <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
        <LabeledField label="AMOUNT NEEDED" emphasized prefix="AED" value="3,200" />
        <LabeledField label="BY WHEN" value="Today" serifValue={false} />
      </View>

      <Text style={styles.sectionTitle}>Can it be paid in stages?</Text>
      <View style={styles.pillRow}>
        {stageOptions.map((s) => (
          <Pill key={s} label={s} selected={staged === s} onPress={() => setStaged(s)} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 32, lineHeight: 36, color: colors.textPrimary, marginBottom: 6 },
  subtitle: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, marginBottom: 18 },
  sectionTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 15, color: colors.textPrimary, marginBottom: 10 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: 18 },
});
