import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/tokens';

const languages = [
  { code: 'en', label: 'Engl' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'bho', label: 'भोजपुरी' },
];

export function LanguageSwitcher({ selected, onChange, light = false }) {
  return (
    <View style={styles.row}>
      {languages.map((language) => {
        const active = selected === language.code;

        return (
          <Pressable
            key={language.code}
            onPress={() => onChange(language.code)}
            style={[styles.chip, light ? styles.chipLight : styles.chipDark, active && styles.activeChip]}>
            <Text style={[styles.label, light ? styles.labelLight : styles.labelDark, active && styles.activeLabel]}>
              {language.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  chipDark: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  chipLight: {
    backgroundColor: colors.panelMuted,
  },
  activeChip: {
    backgroundColor: colors.panel,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  labelDark: {
    color: colors.panel,
  },
  labelLight: {
    color: colors.textMuted,
  },
  activeLabel: {
    color: colors.primary,
  },
});
