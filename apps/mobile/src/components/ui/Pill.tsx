import { StyleSheet, View } from 'react-native';
import { theme } from '../../theme/theme';
import { AppText } from './AppText';

type PillProps = {
  label: string;
};

export function Pill({ label }: PillProps) {
  return (
    <View style={styles.pill}>
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#fff0e6',
    borderWidth: 1,
    borderColor: '#f3cdb7',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
});
