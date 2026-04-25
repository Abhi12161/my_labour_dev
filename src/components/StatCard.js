import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { radius } from '../theme/tokens';

export function StatCard({
  label,
  value,
  icon = 'stats-chart',
  trend = 'up',
  gradient = ['#667eea', '#764ba2'],
  onPress,
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    animatedValue.setValue(0); // ✅ reset animation

    Animated.timing(animatedValue, {
      toValue: Number(value) || 0,
      duration: 800,
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(
        Number.isInteger(Number(value))
          ? Math.floor(value)
          : Number(value).toFixed(1)
      );
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value]);

  const isUp = trend === 'up';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, width: '31%' }]} // ✅ width yaha shift
    >
      <LinearGradient colors={gradient} style={styles.card}>
        
        {/* Glass effect */}
        <BlurView intensity={25} tint="light" style={styles.blurOverlay} />

        {/* Top row */}
        <View style={styles.topRow}>
          <Ionicons name={icon} size={18} color="#fff" />

          <View style={styles.trend}>
            <Ionicons
              name={isUp ? 'arrow-up' : 'arrow-down'}
              size={12}
              color={isUp ? '#4ade80' : '#f87171'}
            />
          </View>
        </View>

        {/* Value */}
        <Text style={styles.value}>{displayValue}</Text>

        {/* Label */}
        <Text numberOfLines={1} style={styles.label}>
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: 12,
    minHeight: 110, // ✅ IMPORTANT: label cut nahi hoga
    overflow: 'hidden',

    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
    opacity: 0.25, // ✅ fade fix
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  trend: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 4,
    borderRadius: 999,
  },

  value: {
    color: '#fff',
    fontSize: 22, // thoda reduce → space bachega
    fontWeight: '800',
    marginTop: 8,
  },

  label: {
    color: '#fff',
    opacity: 0.95,
    fontSize: 12,
    marginTop: 2,
  },
});