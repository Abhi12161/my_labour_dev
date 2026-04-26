import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

export function LabourCard({ copy, labour }) {
  const scale = useRef(new Animated.Value(1)).current;
const onPressIn = () => {
  Animated.spring(scale, {
    toValue: 0.92, // 👈 zyada shrink
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

        {/* TOP */}
        <View style={styles.topRow}>
          
          <View style={styles.left}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{labour.photoLabel}</Text>
              </View>

              {/* ONLINE DOT */}
              <View style={styles.onlineDot} />
            </View>

            <View>
              <Text style={styles.name}>{labour.name}</Text>
              <Text style={styles.skill}>{labour.primarySkill}</Text>
              <Text style={styles.rating}>
                ⭐ {labour.rating} ({labour.reviews})
              </Text>
            </View>
          </View>

          {/* RIGHT */}
          <View style={styles.right}>
            <Text style={styles.distance}>📍 {labour.distance}</Text>
            <Text style={styles.available}>{labour.availability}</Text>
          </View>
        </View>

        {/* LOCATION */}
        <Text style={styles.location}>{labour.location}</Text>

        {/* SKILLS */}
        <View style={styles.skills}>
          {labour.skills.slice(0, 3).map((s) => (
            <View key={s} style={styles.chip}>
              <Text style={styles.chipText}>{s}</Text>
            </View>
          ))}
        </View>

        {/* BUTTON WITH ANIMATION */}
        <Animated.View style={{ transform: [{ scale }] }}>
          <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
            <LinearGradient
              colors={['#1f7a63', '#2ecc71']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{copy.hireNow}</Text>
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
  padding: 2.5, // 👈 IMPORTANT (increase this)
},

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  left: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  avatarWrapper: {
    position: 'relative',
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

  name: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
  },

  skill: {
    fontSize: 12,
    color: '#1f7a63',
    fontWeight: '600',
  },

  rating: {
    fontSize: 11,
    color: '#666',
  },

  right: {
    alignItems: 'flex-end',
    gap: 4,
  },

  distance: {
    fontSize: 11,
    color: '#444',
  },

  available: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '700',
  },

  location: {
    fontSize: 12,
    color: '#666',
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
  marginTop: 6,
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
});