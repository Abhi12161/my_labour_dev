import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { FormInput } from '../../components/FormInput';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RoleSelector } from '../../components/RoleSelector';
import { SelectField } from '../../components/SelectField';
import { API_BASE_URL } from '../../config/env';
import { copy } from '../../constants/copy';
import { useAuthFlow } from '../../hooks/useAuthFlow';
import { fetchCities } from '../../services/authService';
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
    error,
    clearError,
  } = useAuthFlow(language, preSelectedRole || 'customer');

  const [cityOptions, setCityOptions] = useState([]);
  const [cityError, setCityError] = useState('');

  const isLogin = authMode === 'login';
  const showRoleSelector = !preSelectedRole && isLogin;
  const errorShellStyle = error ? { borderColor: '#ff4d4f' } : null;

  useEffect(() => {
    let isMounted = true;

    const loadCities = async () => {
      try {
        setCityError('');
        const cities = await fetchCities();

        if (!isMounted) {
          return;
        }

        setCityOptions(cities);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setCityOptions([]);
        setCityError(loadError.message || 'Unable to load cities');
      }
    };

    loadCities();

    return () => {
      isMounted = false;
    };
  }, []);

  const userTypeOptions = useMemo(
    () => [
      { label: text.labour, value: 'labour' },
      { label: text.customer, value: 'customer' },
    ],
    [text.customer, text.labour]
  );

  const mappedCityOptions = useMemo(
    () => cityOptions.map((city) => ({ label: city, value: city })),
    [cityOptions]
  );

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <View style={styles.topRow}>
          {(onBack || preSelectedRole) && (
            <Pressable onPress={onBack} style={styles.backBtn}>
              <Text style={styles.backText}>{`<- ${text.back}`}</Text>
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
              onChangeText={(value) => {
                updateSignupField('name', value);
                clearError();
              }}
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

            {/* <SelectField
              label="User type"
              options={userTypeOptions}
              placeholder="Select user type"
              value={role}
              onValueChange={(value) => {
                setRole(value);
                clearError();
              }}
              shellStyle={errorShellStyle}
            /> */}

            <SelectField
              label="City"
              options={mappedCityOptions}
              placeholder={cityError || 'Select city'}
              value={signupForm.city}
              onValueChange={(value) => {
                updateSignupField('city', value);
                clearError();
              }}
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
{/* 
            <FormInput
              label="Profile image URL"
              placeholder="https://example.com/photo.jpg"
              value={signupForm.profileImage}
              onChangeText={(value) => {
                updateSignupField('profileImage', value);
                clearError();
              }}
              shellStyle={errorShellStyle}
            /> */}
          </>
        )}

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

        <PrimaryButton
          label={isLogin ? text.submitLogin : text.submitSignup}
          loading={loading}
          onPress={submit}
        />

        {error && (
          <Text style={styles.errorText}>
            {`X ${error}`}
          </Text>
        )}

        {!isLogin && cityError ? (
          <Text style={styles.errorText}>
            {`X ${cityError}`}
          </Text>
        ) : null}

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
