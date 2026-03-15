import type { EarthquakeEvent } from '@cro/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenScaffold } from './ScreenScaffold';

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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#d7dce5',
  },
  cardTitle: {
    color: '#122033',
    fontSize: 18,
    fontWeight: '600',
  },
  cardText: {
    color: '#33445c',
    fontSize: 14,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#1d5fd1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
