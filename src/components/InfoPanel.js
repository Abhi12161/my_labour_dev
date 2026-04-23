import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/tokens';

export function InfoPanel({ title, body, tone = 'default' }) {
  return (
    <View style={[styles.card, tone === 'accent' && styles.accentCard]}>
      <Text style={[styles.title, tone === 'accent' && styles.accentTitle]}>{title}</Text>
      <Text style={[styles.body, tone === 'accent' && styles.accentBody]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0 10px 18px rgba(18, 35, 32, 0.08)',
  },
  accentCard: {
    backgroundColor: colors.hero,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  accentTitle: {
    color: colors.panel,
  },
  body: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  accentBody: {
    color: '#d9e8e2',
  },
});
