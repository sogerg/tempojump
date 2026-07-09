import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ellipsis, Fence, Expand } from 'lucide-react-native';
import { ConverterScreen } from '../screens/ConverterScreen';
import { CombinationsScreen } from '../screens/CombinationsScreen';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { useSettings } from '../context/SettingsContext';
import { FONTS } from '../constants/typography';

const Tab = createBottomTabNavigator();

function CavalierJumpIcon({ size = 24, color }: { size?: number; color?: string }) {
  return (
    <Image
      source={require('../../assets/cavalier-jump-tab-icon.png')}
      style={[styles.tabIcon, { width: size, height: size, tintColor: color }]}
      resizeMode="contain"
    />
  );
}

const TAB_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  Convertisseur: CavalierJumpIcon,
  Combinaisons: Fence,
  Exercices: Expand,
  Plus: Ellipsis,
};

export function BottomTabNavigator() {
  const { t } = useTranslation();
  const { colors } = useSettings();
  const navigation = useNavigation();

  const headerRight = () => (
    <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)} style={styles.settingsButton}>
      <Image source={require('../../assets/menu-button-icon.png')} style={styles.menuIcon} resizeMode="contain" />
    </TouchableOpacity>
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerRight,
        headerStatusBarHeight: 14,
        tabBarActiveTintColor: colors.iconGoldActive,
        tabBarInactiveTintColor: colors.accentGold,
        tabBarStyle: { backgroundColor: colors.barBackground, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.barBackground, height: 64 },
        headerTitleStyle: { color: colors.text, fontFamily: FONTS.heading, fontSize: 20 },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          const Icon = TAB_ICONS[route.name] ?? CavalierJumpIcon;
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
      <Tab.Screen name="Exercices" options={{ title: t('nav.exercises') }} component={ExercisesScreen} />
      <Tab.Screen name="Plus" options={{ title: t('nav.more') }} component={MoreScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  settingsButton: {
    marginRight: 16,
  },
  tabIcon: {
    marginBottom: -2,
  },
  menuIcon: {
    width: 38,
    height: 38,
  },
});
