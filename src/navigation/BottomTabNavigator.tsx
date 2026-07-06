import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ellipsis, Fence, Footprints, Settings, Timer, Expand } from 'lucide-react-native';
import { ConverterScreen } from '../screens/ConverterScreen';
import { CombinationsScreen } from '../screens/CombinationsScreen';
import { HorsesScreen } from '../screens/HorsesScreen';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { ChronoScreen } from '../screens/ChronoScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { useSettings } from '../context/SettingsContext';
import { HorseshoeIcon } from '../components/icons';
import { FONTS } from '../constants/typography';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  Convertisseur: Footprints,
  Combinaisons: Fence,
  Montures: HorseshoeIcon,
  Exercices: Expand,
  Chrono: Timer,
  Plus: Ellipsis,
};

export function BottomTabNavigator() {
  const { t } = useTranslation();
  const { colors } = useSettings();
  const navigation = useNavigation();

  const headerRight = () => (
    <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)} style={styles.settingsButton}>
      <Settings size={22} color={colors.accentGold} />
    </TouchableOpacity>
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerRight,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text, fontFamily: FONTS.heading, fontSize: 20 },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          const Icon = TAB_ICONS[route.name] ?? Footprints;
          return <Icon size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Convertisseur"
        options={{ tabBarLabel: t('nav.converter'), title: t('converter.headerTitle') }}
        component={ConverterScreen}
      />
      <Tab.Screen name="Combinaisons" options={{ title: t('nav.combinations') }} component={CombinationsScreen} />
      <Tab.Screen name="Montures" options={{ title: t('nav.mounts') }} component={HorsesScreen} />
      <Tab.Screen name="Exercices" options={{ title: t('nav.exercises') }} component={ExercisesScreen} />
      <Tab.Screen name="Chrono" options={{ title: t('nav.chrono') }} component={ChronoScreen} />
      <Tab.Screen name="Plus" options={{ title: t('nav.more') }} component={MoreScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  settingsButton: {
    marginRight: 16,
  },
});
