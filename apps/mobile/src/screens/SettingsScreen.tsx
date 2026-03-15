import { StyleSheet, Text } from 'react-native';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';

export function SettingsScreen() {
  return (
    <ScreenScaffold title="Settings" subtitle="Placeholder for FE1">
      <Text style={styles.message}>Language and notification settings will be added later.</Text>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  message: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizeMd,
  },
});
