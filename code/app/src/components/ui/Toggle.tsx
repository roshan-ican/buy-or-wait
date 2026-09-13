import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../../theme';

interface ToggleProps {
  value: boolean;
  onValueChange?: (value: boolean) => void;
}

/** Visual switch matching the design's custom pill toggle (not the OS Switch component). */
export function Toggle({ value, onValueChange }: ToggleProps) {
  return (
    <Pressable
      onPress={() => onValueChange?.(!value)}
      style={[styles.track, { backgroundColor: value ? colors.accent : colors.border }]}
    >
      <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 46,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
  },
  knob: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    top: 3,
  },
  knobOn: { right: 3 },
  knobOff: { left: 3 },
});
