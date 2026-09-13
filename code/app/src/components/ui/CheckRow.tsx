import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../theme';

interface CheckRowProps {
  label: string;
  checked: boolean;
  hint?: string;
  onPress?: () => void;
}

/** Checkbox-style row used for the list of available payment options. */
export function CheckRow({ label, checked, hint, onPress }: CheckRowProps) {
  return (
    <Pressable onPress={onPress} style={[styles.row, checked ? styles.checkedRow : styles.uncheckedRow]}>
      <View style={[styles.box, checked ? styles.boxChecked : styles.boxUnchecked]}>
        {checked ? <Text style={styles.tick}>✓</Text> : null}
      </View>
      <Text style={[styles.label, !checked && styles.labelMuted]} numberOfLines={2}>
        {label}
      </Text>
      {hint ? (
        <Text style={styles.hint} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.base,
    paddingVertical: 17,
    paddingHorizontal: spacing.lg,
  },
  checkedRow: { borderWidth: 1.5, borderColor: colors.navy },
  uncheckedRow: { borderWidth: 1, borderColor: colors.border },
  box: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  boxChecked: { backgroundColor: colors.navy },
  boxUnchecked: { borderWidth: 1.5, borderColor: colors.borderDashed },
  tick: { color: colors.textInverse, fontSize: 13, fontFamily: fontFamily.sansBold },
  label: { flexShrink: 1, fontFamily: fontFamily.sansSemiBold, fontSize: 16, color: colors.textPrimary },
  labelMuted: { fontFamily: fontFamily.sans, color: colors.textSecondary },
  hint: {
    flexShrink: 0,
    marginLeft: 'auto',
    fontFamily: fontFamily.sans,
    fontSize: 14,
    color: colors.textTertiary,
  },
});
