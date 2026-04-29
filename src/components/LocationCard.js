import { BlurView } from 'expo-blur';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLocation } from '../store/locationSlice';

export function LocationCard({ text }) {
  const dispatch = useDispatch();

  const { status, coords, name, error } = useSelector(
    (state) => state.location
  );

  const latitude = coords?.latitude;
  const longitude = coords?.longitude;

  const locationName = error ? error : name;
  const loadingLocation = status === 'loading';

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // ✅ location fetch
  useEffect(() => {
    dispatch(fetchLocation());
  }, [dispatch]);

  // ✅ dynamic map
  const openMap = () => {
    if (!latitude || !longitude) return;

    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  return (
    <BlurView intensity={70} tint="light" style={styles.glassCard}>
      <View style={styles.leftSection}>
        <Animated.Text
          style={[
            styles.locationIcon,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          📍
        </Animated.Text>
        <View style={styles.liveDot} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.locationTitle}>
          {text?.liveLocation || 'Live Location'}
        </Text>

        {loadingLocation ? (
          <ActivityIndicator size="small" color="#4f46e5" />
        ) : (
          <Text style={styles.locationText} numberOfLines={1}>
            {locationName}
          </Text>
        )}
      </View>

      <Pressable onPress={openMap} style={styles.mapButton}>
        <Text style={styles.mapIcon}>🗺️</Text>
      </Pressable>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },

  leftSection: {
    alignItems: 'center',
    marginRight: 12,
  },

  locationIcon: {
    fontSize: 22,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginTop: 4,
  },

  locationTitle: {
    fontSize: 11,
    color: '#6b7280',
  },

  locationText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  mapButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
  },

  mapIcon: {
    fontSize: 16,
    color: '#fff',
  },
});
