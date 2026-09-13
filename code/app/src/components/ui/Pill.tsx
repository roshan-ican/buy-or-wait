import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../theme';

interface PillProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** 'danger' outlines + colors the label red instead of filling navy when selected (e.g. emergency category chips). */
  tone?: 'default' | 'danger';
}

/** Rounded selectable filter/option pill (used for "No rush" / "This month" style chips). */
export function Pill({ label, selected, onPress, tone = 'default' }: PillProps) {
  const selectedStyle = tone === 'danger' ? styles.selectedDanger : styles.selected;
  const selectedLabelStyle = tone === 'danger' ? styles.selectedLabelDanger : styles.selectedLabel;
  return (
    <Pressable onPress={onPress} style={[styles.base, selected ? selectedStyle : styles.unselected]}>
      <Text style={[styles.label, selected && selectedLabelStyle]}>{label}</Text>
    </Pressable>
  );
}

interface StatusPillProps {
  label: string;
  tone: 'positive' | 'caution' | 'danger' | 'accent';
}

/** Small pill badge for status text, e.g. "YES — WITH A PLAN" / "SEND LESS". */
export function StatusPill({ label, tone }: StatusPillProps) {
  return (
    <View style={[styles.statusBase, statusTones[tone].container]}>
      <Text style={[styles.statusLabel, statusTones[tone].label]}>{label}</Text>
    </View>
  );
}

const statusTones = {
  positive: { container: { backgroundColor: colors.positiveTint }, label: { color: colors.positive } },
  caution: { container: { backgroundColor: colors.cautionTint }, label: { color: colors.caution } },
  danger: { container: { backgroundColor: colors.dangerTint }, label: { color: colors.danger } },
  accent: { container: { backgroundColor: colors.accentTint }, label: { color: colors.accent } },
} as const;

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.mdl,
  },
  selected: { borderWidth: 1.5, borderColor: colors.navy, backgroundColor: colors.navy },
  selectedDanger: { borderWidth: 1.5, borderColor: colors.danger, backgroundColor: 'transparent' },
  unselected: { borderWidth: 1, borderColor: colors.border, backgroundColor: 'transparent' },
  label: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textSecondary },
  selectedLabel: { fontFamily: fontFamily.sansSemiBold, color: colors.textInverse },
  selectedLabelDanger: { fontFamily: fontFamily.sansSemiBold, color: colors.danger },
  statusBase: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: spacing.mdl,
    marginBottom: spacing.mdl,
  },
  statusLabel: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
