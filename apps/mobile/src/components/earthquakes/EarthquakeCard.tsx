import type { EarthquakeListItem } from '../../types/earthquake';
import { useI18n } from '../../i18n';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';
import { Pill } from '../ui/Pill';

type EarthquakeCardProps = {
  item: EarthquakeListItem;
  onOpenDetails: () => void;
};

export function EarthquakeCard({ item, onOpenDetails }: EarthquakeCardProps) {
  const { t } = useI18n();

  return (
    <Card>
      <Pill label={item.source} />
      <AppText variant="subtitle">
        M {item.magnitude} · {item.place}
      </AppText>
      <AppText variant="caption" muted>
        {item.formattedTime}
      </AppText>
      <AppText variant="caption" muted>
        {item.relativeTime} · {item.depthLabel}
      </AppText>
      <AppButton label={t('common.details')} onPress={onOpenDetails} />
    </Card>
  );
}
