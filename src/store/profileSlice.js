import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  addSkill as addSkillRequest,
  deleteSkill as deleteSkillRequest,
  getProfile,
  updateProfile as updateProfileRequest,
  updateSkill as updateSkillRequest,
} from '../services/profileService';
import { logout, updateSessionUser } from './authSlice';

const createRoleState = () => ({
  data: null,
  status: 'idle',
  updateStatus: 'idle',
  skillStatus: 'idle',
  error: null,
  skillError: null,
});

const initialState = {
  customer: createRoleState(),
  labour: createRoleState(),
};

const getSession = (state) => state.auth.session;

const getRoleAndToken = (state, requestedRole) => {
  const session = getSession(state);

  if (!session?.role || !session?.token) {
    throw new Error('Please login first.');
  }

  if (requestedRole && session.role !== requestedRole) {
    throw new Error('Invalid profile access.');
  }

  return {
    role: session.role,
    token: session.token,
  };
};

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (role, { dispatch, getState, rejectWithValue }) => {
    try {
      const { role: activeRole, token } = getRoleAndToken(getState(), role);
      const profile = await getProfile(activeRole, token);

      dispatch(updateSessionUser(profile));

      return { role: activeRole, profile };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch profile.');
    }
  }
);

export const saveProfile = createAsyncThunk(
  'profile/saveProfile',
  async (payload, { dispatch, getState, rejectWithValue }) => {
    try {
      const { role, token } = getRoleAndToken(getState(), payload.role);
      const profile = await updateProfileRequest(role, token, payload);

      dispatch(updateSessionUser(profile));

      return { role, profile };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update profile.');
    }
  }
);

export const createSkill = createAsyncThunk(
  'profile/createSkill',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { role, token } = getRoleAndToken(getState());

      if (role !== 'labour') {
        throw new Error('Skills can only be managed for labour accounts.');
      }

      const skill = await addSkillRequest(token, payload);
      return skill;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add skill.');
    }
  }
);

export const editSkill = createAsyncThunk(
  'profile/editSkill',
  async ({ skillId, ...payload }, { getState, rejectWithValue }) => {
    try {
      const { role, token } = getRoleAndToken(getState());

      if (role !== 'labour') {
        throw new Error('Skills can only be managed for labour accounts.');
      }

      const skill = await updateSkillRequest(token, skillId, payload);
      return skill;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update skill.');
    }
  }
);

export const removeSkill = createAsyncThunk(
  'profile/removeSkill',
  async (skillId, { getState, rejectWithValue }) => {
    try {
      const { role, token } = getRoleAndToken(getState());

      if (role !== 'labour') {
        throw new Error('Skills can only be managed for labour accounts.');
      }

      await deleteSkillRequest(token, skillId);
      return skillId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete skill.');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state, action) => {
      const role = action.payload;

      if (!role || !state[role]) {
        return;
      }

      state[role].error = null;
      state[role].skillError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state, action) => {
        const role = action.meta.arg;
        state[role].status = 'loading';
        state[role].error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        const { role, profile } = action.payload;
        state[role].status = 'succeeded';
        state[role].data = profile;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        const role = action.meta.arg;
        state[role].status = 'failed';
        state[role].error = action.payload || action.error.message || 'Failed to fetch profile.';
      })
      .addCase(saveProfile.pending, (state, action) => {
        const role = action.meta.arg.role;
        state[role].updateStatus = 'loading';
        state[role].error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        const { role, profile } = action.payload;
        state[role].updateStatus = 'succeeded';
        state[role].data = {
          ...(state[role].data || {}),
          ...profile,
        };
      })
      .addCase(saveProfile.rejected, (state, action) => {
        const role = action.meta.arg.role;
        state[role].updateStatus = 'failed';
        state[role].error = action.payload || action.error.message || 'Failed to update profile.';
      })
      .addCase(createSkill.pending, (state) => {
        state.labour.skillStatus = 'loading';
        state.labour.skillError = null;
      })
      .addCase(createSkill.fulfilled, (state, action) => {
        state.labour.skillStatus = 'succeeded';
        const currentSkills = state.labour.data?.skills || [];
        state.labour.data = {
          ...(state.labour.data || {}),
          skills: [...currentSkills, action.payload],
        };
      })
      .addCase(createSkill.rejected, (state, action) => {
        state.labour.skillStatus = 'failed';
        state.labour.skillError = action.payload || action.error.message || 'Failed to add skill.';
      })
      .addCase(editSkill.pending, (state) => {
        state.labour.skillStatus = 'loading';
        state.labour.skillError = null;
      })
      .addCase(editSkill.fulfilled, (state, action) => {
        state.labour.skillStatus = 'succeeded';
        const currentSkills = state.labour.data?.skills || [];
        state.labour.data = {
          ...(state.labour.data || {}),
          skills: currentSkills.map((skill) =>
            skill._id === action.payload._id ? action.payload : skill
          ),
        };
      })
      .addCase(editSkill.rejected, (state, action) => {
        state.labour.skillStatus = 'failed';
        state.labour.skillError = action.payload || action.error.message || 'Failed to update skill.';
      })
      .addCase(removeSkill.pending, (state) => {
        state.labour.skillStatus = 'loading';
        state.labour.skillError = null;
      })
      .addCase(removeSkill.fulfilled, (state, action) => {
        state.labour.skillStatus = 'succeeded';
        const currentSkills = state.labour.data?.skills || [];
        state.labour.data = {
          ...(state.labour.data || {}),
          skills: currentSkills.filter((skill) => skill._id !== action.payload),
        };
      })
      .addCase(removeSkill.rejected, (state, action) => {
        state.labour.skillStatus = 'failed';
        state.labour.skillError = action.payload || action.error.message || 'Failed to delete skill.';
      })
      .addCase(logout, () => initialState);
  },
});

export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
