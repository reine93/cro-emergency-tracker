import type { EarthquakeEvent } from '@cro/shared';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { useI18n } from '../i18n';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';
import { formatEventTimeCroatia, localizePlaceName } from '../types/earthquake';

type DetailsScreenProps = {
  event: EarthquakeEvent;
  onBack: () => void;
};

export function DetailsScreen({ event, onBack }: DetailsScreenProps) {
  const { t, language } = useI18n();
  const localizedPlace = localizePlaceName(event.place, language);
  const isOutsideCroatia = !localizedPlace.toUpperCase().includes('HRVATSKA');
  const feltImpactHint =
    event.magnitude >= 4 ? t('details.feltImpactHigh') : t('details.feltImpactNormal');

  return (
    <ScreenScaffold title={t('details.title')} subtitle={t('details.subtitle')}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Pill label={event.source} />
          <AppText variant="subtitle">M {event.magnitude}</AppText>
          <AppText variant="caption" muted>
            {t('details.magnitudeHint')}
          </AppText>

          <View style={styles.infoGroup}>
            <AppText variant="caption" muted>
              {t('details.placeLabel')}
            </AppText>
            <AppText variant="body">{localizedPlace || t('common.unknownPlace')}</AppText>
          </View>

          <View style={styles.infoGroup}>
            <AppText variant="caption" muted>
              {t('details.occurredLabel')}
            </AppText>
            <AppText variant="body">
              {formatEventTimeCroatia(event.time, language, t('common.unknownTime'))}
            </AppText>
          </View>

          <View style={styles.infoGroup}>
            <AppText variant="caption" muted>
              {t('details.depthLabel')}
            </AppText>
            <AppText variant="body">
              {event.depthKm !== undefined ? `${event.depthKm} km` : t('common.na')}
            </AppText>
          </View>

          <View style={styles.infoGroup}>
            <AppText variant="caption" muted>
              {t('details.coordinatesLabel')}
            </AppText>
            <AppText variant="body">
              {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
            </AppText>
          </View>

          {event.authority ? (
            <View style={styles.infoGroup}>
              <AppText variant="caption" muted>
                {t('details.reportedByLabel')}
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
            {t('details.disclaimer')}
          </AppText>
        </Card>

        <View style={styles.backButtonWrap}>
          <AppButton
            label={t('details.backToList')}
            onPress={onBack}
            accessibilityLabel={t('a11y.details.backToList')}
          />
        </View>
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
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
