import { useState } from 'react';
import { Alert } from 'react-native';

import { copy } from '../constants/copy';
import { login, signup } from '../services/authService';

const initialLoginForm = {
  email: '',
  password: '',
};

const initialSignupForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
};

export function useAuthFlow(language, onAuthenticated, initialRole = 'customer') {
  const text = copy[language];
  const [authMode, setAuthMode] = useState('login');
  const [role, setRole] = useState(initialRole);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [signupForm, setSignupForm] = useState(initialSignupForm);
  const [loading, setLoading] = useState(false);

  const updateLoginField = (field, value) => {
    setLoginForm((current) => ({ ...current, [field]: value }));
  };

  const updateSignupField = (field, value) => {
    setSignupForm((current) => ({ ...current, [field]: value }));
  };

  const switchMode = () => {
    setAuthMode((current) => (current === 'login' ? 'signup' : 'login'));
  };

  const submit = async () => {
    const activeForm = authMode === 'login' ? loginForm : signupForm;
    const requiredFields =
      authMode === 'login'
        ? [activeForm.email, activeForm.password]
        : [activeForm.name, activeForm.email, activeForm.phone, activeForm.password];

    if (requiredFields.some((value) => !value.trim())) {
      Alert.alert(text.missingTitle, text.missingBody);
      return;
    }

    setLoading(true);

    try {
      const response =
        authMode === 'login' ? await login(loginForm) : await signup(signupForm);

      const user =
        response.user ||
        (authMode === 'login'
          ? {
              name: response.name || 'User',
              email: loginForm.email,
              phone: response.phone || 'Not provided',
            }
          : {
              name: signupForm.name,
              email: signupForm.email,
              phone: signupForm.phone,
            });

      onAuthenticated({
        token: response.token || '',
        user,
        role,
      });

      Alert.alert(text.successTitle, authMode === 'login' ? text.loginSuccess : text.signupSuccess);
      setLoginForm(initialLoginForm);
      setSignupForm(initialSignupForm);
    } catch (error) {
      Alert.alert(text.errorTitle, error.message);
    } finally {
      setLoading(false);
    }
  };

  const launchDemo = () => {
    onAuthenticated({
      token: 'demo-session',
      user: {
        name: 'Abhimanyu Kumar',
        email: 'abhimanyu2021@gmail.com',
        phone: '9262980734',
      },
      role,
    });
  };

  return {
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
  };
}
