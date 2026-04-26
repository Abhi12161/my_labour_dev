import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FormInput } from '../components/FormInput';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { PrimaryButton } from '../components/PrimaryButton';
import { RoleSelector } from '../components/RoleSelector';
import { API_BASE_URL } from '../config/env';
import { copy } from '../constants/copy';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { colors, radius } from '../theme/tokens';

export function AuthScreen({
  language,
  onAuthenticated,
  onChangeLanguage,
  preSelectedRole,
  onBack,
}) {
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
      
      {/* HERO */}
      <View style={styles.heroCard}>
        <View style={styles.topRow}>
          {(onBack || preSelectedRole) && (
            <Pressable onPress={onBack} style={styles.backBtn}>
              <Text style={styles.backText}>← {text.back}</Text>
            </Pressable>
          )}
          <LanguageSwitcher selected={language} onChange={onChangeLanguage} />
        </View>

        <Text style={styles.title}>
          {isLogin ? text.welcomeBack : text.createAccount}
        </Text>

        <Text style={styles.subtitle}>
          {isLogin ? text.loginDescription : text.signupDescription}
        </Text>
      </View>

      {/* FORM */}
      <View style={styles.formCard}>

        {showRoleSelector && (
          <RoleSelector copy={text} selectedRole={role} onChange={setRole} />
        )}

        {/* Signup Fields */}
        {!isLogin && (
          <>
            <FormInput
              label={text.fullName}
              placeholder={text.fullNamePlaceholder}
              value={signupForm.name}
              onChangeText={(v) => updateSignupField('name', v)}
            />

            <FormInput
              label={text.address}
              placeholder={text.addressPlaceholder}
              value={signupForm.address}
              onChangeText={(v) => updateSignupField('address', v)}
              multiline
            />
          </>
        )}

        {/* Mobile */}
        <FormInput
          label={text.phone}
          placeholder={text.phonePlaceholder}
          value={isLogin ? loginForm.phone : signupForm.phone}
          keyboardType="phone-pad"
          onChangeText={(v) =>
            isLogin
              ? updateLoginField('phone', v)
              : updateSignupField('phone', v)
          }
        />

        {/* BUTTON */}
        <PrimaryButton
          label={isLogin ? text.submitLogin : text.submitSignup}
          loading={loading}
          onPress={submit}
        />

        {/* DEMO */}
        <PrimaryButton
          label={text.demoButton}
          variant="ghost"
          onPress={launchDemo}
        />

        {/* SWITCH */}
        <Text style={styles.switchText} onPress={switchMode}>
          {isLogin ? text.switchToSignup : text.switchToLogin}
        </Text>

        {/* ENV BOX */}
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
    paddingBottom: 40,
    gap: 20,
  },

  heroCard: {
    backgroundColor: colors.hero,
    borderRadius: radius.xl,
    padding: 24,
    gap: 12,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  backText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },

  subtitle: {
    color: '#dfe6e3',
    fontSize: 14,
    lineHeight: 20,
  },

  formCard: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  switchText: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '700',
    marginTop: 6,
  },

  envBox: {
    marginTop: 10,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.panelMuted,
    gap: 6,
  },

  envTitle: {
    fontWeight: '700',
    color: colors.text,
  },

  envBody: {
    color: colors.textMuted,
    fontSize: 13,
  },

  envCode: {
    color: colors.primary,
    fontWeight: '700',
  },
});