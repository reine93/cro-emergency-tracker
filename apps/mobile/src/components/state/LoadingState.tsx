import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { theme } from '../../theme/theme';
import { AppText } from '../ui/AppText';

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.colors.brand} />
      <AppText variant="caption" muted>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
});
