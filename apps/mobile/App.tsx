import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PreparednessProvider } from './src/gamification/preparedness.context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { I18nProvider } from './src/i18n';
import { NotificationPolicyProvider } from './src/notifications/policy.context';

export default function App() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <NotificationPolicyProvider>
          <PreparednessProvider>
            <StatusBar style="dark" />
            <AppNavigator />
          </PreparednessProvider>
        </NotificationPolicyProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
