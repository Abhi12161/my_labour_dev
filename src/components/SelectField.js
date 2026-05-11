import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/tokens';

export function SelectField({
  label,
  options,
  placeholder,
  onValueChange,
  shellStyle,
  value,
}) {
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.container}>
        <Pressable
          onPress={() => setOpen((current) => !current)}
          style={[styles.inputShell, shellStyle]}>
          <Text style={[styles.valueText, !selectedOption && styles.placeholderText]}>
            {selectedOption?.label || placeholder}
          </Text>
          <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
        </Pressable>

        {open ? (
          <View style={styles.dropdown}>
            {options.map((option) => {
              const active = option.value === value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  style={[styles.option, active && styles.activeOption]}>
                  <Text style={[styles.optionText, active && styles.activeOptionText]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  container: {
    gap: 8,
  },
  inputShell: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.panelMuted,
    paddingHorizontal: 16,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  valueText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  placeholderText: {
    color: colors.textMuted,
  },
  chevron: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  activeOption: {
    backgroundColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
  },
  activeOptionText: {
    color: colors.panel,
    fontWeight: '700',
  },
});
