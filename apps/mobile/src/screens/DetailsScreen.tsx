import type { EarthquakeEvent } from '@cro/shared';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';
import { formatEventTimeCroatia } from '../types/earthquake';

type DetailsScreenProps = {
  event: EarthquakeEvent;
  onBack: () => void;
};

export function DetailsScreen({ event, onBack }: DetailsScreenProps) {
  const isOutsideCroatia = !event.place.toUpperCase().includes('CROATIA');
  const feltImpactHint =
    event.magnitude >= 4
      ? 'Higher-magnitude cross-border event. It may be felt in parts of Croatia.'
      : 'Cross-border event. It may be felt in Croatia depending on distance and local conditions.';

  return (
    <ScreenScaffold title="Event Details" subtitle="Informational only · not an EEW alert">
      <Card>
        <Pill label={event.source} />
        <AppText variant="subtitle">M {event.magnitude}</AppText>
        <AppText variant="caption" muted>
          Magnitude indicates the estimated energy release of the earthquake.
        </AppText>

        <View style={styles.infoGroup}>
          <AppText variant="caption" muted>
            Place
          </AppText>
          <AppText variant="body">{event.place || 'Unknown place'}</AppText>
        </View>

        <View style={styles.infoGroup}>
          <AppText variant="caption" muted>
            Occured at (Local time in Croatia)
          </AppText>
          <AppText variant="body">{formatEventTimeCroatia(event.time)}</AppText>
        </View>

        <View style={styles.infoGroup}>
          <AppText variant="caption" muted>
            Depth
          </AppText>
          <AppText variant="body">
            {event.depthKm !== undefined ? `${event.depthKm} km` : 'n/a'}
          </AppText>
        </View>

        <View style={styles.infoGroup}>
          <AppText variant="caption" muted>
            Coordinates
          </AppText>
          <AppText variant="body">
            {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
          </AppText>
        </View>

        {event.authority ? (
          <View style={styles.infoGroup}>
            <AppText variant="caption" muted>
              Reported by
            </AppText>
            <AppText variant="body">{event.authority}</AppText>
          </View>
        ) : null}

        {isOutsideCroatia ? (
          <View style={styles.banner}>
            <AppText variant="caption">{feltImpactHint}</AppText>
          </View>
        ) : null}
      </Card>

      <Card>
        <AppText variant="caption" muted>
          This information supports awareness and preparedness only. Follow official civil
          protection guidance for emergency actions.
        </AppText>
      </Card>

      <View style={styles.backButtonWrap}>
        <AppButton label="Back to list" onPress={onBack} />
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  infoGroup: {
    gap: theme.spacing.xs,
  },
  banner: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.brandSoft,
    padding: theme.spacing.md,
  },
  backButtonWrap: {
    marginTop: theme.spacing.sm,
  },
});
