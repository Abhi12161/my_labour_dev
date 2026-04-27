import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FilterBar } from '../components/FilterBar';
import { InfoPanel } from '../components/InfoPanel';
import { JobCard } from '../components/JobCard';
import { JobPostModal } from '../components/JobPostModal';
import { LabourCard } from '../components/LabourCard';
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

const initialFilters = {
  search: '',
  district: 'All',
  category: 'All',
  availability: 'All',
  rating: 'All',
};

export function CustomerDashboard({
  language,
  onLogout,
  onPostJob,
  postedJobs,
  session,
}) {
  const text = copy[language];
  const [filters, setFilters] = useState(initialFilters);
  const [jobModalVisible, setJobModalVisible] = useState(false);
  const deferredSearch = useDeferredValue(filters.search);

  const filteredLabours = useMemo(() => {
    return filterJobs(availableLabours, {
      ...filters,
      search: deferredSearch,
    });
  }, [deferredSearch, filters]);

  const handleChangeFilter = (field, value) => {
    startTransition(() => {
      setFilters((current) => ({ ...current, [field]: value }));
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      setFilters(initialFilters);
    });
  };

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

  const customerStatStyles = {
    labours: { icon: 'people', gradient: ['#ff8d63', '#ffb25e'], trend: 'up' },
    jobs: { icon: 'people', gradient: ['#3ecf97', '#2563eb'], trend: 'down' },
    rating: { icon: 'people', gradient: ['#6366f1', '#8b5cf6'], trend: 'up' },
    hires: { icon: 'people', gradient: ['#f59e0b', '#fbbf24'], trend: 'down' },
    completed: { icon: 'checkmark-done', gradient: ['#22c1ff', '#2563eb'], trend: 'up' },
    pending: { icon: 'time', gradient: ['#ec4899', '#ff5f6d'], trend: 'down' },
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroTopActions}>
          <View style={styles.badgeWrap}>
            <Ionicons name="home" size={11} color="#ffffff" />
            <Text style={styles.heroBadge}>{text.customerDashboardBadge}</Text>
          </View>

          <Pressable style={styles.logoutPill} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={13} color="#35554d" />
            <Text style={styles.logoutPillText}>{text.logout}</Text>
          </Pressable>
        </View>

        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroHello}>{text.hello},</Text>
            <Text style={styles.heroName}>{session.user.name}</Text>
            <Text style={styles.heroSubtitle}>{text.customerSubtitle}</Text>
          </View>
        </View>

        <View style={styles.contactCard}>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={12} color="#ffffff" />
            <Text style={styles.profileText}>{session.user.email}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={12} color="#ffffff" />
            <Text style={styles.profileText}>{session.user.phone}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {customerOverviewStats.map((item) => (
          <StatCard
            key={item.id}
            label={text[item.labelKey]}
            value={item.value}
            icon={customerStatStyles[item.id]?.icon}
            trend={customerStatStyles[item.id]?.trend}
            gradient={customerStatStyles[item.id]?.gradient}
            onPress={() => {}}
            compact
          />
        ))}
      </View>

      <Pressable style={styles.postJobBar} onPress={() => setJobModalVisible(true)}>
        <View>
          <Text style={styles.postJobLabel}>{text.postJobTitle}</Text>
          <Text style={styles.postJobBody}>{text.descriptionPlaceholder}</Text>
        </View>
        <Text style={styles.postJobAction}>{text.postJobOpen}</Text>
      </Pressable>

      <FilterBar
        copy={text}
        filters={filters}
        options={labourFilterOptions}
        onChangeFilter={handleChangeFilter}
        onClear={clearFilters}
      />

      <View style={styles.jobsHeader}>
        <Text style={styles.jobsTitle}>{text.availableLaboursTitle}</Text>
        <Text style={styles.jobsCount}>{filteredLabours.length}</Text>
      </View>

      <View style={styles.jobsList}>
        {filteredLabours.length ? (
          filteredLabours.map((labour) => <LabourCard key={labour.id} copy={text} labour={labour} />)
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{text.noLabours}</Text>
          </View>
        )}
      </View>

      <View style={styles.wrapperGradient}>
        <LinearGradient colors={['rgba(209, 250, 229, 1)', 'rgba(0, 128, 0, 1)']} style={styles.panelGradient}>
          <Text style={styles.panelTitleGradient}>{text.popularSkillsTitle}</Text>

          <View style={styles.skillRowGradient}>
            {popularSkills.map((skill) => (
              <LinearGradient key={skill} colors={['#ecfdf5', '#ffffff']} style={styles.skillChipGradient}>
                <Text style={styles.skillTextGradient}>{skill}</Text>
              </LinearGradient>
            ))}
          </View>
        </LinearGradient>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{text.availableJobsTitle}</Text>
        <View style={styles.jobsList}>
          {postedJobs.map((job) => (
            <JobCard key={job.id} copy={text} job={job} />
          ))}
        </View>
      </View>

      <InfoPanel title={text.notifyTitle} body={text.notifyCustomer} />

      <View style={styles.msgWrapper}>
        <LinearGradient colors={['#ecfdf5', '#ffffff']} style={styles.msgPanel}>
          <Text style={styles.msgTitle}>{text.messengerTitle}</Text>

          <View style={styles.msgList}>
            {customerMessages.map((item) => (
              <View key={item.id} style={styles.msgItem}>
                <View style={styles.msgHeader}>
                  <Text style={styles.msgName}>{item.name}</Text>
                  <Text style={styles.msgStatus}>{item.status}</Text>
                </View>

                <Text style={styles.msgText} numberOfLines={2}>
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>

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

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 36,
    gap: 18,
  },
  hero: {
    backgroundColor: '#0c3b34',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heroTop: {
    gap: 8,
  },
  heroTopActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#f5a623',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  heroBadge: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  logoutPill: {
    backgroundColor: '#f8f1ea',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  logoutPillText: {
    color: '#35554d',
    fontSize: 11,
    fontWeight: '700',
  },
  heroHello: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  heroName: {
    color: '#00e6a8',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
    maxWidth: 170,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    lineHeight: 16,
    maxWidth: 185,
  },
  contactCard: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 13,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  profileText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    columnGap: 6,
  },
  profileSectionWrap: {
    marginTop: 4,
  },
  profileCard: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  profileHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileHeaderBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  profileHeaderEditPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  profileHeaderEditPillText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '600',
  },
  profileContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#8db79a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
  },
  profileInfoBlock: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  profileWork: {
    color: '#e8f4ef',
    fontSize: 10,
    fontWeight: '600',
  },
  profileMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  profileMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileMetaText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '600',
  },
  profileActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  profileActionLight: {
    flex: 1,
    minHeight: 34,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  profileActionLightText: {
    color: '#0e5a49',
    fontSize: 11,
    fontWeight: '700',
  },
  profileActionDark: {
    flex: 1,
    minHeight: 34,
    borderRadius: 6,
    backgroundColor: '#145c4d',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  profileActionDarkText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
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
  },
  panelTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  msgWrapper: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  msgPanel: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  msgTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  msgList: {
    gap: 10,
  },
  msgItem: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#eef2f1',
  },
  msgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  msgName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
  },
  msgStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  msgText: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 16,
  },
  wrapperGradient: {
    borderRadius: 18,
    padding: 2.5,
  },
  panelGradient: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  panelTitleGradient: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  skillRowGradient: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillChipGradient: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skillTextGradient: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f7a63',
  },
});
