import 'react-native-gesture-handler';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts as useInstrumentSans } from '@expo-google-fonts/instrument-sans';
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from '@expo-google-fonts/instrument-sans';
import { InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif';

import { ResponsiveShell } from './src/components/layout/ResponsiveShell';
import { RootNavigator } from './src/navigation/RootNavigator';
import { linking } from './src/navigation/linking';
import { colors } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.surface,
    card: colors.surface,
    border: colors.border,
    primary: colors.accent,
    text: colors.textPrimary,
  },
};

export default function App() {
  const [fontsLoaded] = useInstrumentSans({
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: colors.canvas }}>
          <ResponsiveShell>
            <NavigationContainer theme={navigationTheme} linking={linking}>
              <RootNavigator />
            </NavigationContainer>
          </ResponsiveShell>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
