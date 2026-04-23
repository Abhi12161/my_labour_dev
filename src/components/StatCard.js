import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/tokens';

export function StatCard({ label, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0 10px 18px rgba(18, 35, 32, 0.08)',
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  value: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
