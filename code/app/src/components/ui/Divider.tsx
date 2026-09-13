import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme';

export function Divider({ soft = false }: { soft?: boolean }) {
  return <View style={[styles.line, { backgroundColor: soft ? colors.dividerSoft : colors.divider }]} />;
}

const styles = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth * 2, width: '100%' },
});
