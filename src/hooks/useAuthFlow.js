import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { copy } from '../constants/copy';
import {
  authenticateDemo,
  clearAuthError,
  setRole,
  submitAuth,
  toggleAuthMode,
  updateLoginField,
  updateSignupField,
} from '../store/authSlice';

export function useAuthFlow(language, initialRole = 'customer') {
  const text = copy[language];
  const dispatch = useDispatch();
  const { authMode, role, roleAuth, session } = useSelector((state) => state.auth);
  const activeRoleAuth = roleAuth[role];
  const { loading, loginForm, signupForm, error } = activeRoleAuth;

  useEffect(() => {
    if (initialRole && role !== initialRole) {
      dispatch(setRole(initialRole));
    }
  }, [dispatch, initialRole, role]);

  const submit = async () => {
    const activeForm = authMode === 'login' ? loginForm : signupForm;
    const requiredFields =
      authMode === 'login'
        ? [activeForm.phone]
        : [activeForm.name, activeForm.phone, activeForm.address];

    if (requiredFields.some((value) => !value.trim())) {
      Alert.alert(text.missingTitle, text.missingBody);
      return;
    }

    const result = await dispatch(submitAuth());

    if (submitAuth.fulfilled.match(result)) {
      Alert.alert(text.successTitle, authMode === 'login' ? text.loginSuccess : text.signupSuccess);
      return;
    }

    Alert.alert(text.errorTitle, result.payload || text.errorTitle);
  };

  const launchDemo = () => {
    dispatch(authenticateDemo());
  };

  const handleUpdateLoginField = (field, value) => {
    dispatch(updateLoginField({ field, value }));
  };

  const handleUpdateSignupField = (field, value) => {
    dispatch(updateSignupField({ field, value }));
  };

  const switchMode = () => {
    dispatch(toggleAuthMode());
  };

  const handleSetRole = (nextRole) => {
    dispatch(setRole(nextRole));
  };

  return {
    authMode,
    error,
    loading,
    loginForm,
    role,
    session,
    signupForm,
    setRole: handleSetRole,
    switchMode,
    submit,
    launchDemo,
    updateLoginField: handleUpdateLoginField,
    updateSignupField: handleUpdateSignupField,
    clearError: () => dispatch(clearAuthError()),
  };
}
