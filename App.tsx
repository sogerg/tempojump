import './src/i18n';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { ProfilesProvider } from './src/context/ProfilesContext';
import { RootNavigator } from './src/navigation/RootNavigator';

function AppContent() {
  const { isDarkMode } = useSettings();
  return (
    <ProfilesProvider>
      <RootNavigator />
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </ProfilesProvider>
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
