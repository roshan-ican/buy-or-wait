import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamily } from '../../theme';

const TAB_GLYPH: Record<string, string> = {
  Home: '◉',
  Forecast: '◈',
  Decisions: '◇',
  Profile: '○',
};

/** Custom tab bar matching the design's icon-over-label footer nav exactly. */
export function BottomNavBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = (options.tabBarLabel as string) ?? options.title ?? route.name;
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.item}>
            <Text style={[styles.glyph, { color: focused ? colors.navy : colors.inactive }]}>
              {TAB_GLYPH[route.name] ?? '•'}
            </Text>
            <Text style={[styles.label, { color: focused ? colors.navy : colors.inactive }, focused && styles.labelFocused]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
  item: { alignItems: 'center', flex: 1 },
  glyph: { fontSize: 19, marginBottom: 4 },
  label: { fontFamily: fontFamily.sans, fontSize: 12 },
  labelFocused: { fontFamily: fontFamily.sansSemiBold },
});
