import { StyleSheet, View } from 'react-native';
import { theme } from '../../theme/theme';
import { AppText } from './AppText';

type BadgeProps = {
  label: string;
};

export function Badge({ label }: BadgeProps) {
  return (
    <View style={styles.badge}>
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.md,
    backgroundColor: '#ffe9a8',
    borderWidth: 1,
    borderColor: '#f1cc58',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
});
