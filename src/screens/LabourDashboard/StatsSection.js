// sections/StatsSection.js
// Section 2: Overview stat cards + "Mark Available / Today's Work" card
// Data: labourOverviewStats (static), availabilityRequest (dynamic)
// Actions: onTodayWork

import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import { StatCard } from '../../components/StatCard';
import { labourOverviewStats } from '../../data/dashboardData';
import { styles } from '../styles';

// ─── Section-specific static data ─────────────────────────────────────────────

/**
 * Visual style config per stat id.
 * icon, gradient, and trend direction are co-located with this section.
 */
export const STAT_STYLES = {
  matches:   { icon: 'people',    gradient: ['#0f766e', '#115e59'], trend: 'up'   },
  views:     { icon: 'eye',       gradient: ['#1d9bf0', '#2563eb'], trend: 'up'   },
  completed: { icon: 'briefcase', gradient: ['#6d5efc', '#7c3aed'], trend: 'up'   },
  response:  { icon: 'bar-chart', gradient: ['#f0a43a', '#f97316'], trend: 'down' },
};

// ─── Data helper ──────────────────────────────────────────────────────────────

/**
 * Returns the label and subtitle to show on the "today work" card based on
 * the current availability request status.
 *
 * @param {object|null} availabilityRequest
 * @returns {{ buttonLabel: string, subtitle: string }}
 */
export function getTodayWorkContent(availabilityRequest) {
  if (availabilityRequest?.status === 'hired') {
    return {
      buttonLabel: 'Hired for Work',
      subtitle: `Direct hire confirmed for ${
        availabilityRequest.workDetails?.location || 'your work site'
      }.`,
    };
  }

  if (availabilityRequest?.status === 'available') {
    return {
      buttonLabel: 'Available Now',
      subtitle: 'You are visible for direct hire. Customers can contact and hire you.',
    };
  }

  return {
    buttonLabel: 'Mark Available',
    subtitle:
      'Mark yourself available for direct hire without waiting for a posted job.',
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * StatsSection
 * Renders the stat grid and the "Today's Work / Mark Available" action card.
 *
 * Props:
 *   text                {object}        - i18n copy object
 *   availabilityRequest {object|null}   - current availability state from API
 *   availabilityLoading {boolean}
 *   onTodayWork         {function}      - called when button is pressed
 */
export function StatsSection({
  text,
  availabilityRequest,
  availabilityLoading,
  onTodayWork,
}) {
  const { buttonLabel, subtitle } = getTodayWorkContent(availabilityRequest);

  return (
    <>
      {/* ── Stat grid ── */}
      <View style={styles.statsGrid}>
        {labourOverviewStats.map((item) => (
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

      {/* ── Today's Work card ── */}
      <View style={styles.todayWorkCard}>
        <View style={styles.todayLeft}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>👷</Text>
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.todayTitle}>{text.todayWorkButton}</Text>
            <Text style={styles.todaySubtitle}>{subtitle}</Text>
          </View>
        </View>

        <PrimaryButton
          loading={availabilityLoading}
          label={buttonLabel}
          onPress={onTodayWork}
        />
      </View>
    </>
  );
}
