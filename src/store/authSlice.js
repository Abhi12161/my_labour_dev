import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { login, signup } from '../services/authService';

const createInitialLoginForm = () => ({
  phone: '',
});

const createInitialSignupForm = () => ({
  name: '',
  phone: '',
  address: '',
});

const createRoleAuthState = () => ({
  loginForm: createInitialLoginForm(),
  signupForm: createInitialSignupForm(),
  loading: false,
  error: null,
});

const initialState = {
  session: null,
  authMode: 'login',
  role: 'customer',
  roleAuth: {
    customer: createRoleAuthState(),
    labour: createRoleAuthState(),
  },
};

const normalizeUser = ({ authMode, response, loginForm, signupForm }) => {
  const responseUser = response.user || {};

  if (authMode === 'login') {
    return {
      ...responseUser,
      name: responseUser.name || response.name || 'User',
      phone:
        responseUser.phone ||
        responseUser.mobile ||
        response.mobile ||
        loginForm.phone ||
        'Not provided',
      address: responseUser.address || response.address || 'Not provided',
    };
  }

  return {
    ...responseUser,
    name: responseUser.name || signupForm.name,
    phone: responseUser.phone || responseUser.mobile || signupForm.phone,
    address: responseUser.address || signupForm.address,
  };
};

export const submitAuth = createAsyncThunk(
  'auth/submitAuth',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const activeRole = auth.role;
      const activeRoleState = auth.roleAuth[activeRole];

      const response =
        auth.authMode === 'login'
          ? await login(activeRole, activeRoleState.loginForm)
          : await signup(activeRole, activeRoleState.signupForm);

      return {
        token: response.token || '',
        user: normalizeUser({
          authMode: auth.authMode,
          response,
          loginForm: activeRoleState.loginForm,
          signupForm: activeRoleState.signupForm,
        }),
        role: response.user?.role || response.role || activeRole,
        activeRole,
      };
    } catch (error) {
      return rejectWithValue(
        error.message || 'Authentication failed.'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthMode: (state, action) => {
      state.authMode = action.payload;
      state.roleAuth[state.role].error = null;
    },

    toggleAuthMode: (state) => {
      state.authMode = state.authMode === 'login' ? 'signup' : 'login';
      state.roleAuth[state.role].error = null;
    },

    setRole: (state, action) => {
      state.role = action.payload;
    },

    updateLoginField: (state, action) => {
      const { field, value } = action.payload;
      state.roleAuth[state.role].loginForm[field] = value;
    },

    updateSignupField: (state, action) => {
      const { field, value } = action.payload;
      state.roleAuth[state.role].signupForm[field] = value;
    },

    // 🔥 NEW: Custom error set करने के लिए
    setError: (state, action) => {
      state.roleAuth[state.role].error = action.payload;
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
      state.roleAuth[state.role].error = null;
    },

    logout: (state) => {
      state.session = null;
      state.role = 'customer';
      state.authMode = 'login';
      state.roleAuth = {
        customer: createRoleAuthState(),
        labour: createRoleAuthState(),
      };
    },

    clearAuthError: (state) => {
      state.roleAuth[state.role].error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(submitAuth.pending, (state) => {
        state.roleAuth[state.role].loading = true;
        state.roleAuth[state.role].error = null;
      })

      .addCase(submitAuth.fulfilled, (state, action) => {
        const completedRole = action.payload.activeRole;

        state.roleAuth[completedRole].loading = false;
        state.roleAuth[completedRole].loginForm = createInitialLoginForm();
        state.roleAuth[completedRole].signupForm = createInitialSignupForm();

        state.session = {
          token: action.payload.token,
          user: action.payload.user,
          role: action.payload.role,
        };
      })

      .addCase(submitAuth.rejected, (state, action) => {
        state.roleAuth[state.role].loading = false;

        state.roleAuth[state.role].error =
          action.payload ||
          action.error.message ||
          'Authentication failed.';
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
  setError, // 👈 IMPORTANT
} = authSlice.actions;

export default authSlice.reducer;