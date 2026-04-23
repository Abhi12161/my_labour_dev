import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FormInput } from '../components/FormInput';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { PrimaryButton } from '../components/PrimaryButton';
import { RoleSelector } from '../components/RoleSelector';
import { API_BASE_URL } from '../config/env';
import { copy } from '../constants/copy';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { colors, radius } from '../theme/tokens';

export function AuthScreen({ language, onAuthenticated, onChangeLanguage, preSelectedRole, onBack }) {
  const text = copy[language];
  const {
    authMode,
    loading,
    loginForm,
    role,
    signupForm,
    setRole,
    switchMode,
    submit,
    launchDemo,
    updateLoginField,
    updateSignupField,
  } = useAuthFlow(language, onAuthenticated, preSelectedRole || 'customer');

  const isLogin = authMode === 'login';
  const showRoleSelector = !preSelectedRole;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          {(onBack || preSelectedRole) && (
            <Pressable onPress={onBack} style={styles.backButton}>
              <Text style={styles.backText}>← {text.back || 'Back'}</Text>
            </Pressable>
          )}
          <Text style={styles.badge}>{text.badge}</Text>
          <LanguageSwitcher selected={language} onChange={onChangeLanguage} />
        </View>

        {!preSelectedRole && (
          <>
            <Text style={styles.headline}>{text.headline}</Text>
            <Text style={styles.subheadline}>{text.subheadline}</Text>
          </>
        )}
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>{isLogin ? text.welcomeBack : text.createAccount}</Text>
        <Text style={styles.formDescription}>
          {isLogin ? text.loginDescription : text.signupDescription}
        </Text>

        {showRoleSelector && <RoleSelector copy={text} selectedRole={role} onChange={setRole} />}

        {!isLogin ? (
          <FormInput
            label={text.fullName}
            placeholder={text.fullNamePlaceholder}
            value={signupForm.name}
            onChangeText={(value) => updateSignupField('name', value)}
          />
        ) : null}

        <FormInput
          label={text.email}
          placeholder={text.emailPlaceholder}
          value={isLogin ? loginForm.email : signupForm.email}
          keyboardType="email-address"
          onChangeText={(value) =>
            isLogin ? updateLoginField('email', value) : updateSignupField('email', value)
          }
        />

        {!isLogin ? (
          <FormInput
            label={text.phone}
            placeholder={text.phonePlaceholder}
            value={signupForm.phone}
            keyboardType="phone-pad"
            onChangeText={(value) => updateSignupField('phone', value)}
          />
        ) : null}

        <FormInput
          label={text.password}
          placeholder={text.passwordPlaceholder}
          value={isLogin ? loginForm.password : signupForm.password}
          secureTextEntry
          onChangeText={(value) =>
            isLogin ? updateLoginField('password', value) : updateSignupField('password', value)
          }
        />

        <PrimaryButton
          label={isLogin ? text.submitLogin : text.submitSignup}
          loading={loading}
          onPress={submit}
        />

        <PrimaryButton label={text.demoButton} variant="ghost" onPress={launchDemo} />

        <Text style={styles.switchLink} onPress={switchMode}>
          {isLogin ? text.switchToSignup : text.switchToLogin}
        </Text>

        <View style={styles.envBox}>
          <Text style={styles.envTitle}>{text.envTitle}</Text>
          <Text style={styles.envBody}>{text.envBody}</Text>
          <Text style={styles.envCode}>{API_BASE_URL}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 36,
    gap: 20,
  },
  heroCard: {
    backgroundColor: colors.hero,
    borderRadius: radius.xl,
    padding: 24,
    gap: 18,
  },
  heroTopRow: {
    gap: 12,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backText: {
    color: colors.panel,
    fontSize: 14,
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    color: colors.panel,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '800',
  },
  headline: {
    color: colors.panel,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
  },
  subheadline: {
    color: '#d9e6e0',
    fontSize: 15,
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: colors.panel,
    borderRadius: radius.xl,
    padding: 22,
    gap: 16,
  },
  formTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  formDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    paddingTop: 4,
  },
  envBox: {
    backgroundColor: colors.panelMuted,
    borderRadius: radius.lg,
    padding: 16,
    gap: 6,
  },
  envTitle: {
    color: colors.text,
    fontWeight: '800',
  },
  envBody: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  envCode: {
    color: colors.primary,
    fontWeight: '800',
  },
});
