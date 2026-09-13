import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { ListRow } from '../../../components/ui/ListRow';
import { Pill } from '../../../components/ui/Pill';
import { ForecastChart } from '../../../components/charts/ForecastChart';
import { colors, fontFamily, spacing } from '../../../theme';
import { knownUpcoming } from '../../../data';
import { MainTabScreenProps } from '../../../navigation/types';

const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];

/** B2 · Forecast */
export function ForecastScreen(_props: MainTabScreenProps<'Forecast'>) {
  const [withCamera, setWithCamera] = useState(false);

  return (
    <Screen>
      <Text style={styles.title}>Next six months</Text>
      <Text style={styles.subtitle}>
        Balance after income, essentials, commitments and everything you have told it is coming.
      </Text>

      <View style={styles.pillRow}>
        <Pill label="As things stand" selected={!withCamera} onPress={() => setWithCamera(false)} />
        <Pill label="With camera" selected={withCamera} onPress={() => setWithCamera(true)} />
      </View>

      <ForecastChart showComparison={withCamera} />
      <View style={styles.monthRow}>
        {months.map((m) => (
          <Text key={m} style={styles.monthLabel}>
            {m}
          </Text>
        ))}
      </View>

      <Card style={styles.lowestCard}>
        <Text style={styles.cardLabel}>LOWEST POINT</Text>
        <Text style={styles.lowestValue}>AED 2,350 · mid-November</Text>
        <Text style={styles.lowestBody}>
          Car insurance of 1,800 lands on 12 Nov. Even with the camera plan you stay 850 above your floor.
        </Text>
      </Card>

      <Card padding={0}>
        <View style={styles.knownHeader}>
          <Text style={styles.cardLabel}>KNOWN AHEAD</Text>
        </View>
        <View style={styles.knownRows}>
          {knownUpcoming.map((item, i) => (
            <ListRow
              key={item.id}
              label={`${item.label} · ${item.date}`}
              value={item.amount.toLocaleString()}
              last={i === knownUpcoming.length - 1}
            />
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 34, color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, marginBottom: 24 },
  pillRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: 24 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 26 },
  monthLabel: { fontFamily: fontFamily.sans, fontSize: 12, color: colors.textTertiary },
  lowestCard: { marginBottom: 14 },
  cardLabel: { fontFamily: fontFamily.sans, fontSize: 13, letterSpacing: 0.6, color: colors.textTertiary, marginBottom: 8 },
  lowestValue: { fontFamily: fontFamily.serif, fontSize: 30, color: colors.textPrimary, marginBottom: 6 },
  lowestBody: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 21, color: colors.textSecondary },
  knownHeader: { paddingHorizontal: 20, paddingTop: 20 },
  knownRows: { paddingHorizontal: 20, paddingBottom: 4 },
});
