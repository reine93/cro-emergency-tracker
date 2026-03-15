import type { EarthquakeEvent } from '@cro/shared';
import { StyleSheet, View } from 'react-native';
import { EmptyState } from '../components/state/EmptyState';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
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
      <Card>
        <Badge label="Sample" />
        <AppText variant="subtitle">Sample event card</AppText>
        <AppText variant="caption" muted>
          M {sampleEvent.magnitude} · {sampleEvent.place}
        </AppText>
        <AppText variant="caption" muted>
          Depth {sampleEvent.depthKm} km
        </AppText>
        <AppButton label="Open details screen" onPress={() => onOpenDetails(sampleEvent)} />
      </Card>

      <View style={styles.statePreview}>
        <EmptyState
          title="No more sample items"
          description="Loading/error states are now available as shared FE3 components."
        />
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  statePreview: {
    marginTop: theme.spacing.lg,
  },
});
