import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../../theme';

interface ListRowProps {
  label: string;
  value: string;
  valueColor?: string;
  last?: boolean;
  delta?: string;
}

/** One line-item row inside a bordered list card (rent/food/transport, debt facts, etc). */
export function ListRow({ label, value, valueColor, last, delta }: ListRowProps) {
  return (
    <View style={[styles.row, !last && styles.divider]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor && { color: valueColor }]}>
        {value}
        {delta ? <Text style={styles.delta}> {delta}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: colors.dividerSoft },
  label: { fontFamily: fontFamily.sans, fontSize: 16, color: colors.textSecondary },
  value: { fontFamily: fontFamily.sansSemiBold, fontSize: 16, color: colors.textPrimary },
  delta: { fontFamily: fontFamily.sansSemiBold, fontSize: 13, color: colors.danger },
});
