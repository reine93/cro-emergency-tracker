import { StyleSheet, Text } from 'react-native';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';

export function TasksScreen() {
  return (
    <ScreenScaffold title="Preparedness Tasks" subtitle="Placeholder for FE1">
      <Text style={styles.message}>Task system starts in later frontend tasks.</Text>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  message: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizeMd,
  },
});
