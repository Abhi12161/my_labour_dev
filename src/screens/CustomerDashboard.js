import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

import { FilterBar } from '../components/FilterBar';
import { InfoPanel } from '../components/InfoPanel';
import { JobCard } from '../components/JobCard';
import { JobPostModal } from '../components/JobPostModal';
import { LabourCard } from '../components/LabourCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatCard } from '../components/StatCard';
import { copy } from '../constants/copy';
import {
  availableLabours,
  customerMessages,
  customerOverviewStats,
  jobPostOptions,
  labourFilterOptions,
  popularSkills,
} from '../data/dashboardData';
import { colors, radius } from '../theme/tokens';
import { filterJobs } from '../utils/filterJobs';

// Initial filter state for customer dashboard
const initialFilters = {
  search: '',
  district: 'All',
  category: 'All',
  availability: 'All',
  rating: 'All',
};

/**
 * CustomerDashboard Component
 *
 * This component renders the dashboard for customers who want to hire labour.
 * It includes:
 * - Overview statistics
 * - Job posting functionality
 * - Labour search and filtering
 * - Posted jobs list
 * - Popular skills display
 * - Notifications and messaging
 */
export function CustomerDashboard({
  language,
  onChangeLanguage,
  onLogout,
  onPostJob,
  postedJobs,
  session,
}) {
  // Get localized text based on selected language
  const text = copy[language];
  
   const location = useSelector((state) => state.location);

  // State for labour filtering
  const [filters, setFilters] = useState(initialFilters);
  const [jobModalVisible, setJobModalVisible] = useState(false);

  // Deferred search for performance optimization
  const deferredSearch = useDeferredValue(filters.search);

  // Memoized filtered labour list to avoid unnecessary recalculations
  const filteredLabours = useMemo(() => {
    return filterJobs(availableLabours, {
      ...filters,
      search: deferredSearch,
    });
  }, [deferredSearch, filters]);

  /**
   * Handle filter changes with transition for smooth UI updates
   */
  const handleChangeFilter = (field, value) => {
    startTransition(() => {
      setFilters((current) => ({ ...current, [field]: value }));
    });
  };

  /**
   * Clear all filters and reset to initial state
   */
  const clearFilters = () => {
    startTransition(() => {
      setFilters(initialFilters);
    });
  };

  /**
   * Handle job posting from the modal
   * Creates a new job object and adds it to the posted jobs list
   */
  const handlePostJob = (form) => {
    const createdJob = {
      id: `post-${Date.now()}`,
      title: form.title || text.jobTitlePlaceholder,
      location: `${form.city}, Muzaffarpur`,
      posted: text.today,
      applicants: 0,
      distance: 'Nearby',
      description: form.description || text.descriptionPlaceholder,
      skill: form.skill,
      skillLevel: form.level,
      time: form.timing,
    };

    onPostJob(createdJob);
    setJobModalVisible(false);
    Alert.alert(text.jobPostedTitle, text.jobPostedBody);
  };
  const gradients = [
    ['#ff7e5f', '#feb47b'],   // orange
    ['#43cea2', '#185a9d'],   // teal-blue
    ['#667eea', '#764ba2'],   // purple
    ['#f7971e', '#ffd200'],   // yellow
    ['#00c6ff', '#0072ff'],   // 🔥 completed - blue pop
    ['#f857a6', '#ff5858'],   // 🔥 pending - pink/red alert
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero section with user greeting and logout */}
    <View style={styles.hero}>

  {/* Top Row */}
  <View style={styles.heroTop}>

    <View style={styles.heroCopy}>

      {/* Badge */}
      <View style={styles.badgeWrap}>
        <Text style={styles.heroBadge}>
          {text.customerDashboardBadge}
        </Text>
      </View>

      {/* Greeting */}
      <Text style={styles.heroTitle}>
        {text.hello},{" "}
        <Text style={styles.name}>{session.user.name}</Text>
      </Text>

      {/* Subtitle */}
      <Text style={styles.heroSubtitle}>
        {text.customerSubtitle}
      </Text>

    </View>

    {/* Logout Button */}
    <PrimaryButton
      label={text.logout}
      onPress={onLogout}
      variant="ghost"
    />

  </View>

  {/* Profile Info Section */}
  <View style={styles.profileCard}>
    <Text style={styles.profileText}>
      📧 {session.user.email}
    </Text>
    <Text style={styles.profileText}>
      📱 {session.user.phone}
    </Text>
  </View>

</View>

      {/* Overview statistics grid */}
      <View style={styles.statsGrid}>
        {customerOverviewStats.map((item, index) => (
          <StatCard
            key={item.id}
            label={text[item.labelKey]}
            value={item.value}
            icon={
              item.id === 'completed'
                ? 'checkmark-done'
                : item.id === 'pending'
                  ? 'time'
                  : 'people'
            }
            trend={index % 2 === 0 ? 'up' : 'down'}
            gradient={gradients[index % gradients.length]}
            onPress={() => console.log('Clicked', item.labelKey)}
          />
        ))}
      </View>

      {/* Information panel about Muzaffarpur focus */}
      <InfoPanel title={`${text.focusMuzaffarpur}${location.fullData?.address?.city || ''}`} body={text.focusMuzaffarpurBody} tone="accent" />

      {/* Job posting section */}
      <Pressable style={styles.postJobBar} onPress={() => setJobModalVisible(true)}>
        <View>
          <Text style={styles.postJobLabel}>{text.postJobTitle}</Text>
          <Text style={styles.postJobBody}>{text.descriptionPlaceholder}</Text>
        </View>
        <Text style={styles.postJobAction}>{text.postJobOpen}</Text>
      </Pressable>

      {/* Labour filtering controls */}
      <FilterBar
        copy={text}
        filters={filters}
        options={labourFilterOptions}
        onChangeFilter={handleChangeFilter}
        onClear={clearFilters}
      />

      {/* Available labour section header */}
      <View style={styles.jobsHeader}>
        <Text style={styles.jobsTitle}>{text.availableLaboursTitle}</Text>
        <Text style={styles.jobsCount}>{filteredLabours.length}</Text>
      </View>

      {/* Labour cards list */}
      <View style={styles.jobsList}>
        {filteredLabours.length ? (
          filteredLabours.map((labour) => <LabourCard key={labour.id} copy={text} labour={labour} />)
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{text.noLabours}</Text>
          </View>
        )}
      </View>

      {/* Popular skills section */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{text.popularSkillsTitle}</Text>
        <View style={styles.skillRow}>
          {popularSkills.map((skill) => (
            <View key={skill} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Posted jobs section */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{text.availableJobsTitle}</Text>
        <View style={styles.jobsList}>
          {postedJobs.map((job) => (
            <JobCard key={job.id} copy={text} job={job} />
          ))}
        </View>
      </View>

      {/* Notifications info panel */}
      <InfoPanel title={text.notifyTitle} body={text.notifyCustomer} />

      {/* Messages section */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{text.messengerTitle}</Text>
        <View style={styles.messageList}>
          {customerMessages.map((item) => (
            <View key={item.id} style={styles.messageItem}>
              <Text style={styles.messageName}>{item.name}</Text>
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.messageStatus}>{item.status}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Job posting modal */}
      <JobPostModal
        copy={text}
        options={jobPostOptions}
        visible={jobModalVisible}
        onClose={() => setJobModalVisible(false)}
        onSubmit={handlePostJob}
      />
    </ScrollView>
  );
}

// Styles for the CustomerDashboard component
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 36,
    gap: 18,
  },
hero: {
  backgroundColor: '#0f2f2a', // deep premium green
  borderRadius: 24,
  padding: 22,
  gap: 18,

  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowRadius: 15,
  shadowOffset: { width: 0, height: 8 },

  elevation: 6,
},

heroTop: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
},

heroCopy: {
  flex: 1,
  gap: 8,
},

badgeWrap: {
  alignSelf: 'flex-start',
  backgroundColor: '#ff9f1c',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 999,
},

heroBadge: {
  color: '#fff',
  fontSize: 12,
  fontWeight: '800',
},

heroTitle: {
  color: '#fff',
  fontSize: 26,
  fontWeight: '800',
  lineHeight: 34,
},

name: {
  color: '#00e6a8', // highlight name
},

heroSubtitle: {
  color: 'rgba(255,255,255,0.75)',
  fontSize: 14,
  lineHeight: 20,
},

profileCard: {
  backgroundColor: 'rgba(255,255,255,0.08)',
  padding: 12,
  borderRadius: 14,
  gap: 6,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
},

profileText: {
  color: 'rgba(255,255,255,0.85)',
  fontSize: 13,
},
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  postJobBar: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0 10px 18px rgba(18, 35, 32, 0.08)',
  },
  postJobLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  postJobBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  postJobAction: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  jobsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  jobsTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  jobsCount: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  jobsList: {
    gap: 12,
  },
  emptyCard: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0 10px 18px rgba(18, 35, 32, 0.08)',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0 10px 18px rgba(18, 35, 32, 0.08)',
  },
  panelTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: colors.panelMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skillText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  messageList: {
    gap: 12,
  },
  messageItem: {
    backgroundColor: colors.panelMuted,
    borderRadius: radius.md,
    padding: 16,
    gap: 8,
  },
  messageName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  messageText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  messageStatus: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});