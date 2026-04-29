import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  authenticateDemo,
  clearAuthError,
  setRole,
  setError, // ✅ ADD THIS
  submitAuth,
  toggleAuthMode,
  updateLoginField,
  updateSignupField,
} from '../store/authSlice';

export function useAuthFlow(language, initialRole = 'customer') {
  const dispatch = useDispatch();
  const { authMode, role, roleAuth, session } = useSelector((state) => state.auth);

  const activeRoleAuth = roleAuth[role];
  const { loading, loginForm, signupForm, error } = activeRoleAuth;

  useEffect(() => {
    if (initialRole && role !== initialRole) {
      dispatch(setRole(initialRole));
    }
  }, [dispatch, initialRole, role]);

  // 🔥 STRONG VALIDATION FUNCTION
  const isValidPhone = (phone) => {
    return /^[0-9]{10}$/.test(phone);
  };

  const submit = async () => {
    const activeForm = authMode === 'login' ? loginForm : signupForm;

    dispatch(clearAuthError());

    // ✅ Phone validation
    if (!isValidPhone(activeForm.phone)) {
      return dispatch(setError('Enter valid 10 digit mobile number'));
    }

    // ✅ Signup validation
    if (authMode === 'signup') {
      if (!activeForm.name.trim()) {
        return dispatch(setError('Name is required'));
      }

      if (!activeForm.address.trim()) {
        return dispatch(setError('Address is required'));
      }
    }

    const result = await dispatch(submitAuth());

    // ❌ API error already Redux me set ho jayega
    if (!submitAuth.fulfilled.match(result)) {
      return;
    }
  };

  const launchDemo = () => {
    dispatch(authenticateDemo());
  };

  return {
    authMode,
    error,
    loading,
    loginForm,
    role,
    session,
    signupForm,
    setRole: (r) => dispatch(setRole(r)),
    switchMode: () => dispatch(toggleAuthMode()),
    submit,
    launchDemo,
    updateLoginField: (field, value) =>
      dispatch(updateLoginField({ field, value })),
    updateSignupField: (field, value) =>
      dispatch(updateSignupField({ field, value })),
    clearError: () => dispatch(clearAuthError()),
  };
}