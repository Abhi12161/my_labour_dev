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
  compact = false,
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    animatedValue.setValue(0);

    Animated.timing(animatedValue, {
      toValue: Number(value) || 0,
      duration: 800,
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value: animated }) => {
      setDisplayValue(
        Number.isInteger(Number(animated))
          ? Math.floor(animated)
          : Number(animated).toFixed(1)
      );
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [animatedValue, value]);

  const isUp = trend === 'up';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.9 : 1,
          width: compact ? '23.5%' : '31%',
        },
      ]}
    >
      <LinearGradient colors={gradient} style={[styles.card, compact && styles.cardCompact]}>
        <BlurView intensity={25} tint="light" style={styles.blurOverlay} />

        <View style={styles.topRow}>
          <Ionicons name={icon} size={compact ? 13 : 18} color="#fff" />

          <View style={[styles.trend, compact && styles.trendCompact]}>
            <Ionicons
              name={isUp ? 'arrow-up' : 'arrow-down'}
              size={compact ? 8 : 12}
              color={isUp ? '#4ade80' : '#f87171'}
            />
          </View>
        </View>

        <Text style={[styles.value, compact && styles.valueCompact]}>{displayValue}</Text>

        <Text numberOfLines={2} style={[styles.label, compact && styles.labelCompact]}>
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
    minHeight: 110,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  cardCompact: {
    minHeight: 82,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
    opacity: 0.25,
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
  trendCompact: {
    padding: 3,
  },
  value: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
  },
  valueCompact: {
    fontSize: 22,
    marginTop: 6,
    lineHeight: 24,
  },
  label: {
    color: '#fff',
    opacity: 0.95,
    fontSize: 12,
    marginTop: 2,
  },
  labelCompact: {
    fontSize: 9.5,
    lineHeight: 11,
    marginTop: 2,
  },
});
