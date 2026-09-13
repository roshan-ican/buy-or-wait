import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../../theme';

interface IconGlyphProps {
  glyph: string;
  size?: number;
  color?: string;
  circleSize?: number;
  circleColor?: string;
  style?: ViewStyle;
}

/**
 * The design leans on plain unicode glyphs (◆ ◍ ◇ ▤ ← ✕ ✓ etc.) instead of an
 * icon font. Rendering them as Text keeps the app dependency-free and
 * pixel-matches the canvas.
 */
export function IconGlyph({ glyph, size = 20, color = colors.textPrimary, circleSize, circleColor, style }: IconGlyphProps) {
  if (circleSize) {
    return (
      <View
        style={[
          styles.circle,
          { width: circleSize, height: circleSize, borderRadius: circleSize / 2, backgroundColor: circleColor },
          style,
        ]}
      >
        <Text style={{ fontSize: size, color }}>{glyph}</Text>
      </View>
    );
  }
  return <Text style={[{ fontSize: size, color }, style]}>{glyph}</Text>;
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
});
