import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { I18nProvider } from './src/i18n';

export default function App() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </I18nProvider>
    </SafeAreaProvider>
  );
}
