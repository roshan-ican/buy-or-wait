import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavBar } from '../components/ui/BottomNavBar';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { ForecastScreen } from '../features/forecast/screens/ForecastScreen';
import { DecisionsScreen } from '../features/decisions/screens/DecisionsScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomNavBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Forecast" component={ForecastScreen} />
      <Tab.Screen name="Decisions" component={DecisionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
