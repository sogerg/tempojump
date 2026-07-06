import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { ConverterScreen } from '../screens/ConverterScreen';
import { CombinationScreen } from '../screens/CombinationScreen';
import { MountsScreen } from '../screens/MountsScreen';
import { ChronoScreen } from '../screens/ChronoScreen';
import { SettingsModal } from '../components/SettingsModal';
import { useSettings } from '../context/SettingsContext';

const Tab = createBottomTabNavigator();

export function RootNavigator() {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useSettings();
  const [settingsVisible, setSettingsVisible] = useState(false);

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

  const headerRight = () => (
    <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.settingsButton}>
      <Text style={styles.settingsIcon}>⚙️</Text>
    </TouchableOpacity>
  );

  return (
    <NavigationContainer theme={navigationTheme}>
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
        <Tab.Screen name="Combinaisons" options={{ title: t('nav.combinations') }} component={CombinationScreen} />
        <Tab.Screen name="Montures" options={{ title: t('nav.mounts') }} component={MountsScreen} />
        <Tab.Screen name="Chrono" options={{ title: t('nav.chrono') }} component={ChronoScreen} />
      </Tab.Navigator>
      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
    </NavigationContainer>
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
