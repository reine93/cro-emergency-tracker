import type { EarthquakeEvent } from '@cro/shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { EmptyState } from '../components/state/EmptyState';
import { ErrorState } from '../components/state/ErrorState';
import { LoadingState } from '../components/state/LoadingState';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { getRecentEarthquakes } from '../api/earthquakes.api';
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
  const [isDebugLoading, setIsDebugLoading] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [debugResult, setDebugResult] = useState<string | null>(null);

  const runDebugApiTest = async () => {
    setIsDebugLoading(true);
    setDebugError(null);
    setDebugResult(null);

    try {
      const items = await getRecentEarthquakes({ hours: 336, minMag: 2.5 });
      const first = items[0];
      setDebugResult(
        first
          ? `Fetched ${items.length} items. First: M${first.magnitude} · ${first.place} (${first.relativeTime}).`
          : 'Fetched 0 items.',
      );
    } catch (error) {
      setDebugError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsDebugLoading(false);
    }
  };

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

      <View style={styles.statePreview}>
        <Card>
          <Badge label="Debug only (remove in FE5)" />
          <AppText variant="subtitle">FE4 API test panel</AppText>
          <AppText variant="caption" muted>
            Runs getRecentEarthquakes with current API base URL.
          </AppText>
          <AppButton label="Test API fetch" onPress={runDebugApiTest} />
          {isDebugLoading ? <LoadingState message="Calling backend..." /> : null}
          {debugError ? (
            <ErrorState
              title="API test failed"
              description={debugError}
              onRetry={runDebugApiTest}
            />
          ) : null}
          {debugResult ? <AppText variant="caption">{debugResult}</AppText> : null}
        </Card>
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  statePreview: {
    marginTop: theme.spacing.lg,
  },
});
