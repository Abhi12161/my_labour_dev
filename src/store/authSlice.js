import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { login, signup } from '../services/authService';

const initialLoginForm = {
  phone: '',
};

const initialSignupForm = {
  name: '',
  phone: '',
  address: '',
};

const createInitialLoginForm = () => ({ ...initialLoginForm });
const createInitialSignupForm = () => ({ ...initialSignupForm });

const initialState = {
  session: null,
  authMode: 'login',
  role: 'customer',
  loginForm: createInitialLoginForm(),
  signupForm: createInitialSignupForm(),
  loading: false,
  error: null,
};

const buildSession = ({ authMode, role, response, loginForm, signupForm }) => {
  const responseUser = response.user || {};
  const fallbackUser =
    authMode === 'login'
      ? {
          name: responseUser.name || response.name || 'User',
          phone: responseUser.phone || responseUser.mobile || response.mobile || loginForm.phone || 'Not provided',
          address: responseUser.address || response.address || 'Not provided',
        }
      : {
          name: responseUser.name || signupForm.name,
          phone: responseUser.phone || responseUser.mobile || signupForm.phone,
          address: responseUser.address || signupForm.address,
        };

  return {
    token: response.token || '',
    user: {
      ...fallbackUser,
      ...responseUser,
      phone: fallbackUser.phone,
    },
    role: responseUser.role || response.role || role,
  };
};

export const submitAuth = createAsyncThunk(
  'auth/submitAuth',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response =
        auth.authMode === 'login'
          ? await login(auth.loginForm)
          : await signup(auth.signupForm);

      return buildSession({
        authMode: auth.authMode,
        role: auth.role,
        response,
        loginForm: auth.loginForm,
        signupForm: auth.signupForm,
      });
    } catch (error) {
      return rejectWithValue(error.message || 'Authentication failed.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthMode: (state, action) => {
      state.authMode = action.payload;
      state.error = null;
    },
    toggleAuthMode: (state) => {
      state.authMode = state.authMode === 'login' ? 'signup' : 'login';
      state.error = null;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    updateLoginField: (state, action) => {
      const { field, value } = action.payload;
      state.loginForm[field] = value;
    },
    updateSignupField: (state, action) => {
      const { field, value } = action.payload;
      state.signupForm[field] = value;
    },
    authenticateDemo: (state) => {
      state.session = {
        token: 'demo-session',
        user: {
          name: 'Rajan Kumar',
          phone: '9262980734',
          address: 'Demo Address',
        },
        role: state.role,
      };
      state.error = null;
    },
    logout: (state) => {
      state.session = null;
      state.role = 'customer';
      state.authMode = 'login';
      state.loginForm = createInitialLoginForm();
      state.signupForm = createInitialSignupForm();
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload;
        state.loginForm = createInitialLoginForm();
        state.signupForm = createInitialSignupForm();
      })
      .addCase(submitAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Authentication failed.';
      });
  },
});

export const {
  authenticateDemo,
  clearAuthError,
  logout,
  setAuthMode,
  setRole,
  toggleAuthMode,
  updateLoginField,
  updateSignupField,
} = authSlice.actions;

export default authSlice.reducer;
