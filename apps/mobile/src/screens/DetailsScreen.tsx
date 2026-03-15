import type { EarthquakeEvent } from '@cro/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';

type DetailsScreenProps = {
  event: EarthquakeEvent;
  onBack: () => void;
};

export function DetailsScreen({ event, onBack }: DetailsScreenProps) {
  return (
    <ScreenScaffold title="Event Details" subtitle="Stack route from Home -> Details">
      <View style={styles.card}>
        <Text style={styles.line}>ID: {event.id}</Text>
        <Text style={styles.line}>Magnitude: {event.magnitude}</Text>
        <Text style={styles.line}>Place: {event.place}</Text>
        <Text style={styles.line}>Depth: {event.depthKm ?? 'N/A'} km</Text>
        <Text style={styles.line}>Time: {event.time}</Text>
      </View>
      <Pressable style={styles.button} onPress={onBack}>
        <Text style={styles.buttonLabel}>Back to list</Text>
      </Pressable>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  line: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSizeSm,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.brand,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  buttonLabel: {
    color: theme.colors.onBrand,
    fontWeight: theme.typography.fontWeightSemibold,
  },
});
