import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, screenPadding } from '../../theme';

export type ScreenVariant = 'light' | 'dark';

interface ScreenProps {
  variant?: ScreenVariant;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
  noPadding?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Shared phone-screen shell: safe area + optional pinned header/footer + a
 * scrollable (or static) body. Every screen in the app is built from this so
 * spacing stays consistent with the source design.
 */
export function Screen({
  variant = 'light',
  header,
  footer,
  scroll = true,
  noPadding = false,
  contentStyle,
  children,
}: ScreenProps) {
  const backgroundColor = variant === 'dark' ? colors.navy : colors.surface;
  const Body: any = scroll ? ScrollView : View;
  const bodyProps = scroll
    ? {
        style: styles.scrollFlex,
        contentContainerStyle: [
          styles.bodyContent,
          !noPadding && styles.paddedH,
          contentStyle,
        ],
        showsVerticalScrollIndicator: false,
      }
    : { style: [styles.bodyFlex, !noPadding && styles.paddedH, contentStyle] };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style={variant === 'dark' ? 'light' : 'dark'} />
      {header ? <View style={[styles.header, !noPadding && styles.paddedH]}>{header}</View> : null}
      <Body {...bodyProps}>{children}</Body>
      {footer ? <View style={[styles.footer, !noPadding && styles.paddedH]}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingTop: 6, paddingBottom: 8 },
  bodyFlex: { flex: 1, paddingTop: 8 },
  scrollFlex: { flex: 1, width: '100%' },
  bodyContent: { flexGrow: 1, paddingTop: 8, paddingBottom: 40 },
  footer: { paddingTop: 12, paddingBottom: 12 },
  paddedH: { paddingHorizontal: screenPadding },
});
