import './src/i18n';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { HorseProvider } from './src/context/HorseContext';
import { RootNavigator } from './src/navigation/RootNavigator';

function AppContent() {
  const { isDarkMode } = useSettings();
  return (
    <HorseProvider>
      <RootNavigator />
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </HorseProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
