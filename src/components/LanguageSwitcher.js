import { Pressable, StyleSheet, Text, View } from 'react-native';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'bho', label: 'भोजपुरी' },
];

export function LanguageSwitcher({ selected, onChange }) {
  return (
    <View style={styles.container}>
      {languages.map((language) => {
        const active = selected === language.code;

        return (
          <Pressable
            key={language.code}
            onPress={() => onChange(language.code)}
            style={[styles.tab, active && styles.activeTab]}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>
              {language.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // 🔥 Main pill container (second image jaisa)
  container: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    borderRadius: 999,
    padding: 4,
    alignSelf: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  // 🔹 Each tab
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },

  // 🔥 Active tab (white pill)
  activeTab: {
    backgroundColor: '#ffffff',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777',
  },

  activeLabel: {
    color: '#000',
    fontWeight: '700',
  },
});