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
      <View style={styles.heroCard}>
        <View style={styles.topRow}>
          {(onBack || preSelectedRole) && (
            <Pressable onPress={onBack} style={styles.backBtn}>
              <Text style={styles.backText}>â† {text.back}</Text>
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

      <View style={styles.formCard}>
        {showRoleSelector && (
          <RoleSelector copy={text} selectedRole={role} onChange={setRole} />
        )}

        {!isLogin && (
          <>
            <FormInput
              label={text.fullName}
              placeholder={text.fullNamePlaceholder}
              value={signupForm.name}
              onChangeText={(value) => updateSignupField('name', value)}
            />

            <FormInput
              label={text.address}
              placeholder={text.addressPlaceholder}
              value={signupForm.address}
              onChangeText={(value) => updateSignupField('address', value)}
              multiline
            />
          </>
        )}

        <FormInput
          label={text.phone}
          placeholder={text.phonePlaceholder}
          value={isLogin ? loginForm.phone : signupForm.phone}
          keyboardType="phone-pad"
          onChangeText={(value) =>
            isLogin
              ? updateLoginField('phone', value)
              : updateSignupField('phone', value)
          }
        />

        <PrimaryButton
          label={isLogin ? text.submitLogin : text.submitSignup}
          loading={loading}
          onPress={submit}
        />

        <PrimaryButton
          label={text.demoButton}
          variant="ghost"
          onPress={launchDemo}
        />

        <Text style={styles.switchText} onPress={switchMode}>
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
