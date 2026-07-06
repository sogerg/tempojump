import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ConverterScreen } from '../screens/ConverterScreen';
import { CombinationScreen } from '../screens/CombinationScreen';
import { MountsScreen } from '../screens/MountsScreen';

const Tab = createBottomTabNavigator();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#2f6f4f',
        }}
      >
        <Tab.Screen name="Convertisseur" component={ConverterScreen} />
        <Tab.Screen name="Combinaisons" component={CombinationScreen} />
        <Tab.Screen name="Montures" component={MountsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
