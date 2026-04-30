import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { login, signup } from '../services/authService';

const createInitialLoginForm = () => ({
  mobile: '',
});

const createInitialSignupForm = () => ({
  name: '',
  mobile: '',
  address: '',
  bio: '',
  profileImage: '',
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
  const responseUser = response.user || response || {};
  const fallbackMobile = authMode === 'login' ? loginForm.mobile : signupForm.mobile;

  return {
    ...responseUser,
    _id: responseUser._id || response._id,
    id: responseUser._id || responseUser.id || response._id,
    name: responseUser.name || response.name || signupForm.name || 'User',
    mobile:
      responseUser.mobile ||
      responseUser.phone ||
      response.mobile ||
      fallbackMobile ||
      'Not provided',
    address:
      responseUser.address ||
      response.address ||
      signupForm.address ||
      'Not provided',
    bio: responseUser.bio || response.bio || signupForm.bio || '',
    profileImage:
      responseUser.profileImage ||
      response.profileImage ||
      signupForm.profileImage ||
      '',
  };
};

export const submitAuth = createAsyncThunk(
  'auth/submitAuth',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const activeRole = auth.role;
      const activeRoleState = auth.roleAuth[activeRole];

      let response;

      if (auth.authMode === 'login') {
        response = await login(activeRole, activeRoleState.loginForm);
      } else {
        const createdUser = await signup(activeRole, activeRoleState.signupForm);
        const loginResponse = await login(activeRole, {
          mobile: activeRoleState.signupForm.mobile,
        });

        response = {
          ...loginResponse,
          user: {
            ...loginResponse.user,
            ...createdUser,
          },
        };
      }

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

    setError: (state, action) => {
      state.roleAuth[state.role].error = action.payload;
    },

    authenticateDemo: (state) => {
      state.session = {
        token: 'demo-session',
        user: {
          id: 'demo-user',
          name: state.role === 'labour' ? 'Rajan Kumar' : 'Amit Sharma',
          phone: state.role === 'labour' ? '9262980734' : '9123456789',
          mobile: state.role === 'labour' ? '9262980734' : '9123456789',
          address: 'Demo Address',
          bio: '',
          profileImage: '',
        },
        role: state.role,
      };
      state.roleAuth[state.role].error = null;
    },

    updateSessionUser: (state, action) => {
      if (!state.session) {
        return;
      }

      state.session.user = {
        ...state.session.user,
        ...action.payload,
        id: action.payload._id || action.payload.id || state.session.user.id,
        phone:
          action.payload.mobile ||
          action.payload.phone ||
          state.session.user.phone,
      };
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
          user: {
            ...action.payload.user,
            phone: action.payload.user.mobile || action.payload.user.phone,
          },
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
  setError,
  toggleAuthMode,
  updateLoginField,
  updateSessionUser,
  updateSignupField,
} = authSlice.actions;

export default authSlice.reducer;
