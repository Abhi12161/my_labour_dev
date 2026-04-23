import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius } from '../theme/tokens';

function FilterGroup({ label, options, selected, onSelect }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map((option) => {
          const active = selected === option;

          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              style={[styles.optionChip, active && styles.optionChipActive]}>
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function FilterBar({ copy, filters, options, onChangeFilter, onClear }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{copy.filtersTitle}</Text>
      <TextInput
        style={styles.searchInput}
        placeholder={copy.searchPlaceholder}
        placeholderTextColor={colors.textMuted}
        value={filters.search}
        onChangeText={(value) => onChangeFilter('search', value)}
      />

      <FilterGroup
        label={copy.district}
        options={options.district}
        selected={filters.district}
        onSelect={(value) => onChangeFilter('district', value)}
      />
      <FilterGroup
        label={copy.category}
        options={options.category}
        selected={filters.category}
        onSelect={(value) => onChangeFilter('category', value)}
      />
      <FilterGroup
        label={copy.availability}
        options={options.availability}
        selected={filters.availability}
        onSelect={(value) => onChangeFilter('availability', value)}
      />
      <FilterGroup
        label={copy.rating}
        options={options.rating}
        selected={filters.rating}
        onSelect={(value) => onChangeFilter('rating', value)}
      />

      <Pressable onPress={onClear} style={styles.clearButton}>
        <Text style={styles.clearLabel}>{copy.clearFilters}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    padding: 20,
    gap: 16,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  searchInput: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelMuted,
    paddingHorizontal: 16,
    color: colors.text,
  },
  group: {
    gap: 10,
  },
  groupLabel: {
    color: colors.text,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    backgroundColor: colors.panelMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionChipActive: {
    backgroundColor: colors.primary,
  },
  optionText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  optionTextActive: {
    color: colors.panel,
  },
  clearButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
  },
  clearLabel: {
    color: colors.accent,
    fontWeight: '800',
  },
});
