import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ListRow } from '../../../components/ui/ListRow';
import { StatusPill } from '../../../components/ui/Pill';
import { colors, fontFamily } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';

/** D1b · Transfer result */
export function FamilyTransferResultScreen({ navigation }: RootScreenProps<'FamilyTransferResult'>) {
  return (
    <Screen
      footer={
        <Button label="Set up 800 monthly" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })} />
      }
    >
      <StatusPill label="SEND LESS" tone="caution" />
      <Text style={styles.title}>Send 800 a month, not 1,200.</Text>
      <Text style={styles.body}>
        At 1,200 every month you cross your floor in November when the car insurance lands. At 800 you never do,
        and you can top up in months that run light.
      </Text>

      <Card padding={0} style={{ marginBottom: 12 }}>
        <View style={{ paddingHorizontal: 18 }}>
          <ListRow label="Safe recurring amount" value="800" />
          <ListRow label="Safe one-off this month" value="1,200" />
          <ListRow label="Lowest balance after" value="1,950" valueColor={colors.positive} last />
        </View>
      </Card>

      <Card tone="fill">
        <Text style={styles.footnote}>
          Best day to send: <Text style={styles.footnoteBold}>the 2nd</Text>, right after payday, before your
          standing orders clear.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 36, lineHeight: 40, color: colors.textPrimary, marginBottom: 12 },
  body: { fontFamily: fontFamily.sans, fontSize: 16, lineHeight: 23, color: colors.textSecondary, marginBottom: 24 },
  footnote: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  footnoteBold: { fontFamily: fontFamily.sansSemiBold, color: colors.textPrimary },
});
