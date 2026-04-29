import { createSlice } from '@reduxjs/toolkit';

import { initialPostedJobs } from '../data/dashboardData';

const initialState = {
  language: 'en',
  selectedRole: null,
  postedJobs: initialPostedJobs,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    selectRole: (state, action) => {
      state.selectedRole = action.payload;
    },
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
    addPostedJob: (state, action) => {
      state.postedJobs = [action.payload, ...state.postedJobs];
    },
    resetAppFlow: (state) => {
      state.selectedRole = null;
    },
  },
});

export const {
  addPostedJob,
  clearSelectedRole,
  resetAppFlow,
  selectRole,
  setLanguage,
} = appSlice.actions;

export default appSlice.reducer;
