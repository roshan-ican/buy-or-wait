import React from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../theme';

interface LabeledFieldProps {
  label: string;
  value: string;
  required?: boolean;
  optionalNote?: string;
  emphasized?: boolean;
  prefix?: string;
  serifValue?: boolean;
  trailing?: React.ReactNode;
  placeholder?: boolean;
  /** A2 Income uses a bigger, bolder section-style label instead of the usual small caption. */
  labelVariant?: 'caption' | 'section';
  editable?: boolean;
  onChangeText?: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  /** Grey hint text shown in an editable field while it's empty, e.g. "12,000". */
  placeholderText?: string;
}

/** Bordered "AMOUNT / AED 1,200" style field used throughout every input screen. */
export function LabeledField({
  label,
  value,
  required,
  optionalNote,
  emphasized,
  prefix,
  serifValue = true,
  trailing,
  placeholder,
  labelVariant = 'caption',
  editable = false,
  onChangeText,
  keyboardType,
  placeholderText,
}: LabeledFieldProps) {
  return (
    <View style={[styles.container, emphasized ? styles.emphasized : styles.plain]}>
      <View style={styles.textCol}>
        <Text style={[styles.label, labelVariant === 'section' && styles.labelSection]}>
          {label}
          {required ? <Text style={styles.required}> ·  required</Text> : null}
          {optionalNote ? <Text style={styles.optional}> · {optionalNote}</Text> : null}
        </Text>
        <View style={styles.valueRow}>
          {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
          {editable ? (
            <TextInput
              value={value}
              onChangeText={onChangeText}
              keyboardType={keyboardType}
              placeholder={placeholderText ?? (placeholder ? value : undefined)}
              placeholderTextColor="#C4BFB3"
              style={[serifValue ? styles.valueSerif : styles.valuePlain, styles.input]}
            />
          ) : (
            <Text style={[serifValue ? styles.valueSerif : styles.valuePlain, placeholder && styles.placeholder]}>{value}</Text>
          )}
        </View>
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.base,
    paddingVertical: spacing.mdl,
    paddingHorizontal: spacing.lgl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  plain: { borderWidth: 1, borderColor: colors.border },
  emphasized: { borderWidth: 1.5, borderColor: colors.navy },
  textCol: { flexShrink: 1 },
  label: { fontFamily: fontFamily.sans, fontSize: 12, letterSpacing: 0.4, color: colors.textTertiary, marginBottom: 4 },
  labelSection: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
    letterSpacing: 0.3,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  required: { color: colors.danger },
  optional: { fontFamily: fontFamily.sans, color: colors.textTertiary },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  prefix: { fontFamily: fontFamily.sans, fontSize: 15, color: colors.textTertiary },
  valueSerif: { fontFamily: fontFamily.serif, fontSize: 28, color: colors.textPrimary },
  valuePlain: { fontFamily: fontFamily.sans, fontSize: 17, color: colors.textPrimary },
  placeholder: { color: '#C4BFB3' },
  input: { padding: 0, minWidth: 180, outlineStyle: 'none' } as any,
});
