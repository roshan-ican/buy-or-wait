import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';

const breakdown = [
  { id: 'cash', title: 'From this month’s cash', note: 'Keeps you 1,500 clear', amount: '1,800' },
  { id: 'savings', title: 'From savings', note: 'Leaves 800 in reserve', amount: '1,200' },
  { id: 'pause', title: 'Pause optional spending', note: 'Shopping and travel, this month', amount: '200' },
];

/** D7b · Emergency plan */
export function EmergencyResultScreen({ navigation }: RootScreenProps<'EmergencyResult'>) {
  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'Main' }] });

  return (
    <Screen
      footer={
        <View style={styles.footerRow}>
          <Button label="Split it" variant="outline" flex={1} onPress={goHome} />
          <Button label="Use this plan" flex={1} onPress={goHome} />
        </View>
      }
    >
      <Text style={styles.title}>Here is the 3,200.</Text>
      <Text style={styles.body}>
        Covered today without crossing your floor. You will be back to normal by the end of October.
      </Text>

      <View style={{ gap: spacing.sm, marginBottom: spacing.lgl }}>
        {breakdown.map((item) => (
          <Card key={item.id} style={styles.breakdownRow}>
            <View>
              <Text style={styles.breakdownTitle}>{item.title}</Text>
              <Text style={styles.breakdownNote}>{item.note}</Text>
            </View>
            <Text style={styles.breakdownAmount}>{item.amount}</Text>
          </Card>
        ))}
      </View>

      <Card tone="fill" style={{ marginBottom: spacing.smd }}>
        <Text style={styles.noteText}>
          The clinic takes payment in two parts. Splitting it 1,800 now and 1,400 on 20 Oct would leave your
          savings untouched entirely — <Text style={styles.noteBold}>worth asking</Text>.
        </Text>
      </Card>
      <Text style={styles.footnote}>Your camera plan is paused until this clears.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 36, lineHeight: 40, color: colors.textPrimary, marginBottom: 12 },
  body: { fontFamily: fontFamily.sans, fontSize: 16, lineHeight: 23, color: colors.textSecondary, marginBottom: 20 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakdownTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 16, color: colors.textPrimary },
  breakdownNote: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.textTertiary, marginTop: 2 },
  breakdownAmount: { fontFamily: fontFamily.serif, fontSize: 24, color: colors.textPrimary },
  noteText: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  noteBold: { fontFamily: fontFamily.sansSemiBold, color: colors.textPrimary },
  footnote: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, color: colors.textTertiary },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
});
