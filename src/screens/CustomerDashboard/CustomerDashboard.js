import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
  customerMessages,
  customerOverviewStats,
  jobPostOptions,
  labourFilterOptions,
  popularSkills,
} from '../../data/dashboardData';
import {
  cancelCustomerApplication,
  fetchCustomerApplications,
  fetchCustomerNotifications,
} from '../../services/applicationService';
import {
  directHireLabour,
  fetchAvailableLabourRequests,
  fetchNearbyLabourRequests,
  normalizeDirectHireNotifications,
} from '../../services/directHireService';
import { createJob, fetchJobs } from '../../services/jobService';
import { fetchProfile, saveProfile } from '../../store/profileSlice';
import { filterJobs } from '../../utils/filterJobs';
import { mergeUniqueNotifications } from '../../utils/notificationUtils';
import { styles } from './styles';

const initialFilters = {
  search: '',
  district: 'All',
  category: 'All',
  availability: 'All',
  rating: 'All',
};

const normalizeLocationValue = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9,\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getLocationTokens = (value) =>
  normalizeLocationValue(value)
    .split(',')
    .flatMap((part) => part.split(' '))
    .map((part) => part.trim())
    .filter((part) => part.length > 2);

const isMatchingLocation = (jobLocation, customerLocation) => {
  const normalizedJobLocation = normalizeLocationValue(jobLocation);
  const customerTokens = getLocationTokens(customerLocation);

  if (!normalizedJobLocation || !customerTokens.length) {
    return false;
  }

  return customerTokens.some((token) => normalizedJobLocation.includes(token));
};

const getCustomerProfile = (profile, sessionUser) => {
  if (profile?.customer) {
    return profile.customer;
  }

  if (profile && Object.keys(profile).length) {
    return profile;
  }

  return sessionUser || {};
};

const mapApplicationToLabourCard = (application) => ({
  id: application.labour.id,
  name: application.labour.name,
  primarySkill: application.job.skill,
  skills: (application.labour.skills?.length ? application.labour.skills : [application.job.skill]).map(
    (skill) => (typeof skill === 'string' ? skill : skill?.name || application.job.skill)
  ),
  rating: application.labour.rating || 0,
  reviews: 0,
  distance: application.job.location,
  location: application.labour.address,
  availability: application.status === 'cancelled' ? 'Cancelled' : 'Assigned',
  photoLabel: (application.labour.name || 'L').charAt(0).toUpperCase(),
});

const mapDirectRequestToLabourCard = (request) => ({
  id: request.id,
  name: request.labour.name,
  primarySkill:
    request.labour.skills?.[0]?.name || request.labour.skills?.[0] || 'General',
  skills: (request.labour.skills?.length ? request.labour.skills : ['General']).map((skill) =>
    typeof skill === 'string' ? skill : skill?.name || 'General'
  ),
  rating: request.labour.rating || 0,
  reviews: 0,
  distance: request.city || 'Nearby',
  location: request.labour.address,
  availability: request.statusLabel,
  photoLabel: (request.labour.name || 'L').charAt(0).toUpperCase(),
  requestId: request.id,
});

const getSkillLabel = (skill, fallback = 'General') =>
  typeof skill === 'string' ? skill : skill?.name || fallback;

const dedupeApplicationsByMobile = (applications) => {
  const seen = new Map();

  applications.forEach((application) => {
    const key = `${application.job.id}|${application.labour.mobile}`;
    const existing = seen.get(key);

    if (!existing || new Date(application.appliedAt) > new Date(existing.appliedAt)) {
      seen.set(key, application);
    }
  });

  return Array.from(seen.values());
};

const normalizeIdentity = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'not provided' ? '' : normalized;
};

const getHiredLabourKeys = (applications) => {
  const hiredStatuses = new Set(['hired', 'assigned', 'accepted']);
  const keys = new Set();

  applications.forEach((application) => {
    if (!hiredStatuses.has(normalizeIdentity(application.status))) return;

    const labourId = normalizeIdentity(application.labour?.id);
    const labourMobile = normalizeIdentity(application.labour?.mobile);

    if (labourId) keys.add(`id:${labourId}`);
    if (labourMobile) keys.add(`mobile:${labourMobile}`);
  });

  return keys;
};

