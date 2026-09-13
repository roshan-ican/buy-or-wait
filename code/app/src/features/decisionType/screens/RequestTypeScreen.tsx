import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { OptionCard } from '../../../components/ui/OptionCard';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps, RootStackParamList } from '../../../navigation/types';

type RequestTypeRoute = Exclude<keyof RootStackParamList, 'Main'>;

const requestTypes: { icon: string; title: string; route: RequestTypeRoute; danger?: boolean }[] = [
  { icon: '◍', title: 'Family transfer', route: 'FamilyTransfer' },
  { icon: '◆', title: 'Purchase', route: 'PurchaseItem' },
  { icon: '◇', title: 'Investment', route: 'Investment' },
  { icon: '◌', title: 'Debt repayment', route: 'DebtRepayment' },
  { icon: '◐', title: 'Travel', route: 'Travel' },
  { icon: '▤', title: 'Housing', route: 'Housing' },
  { icon: '▲', title: 'Education', route: 'Education' },
  { icon: '✚', title: 'Emergency', route: 'Emergency', danger: true },
];

/** B3 · What is the decision? */
export function RequestTypeScreen({ navigation }: RootScreenProps<'RequestType'>) {
  return (
    <Screen header={<BackHeader icon="close" onBack={() => navigation.goBack()} />}>
      <Text style={styles.title}>What is this about?</Text>
      <Text style={styles.subtitle}>Each one asks different questions.</Text>

      <View style={styles.grid}>
        {requestTypes.map((item) => (
          <View key={item.route} style={styles.gridItem}>
            <OptionCard
              icon={item.icon}
              title={item.title}
              danger={item.danger}
              compact
              onPress={() => navigation.navigate(item.route as never)}
            />
          </View>
        ))}
      </View>

      <Pressable style={styles.otherCard} onPress={() => navigation.navigate('OtherRequest')}>
        <Text style={styles.otherTitle}>Something else</Text>
        <Text style={styles.otherSubtitle}>Describe it in your own words</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 34, color: colors.textPrimary, marginBottom: 6 },
  subtitle: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, marginBottom: 26 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gridItem: { width: '48%' },
  otherCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderDashed,
    borderRadius: 18,
    padding: spacing.mdl,
    marginTop: spacing.sm,
  },
  otherTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 15, color: colors.textPrimary, marginBottom: 4 },
  otherSubtitle: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.textTertiary },
});
