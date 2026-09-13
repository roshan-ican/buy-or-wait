import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { IconGlyph } from '../../../components/ui/IconGlyph';
import { colors, fontFamily, spacing } from '../../../theme';
import { useAsync } from '../../../hooks/useAsync';
import { repositories } from '../../../data';
import { MainTabScreenProps } from '../../../navigation/types';

/** E11 · Decisions (history) */
export function DecisionsScreen({ navigation }: MainTabScreenProps<'Decisions'>) {
  const [tab, setTab] = useState<'single' | 'files'>('files');
  const history = useAsync(() => repositories.decisionHistory.listHistory(), []);

  return (
    <Screen>
      <Text style={styles.title}>Decisions</Text>

      <View style={styles.tabRow}>
        <View style={[styles.tabPill, tab === 'single' ? styles.tabPillSelected : styles.tabPillPlain]}>
          <Text
            style={[styles.tabLabel, tab === 'single' && styles.tabLabelSelected]}
            onPress={() => setTab('single')}
          >
            Single
          </Text>
        </View>
        <View style={[styles.tabPill, tab === 'files' ? styles.tabPillSelected : styles.tabPillPlain]}>
          <Text style={[styles.tabLabel, tab === 'files' && styles.tabLabelSelected]} onPress={() => setTab('files')}>
            Files
          </Text>
        </View>
      </View>

      {tab === 'single' ? (
        <Text style={styles.emptyText}>Single-decision history isn’t part of this preview — try the Files tab.</Text>
      ) : (
        <View style={{ gap: spacing.xl }}>
          {history && history.length === 0 && (
            <Text style={styles.emptyText}>No files analysed yet. Upload requests.csv to see results here.</Text>
          )}
          {(history ?? []).map((entry) => (
            <View key={entry.id}>
              <Text style={styles.dateLabel}>{entry.date}</Text>
              <Card>
                <View style={styles.fileRow}>
                  <IconGlyph glyph="▤" size={15} color={colors.accent} circleSize={36} circleColor={colors.accentTint} />
                  <View>
                    <Text style={styles.fileName}>{entry.fileName}</Text>
                    <Text style={styles.fileSubtitle}>{entry.subtitle}</Text>
                  </View>
                </View>
                <View style={styles.countsRow}>
                  <Text style={[styles.countItem, { color: colors.positive }]}>● {entry.safe}</Text>
                  <Text style={[styles.countItem, { color: colors.caution }]}>● {entry.caution}</Text>
                  <Text style={[styles.countItem, { color: colors.danger }]}>● {entry.wait}</Text>
                </View>
                <View style={styles.actionsRow}>
                  <Button
                    label="View results"
                    variant="outline"
                    size="md"
                    flex={1}
                    onPress={() => navigation.navigate('BulkResultsTable')}
                  />
                  <Button
                    label="↓ output.csv"
                    variant="outline"
                    size="md"
                    flex={1}
                    onPress={() => navigation.navigate('BulkDownload')}
                  />
                </View>
              </Card>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 32, color: colors.textPrimary, marginBottom: 20 },
  tabRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: 26 },
  tabPill: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 15 },
  tabPillSelected: { backgroundColor: colors.navy },
  tabPillPlain: { borderWidth: 1, borderColor: colors.border },
  tabLabel: { fontFamily: fontFamily.sans, fontSize: 14, color: colors.textSecondary },
  tabLabelSelected: { color: colors.textInverse },
  dateLabel: { fontFamily: fontFamily.sans, fontSize: 13, letterSpacing: 0.6, color: colors.textTertiary, marginBottom: 12 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.smd, marginBottom: 14 },
  fileName: { fontFamily: fontFamily.sansSemiBold, fontSize: 16, color: colors.textPrimary },
  fileSubtitle: { fontFamily: fontFamily.sans, fontSize: 13, color: colors.textTertiary },
  countsRow: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  countItem: { fontFamily: fontFamily.sans, fontSize: 14 },
  actionsRow: { flexDirection: 'row', gap: spacing.xs },
  emptyText: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, lineHeight: 22 },
});
