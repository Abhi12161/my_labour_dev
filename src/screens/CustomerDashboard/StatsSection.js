// sections/StatsSection.js
// Section 3: Overview stats grid + Post Job bar + Popular Skills
// Data: customerOverviewStats, popularSkills (from dashboardData)
// Actions: onPostJob (opens modal)

import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatCard } from '../../components/StatCard';
import { customerOverviewStats, popularSkills } from '../../data/dashboardData';
import { styles } from '../styles';

// ─── Section-specific static data ─────────────────────────────────────────────

/**
 * Visual style config per stat id.
 * Keeps icon, gradient, and trend direction co-located with this section.
 */
export const STAT_STYLES = {
  labours:   { icon: 'people',          gradient: ['#ff8d63', '#ffb25e'], trend: 'up'   },
  jobs:      { icon: 'people',          gradient: ['#3ecf97', '#2563eb'], trend: 'down' },
  rating:    { icon: 'people',          gradient: ['#6366f1', '#8b5cf6'], trend: 'up'   },
  hires:     { icon: 'people',          gradient: ['#f59e0b', '#fbbf24'], trend: 'down' },
  completed: { icon: 'checkmark-done',  gradient: ['#22c1ff', '#2563eb'], trend: 'up'   },
  pending:   { icon: 'time',            gradient: ['#ec4899', '#ff5f6d'], trend: 'down' },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * StatsSection
 * Renders stat grid, the "Post a Job" shortcut bar, and the popular skills row.
 *
 * Props:
 *   text        {object}   - i18n copy object
 *   onOpenModal {function} - called when user taps the Post Job bar
 */
export function StatsSection({ text, onOpenModal }) {
  return (
    <>
      {/* ── Stats grid ── */}
      <View style={styles.statsGrid}>
        {customerOverviewStats.map((item) => (
          <StatCard
            key={item.id}
            label={text[item.labelKey]}
            value={item.value}
            icon={STAT_STYLES[item.id]?.icon}
            trend={STAT_STYLES[item.id]?.trend}
            gradient={STAT_STYLES[item.id]?.gradient}
            onPress={() => {}}
            compact
          />
        ))}
      </View>

      {/* ── Post Job shortcut bar ── */}
      <Pressable style={styles.postJobBar} onPress={onOpenModal}>
        <View>
          <Text style={styles.postJobLabel}>{text.postJobTitle}</Text>
          <Text style={styles.postJobBody}>{text.descriptionPlaceholder}</Text>
        </View>
        <Text style={styles.postJobAction}>{text.postJobOpen}</Text>
      </Pressable>

      {/* ── Popular Skills ── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Ionicons name="medal-outline" size={13} color="#0c5a49" />
            <Text style={styles.sectionTitle}>{text.popularSkillsTitle}</Text>
          </View>
        </View>

        <View style={styles.skillRowGradient}>
          {popularSkills.map((skill) => (
            <View key={skill} style={styles.skillChipGradient}>
              <Text style={styles.skillTextGradient}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}
