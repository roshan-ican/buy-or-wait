import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ListRow } from '../../../components/ui/ListRow';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';

/** D5 · Housing */
export function HousingScreen({ navigation }: RootScreenProps<'Housing'>) {
  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} />}
      footer={<Button label="Check it" onPress={() => navigation.popToTop()} />}
    >
      <Text style={styles.title}>Moving somewhere new</Text>
      <Text style={styles.subtitle}>Two questions: can you move in, and can you keep living there.</Text>

      <Text style={styles.sectionLabel}>UP FRONT</Text>
      <Card padding={0} style={{ marginBottom: 18 }}>
        <View style={{ paddingHorizontal: 18 }}>
          <ListRow label="Deposit" value="4,200" />
          <ListRow label="Agency fee" value="2,100" />
          <ListRow label="Moving & furniture" value="3,000" last />
        </View>
      </Card>

      <Text style={styles.sectionLabel}>EVERY MONTH AFTER</Text>
      <Card padding={0} style={{ marginBottom: 18 }}>
        <View style={{ paddingHorizontal: 18 }}>
          <ListRow label="Rent" value="4,200" delta="+700" />
          <ListRow label="Utilities" value="850" delta="+150" last />
        </View>
      </Card>

      <Card tone="danger">
        <Text style={styles.noteText}>
          You can cover the 9,300 move-in. The problem is after: 850 more each month takes your free cash from
          4,500 to 3,650, every month, forever.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 32, lineHeight: 36, color: colors.textPrimary, marginBottom: 6 },
  subtitle: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, marginBottom: 20 },
  sectionLabel: { fontFamily: fontFamily.sans, fontSize: 12, letterSpacing: 0.6, color: colors.textTertiary, marginBottom: 8 },
  noteText: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, color: colors.textPrimary },
});
