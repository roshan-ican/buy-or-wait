import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../theme';

export type CardTone = 'neutral' | 'selected' | 'dashed' | 'positive' | 'caution' | 'danger' | 'fill' | 'accentFill';

interface CardProps {
  tone?: CardTone;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function Card({ tone = 'neutral', padding = spacing.lgl, style, children }: CardProps) {
  return <View style={[styles.base, toneStyles[tone], { padding }, style]}>{children}</View>;
}

const toneStyles: Record<CardTone, ViewStyle> = {
  neutral: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  selected: { borderWidth: 1.5, borderColor: colors.navy, backgroundColor: colors.surface },
  dashed: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderDashed, backgroundColor: colors.surface },
  positive: { borderWidth: 1.5, borderColor: colors.positive, backgroundColor: colors.positiveTint },
  caution: { borderWidth: 1, borderColor: colors.cautionBorder, backgroundColor: colors.cautionTintAlt },
  danger: { borderWidth: 1, borderColor: colors.dangerBorder, backgroundColor: colors.dangerTintAlt },
  fill: { backgroundColor: colors.neutralFill },
  accentFill: { backgroundColor: colors.accentTint },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
  },
});
