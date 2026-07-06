import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ConverterScreen } from '../screens/ConverterScreen';
import { CombinationsScreen } from '../screens/CombinationsScreen';
import { HorsesScreen } from '../screens/HorsesScreen';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { ChronoScreen } from '../screens/ChronoScreen';
import { MetronomeScreen } from '../screens/MetronomeScreen';
import { ChecklistScreen } from '../screens/ChecklistScreen';
import { useSettings } from '../context/SettingsContext';

const Tab = createBottomTabNavigator();

export function BottomTabNavigator() {
  const { t } = useTranslation();
  const { colors } = useSettings();
  const navigation = useNavigation();

  const headerRight = () => (
    <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)} style={styles.settingsButton}>
      <Text style={styles.settingsIcon}>⚙️</Text>
    </TouchableOpacity>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight,
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Tab.Screen name="Convertisseur" options={{ title: t('nav.converter') }} component={ConverterScreen} />
      <Tab.Screen name="Combinaisons" options={{ title: t('nav.combinations') }} component={CombinationsScreen} />
      <Tab.Screen name="Montures" options={{ title: t('nav.mounts') }} component={HorsesScreen} />
      <Tab.Screen name="Exercices" options={{ title: t('nav.exercises') }} component={ExercisesScreen} />
      <Tab.Screen name="Chrono" options={{ title: t('nav.chrono') }} component={ChronoScreen} />
      <Tab.Screen name="Metronome" options={{ title: t('nav.metronome') }} component={MetronomeScreen} />
      <Tab.Screen name="Checklist" options={{ title: t('nav.checklist') }} component={ChecklistScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  settingsButton: {
    marginRight: 16,
  },
  settingsIcon: {
    fontSize: 20,
  },
});
