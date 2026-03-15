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
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.onBrand,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.border,
  },
  labelDisabled: {
    color: theme.colors.textMuted,
  },
});
