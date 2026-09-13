import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Divider } from '../../../components/ui/Divider';
import { ListRow } from '../../../components/ui/ListRow';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';

/** D4 · Travel */
export function TravelScreen({ navigation }: RootScreenProps<'Travel'>) {
  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} />}
      footer={<Button label="Check it" onPress={() => navigation.popToTop()} />}
    >
      <Text style={styles.title}>Georgia, 12–19 Dec</Text>
      <Text style={styles.subtitle}>The whole trip, not just the flight.</Text>

      <Card padding={0} style={{ marginBottom: 16 }}>
        <View style={{ paddingHorizontal: 18 }}>
          <ListRow label="Flights" value="1,600" />
          <ListRow label="Stay · 7 nights" value="2,100" />
          <ListRow label="Food & local transport" value="1,100" />
          <ListRow label="Activities" value="600" last />
        </View>
      </Card>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Trip total</Text>
        <Text style={styles.totalValue}>AED 5,400</Text>
      </View>
      <View style={styles.paidRow}>
        <Text style={styles.paidLabel}>Already paid</Text>
        <Text style={styles.paidValue}>1,600 · flights booked</Text>
      </View>
      <Divider />
      <View style={[styles.totalRow, { marginTop: 16 }]}>
        <Text style={styles.totalLabel}>Still to find</Text>
        <Text style={[styles.totalValue, { color: colors.caution }]}>AED 3,800</Text>
      </View>

      <Card tone="fill" style={{ marginTop: 18 }}>
        <Text style={styles.noteText}>
          Spread across October and November this fits. All at once in December, it does not.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 32, lineHeight: 36, color: colors.textPrimary, marginBottom: 6 },
  subtitle: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, marginBottom: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  totalLabel: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary },
  totalValue: { fontFamily: fontFamily.serif, fontSize: 30, color: colors.textPrimary },
  paidRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 16 },
  paidLabel: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textSecondary },
  paidValue: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textSecondary },
  noteText: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
});
