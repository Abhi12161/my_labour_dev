import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as Location from 'expo-location';

export const fetchLocation = createAsyncThunk(
  'location/fetchLocation',
  async (_, { rejectWithValue }) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        throw new Error('Permission denied');
      }

      const loc = await Location.getCurrentPositionAsync({});

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.coords.latitude}&lon=${loc.coords.longitude}`
      );

      const data = await response.json();

      const city =
        data?.address?.city ||
        data?.address?.town ||
        data?.address?.village ||
        data?.address?.state ||
        null;

      return {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        name: data.display_name || city || 'Unknown location',
        fullData: data,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Error fetching location');
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    status: 'idle',
    coords: null,
    name: '',
    fullData: null,
    error: null,
  },
  reducers: {
    clearLocation: (state) => {
      state.status = 'idle';
      state.coords = null;
      state.name = '';
      state.fullData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocation.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLocation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.coords = {
          latitude: action.payload.latitude,
          longitude: action.payload.longitude,
        };
        state.name = action.payload.name;
        state.fullData = action.payload.fullData;
      })
      .addCase(fetchLocation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearLocation } = locationSlice.actions;
export default locationSlice.reducer;