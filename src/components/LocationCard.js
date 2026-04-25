import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export function LocationCard({ text }) {
  const [locationName, setLocationName] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // no global context — local state only

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

  const openMap = () => {
    if (!latitude || !longitude) return;
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  useEffect(() => {
    const doGetLocation = async () => {
      try {
        setLoadingLocation(true);

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationName('Permission denied');
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        setLatitude(loc.coords.latitude);
        setLongitude(loc.coords.longitude);

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.coords.latitude}&lon=${loc.coords.longitude}`
        );

        const data = await response.json();

        // Prefer more granular city-like fields over the long display_name
        const city =
          data?.address?.city ||
          data?.address?.town ||
          data?.address?.village ||
          data?.address?.state ||
          null;

        setLocationName(data.display_name || city || 'Unknown location');

        // local-only: we keep the resolved name in component state

      } catch (e) {
        console.log(e);
        setLocationName('Error fetching location');
      } finally {
        setLoadingLocation(false);
      }
    };

    doGetLocation();
  }, []);

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
        <Text style={styles.locationTitle}>{text?.liveLocation || 'Live Location'}</Text>

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
