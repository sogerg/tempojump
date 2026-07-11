import './src/i18n';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationBar } from 'expo-navigation-bar';
import {
  useFonts,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { HorseProvider } from './src/context/HorseContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { RootNavigator } from './src/navigation/RootNavigator';

function AppContent() {
  const { isDarkMode } = useSettings();
  return (
    <HorseProvider>
      <SubscriptionProvider>
        <RootNavigator />
      </SubscriptionProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} hidden />
      <NavigationBar hidden />
    </HorseProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_600SemiBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#FBF8F2' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
