import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ListRow } from '../../../components/ui/ListRow';
import { Pill } from '../../../components/ui/Pill';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';

/** D3 · Debt repayment */
export function DebtRepaymentScreen({ navigation }: RootScreenProps<'DebtRepayment'>) {
  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} />}
      footer={<Button label="Check it" onPress={() => navigation.popToTop()} />}
    >
      <Text style={styles.title}>Paying down a debt</Text>

      <Card padding={0} style={{ marginBottom: 18 }}>
        <View style={{ paddingHorizontal: 18 }}>
          <ListRow label="Still owed" value="8,400" />
          <ListRow label="Minimum payment" value="450 / mo" />
          <ListRow label="Interest" value="18.9%" valueColor={colors.danger} />
          <ListRow label="Due" value="15th monthly" last />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>How much extra do you want to put in?</Text>
      <View style={styles.amountBox}>
        <Text style={styles.currency}>AED</Text>
        <Text style={styles.amount}>1,500</Text>
      </View>
      <View style={styles.pillRow}>
        <Pill label="Just the minimum" />
        <Pill label="Clear it all" />
      </View>

      <Card tone="fill">
        <Text style={styles.noteText}>
          Another card at 24% is costing you more per dirham. It will compare the two before recommending where the
          extra goes.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 32, lineHeight: 36, color: colors.textPrimary, marginBottom: 22 },
  sectionTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 15, color: colors.textPrimary, marginBottom: 10 },
  amountBox: {
    borderWidth: 1.5,
    borderColor: colors.navy,
    borderRadius: 16,
    paddingVertical: spacing.mdl,
    paddingHorizontal: spacing.lgl,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  currency: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.textTertiary },
  amount: { fontFamily: fontFamily.serif, fontSize: 28, color: colors.textPrimary },
  pillRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: 22 },
  noteText: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
});
