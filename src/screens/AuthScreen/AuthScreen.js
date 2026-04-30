import { Pressable, ScrollView, Text, View } from 'react-native';

import { FormInput } from '../../components/FormInput';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RoleSelector } from '../../components/RoleSelector';
import { API_BASE_URL } from '../../config/env';
import { copy } from '../../constants/copy';
import { useAuthFlow } from '../../hooks/useAuthFlow';
import { styles } from './styles';

export function AuthScreen({
  language,
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
    error,          // ✅ ADD
    clearError,     // ✅ ADD
  } = useAuthFlow(language, preSelectedRole || 'customer');

  const isLogin = authMode === 'login';
  const showRoleSelector = !preSelectedRole;
  const errorShellStyle = error ? { borderColor: '#ff4d4f' } : null;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 🔝 TOP */}
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

      {/* 📄 FORM */}
      <View style={styles.formCard}>

        {showRoleSelector && (
          <RoleSelector copy={text} selectedRole={role} onChange={setRole} />
        )}

        {/* 🔹 SIGNUP */}
        {!isLogin && (
          <>
            <FormInput
              label={text.fullName}
              placeholder={text.fullNamePlaceholder}
              value={signupForm.name}
              onChangeText={(value) => {
                updateSignupField('name', value);
                clearError();
              }}
              autoCapitalize="words"
              shellStyle={errorShellStyle}
            />

            <FormInput
              label={text.address}
              placeholder={text.addressPlaceholder}
              value={signupForm.address}
              onChangeText={(value) => {
                updateSignupField('address', value);
                clearError();
              }}
              multiline
              autoCapitalize="words"
              shellStyle={errorShellStyle}
            />

            <FormInput
              label={text.phone}
              placeholder={text.phonePlaceholder}
              value={signupForm.mobile}
              keyboardType="phone-pad"
              onChangeText={(value) => {
                updateSignupField('mobile', value);
                clearError();
              }}
              shellStyle={errorShellStyle}
            />

            <FormInput
              label="Bio"
              placeholder="Tell us about your work or requirements"
              value={signupForm.bio}
              onChangeText={(value) => {
                updateSignupField('bio', value);
                clearError();
              }}
              multiline
              autoCapitalize="sentences"
              shellStyle={errorShellStyle}
            />

            <FormInput
              label="Profile image URL"
              placeholder="https://example.com/photo.jpg"
              value={signupForm.profileImage}
              onChangeText={(value) => {
                updateSignupField('profileImage', value);
                clearError();
              }}
              shellStyle={errorShellStyle}
            />
          </>
        )}

        {/* 🔹 LOGIN */}
        {isLogin && (
          <FormInput
            label={text.phone}
            placeholder={text.phonePlaceholder}
            value={loginForm.mobile}
            keyboardType="phone-pad"
            onChangeText={(value) => {
              updateLoginField('mobile', value);
              clearError();
            }}
            shellStyle={errorShellStyle}
          />
        )}

        {/* 🔥 SUBMIT */}
        <PrimaryButton
          label={isLogin ? text.submitLogin : text.submitSignup}
          loading={loading}
          onPress={submit}
        />

        {/* 🔴 ERROR MESSAGE */}
        {error && (
          <Text style={styles.errorText}>
            ❌ {error}
          </Text>
        )}

        {/* 🎯 DEMO */}
        <PrimaryButton
          label={text.demoButton}
          variant="ghost"
          onPress={launchDemo}
        />

        {/* 🔁 SWITCH */}
        <Text style={styles.switchText} onPress={switchMode}>
          {isLogin ? text.switchToSignup : text.switchToLogin}
        </Text>

        {/* 🌐 ENV */}
        <View style={styles.envBox}>
          <Text style={styles.envTitle}>{text.envTitle}</Text>
          <Text style={styles.envBody}>{text.envBody}</Text>
          <Text style={styles.envCode}>{API_BASE_URL}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
