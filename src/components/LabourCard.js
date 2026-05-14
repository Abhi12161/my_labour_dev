import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export function LabourCard({
  copy,
  labour,
  actionLabel,
  onActionPress,
  disabled = false,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 30,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <LinearGradient
      colors={['#1f7a63', '#2ecc71']}
      style={styles.outer}
    >
      <View style={styles.card}>

        {/* TOP ROW — avatar + info column */}
        <View style={styles.topRow}>

          {/* AVATAR */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {labour.photoLabel}
              </Text>
            </View>
            <View style={styles.onlineDot} />
          </View>

          {/* INFO COLUMN */}
          <View style={styles.infoColumn}>

            {/* 1. NAME */}
            <Text style={styles.name} numberOfLines={1}>
              {labour.name}
            </Text>

            {/* 2. LOCATION */}
            <View style={styles.locationRow}>
              <Text style={styles.locationPin}>📍</Text>
              <Text style={styles.locationText}>
                {labour.location}
              </Text>
            </View>

            {/* 3. PRIMARY SKILL */}
            <Text style={styles.primarySkill}>
              {labour.primarySkill}
            </Text>

            {/* 4. RATING */}
            <Text style={styles.rating}>
              ⭐ {labour.rating} ({labour.reviews} reviews)
            </Text>

            {/* 5. AVAILABLE + DISTANCE */}
            <View style={styles.metaRow}>
              <Text style={styles.available}>
                ● {labour.availability}
              </Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.distance}>
                🧭 {labour.distance}
              </Text>
            </View>

          </View>

        </View>

        {/* SKILLS CHIPS */}
        <View style={styles.skills}>
          {labour.skills.slice(0, 3).map((s) => (
            <View key={s} style={styles.chip}>
              <Text style={styles.chipText}>{s}</Text>
            </View>
          ))}
        </View>

        {/* BUTTON */}
        <Animated.View style={{ transform: [{ scale }] }}>
          <Pressable
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onActionPress}
            disabled={disabled || !onActionPress}
          >
            <LinearGradient
              colors={
                disabled
                  ? ['#8ba69d', '#7b8f88']
                  : ['#1f7a63', '#2ecc71']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.button,
                disabled && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.buttonText}>
                {actionLabel || copy?.hireNow || 'Hire Now'}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 18,
    padding: 2.5,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  avatarWrapper: {
    position: 'relative',
    flexShrink: 0,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#1f7a63',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },

  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff',
  },

  infoColumn: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },

  name: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  locationPin: {
    fontSize: 11,
  },

  locationText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },

  primarySkill: {
    fontSize: 12,
    color: '#1f7a63',
    fontWeight: '600',
  },

  rating: {
    fontSize: 11,
    color: '#666',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },

  available: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '700',
  },

  metaDot: {
    fontSize: 11,
    color: '#bbb',
  },

  distance: {
    fontSize: 11,
    color: '#555',
    fontWeight: '500',
  },

  skills: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },

  chip: {
    backgroundColor: '#f1f5f4',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },

  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },

  button: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#1f7a63',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },

  buttonDisabled: {
    opacity: 0.85,
  },
});