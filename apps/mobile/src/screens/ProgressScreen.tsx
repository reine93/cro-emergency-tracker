import { StyleSheet, Text } from 'react-native';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';

export function ProgressScreen() {
  return (
    <ScreenScaffold title="Progress" subtitle="Placeholder for FE1">
      <Text style={styles.message}>Gamification progress arrives in later frontend tasks.</Text>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  message: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizeMd,
  },
});
