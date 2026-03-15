import type { EarthquakeListItem } from '../../types/earthquake';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';
import { Pill } from '../ui/Pill';

type EarthquakeCardProps = {
  item: EarthquakeListItem;
  onOpenDetails: () => void;
};

export function EarthquakeCard({ item, onOpenDetails }: EarthquakeCardProps) {
  return (
    <Card>
      <Pill label={item.source} />
      <AppText variant="subtitle">
        M {item.magnitude} · {item.place}
      </AppText>
      <AppText variant="caption" muted>
        {item.relativeTime}
      </AppText>
      <AppText variant="caption" muted>
        {item.depthLabel}
      </AppText>
      <AppButton label="Details" onPress={onOpenDetails} />
    </Card>
  );
}
