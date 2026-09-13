import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Button } from '../../../components/ui/Button';
import { colors, fontFamily, spacing } from '../../../theme';
import { RootScreenProps } from '../../../navigation/types';

/** A1 · Welcome */
export function WelcomeScreen({ navigation }: RootScreenProps<'Welcome'>) {
  return (
    <Screen variant="dark" scroll={false}>
      <View style={styles.spacer} />
      <View style={styles.bottom}>
        <Text style={styles.title}>
          Buy{'\n'}
          <Text style={styles.titleItalic}>or</Text> Wait
        </Text>
        <Text style={styles.subtitle}>
          {
            'Tell it about a decision. It looks at the months ahead, not just today’s balance, and tells you the safest way to do it.'
          }
        </Text>
        <View style={styles.actions}>
          <Button label="Set up my profile" variant="primaryInverse" onPress={() => navigation.navigate('Income')} />
          <Button
            label="I already have an account"
            variant="outlineInverse"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  spacer: { flex: 1 },
  bottom: { paddingBottom: spacing.huge },
  title: {
    fontFamily: fontFamily.serif,
    fontSize: 64,
    lineHeight: 64,
    color: colors.textInverse,
    marginBottom: spacing.xl,
  },
  titleItalic: { fontFamily: fontFamily.serifItalic, fontStyle: 'italic', color: colors.textInverseFaint },
  subtitle: {
    fontFamily: fontFamily.sans,
    fontSize: 17,
    lineHeight: 25,
    color: colors.textInverseMuted,
    maxWidth: 290,
    marginBottom: spacing.massive,
  },
  actions: { gap: spacing.smd },
});
