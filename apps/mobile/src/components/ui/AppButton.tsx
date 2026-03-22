import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';
import { AppText } from './AppText';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
};

export function AppButton({
  label,
  onPress,
  icon,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
}: AppButtonProps) {
  return (
    <Pressable
      style={[styles.button, disabled ? styles.buttonDisabled : null]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      hitSlop={6}
    >
      {icon}
      <AppText variant="caption" style={[styles.label, disabled ? styles.labelDisabled : null]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.brand,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#f25e4f',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    gap: theme.spacing.xs,
    ...theme.shadows.card,
  },
  label: {
    color: theme.colors.onBrand,
  },
  buttonDisabled: {
    backgroundColor: '#f3d1c1',
    borderColor: '#e5c0b1',
  },
  labelDisabled: {
    color: theme.colors.textMuted,
  },
});
