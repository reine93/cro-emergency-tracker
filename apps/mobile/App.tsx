import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PreparednessProvider } from './src/gamification/preparedness.context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { I18nProvider } from './src/i18n';

export default function App() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <PreparednessProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </PreparednessProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
