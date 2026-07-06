import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { BottomTabNavigator } from './BottomTabNavigator';
import { SettingsScreen } from '../screens/SettingsScreen';
import { MetronomeScreen } from '../screens/MetronomeScreen';
import { ChecklistScreen } from '../screens/ChecklistScreen';
import { CoursePlanScreen } from '../screens/CoursePlanScreen';
import { JournalScreen } from '../screens/JournalScreen';
import { useSettings } from '../context/SettingsContext';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useSettings();

  const navigationTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      >
        <Stack.Screen name="Tabs" component={BottomTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ presentation: 'modal', title: t('settings.title'), headerShown: false }}
        />
        <Stack.Screen name="Metronome" component={MetronomeScreen} options={{ title: t('nav.metronome') }} />
        <Stack.Screen name="Checklist" component={ChecklistScreen} options={{ title: t('nav.checklist') }} />
        <Stack.Screen name="CoursePlan" component={CoursePlanScreen} options={{ title: t('nav.coursePlan') }} />
        <Stack.Screen name="Journal" component={JournalScreen} options={{ title: t('nav.journal') }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
