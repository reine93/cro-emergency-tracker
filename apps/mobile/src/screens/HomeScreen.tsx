import type { EarthquakeEvent } from '@cro/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';

type HomeScreenProps = {
  onOpenDetails: (event: EarthquakeEvent) => void;
};

const sampleEvent: EarthquakeEvent = {
  id: 'sample-1',
  source: 'EMSC',
  time: new Date().toISOString(),
  magnitude: 2.8,
  depthKm: 9.2,
  latitude: 45.81,
  longitude: 15.98,
  place: 'ZAGREB AREA',
  authority: 'EMSC',
};

export function HomeScreen({ onOpenDetails }: HomeScreenProps) {
  return (
    <ScreenScaffold
      title="Recent Earthquakes"
      subtitle="Foundation screen for FE1. Feed cards come in FE5."
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sample event card</Text>
        <Text style={styles.cardText}>
          M {sampleEvent.magnitude} · {sampleEvent.place}
        </Text>
        <Text style={styles.cardText}>Depth {sampleEvent.depthKm} km</Text>
        <Pressable style={styles.button} onPress={() => onOpenDetails(sampleEvent)}>
          <Text style={styles.buttonLabel}>Open details screen</Text>
        </Pressable>
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSizeLg,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  cardText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizeSm,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.brand,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  buttonLabel: {
    color: theme.colors.onBrand,
    fontWeight: theme.typography.fontWeightSemibold,
  },
});
