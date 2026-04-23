import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '../theme/tokens';

export function PrimaryButton({ label, loading, onPress, variant = 'primary' }) {
  const isGhost = variant === 'ghost';

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={[styles.button, isGhost ? styles.ghostButton : styles.primaryButton]}>
      {loading ? (
        <ActivityIndicator color={isGhost ? colors.primary : colors.panel} />
      ) : (
        <Text style={[styles.label, isGhost ? styles.ghostLabel : styles.primaryLabel]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    borderWidth: 1,
    borderColor: colors.border,
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
});
