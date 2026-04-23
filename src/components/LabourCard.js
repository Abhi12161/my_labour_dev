import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/tokens';

export function LabourCard({ copy, labour }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{labour.photoLabel}</Text>
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.name}>{labour.name}</Text>
          <Text style={styles.primarySkill}>{labour.primarySkill}</Text>
          <Text style={styles.meta}>
            {copy.ratingLabel}: {labour.rating} ({labour.reviews})
          </Text>
        </View>
      </View>

      <Text style={styles.meta}>{labour.location}</Text>
      <Text style={styles.meta}>
        {copy.distanceLabel}: {labour.distance}
      </Text>
      <Text style={styles.meta}>{labour.availability}</Text>

      <View style={styles.skillRow}>
        {labour.skills.map((skill) => (
          <View key={skill} style={styles.skillChip}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.actionButton}>
        <Text style={styles.actionLabel}>{copy.hireNow}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0 10px 18px rgba(18, 35, 32, 0.08)',
  },
  header: {
    flexDirection: 'row',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.panel,
    fontWeight: '800',
    fontSize: 18,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  primarySkill: {
    color: colors.primary,
    fontWeight: '700',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: colors.panelMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  skillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  actionButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  actionLabel: {
    color: colors.panel,
    fontWeight: '800',
  },
});
