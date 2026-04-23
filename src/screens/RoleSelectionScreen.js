import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { copy } from '../constants/copy';
import { colors, radius } from '../theme/tokens';

export function RoleSelectionScreen({ language, onChangeLanguage, onSelectRole }) {
  const text = copy[language];

  const roles = [
    {
      key: 'customer',
      title: text.needWorkers || 'I need workers',
      description: text.customerRoleDescription || 'Post your project details and quickly connect with millions, helpers, electricians, plumbers, and more in your area.',
      cta: text.startHiring || 'Start Hiring',
      icon: '👤',
    },
    {
      key: 'labour',
      title: text.offerServices || 'I offer services',
      description: text.labourRoleDescription || 'Build a strong profile for your work, highlight your skills, and get discovered by customers looking for reliable local professionals.',
      cta: text.signUpWorker || 'Sign up as a worker',
      icon: '🔧',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>💼</Text>
          <Text style={styles.appName}>{text.badge || 'Labor Connect'}</Text>
          <LanguageSwitcher selected={language} onChange={onChangeLanguage} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.headline}>{text.headline}</Text>
          <Text style={styles.subheadline}>{text.subheadline}</Text>
        </View>

        {/* Roles Grid */}
        <View style={styles.rolesGrid}>
          {roles.map((role) => (
            <Pressable
              key={role.key}
              style={styles.roleCard}
              onPress={() => onSelectRole(role.key)}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{role.icon}</Text>
              </View>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>{role.cta}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{text.allCitiesAvailable || 'Available in Muzaffarpur'}</Text>
          <Text style={styles.footerSubtext}>
            {text.footerBenefits || 'Live opportunities in Muzaffarpur • Better worker-employer matching • Professional first impression'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  logo: {
    fontSize: 40,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  heroSection: {
    marginBottom: 32,
    gap: 12,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 36,
  },
  subheadline: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  rolesGrid: {
    gap: 16,
    marginBottom: 32,
  },
  roleCard: {
    backgroundColor: colors.panel,
    borderRadius: radius.xl,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.panelMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  roleDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaText: {
    color: colors.panel,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    backgroundColor: colors.panelMuted,
    borderRadius: radius.lg,
    padding: 16,
    gap: 8,
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
