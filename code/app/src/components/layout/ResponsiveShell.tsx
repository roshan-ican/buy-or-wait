import React from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { colors, desktopBreakpoint, phoneWidth, radius } from '../../theme';

/**
 * On a real phone this is a no-op. On web/tablet (viewport wider than the
 * design's phone artboard) it centers the whole app inside a fixed
 * phone-width frame so the experience — and the screenshots — stay
 * identical to the mobile design at every viewport size, per spec.
 */
export function ResponsiveShell({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const shouldFrame = Platform.OS === 'web' && width >= desktopBreakpoint;

  if (!shouldFrame) {
    return <View style={styles.fill}>{children}</View>;
  }

  const frameHeight = Math.min(height - 64, 900);

  return (
    <View style={styles.backdrop}>
      <View style={[styles.frame, { width: phoneWidth, height: frameHeight }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
  frame: {
    borderRadius: radius.frame,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 10,
    borderColor: '#0D1626',
    shadowColor: 'rgba(20,35,59,0.45)',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 1,
    shadowRadius: 48,
    elevation: 20,
  },
});
