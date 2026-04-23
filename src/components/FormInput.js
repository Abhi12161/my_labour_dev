import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius } from '../theme/tokens';

export function FormInput({
  keyboardType,
  label,
  onChangeText,
  placeholder,
  secureTextEntry,
  value,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = Boolean(secureTextEntry);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          style={styles.input}
          value={value}
          autoCapitalize="none"
        />
        {isPassword ? (
          <Pressable onPress={() => setShowPassword((current) => !current)}>
            <Text style={styles.toggle}>{showPassword ? 'Hide' : 'Show'}</Text>
          </Pressable>
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
  inputShell: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.panelMuted,
    paddingHorizontal: 16,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 14,
  },
  toggle: {
    color: colors.primary,
    fontWeight: '700',
  },
});
