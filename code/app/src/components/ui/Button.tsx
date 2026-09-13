import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fontFamily, radius } from '../../theme';

export type ButtonVariant = 'primary' | 'primaryInverse' | 'outline' | 'outlineInverse' | 'danger';
export type ButtonSize = 'lg' | 'md';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  flex?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Shrinks the label a touch for long copy in a tight two-button footer row. */
  compactLabel?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  flex,
  disabled,
  style,
  compactLabel,
}: ButtonProps) {
  const height = size === 'lg' ? 56 : 52;
  const variantStyle = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { height },
        variantStyle.container,
        flex != null && { flex },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[styles.label, compactLabel && styles.labelCompact, variantStyle.label]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; label: { color: string } }> = {
  primary: {
    container: { backgroundColor: colors.navy },
    label: { color: colors.textInverse },
  },
  primaryInverse: {
    container: { backgroundColor: colors.surface },
    label: { color: colors.navy },
  },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.borderDashed },
    label: { color: colors.navy },
  },
  outlineInverse: {
    container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.navyBorder },
    label: { color: colors.textInverseMuted },
  },
  danger: {
    container: { backgroundColor: colors.danger },
    label: { color: colors.textInverse },
  },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.base,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  label: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 16,
  },
  labelCompact: {
    fontSize: 15,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
