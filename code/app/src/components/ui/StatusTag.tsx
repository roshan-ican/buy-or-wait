import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../../theme';

export type StatusTone = 'positive' | 'caution' | 'danger' | 'accent';

/** Bold uppercase inline status word, no background — e.g. "SAFEST", "RISKY", "NOT SAFE". */
export function StatusTag({ label, tone }: { label: string; tone: StatusTone }) {
  return <Text style={[styles.text, { color: toneColor[tone] }]}>{label}</Text>;
}

const toneColor: Record<StatusTone, string> = {
  positive: colors.positive,
  caution: colors.caution,
  danger: colors.danger,
  accent: colors.accent,
};

export function StatusDot({ tone, size = 10 }: { tone: StatusTone; size?: number }) {
  return (
    <View
      style={[
        styles.dot,
        { backgroundColor: toneColor[tone], width: size, height: size, borderRadius: size / 2 },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  text: { fontFamily: fontFamily.sansBold, fontSize: 12, letterSpacing: 0.4 },
  dot: {},
});