const isAlreadyHiredLabour = (request, hiredLabourKeys) => {
  const labourId = normalizeIdentity(request.labour?.id);
  const labourMobile = normalizeIdentity(request.labour?.mobile);

  return (
    (labourId && hiredLabourKeys.has(`id:${labourId}`)) ||
    (labourMobile && hiredLabourKeys.has(`mobile:${labourMobile}`))
  );
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
  const customerProfile = getCustomerProfile(profile, session?.user);
  const [filters, setFilters] = useState(initialFilters);
  const [jobModalVisible, setJobModalVisible] = useState(false);
  const [jobs, setJobs] = useState(postedJobs);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState('');
  const [hiringApplicationId, setHiringApplicationId] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState(customerProfile);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [availableRequestsLoading, setAvailableRequestsLoading] = useState(false);
  const [availableRequestsError, setAvailableRequestsError] = useState('');
  const [selectedDirectRequest, setSelectedDirectRequest] = useState(null);
  const [directHireForm, setDirectHireForm] = useState({
    location: '',
    timing: '',
    notes: '',
  });
  const [directHiringRequestId, setDirectHiringRequestId] = useState('');
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

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      setJobsLoading(true);
      setJobsError('');

      try {
        const fetchedJobs = await fetchJobs(
          session?.token && session.token !== 'demo-session'
            ? session.token
            : undefined
        );

        if (isMounted) {
          setJobs(fetchedJobs);
        }
      } catch (loadError) {
        if (isMounted) {
          setJobsError(loadError.message || 'Failed to load jobs.');
        }
      } finally {
        if (isMounted) {
          setJobsLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, [session?.token]);
  console.log('Jobs loading state:', { jobsLoading, jobsError, jobs }); 

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async () => {
      const shouldUseApiApplications =
        Boolean(session?.token) &&
        session.token !== 'demo-session' &&
        session?.role === 'customer';

      if (!shouldUseApiApplications) {
        setApplications([]);
        setApplicationsError('');
        setApplicationsLoading(false);
        return;
      }

      setApplicationsLoading(true);
      setApplicationsError('');

      try {
        const fetchedApplications = await fetchCustomerApplications(session.token);

        if (isMounted) {
          setApplications(dedupeApplicationsByMobile(fetchedApplications));
        }
      } catch (loadError) {
        if (isMounted) {
          setApplicationsError(loadError.message || 'Failed to load applied labour.');
        }
      } finally {
        if (isMounted) {
          setApplicationsLoading(false);
        }
      }
    };

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, [session?.role, session?.token]);

  useEffect(() => {
    if (isEditingProfile) {
      setEditedProfile(customerProfile);
    }
  }, [customerProfile, isEditingProfile]);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      const shouldUseApiNotifications =
        Boolean(session?.token) &&
        session.token !== 'demo-session' &&
        session?.role === 'customer';

      if (!shouldUseApiNotifications) {
        setNotifications([]);
        setNotificationsLoading(false);
        return;
      }

      setNotificationsLoading(true);

      try {
        const fetchedNotifications = await fetchCustomerNotifications(session.token);

        if (isMounted) {
          setNotifications(fetchedNotifications);
        }
      } catch (loadError) {
        if (isMounted) {
          setNotifications([
            {
              id: 'customer-notification-error',
              status: 'error',
              statusLabel: 'Error',
              message: loadError.message || 'Failed to load notifications.',
              timestamp: new Date().toISOString(),
              actorName: 'System',
            },
          ]);
        }
      } finally {
        if (isMounted) {
          setNotificationsLoading(false);
        }
      }
    };

    loadNotifications();
    const intervalId = setInterval(loadNotifications, 800000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [session?.role, session?.token]);

 useEffect(() => {
  let isMounted = true;

  const shouldUse =
    Boolean(session?.token) &&
    session.token !== 'demo-session' &&
    session?.role === 'customer';

  if (!shouldUse) {
    setAvailableRequests([]);
    setAvailableRequestsLoading(false);
    setAvailableRequestsError('');
    return;
  }

  const loadAvailableRequests = async () => {
    setAvailableRequestsLoading(true);
    setAvailableRequestsError('');

    try {
      const city = customerProfile?.city?.trim();

      const requests = city
        ? await fetchNearbyLabourRequests(
            session.token,
            city
          )
        : await fetchAvailableLabourRequests(
            session.token
          );

      if (isMounted) {
        setAvailableRequests(requests);
      }
    } catch (err) {
      if (isMounted) {
        setAvailableRequestsError(
          err.message ||
            'Failed to load available labour.'
        );
      }
    } finally {
      if (isMounted) {
        setAvailableRequestsLoading(false);
      }
    }
  };

  // ✅ only once
  loadAvailableRequests();

  return () => {
    isMounted = false;
  };
}, [
  customerProfile?.city,
  session?.role,
  session?.token,
]);

  const hiredLabourKeys = useMemo(
    () => getHiredLabourKeys(applications),
    [applications]
  );

  const visibleAvailableRequests = useMemo(
    () =>
      availableRequests.filter(
        (request) => !isAlreadyHiredLabour(request, hiredLabourKeys)
      ),
    [availableRequests, hiredLabourKeys]
  );

  const filteredLabours = useMemo(() => {
    return filterJobs(visibleAvailableRequests.map(mapDirectRequestToLabourCard), {
      ...filters,
      search: deferredSearch,
    });
  }, [visibleAvailableRequests, deferredSearch, filters]);

  const customerLocation =
    customerProfile?.address ||
    customerProfile?.city ||
    session?.user?.address ||
    session?.user?.city ||
    '';

  const matchedJobs = useMemo(
    () =>
      jobs.filter((job) =>
        isMatchingLocation(`${job.location || ''}, ${job.city || ''}`, customerLocation)
      ),
    [customerLocation, jobs]
  );

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

  const handlePostJob = async (form) => {
    setIsSubmittingJob(true);
    setJobsError('');

    const token =
      session?.token && session.token !== 'demo-session'
        ? session.token
        : undefined;

    const payload = {
      title: form.title?.trim() || text.jobTitlePlaceholder,
      skill: form.skill,
      description: form.description?.trim() || text.descriptionPlaceholder,
      city: form.city,
      location: form.city,
      timing: form.timing,
      level: form.level,
      requiredLabours: Math.max(Number(form.requiredLabours) || 1, 1),
    };

    try {
      const createdJob = await createJob(payload, token);
      const refreshedJobs = await fetchJobs(token);

      setJobs(refreshedJobs.length ? refreshedJobs : [createdJob, ...jobs]);
      if (!token) {
        onPostJob(createdJob);
      }
      setJobModalVisible(false);
      Alert.alert(text.jobPostedTitle, text.jobPostedBody);
    } catch (submitError) {
      Alert.alert('Error', submitError.message || 'Failed to post job.');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleSaveProfile = async () => {
    const result = await dispatch(
      saveProfile({
        role: 'customer',
        name: editedProfile.name || customerProfile.name || '',
        mobile: editedProfile.mobile || editedProfile.phone || customerProfile.mobile || customerProfile.phone || '',
        address: editedProfile.address || customerProfile.address || '',
        bio: editedProfile.bio || customerProfile.bio || '',
        profileImage: editedProfile.profileImage || customerProfile.profileImage || '',
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
      setEditedProfile(customerProfile);
    }

    setIsEditingProfile((current) => !current);
  };

  const handleHireLabour = async (application) => {
    try {
      setHiringApplicationId(application.id);
      const updatedApplication = await cancelCustomerApplication(
        application.id,
        'Cancelled by customer',
        session.token
      );
      const refreshedNotifications = await fetchCustomerNotifications(session.token);

      setApplications((current) =>
        dedupeApplicationsByMobile(
          current.map((item) => (item.id === updatedApplication.id ? updatedApplication : item))
        )
      );
      if (['hired', 'assigned', 'accepted'].includes(normalizeIdentity(updatedApplication.status))) {
        setAvailableRequests((current) =>
          current.filter(
            (request) =>
              normalizeIdentity(request.labour?.id) !== normalizeIdentity(updatedApplication.labour?.id) &&
              normalizeIdentity(request.labour?.mobile) !== normalizeIdentity(updatedApplication.labour?.mobile)
          )
        );
      }
      setNotifications(refreshedNotifications);
      Alert.alert('Success', `${updatedApplication.labour.name} assignment has been cancelled.`);
    } catch (hireError) {
      Alert.alert('Error', hireError.message || 'Failed to cancel assignment.');
    } finally {
      setHiringApplicationId('');
    }
  };

  const handleOpenDirectHire = (request) => {
    setSelectedDirectRequest(request);
    setDirectHireForm({
      location: customerProfile?.address || customerProfile?.city || '',
      timing: '',
      notes: '',
    });
  };

  const closeDirectHireSheet = () => {
    setSelectedDirectRequest(null);
    setDirectHireForm({
      location: '',
      timing: '',
      notes: '',
    });
    setDirectHiringRequestId('');
  };

  const handleDirectHire = async () => {
    if (!selectedDirectRequest) {
      return;
    }

    if (!directHireForm.location.trim()) {
      Alert.alert('Error', 'Location is required for direct hire.');
      return;
    }

    try {
      setDirectHiringRequestId(selectedDirectRequest.id);
      const hiredRequest = await directHireLabour(selectedDirectRequest.id, directHireForm, session.token);
      const directNotifications = normalizeDirectHireNotifications(hiredRequest, 'customer');

      setAvailableRequests((current) =>
        current.filter((request) => request.id !== hiredRequest.id)
      );
      setNotifications((current) => mergeUniqueNotifications(directNotifications, current));
      closeDirectHireSheet();
      Alert.alert('Success', `${hiredRequest.labour.name} has been directly hired.`);
    } catch (hireError) {
      Alert.alert('Error', hireError.message || 'Failed to directly hire labour.');
    } finally {
      setDirectHiringRequestId('');
    }
  };

  const closeApplicantSheet = () => {
    setSelectedApplication(null);
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
            <Text style={styles.heroName}>{customerProfile?.name || session?.user?.name || 'User'}</Text>

            <Text style={styles.heroSubtitle}>{text.customerSubtitle}</Text>
          </View>

          <View style={styles.heroAvatarWrap}>
            <View style={styles.heroAvatarCircle}>
              <Text style={styles.heroAvatarLetter}>
                {(customerProfile?.name || session?.user?.name || 'A').charAt(0).toUpperCase()}
                
              </Text>
            </View>
            <View style={styles.heroAvatarEdit}>
              <Ionicons name="create-outline" size={11} color="#35554d" />
            </View>
          </View>
        </View>

        <View style={styles.contactCard}>
          
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={12} color="#ffffff" />
            <Text style={styles.contactText}>
              {customerProfile?.mobile || customerProfile?.phone || session?.user?.phone || 'Not provided'}
            </Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={12} color="#ffffff" />
            <Text style={styles.contactText}>{customerProfile?.address || customerProfile?.location}</Text>
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
            {/* <TextInput
              style={localStyles.input}
              value={editedProfile.profileImage || ''}
              onChangeText={(value) => setEditedProfile((current) => ({ ...current, profileImage: value }))}
              placeholder="Profile image URL"
            /> */}
            <Pressable style={localStyles.primaryAction} onPress={handleSaveProfile} disabled={updateStatus === 'loading'}>
              <Text style={localStyles.primaryActionText}>
                {updateStatus === 'loading' ? 'Saving...' : text.save}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <Text style={localStyles.profileLine}>{customerProfile?.address || 'Address not added yet'}</Text>
            <Text style={localStyles.profileLine}>{customerProfile?.bio || 'Bio not added yet'}</Text>
            {/* <Text style={localStyles.profileLine}>
              {customerProfile?.profileImage || 'Profile image URL not added yet'}
            </Text> */}
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
            onPress={() => { }}
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
          {availableRequestsLoading ? <Text style={{ color: '#6b7c74' }}>Loading available labour...</Text> : null}
          {availableRequestsError ? <Text style={{ color: '#d14343' }}>{availableRequestsError}</Text> : null}
          {filteredLabours.length ? (
            filteredLabours.map((labour) => (
              <LabourCard
                key={labour.id}
                copy={text}
                labour={labour}
                actionLabel={
                  directHiringRequestId === labour.requestId
                    ? 'Hiring...'
                    : 'Direct Hire'
                }
                onActionPress={() => {
                  const request = availableRequests.find((item) => item.id === labour.requestId);
                  if (request) {
                    handleOpenDirectHire(request);
                  }
                }}
                disabled={directHiringRequestId === labour.requestId}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No direct available labour found right now.</Text>
            </View>
          )}
        </View>
      </View>

      {(notificationsLoading || notifications.length > 0) && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrap}>
              <Ionicons name="notifications-outline" size={13} color="#0c5a49" />
              <Text style={styles.sectionTitle}>{text.notificationsTitle}</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{notifications.length}</Text>
            </View>
          </View>

          <View style={styles.jobsList}>
            {notificationsLoading ? <Text style={{ color: '#6b7c74' }}>Loading notifications...</Text> : null}
            {notifications.slice(0, 6).map((notification) => (
              <View key={notification.id} style={localStyles.notificationCard}>
                <View style={localStyles.notificationTopRow}>
                  <Text style={localStyles.notificationStatus}>
                    {notification.statusLabel || notification.status}
                  </Text>
                  <Text style={localStyles.notificationTime}>
                    {new Date(notification.timestamp).toLocaleString()}
                  </Text>
                </View>
                <Text style={localStyles.notificationMessage}>{notification.message}</Text>
                {notification.jobTitle ? (
                  <Text style={localStyles.notificationMeta}>Job: {notification.jobTitle}</Text>
                ) : null}
                {notification.actorName ? (
                  <Text style={localStyles.notificationMeta}>Labour: {notification.actorName}</Text>
                ) : null}
                {notification.actorMobile ? (
                  <Text style={localStyles.notificationMeta}>Phone: {notification.actorMobile}</Text>
                ) : null}
                {notification.actorAddress ? (
                  <Text style={localStyles.notificationMeta}>Address: {notification.actorAddress}</Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Ionicons name="person-add-outline" size={13} color="#0c5a49" />
            <Text style={styles.sectionTitle}>Applied labour</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{applications.length}</Text>
          </View>
        </View>

        <View style={styles.jobsList}>
          {applicationsLoading ? <Text style={{ color: '#6b7c74' }}>Loading applied labour...</Text> : null}
          {applicationsError ? <Text style={{ color: '#d14343' }}>{applicationsError}</Text> : null}
          {!applicationsLoading && applications.length
            ? applications.map((application) => (
              <View key={application.id} style={{ gap: 8 }}>
                <View style={localStyles.applicationMetaCard}>
                  <Text style={localStyles.applicationJobTitle}>{application.job.title}</Text>
                  <Text style={localStyles.applicationJobMeta}>
                    {application.job.location} - {application.statusLabel}
                  </Text>
                </View>
                <Pressable
                  style={localStyles.applicantProfileCard}
                  onPress={() => setSelectedApplication(application)}
                >
                  <Text style={localStyles.applicantProfileTitle}>{application.labour.name}</Text>
                  <Text style={localStyles.applicantProfileMeta}>
                    Phone: {application.labour.mobile}
                  </Text>
                  <Text style={localStyles.applicantProfileMeta}>
                    Address: {application.labour.address}
                  </Text>
                  <Text style={localStyles.applicantProfileMeta}>
                    Applied on: {new Date(application.appliedAt).toLocaleString()}
                  </Text>
                  {application.labour.bio ? (
                    <Text style={localStyles.applicantProfileBio}>{application.labour.bio}</Text>
                  ) : null}
                  <View style={localStyles.applicantSkillRow}>
                    {(application.labour.skills?.length
                      ? application.labour.skills
                      : [application.job.skill]
                    ).slice(0, 4).map((skill, index) => (
                      <View
                        key={`${application.id}-${getSkillLabel(skill, application.job.skill)}-${index}`}
                        style={localStyles.applicantSkillChip}
                      >
                        <Text style={localStyles.applicantSkillText}>
                          {getSkillLabel(skill, application.job.skill)}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Text style={localStyles.viewProfileLink}>Tap to view full profile</Text>
                </Pressable>
                <LabourCard
                  copy={text}
                  labour={mapApplicationToLabourCard(application)}
                  actionLabel={
                    application.status === 'cancelled'
                      ? 'Cancelled'
                      : hiringApplicationId === application.id
                        ? 'Cancelling...'
                        : 'Cancel Assignment'
                  }
                  onActionPress={
                    application.status === 'cancelled'
                      ? undefined
                      : () => handleHireLabour(application)
                  }
                  disabled={application.status === 'cancelled' || hiringApplicationId === application.id}
                />
              </View>
            ))
            : null}
          {!applicationsLoading && !applications.length ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No labour applications yet.</Text>
            </View>
          ) : null}
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
          {jobsLoading ? <Text style={{ color: '#6b7c74' }}>Loading jobs...</Text> : null}
          {jobsError ? <Text style={{ color: '#d14343' }}>{jobsError}</Text> : null}
          {!jobsLoading && matchedJobs.length
            ? matchedJobs.map((job) => <JobCard key={job.id} copy={text} job={job} />)
            : null}
          {!jobsLoading && !matchedJobs.length ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                {customerLocation
                  ? `No jobs found for ${customerLocation}.`
                  : 'Add your location to see matching jobs.'}
              </Text>
            </View>
          ) : null}
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
        submitting={isSubmittingJob}
      />

      <Modal
        animationType="slide"
        transparent
        visible={Boolean(selectedApplication)}
        onRequestClose={closeApplicantSheet}
      >
        <View style={localStyles.sheetOverlay}>
          <View style={localStyles.sheetCard}>
            <View style={localStyles.sheetHeader}>
              <View>
                <Text style={localStyles.sheetTitle}>Applicant Profile</Text>
                <Text style={localStyles.sheetSubtitle}>
                  {selectedApplication?.job?.title || 'Applied labour details'}
                </Text>
              </View>
              <Pressable style={localStyles.sheetCloseButton} onPress={closeApplicantSheet}>
                <Text style={localStyles.sheetCloseText}>Close</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={localStyles.sheetContent}>
              <View style={localStyles.sheetHero}>
                <View style={localStyles.sheetAvatar}>
                  <Text style={localStyles.sheetAvatarText}>
                    {(selectedApplication?.labour?.name || 'L').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={localStyles.sheetName}>{selectedApplication?.labour?.name}</Text>
                  <Text style={localStyles.sheetMeta}>
                    Applied for: {selectedApplication?.job?.skill || 'General'}
                  </Text>
                  <Text style={localStyles.sheetMeta}>
                    Status: {selectedApplication?.statusLabel || 'Pending'}
                  </Text>
                </View>
              </View>

              <View style={localStyles.sheetInfoCard}>
                <Text style={localStyles.sheetSectionTitle}>Contact</Text>
                <Text style={localStyles.sheetInfoText}>
                  Phone: {selectedApplication?.labour?.mobile || 'Not provided'}
                </Text>
                <Text style={localStyles.sheetInfoText}>
                  Address: {selectedApplication?.labour?.address || 'Not provided'}
                </Text>
              </View>

              <View style={localStyles.sheetInfoCard}>
                <Text style={localStyles.sheetSectionTitle}>Application</Text>
                <Text style={localStyles.sheetInfoText}>
                  Job: {selectedApplication?.job?.title || 'Untitled Job'}
                </Text>
                <Text style={localStyles.sheetInfoText}>
                  Location: {selectedApplication?.job?.location || 'Not provided'}
                </Text>
                <Text style={localStyles.sheetInfoText}>
                  Applied on:{' '}
                  {selectedApplication?.appliedAt
                    ? new Date(selectedApplication.appliedAt).toLocaleString()
                    : 'Not available'}
                </Text>
              </View>

              {selectedApplication?.labour?.bio ? (
                <View style={localStyles.sheetInfoCard}>
                  <Text style={localStyles.sheetSectionTitle}>About</Text>
                  <Text style={localStyles.sheetInfoText}>{selectedApplication.labour.bio}</Text>
                </View>
              ) : null}

              <View style={localStyles.sheetInfoCard}>
                <Text style={localStyles.sheetSectionTitle}>Skills</Text>
                <View style={localStyles.sheetSkillRow}>
                  {(
                    selectedApplication?.labour?.skills?.length
                      ? selectedApplication.labour.skills
                      : [selectedApplication?.job?.skill || 'General']
                  ).map((skill, index) => (
                    <View
                      key={`sheet-${getSkillLabel(skill, selectedApplication?.job?.skill || 'General')}-${index}`}
                      style={localStyles.sheetSkillChip}
                    >
                      <Text style={localStyles.sheetSkillText}>
                        {getSkillLabel(skill, selectedApplication?.job?.skill || 'General')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <Pressable
                style={[
                  localStyles.sheetHireButton,
                  (selectedApplication?.status === 'cancelled' ||
                    hiringApplicationId === selectedApplication?.id) &&
                  localStyles.sheetHireButtonDisabled,
                ]}
                disabled={
                  selectedApplication?.status === 'cancelled' ||
                  hiringApplicationId === selectedApplication?.id
                }
                onPress={() => handleHireLabour(selectedApplication)}
              >
                <Text style={localStyles.sheetHireButtonText}>
                  {selectedApplication?.status === 'cancelled'
                    ? 'Cancelled'
                    : hiringApplicationId === selectedApplication?.id
                      ? 'Cancelling...'
                      : 'Cancel Assignment'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={Boolean(selectedDirectRequest)}
        onRequestClose={closeDirectHireSheet}
      >
        <View style={localStyles.sheetOverlay}>
          <View style={localStyles.sheetCard}>
            <View style={localStyles.sheetHeader}>
              <View>
                <Text style={localStyles.sheetTitle}>Direct Hire Labour</Text>
                <Text style={localStyles.sheetSubtitle}>
                  {selectedDirectRequest?.labour?.name || 'Available labour'}
                </Text>
              </View>
              <Pressable style={localStyles.sheetCloseButton} onPress={closeDirectHireSheet}>
                <Text style={localStyles.sheetCloseText}>Close</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={localStyles.sheetContent}>
              <View style={localStyles.sheetHero}>
                <View style={localStyles.sheetAvatar}>
                  <Text style={localStyles.sheetAvatarText}>
                    {(selectedDirectRequest?.labour?.name || 'L').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={localStyles.sheetName}>{selectedDirectRequest?.labour?.name}</Text>
                  <Text style={localStyles.sheetMeta}>
                    City: {selectedDirectRequest?.city || selectedDirectRequest?.labour?.city || 'Not provided'}
                  </Text>
                  <Text style={localStyles.sheetMeta}>
                    Status: {selectedDirectRequest?.statusLabel || 'Available'}
                  </Text>
                </View>
              </View>

              <View style={localStyles.sheetInfoCard}>
                <Text style={localStyles.sheetSectionTitle}>Contact</Text>
                <Text style={localStyles.sheetInfoText}>
                  Phone: {selectedDirectRequest?.labour?.mobile || 'Not provided'}
                </Text>
                <Text style={localStyles.sheetInfoText}>
                  Address: {selectedDirectRequest?.labour?.address || 'Not provided'}
                </Text>
              </View>

              <View style={localStyles.sheetInfoCard}>
                <Text style={localStyles.sheetSectionTitle}>Work Details</Text>
                <TextInput
                  style={localStyles.input}
                  value={directHireForm.location}
                  onChangeText={(value) => setDirectHireForm((current) => ({ ...current, location: value }))}
                  placeholder="Work location"
                />
                <TextInput
                  style={localStyles.input}
                  value={directHireForm.timing}
                  onChangeText={(value) => setDirectHireForm((current) => ({ ...current, timing: value }))}
                  placeholder="Timing"
                />
                <TextInput
                  style={[localStyles.input, localStyles.multilineInput]}
                  value={directHireForm.notes}
                  onChangeText={(value) => setDirectHireForm((current) => ({ ...current, notes: value }))}
                  placeholder="Notes"
                  multiline
                />
              </View>

              <View style={localStyles.sheetInfoCard}>
                <Text style={localStyles.sheetSectionTitle}>Skills</Text>
                <View style={localStyles.sheetSkillRow}>
                  {(selectedDirectRequest?.labour?.skills?.length
                    ? selectedDirectRequest.labour.skills
                    : ['General']
                  ).map((skill, index) => (
                    <View
                      key={`direct-sheet-${getSkillLabel(skill, 'General')}-${index}`}
                      style={localStyles.sheetSkillChip}
                    >
                      <Text style={localStyles.sheetSkillText}>
                        {getSkillLabel(skill, 'General')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <Pressable
                style={[
                  localStyles.sheetHireButton,
                  directHiringRequestId === selectedDirectRequest?.id &&
                    localStyles.sheetHireButtonDisabled,
                ]}
                disabled={directHiringRequestId === selectedDirectRequest?.id}
                onPress={handleDirectHire}
              >
                <Text style={localStyles.sheetHireButtonText}>
                  {directHiringRequestId === selectedDirectRequest?.id ? 'Hiring...' : 'Confirm Direct Hire'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  applicationMetaCard: {
    backgroundColor: '#f6fbf8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2eee8',
  },
  applicationJobTitle: {
    color: '#17332e',
    fontSize: 12,
    fontWeight: '700',
  },
  applicationJobMeta: {
    color: '#5d726a',
    fontSize: 11,
    marginTop: 4,
  },
  applicantProfileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2eee8',
    gap: 5,
  },
  applicantProfileTitle: {
    color: '#17332e',
    fontSize: 13,
    fontWeight: '700',
  },
  applicantProfileMeta: {
    color: '#4f6760',
    fontSize: 11,
    lineHeight: 16,
  },
  applicantProfileBio: {
    color: '#35554d',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 2,
  },
  applicantSkillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  applicantSkillChip: {
    backgroundColor: '#edf5f1',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  applicantSkillText: {
    color: '#325048',
    fontSize: 10,
    fontWeight: '600',
  },
  viewProfileLink: {
    color: '#0c5a49',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2eee8',
    gap: 6,
  },
  notificationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  notificationStatus: {
    color: '#0c5a49',
    fontSize: 11,
    fontWeight: '700',
  },
  notificationTime: {
    color: '#6b7c74',
    fontSize: 11,
  },
  notificationMessage: {
    color: '#17332e',
    fontSize: 12,
    lineHeight: 18,
  },
  notificationMeta: {
    color: '#4f6760',
    fontSize: 11,
    lineHeight: 16,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 18, 20, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  sheetTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: '#5d726a',
    fontSize: 12,
    marginTop: 4,
  },
  sheetCloseButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sheetCloseText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 12,
  },
  sheetContent: {
    gap: 12,
    paddingBottom: 8,
  },
  sheetHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f6fbf8',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2eee8',
  },
  sheetAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0c5a49',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetAvatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  sheetName: {
    color: '#17332e',
    fontSize: 16,
    fontWeight: '800',
  },
  sheetMeta: {
    color: '#56716a',
    fontSize: 12,
  },
  sheetInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2eee8',
    gap: 6,
  },
  sheetSectionTitle: {
    color: '#17332e',
    fontSize: 13,
    fontWeight: '700',
  },
  sheetInfoText: {
    color: '#4f6760',
    fontSize: 12,
    lineHeight: 18,
  },
  sheetSkillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  sheetSkillChip: {
    backgroundColor: '#edf5f1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  sheetSkillText: {
    color: '#325048',
    fontSize: 11,
    fontWeight: '600',
  },
  sheetHireButton: {
    backgroundColor: '#0c5a49',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  sheetHireButtonDisabled: {
    backgroundColor: '#7b8f88',
  },
  sheetHireButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
};
