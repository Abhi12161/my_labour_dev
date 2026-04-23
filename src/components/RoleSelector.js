import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/tokens';

export function RoleSelector({ copy, selectedRole, onChange }) {
  const roles = [
    { key: 'customer', label: copy.customer, body: copy.customerRoleBody },
    { key: 'labour', label: copy.labour, body: copy.labourRoleBody },
  ];

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{copy.roleTitle}</Text>
      <View style={styles.row}>
        {roles.map((role) => {
          const active = selectedRole === role.key;

          return (
            <Pressable
              key={role.key}
              onPress={() => onChange(role.key)}
              style={[styles.card, active && styles.activeCard]}>
              <Text style={[styles.label, active && styles.activeLabel]}>{role.label}</Text>
              <Text style={[styles.body, active && styles.activeBody]}>{role.body}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: colors.panelMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
    gap: 8,
  },
  activeCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  body: {
    color: colors.textMuted,
    lineHeight: 20,
    fontSize: 13,
  },
  activeLabel: {
    color: colors.panel,
  },
  activeBody: {
    color: '#dcebe6',
  },
});
