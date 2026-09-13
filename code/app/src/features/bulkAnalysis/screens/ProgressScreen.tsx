import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { colors, fontFamily } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';
import { repositories } from '../../../data/repositories';
import { AnalysisJob } from '../../../data/types';

/** E6 · Running (auto-advances) */
export function ProgressScreen({ navigation }: RootScreenProps<'BulkProgress'>) {
  const [job, setJob] = useState<AnalysisJob | null>(repositories.bulkAnalysis.getCurrentJob());
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const next = await repositories.bulkAnalysis.getJobStatus();
        if (!active) return;
        setJob(next);
        if (next.status === 'completed' || next.status === 'completed_with_errors') {
          if (typeof document !== 'undefined') document.title = 'Your Buy or Wait analysis is ready';
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('Your analysis is ready', {
              body: `${next.completed_rows} requests have been evaluated.`,
            });
          }
          navigation.replace('BulkSummary');
          return;
        }
        setTimeout(poll, 300);
      } catch (pollError) {
        if (active) setError(pollError instanceof Error ? pollError.message : 'Could not read analysis progress.');
      }
    };
    poll();
    return () => { active = false; };
  }, [navigation]);

  const completed = job?.completed_rows ?? 0;
  const total = job?.total_rows ?? 0;

  return (
    <Screen variant="dark" scroll={false}>
      <View style={styles.center}>
        <Text style={styles.headline}>Analysing your requests</Text>
        <Text style={styles.reassurance}>Please wait while we prepare your results. We’ll let you know here when they’re ready.</Text>
        <Text style={styles.counter}>{completed} of {total}</Text>
        <View style={styles.checklist}>
          <Text style={styles.done}>✓  Reading the file</Text>
          <Text style={styles.done}>✓  Validating requests</Text>
          <Text style={styles.done}>✓  Reading your financial situation</Text>
          <Text style={styles.active}>⟳  Generating recommendations</Text>
          <Text style={styles.pending}>○  Preparing results</Text>
        </View>
        <ProgressBar progress={total ? completed / total : 0} color={colors.textInverseFaint} trackColor={colors.navyLine} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.footnote}>Keep this tab open. Each row is treated as its own decision.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  headline: { fontFamily: fontFamily.serif, fontSize: 40, lineHeight: 44, color: colors.textInverse, marginBottom: 10 },
  reassurance: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, color: colors.textInverseMuted, marginBottom: 14 },
  counter: { fontFamily: fontFamily.sans, fontSize: 16, color: colors.textInverseFaint, marginBottom: 34 },
  checklist: { gap: 18, marginBottom: 44 },
  done: { fontFamily: fontFamily.sans, fontSize: 16, color: colors.textInverseFaint },
  active: { fontFamily: fontFamily.sansSemiBold, fontSize: 16, color: colors.textInverse },
  pending: { fontFamily: fontFamily.sans, fontSize: 16, color: colors.navyMuted },
  footnote: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.navyMuted, marginTop: 18 },
  error: { fontFamily: fontFamily.sans, fontSize: 14, lineHeight: 20, color: colors.danger, marginTop: 18 },
});
