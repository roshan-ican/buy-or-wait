import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { colors, fontFamily } from '../../../theme';

/** E11 · Decisions (history) */
export function DecisionsScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Decisions</Text>
      <Text style={styles.emptyText}>Decisions you check will show up here.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 32, color: colors.textPrimary, marginBottom: 20 },
  emptyText: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary, lineHeight: 22 },
});
