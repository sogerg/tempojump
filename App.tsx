import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfilesProvider } from './src/context/ProfilesContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ProfilesProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </ProfilesProvider>
    </SafeAreaProvider>
  );
}
