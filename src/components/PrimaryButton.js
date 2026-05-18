import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '../theme/tokens';

export function PrimaryButton({ label, loading, onPress, variant = 'primary', disabled = false }) {
  const isGhost = variant === 'ghost';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        isGhost ? styles.ghostButton : styles.primaryButton,
        isDisabled ? styles.disabledButton : null,
      ]}>
      {loading ? (
        <ActivityIndicator color={isGhost ? colors.primary : colors.panel} />
      ) : (
        <Text
          style={[
            styles.label,
            isGhost ? styles.ghostLabel : styles.primaryLabel,
            isDisabled ? styles.disabledLabel : null,
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  ghostButton: {
    backgroundColor: colors.panelMuted,
    // borderWidth: 1,
    borderColor: colors.border,
  },
  disabledButton: {
    opacity: 0.55,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
  },
  primaryLabel: {
    color: colors.panel,
  },
  ghostLabel: {
    color: colors.primary,
  },
  disabledLabel: {
    color: colors.panel,
  },
});
