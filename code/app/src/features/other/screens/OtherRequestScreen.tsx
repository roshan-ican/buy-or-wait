import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';

const followUps = [
  {
    id: 'items',
    title: 'What are the things, and how much is each?',
    body: 'Phone screen 900 · Sister’s wedding gift 1,500 · Dentist 600',
    dashed: false,
  },
  { id: 'deadline', title: 'Which has a real deadline?', body: 'Wedding, 18 Oct', dashed: false },
];

/** D8 · Other, in your own words */
export function OtherRequestScreen({ navigation }: RootScreenProps<'OtherRequest'>) {
  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} />}
      footer={<Button label="Answer these" onPress={() => navigation.popToTop()} />}
    >
      <Text style={styles.title}>Tell it what is going on</Text>

      <Card tone="selected" style={{ marginBottom: 22 }}>
        <Text style={styles.userText}>
          I have a few things coming next month and I do not know which to deal with first.
        </Text>
      </Card>

      <Text style={styles.sectionLabel}>IT NEEDS TO KNOW</Text>
      <View style={{ gap: spacing.sm }}>
        {followUps.map((item) => (
          <Card key={item.id}>
            <Text style={styles.followUpTitle}>{item.title}</Text>
            <Text style={styles.followUpBody}>{item.body}</Text>
          </Card>
        ))}
        <Card tone="dashed" style={styles.dashedRow}>
          <Text style={styles.dashedIcon}>◆</Text>
          <Text style={styles.dashedText}>Which could wait a month without a problem?</Text>
        </Card>
      </View>

      <Card tone="fill" style={{ marginTop: spacing.xl }}>
        <Text style={styles.noteText}>Three follow-ups, then it ranks them against your October cash flow.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 32, lineHeight: 36, color: colors.textPrimary, marginBottom: 20 },
  userText: { fontFamily: fontFamily.sans, fontSize: 17, lineHeight: 25, color: colors.textPrimary },
  sectionLabel: { fontFamily: fontFamily.sans, fontSize: 13, letterSpacing: 0.6, color: colors.textTertiary, marginBottom: 12 },
  followUpTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 6 },
  followUpBody: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.textTertiary },
  dashedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dashedIcon: { color: colors.accent },
  dashedText: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textSecondary },
  noteText: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
});
