import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as Location from 'expo-location';

/**
 * 📍 FETCH LOCATION (IMPROVED)
 */
export const fetchLocation = createAsyncThunk(
  'location/fetchLocation',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📍 Requesting permission...');

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission denied');
      }

      console.log('📍 Getting coordinates...');

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const { latitude, longitude } = loc.coords;

      console.log('📍 Coordinates:', latitude, longitude);

      let address = [];
      try {
        address = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
      } catch (err) {
        console.log('❌ Reverse geocode failed:', err);
      }

      const place = address?.[0];

      console.log('📍 Place:', place);
      console.log('🧾 PLACE OBJECT FULL:', JSON.stringify(place, null, 2));

      // ✅ STRUCTURED DATA
      const locationData = {
        latitude,
        longitude,

        name: place
          ? `${place.name || ''} ${place.street || ''} ${
              place.city || place.region || ''
            }`
          : 'Unknown location',

        city:
          place?.city ||
          place?.district ||
          place?.subregion ||
          place?.region ||
          null,

        state: place?.region || null,
        country: place?.country || null,
        postalCode: place?.postalCode || null,

        fullData: place || null,
      };

      console.log('✅ Final Location Object:', locationData);

      return locationData;
    } catch (error) {
      console.log('🔥 ERROR:', error);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 📡 LIVE TRACKING (IMPROVED)
 */
export const startLocationTracking = createAsyncThunk(
  'location/startTracking',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission denied');
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        async (location) => {
          const { latitude, longitude } = location.coords;

          let address = [];
          try {
            address = await Location.reverseGeocodeAsync({
              latitude,
              longitude,
            });
          } catch {}

          const place = address?.[0];

          const liveData = {
            latitude,
            longitude,

            name: place
              ? `${place.name || ''} ${place.street || ''} ${
                  place.city || ''
                }`
              : 'Tracking...',

            city:
              place?.city ||
              place?.district ||
              place?.region ||
              null,

            state: place?.region || null,
            country: place?.country || null,

            fullData: place || null,
          };

          console.log('📡 Live Data:', liveData);

          dispatch(updateLiveLocation(liveData));
        }
      );

      return subscription;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * 📦 SLICE
 */
const locationSlice = createSlice({
  name: 'location',
  initialState: {
    status: 'idle',
    coords: null,

    name: '',
    city: null,
    state: null,
    country: null,
    postalCode: null,

    fullData: null,
    error: null,

    tracking: false,
    subscription: null,
  },

  reducers: {
    updateLiveLocation: (state, action) => {
      state.coords = {
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
      };

      state.name = action.payload.name;
      state.city = action.payload.city;
      state.state = action.payload.state;
      state.country = action.payload.country;
      state.fullData = action.payload.fullData;
    },

    stopTracking: (state) => {
      if (state.subscription) {
        state.subscription.remove();
      }

      state.tracking = false;
      state.subscription = null;
    },

    clearLocation: (state) => {
      state.status = 'idle';
      state.coords = null;

      state.name = '';
      state.city = null;
      state.state = null;
      state.country = null;

      state.fullData = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchLocation.pending, (state) => {
        state.status = 'loading';
      })

      .addCase(fetchLocation.fulfilled, (state, action) => {
        state.status = 'succeeded';

        state.coords = {
          latitude: action.payload.latitude,
          longitude: action.payload.longitude,
        };

        state.name = action.payload.name;
        state.city = action.payload.city;
        state.state = action.payload.state;
        state.country = action.payload.country;
        state.postalCode = action.payload.postalCode;

        state.fullData = action.payload.fullData;
      })

      .addCase(fetchLocation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(startLocationTracking.fulfilled, (state, action) => {
        state.tracking = true;
        state.subscription = action.payload;
      });
  },
});

export const { clearLocation, updateLiveLocation, stopTracking } =
  locationSlice.actions;

export default locationSlice.reducer;