import { StyleSheet, Text, View } from 'react-native';

export function JobCard({ job, actionLabel, onActionPress }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {job.title}
          </Text>

          <View style={styles.distancePill}>
            <Text style={styles.distanceText}>{job.distance}</Text>
          </View>
        </View>

        {/* LOCATION */}
        <Text style={styles.location}>📍 {job.location}</Text>

        {/* META ROW */}
        <View style={styles.metaRow}>
          <Text style={styles.meta}>🛠 {job.skill}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>👥 {job.applicants}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>⏱ {job.posted}</Text>
        </View>

        {/* DESCRIPTION */}
        {job.description && (
          <Text style={styles.desc} numberOfLines={2}>
            {job.description}
          </Text>
        )}

        {/* CTA */}
        {/* <Pressable onPress={onActionPress}>
          <LinearGradient
            colors={['#1f7a63', '#166534']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </LinearGradient>
        </Pressable> */}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    paddingHorizontal: 14,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    gap: 10,

    borderWidth: 1,
    borderColor: '#eef2f1',

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  distancePill: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  distanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065f46',
  },

  location: {
    fontSize: 12,
    color: '#6b7280',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },

  meta: {
    fontSize: 12,
    color: '#4b5563',
  },

  dot: {
    fontSize: 12,
    color: '#9ca3af',
  },

  desc: {
    fontSize: 12,
    color: '#374151',
  },

  button: {
    marginTop: 6,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',

    shadowColor: '#1f7a63',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});