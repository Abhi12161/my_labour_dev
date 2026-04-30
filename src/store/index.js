import { configureStore } from '@reduxjs/toolkit';
import appReducer from './appSlice';
import authReducer from './authSlice';
import locationReducer from './locationSlice';
import profileReducer from './profileSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    location: locationReducer,
    profile: profileReducer,
  },
});
