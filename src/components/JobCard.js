import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/tokens';

export function JobCard({ copy, job, actionLabel, onActionPress, disabled = false }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{job.title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{job.distance}</Text>
        </View>
      </View>

      <View style={styles.metaGroup}>
        <Text style={styles.meta}>
          {copy.locationLabel}: {job.location}
        </Text>
        {job.skill ? <Text style={styles.meta}>{copy.requiredSkill}: {job.skill}</Text> : null}
        <Text style={styles.meta}>
          {copy.applicantsLabel}: {job.applicants}
        </Text>
        <Text style={styles.meta}>
          {copy.postedLabel}: {job.posted}
        </Text>
        {job.description ? <Text style={styles.meta}>{job.description}</Text> : null}
      </View>

      {actionLabel ? (
        <Pressable
          style={[styles.actionButton, disabled && styles.disabledButton]}
          onPress={onActionPress}
          disabled={disabled}
        >
          <Text style={[styles.actionLabel, disabled && styles.disabledLabel]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0 10px 18px rgba(18, 35, 32, 0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
  },
  badge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  metaGroup: {
    gap: 6,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  actionButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  disabledButton: {
    backgroundColor: colors.panelMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionLabel: {
    color: colors.panel,
    fontWeight: '800',
  },
  disabledLabel: {
    color: colors.textMuted,
  },
});
