import type { EarthquakeEvent } from '@cro/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenScaffold } from './ScreenScaffold';

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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#d7dce5',
  },
  line: {
    color: '#21344d',
    fontSize: 14,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#1d5fd1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  buttonLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
