import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { copy } from '../constants/copy';
import { colors } from '../theme/tokens';

export function RoleSelectionScreen({ language, onChangeLanguage, onSelectRole }) {
  const text = copy[language];

  const [locationName, setLocationName] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');

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
  }, []);

  const getLocation = async () => {
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
      setLocationName(data.display_name || 'Unknown location');

    } catch (e) {
      console.log(e);
      setLocationName('Error fetching location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const openMap = () => {
    if (!latitude || !longitude) return;
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  useEffect(() => {
    getLocation();
  }, []);

  const roles = [
    {
      key: 'customer',
      title: text.needWorkers || 'I need workers',
      description: 'Post your work and connect with nearby workers.',
      cta: 'Start Hiring',
      icon: '👤',
      gradient: ['#667eea', '#764ba2'],
    },
    {
      key: 'labour',
      title: text.offerServices || 'I offer services',
      description: 'Create profile and get work from customers.',
      cta: 'Start Working',
      icon: '🔧',
      gradient: ['#ff7e5f', '#feb47b'],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>💼</Text>
          <Text style={styles.appName}>Muzaffarpur Labor Hub</Text>

          <LanguageSwitcher
            selected={language}
            onChange={onChangeLanguage}
          />
        </View>

        {/* Location Card */}
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
            <Text style={styles.locationTitle}>Live Location</Text>

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

        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.headline}>
            Find trusted workers near you
          </Text>
          <Text style={styles.subheadline}>
            Connect with skilled labour in your city quickly
          </Text>
        </View>

        {/* Roles */}
        <View style={styles.rolesGrid}>
          {roles.map((role) => (
            <Pressable
              key={role.key}
              onPress={() => onSelectRole(role.key)}
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.96 : 1 }] }
              ]}
            >
              <LinearGradient
                colors={role.gradient}
                style={styles.roleCard}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>{role.icon}</Text>
                </View>

                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleDescription}>{role.description}</Text>

                {/* Gradient Button */}
                <LinearGradient
                  colors={['#ffffff', '#f1f5f9']}
                  style={styles.ctaButton}
                >
                  <Text style={styles.ctaText}>{role.cta}</Text>
                </LinearGradient>

              </LinearGradient>
            </Pressable>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },

  logo: {
    fontSize: 42,
  },

  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },

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

  heroSection: {
    marginBottom: 24,
  },

  headline: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },

  subheadline: {
    textAlign: 'center',
    color: '#777',
  },

  rolesGrid: {
    gap: 16,
  },

  roleCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  iconContainer: {
    width: 55,
    height: 55,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    fontSize: 24,
  },

  roleTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },

  roleDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 4,
  },

  ctaButton: {
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  ctaText: {
    fontWeight: '800',
    color: '#111',
  },
});