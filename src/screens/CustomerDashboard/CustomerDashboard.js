import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Ionicons } from '@expo/vector-icons';
import { FilterBar } from '../../components/FilterBar';
import { InfoPanel } from '../../components/InfoPanel';
import { JobCard } from '../../components/JobCard';
import { JobPostModal } from '../../components/JobPostModal';
import { LabourCard } from '../../components/LabourCard';
import { StatCard } from '../../components/StatCard';
import { copy } from '../../constants/copy';
import {
  availableLabours,
  customerMessages,
  customerOverviewStats,
  jobPostOptions,
  labourFilterOptions,
  popularSkills,
} from '../../data/dashboardData';
import { fetchProfile, saveProfile } from '../../store/profileSlice';
import { filterJobs } from '../../utils/filterJobs';
import { styles } from './styles';

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
  const dispatch = useDispatch();
  const text = copy[language];
  const { data: apiProfile, status, updateStatus, error } = useSelector(
    (state) => state.profile.customer
  );
  const profile = apiProfile || session?.user || {};
  const [filters, setFilters] = useState(initialFilters);
  const [jobModalVisible, setJobModalVisible] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    if (
      session?.token &&
      session?.token !== 'demo-session' &&
      session?.role === 'customer' &&
      status === 'idle'
    ) {
      dispatch(fetchProfile('customer'));
    }
  }, [dispatch, session?.role, session?.token, status]);

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

  const handleSaveProfile = async () => {
    const result = await dispatch(
      saveProfile({
        role: 'customer',
        name: editedProfile.name || '',
        mobile: editedProfile.mobile || editedProfile.phone || '',
        address: editedProfile.address || '',
        bio: editedProfile.bio || '',
        profileImage: editedProfile.profileImage || '',
      })
    );

    if (saveProfile.fulfilled.match(result)) {
      setIsEditingProfile(false);
      Alert.alert(text.profileUpdatedTitle, text.profileUpdatedMessage);
      return;
    }

    Alert.alert('Error', result.payload || 'Failed to update profile.');
  };

  const handleToggleProfileEditor = () => {
    if (!isEditingProfile) {
      setEditedProfile(profile);
    }

    setIsEditingProfile((current) => !current);
  };

  const customerStatStyles = {
    labours: { icon: 'people', gradient: ['#ff8d63', '#ffb25e'], trend: 'up' },
    jobs: { icon: 'people', gradient: ['#3ecf97', '#2563eb'], trend: 'down' },
    rating: { icon: 'people', gradient: ['#6366f1', '#8b5cf6'], trend: 'up' },
    hires: { icon: 'people', gradient: ['#f59e0b', '#fbbf24'], trend: 'down' },
    completed: { icon: 'checkmark-done', gradient: ['#22c1ff', '#2563eb'], trend: 'up' },
    pending: { icon: 'time', gradient: ['#ec4899', '#ff5f6d'], trend: 'down' },
  };

  console.log('CustomerDashboard render', { profile, status, error });

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
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
        </View>

        <View style={styles.heroBody}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroHello}>{text.hello},</Text>
            <Text style={styles.heroName}>{profile?.name || session?.user?.name || 'User'}</Text>

            <Text style={styles.heroSubtitle}>{text.customerSubtitle}</Text>
          </View>

          <View style={styles.heroAvatarWrap}>
            <View style={styles.heroAvatarCircle}>
              <Text style={styles.heroAvatarLetter}>
                {(profile?.name || session?.user?.name || 'A').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.heroAvatarEdit}>
              <Ionicons name="create-outline" size={11} color="#35554d" />
            </View>
          </View>
        </View>

        <View style={styles.contactCard}>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={12} color="#ffffff" />
            <Text style={styles.contactText}>{profile?.email || session?.user?.email || 'Not provided'}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={12} color="#ffffff" />
            <Text style={styles.contactText}>
              {profile?.mobile || profile?.phone || session?.user?.phone || 'Not provided'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Ionicons name="person-outline" size={13} color="#0c5a49" />
            <Text style={styles.sectionTitle}>Customer profile</Text>
          </View>
          <Pressable style={styles.countBadge} onPress={handleToggleProfileEditor}>
            <Text style={styles.countBadgeText}>{isEditingProfile ? 'Close' : 'Edit'}</Text>
          </Pressable>
        </View>

        {status === 'loading' ? <Text style={{ color: '#6b7c74' }}>Loading profile...</Text> : null}
        {error ? <Text style={{ color: '#d14343' }}>{error}</Text> : null}

        {isEditingProfile ? (
          <View style={{ gap: 12 }}>
            <TextInput
              style={localStyles.input}
              value={editedProfile.name || ''}
              onChangeText={(value) => setEditedProfile((current) => ({ ...current, name: value }))}
              placeholder="Name"
            />
            <TextInput
              style={localStyles.input}
              value={editedProfile.mobile || editedProfile.phone || ''}
              onChangeText={(value) => setEditedProfile((current) => ({ ...current, mobile: value }))}
              placeholder="Mobile"
              keyboardType="phone-pad"
            />
            <TextInput
              style={localStyles.input}
              value={editedProfile.address || ''}
              onChangeText={(value) => setEditedProfile((current) => ({ ...current, address: value }))}
              placeholder="Address"
            />
            <TextInput
              style={[localStyles.input, localStyles.multilineInput]}
              value={editedProfile.bio || ''}
              onChangeText={(value) => setEditedProfile((current) => ({ ...current, bio: value }))}
              placeholder="Bio"
              multiline
            />
            <TextInput
              style={localStyles.input}
              value={editedProfile.profileImage || ''}
              onChangeText={(value) => setEditedProfile((current) => ({ ...current, profileImage: value }))}
              placeholder="Profile image URL"
            />
            <Pressable style={localStyles.primaryAction} onPress={handleSaveProfile} disabled={updateStatus === 'loading'}>
              <Text style={localStyles.primaryActionText}>
                {updateStatus === 'loading' ? 'Saving...' : text.save}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <Text style={localStyles.profileLine}>{profile?.address || 'Address not added yet'}</Text>
            <Text style={localStyles.profileLine}>{profile?.bio || 'Bio not added yet'}</Text>
            <Text style={localStyles.profileLine}>{profile?.profileImage || 'Profile image URL not added yet'}</Text>
          </View>
        )}
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

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Ionicons name="people-outline" size={13} color="#0c5a49" />
            <Text style={styles.sectionTitle}>{text.availableLaboursTitle}</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{filteredLabours.length}</Text>
          </View>
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
      </View>

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

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Ionicons name="briefcase-outline" size={13} color="#0c5a49" />
            <Text style={styles.sectionTitle}>{text.availableJobsTitle}</Text>
          </View>
        </View>

        <View style={styles.jobsList}>
          {postedJobs.map((job) => (
            <JobCard key={job.id} copy={text} job={job} />
          ))}
        </View>
      </View>

      <InfoPanel title={text.notifyTitle} body={text.notifyCustomer} />

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Ionicons name="chatbubble-ellipses-outline" size={13} color="#0c5a49" />
            <Text style={styles.sectionTitle}>{text.messengerTitle}</Text>
          </View>
        </View>

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

const localStyles = {
  input: {
    borderWidth: 1,
    borderColor: '#d6e1dc',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f7fbf9',
    color: '#17332e',
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  primaryAction: {
    backgroundColor: '#0c5a49',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  profileLine: {
    color: '#35554d',
    lineHeight: 20,
  },
};
