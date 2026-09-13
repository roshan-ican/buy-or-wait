import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../theme';

interface OptionCardProps {
  icon: string;
  title: string;
  description?: string;
  selected?: boolean;
  danger?: boolean;
  onPress?: () => void;
  compact?: boolean;
}

/** Big selectable tile with icon + title (+ optional description), e.g. request-type grid. */
export function OptionCard({ icon, title, description, selected, danger, onPress, compact }: OptionCardProps) {
  const tone = danger ? styles.danger : selected ? styles.selected : styles.neutral;
  const textColor = danger ? colors.danger : selected ? colors.textInverse : colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.base, tone, compact ? styles.compact : styles.roomy]}
    >
      <Text style={[styles.icon, { color: danger ? colors.danger : selected ? colors.textInverse : colors.textPrimary }]}>
        {icon}
      </Text>
      <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
        {title}
      </Text>
      {description ? (
        <Text style={[styles.description, { color: selected ? colors.textInverseMuted : colors.textSecondary }]}>
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, justifyContent: 'space-between' },
  compact: { padding: spacing.mdl, height: 92 },
  roomy: { padding: spacing.xxl },
  neutral: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  selected: { borderWidth: 1.5, borderColor: colors.navy, backgroundColor: colors.navy },
  danger: { borderWidth: 1, borderColor: colors.dangerBorder, backgroundColor: colors.dangerTint },
  icon: { fontSize: 20, marginBottom: spacing.smd },
  title: { fontFamily: fontFamily.sansSemiBold, fontSize: 15, lineHeight: 19 },
  description: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 21, marginTop: spacing.xxxs },
});
