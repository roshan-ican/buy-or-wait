import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { BackHeader } from '../../../components/ui/BackHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { LabeledField } from '../../../components/ui/LabeledField';
import { SelectRow } from '../../../components/ui/SelectRow';
import { Sheet } from '../../../components/ui/Sheet';
import { colors, fontFamily, spacing } from '../../../theme';
import { repositories } from '../../../data';
import { RootScreenProps } from '../../../navigation/types';

const CATEGORIES = [
  'Electronics',
  'Fashion & accessories',
  'Home & furniture',
  'Groceries',
  'Health & beauty',
  'Travel & leisure',
  'Education',
  'Vehicles',
  'Other',
];

/** C1 · The item */
export function ItemScreen({ navigation }: RootScreenProps<'PurchaseItem'>) {
  const initial = repositories.singleDecision.getDraft();
  const profile = repositories.profile.getProfileSync();
  const [item, setItem] = useState(initial.item);
  const [price, setPrice] = useState(String(initial.price));
  const [category, setCategory] = useState(initial.category);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const next = () => {
    const amount = Number(price.replaceAll(',', ''));
    if (!item.trim() || !Number.isFinite(amount) || amount <= 0) return;
    repositories.singleDecision.saveDraft({ ...initial, item: item.trim(), price: amount, category });
    navigation.navigate('PurchaseWantOrNeed');
  };
  const percentage = Number(price) > 0 ? Number(price) / profile.monthlySalary * 100 : 0;
  return (
    <Screen
      header={<BackHeader onBack={() => navigation.goBack()} progress={1 / 3} progressLabel="Purchase" />}
      footer={<Button label="Next" onPress={next} />}
    >
      <Text style={styles.title}>What do you want to buy?</Text>

      <LabeledField label="ITEM" value={item} serifValue={false} editable onChangeText={setItem} />
      <View style={{ height: spacing.md }} />
      <LabeledField label="PRICE" emphasized prefix={profile.currency} value={price} editable keyboardType="numeric" onChangeText={setPrice} />
      <View style={{ height: spacing.md }} />
      <View style={{ marginBottom: spacing.xxl }}>
        <SelectRow label="CATEGORY" value={category} onPress={() => setCategoryPickerOpen(true)} />
      </View>

      <Card tone="fill" style={styles.noteCard}>
        <Text style={styles.noteIcon}>◆</Text>
        <Text style={styles.noteText}>
          That is <Text style={styles.noteBold}>{Number.isFinite(percentage) ? percentage.toFixed(1) : '0'}% of one month’s salary</Text>. Worth looking at carefully.
        </Text>
      </Card>

      <Sheet visible={categoryPickerOpen} onClose={() => setCategoryPickerOpen(false)}>
        <Text style={styles.sheetTitle}>Category</Text>
        {CATEGORIES.map((option, i) => {
          const selected = option === category;
          return (
            <Pressable
              key={option}
              onPress={() => {
                setCategory(option);
                setCategoryPickerOpen(false);
              }}
              style={[styles.optionRow, i < CATEGORIES.length - 1 && styles.optionRowDivider]}
            >
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{option}</Text>
              {selected ? <Text style={styles.optionCheck}>✓</Text> : null}
            </Pressable>
          );
        })}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.serif, fontSize: 36, lineHeight: 40, color: colors.textPrimary, marginBottom: 30 },
  noteCard: { flexDirection: 'row', gap: spacing.smd, alignItems: 'flex-start' },
  noteIcon: { color: colors.accent, fontSize: 17 },
  noteText: { flex: 1, fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  noteBold: { fontFamily: fontFamily.sansSemiBold, color: colors.textPrimary },
  sheetTitle: { fontFamily: fontFamily.serif, fontSize: 26, color: colors.textPrimary, marginBottom: 8 },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionRowDivider: { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: colors.dividerSoft },
  optionLabel: { fontFamily: fontFamily.sans, fontSize: 17, color: colors.textSecondary },
  optionLabelSelected: { fontFamily: fontFamily.sansSemiBold, color: colors.textPrimary },
  optionCheck: { fontFamily: fontFamily.sansBold, fontSize: 16, color: colors.accent },
});
