import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';
import { repositories } from '../../../data/repositories';

const issues = [
  {
    id: 'profile',
    title: 'Financial context is separate',
    body: 'Each row is joined to its own profile, events, pending payments and seller payment options through user_id and request_id.',
    action: 'Context connected',
    tone: 'caution' as const,
  },
];

/** E4 · What needs attention */
export function IssuesScreen({ navigation }: RootScreenProps<'BulkIssues'>) {
  const total = repositories.bulkAnalysis.getCurrentJob()?.total_rows ?? 0;
  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} />}
      footer={
        <View style={styles.footerRow}>
          <Button label="Fix first" variant="outline" flex={1} onPress={() => navigation.goBack()} />
          <Button label={`Review all ${total}`} flex={1.4} onPress={() => navigation.navigate('BulkPreview')} />
        </View>
      }
    >
      <Text style={styles.title}>Your rows are ready. Here is how their context will be handled.</Text>
      <Text style={styles.subtitle}>Every request is evaluated independently.</Text>

      <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
        {issues.map((issue) => (
          <Card key={issue.id} tone={issue.tone}>
            <Text style={styles.issueTitle}>{issue.title}</Text>
            <Text style={styles.issueBody}>{issue.body}</Text>
            <Text style={styles.issueAction}>{issue.action}</Text>
          </Card>
        ))}
      </View>

      <Text style={styles.footnote}>
        Invalid files stop before analysis. Valid rows always receive one of the four required affordability statuses.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 32, lineHeight: 36, color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, marginBottom: 24 },
  issueTitle: { fontFamily: fontFamily.sansSemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 4 },
  issueBody: { fontFamily: fontFamily.sans, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  issueAction: { fontFamily: fontFamily.sansSemiBold, fontSize: 14, color: colors.accent, marginTop: 8 },
  footnote: { fontFamily: fontFamily.sans, fontSize: 14, lineHeight: 21, color: colors.textTertiary },
  italic: { fontStyle: 'italic' },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
});
