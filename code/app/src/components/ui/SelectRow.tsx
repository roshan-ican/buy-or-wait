import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../theme';

interface SelectRowProps {
  label: string;
  value: string;
  onPress?: () => void;
}

/** Bordered "CATEGORY / Electronics ▾" row used for dropdown-style pickers. */
export function SelectRow({ label, value, onPress }: SelectRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <Text style={styles.chevron}>▾</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.base,
    paddingVertical: spacing.mdl,
    paddingHorizontal: spacing.lgl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontFamily: fontFamily.sans, fontSize: 12, letterSpacing: 0.4, color: colors.textTertiary, marginBottom: 4 },
  value: { fontFamily: fontFamily.sans, fontSize: 17, color: colors.textPrimary },
  chevron: { color: colors.textTertiary, fontSize: 16 },
});
