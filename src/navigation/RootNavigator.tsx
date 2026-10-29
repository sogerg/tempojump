import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { BottomTabNavigator } from './BottomTabNavigator';
import { SettingsScreen } from '../screens/SettingsScreen';
import { HorsesScreen } from '../screens/HorsesScreen';
import { MetronomeScreen } from '../screens/MetronomeScreen';
import { CoursePlanScreen } from '../screens/CoursePlanScreen';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { RecoListScreen } from '../screens/reco/RecoListScreen';
import { RecoStartScreen } from '../screens/reco/RecoStartScreen';
import { RecoWalkScreen } from '../screens/reco/RecoWalkScreen';
import { RecoSummaryScreen } from '../screens/reco/RecoSummaryScreen';
import { RecoLastLookScreen } from '../screens/reco/RecoLastLookScreen';
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
        <Stack.Screen name="Montures" component={HorsesScreen} options={{ title: t('nav.mounts') }} />
        <Stack.Screen name="Metronome" component={MetronomeScreen} options={{ title: t('nav.metronome') }} />
        <Stack.Screen name="CoursePlan" component={CoursePlanScreen} options={{ title: t('nav.coursePlan') }} />
        <Stack.Screen name="Exercices" component={ExercisesScreen} options={{ title: t('nav.exercises') }} />
        <Stack.Screen name="RecoList" component={RecoListScreen} options={{ title: t('nav.recos') }} />
        <Stack.Screen name="RecoStart" component={RecoStartScreen} options={{ title: t('reco.homeButton') }} />
        <Stack.Screen name="RecoWalk" component={RecoWalkScreen} options={{ title: t('nav.recoWalk') }} />
        <Stack.Screen name="RecoSummary" component={RecoSummaryScreen} options={{ title: t('reco.summaryTitle') }} />
        <Stack.Screen
          name="RecoLastLook"
          component={RecoLastLookScreen}
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
