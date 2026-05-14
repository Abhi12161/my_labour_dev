// CustomerDashboard/index.js
// Main orchestrator — manages all state and wires up the 6 section components.
// Each section owns its own rendering logic and local data helpers.
// CSS is shared via sections/sharedStyles.js

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { InfoPanel } from '../../components/InfoPanel';
import { JobPostModal } from '../../components/JobPostModal';
import { copy } from '../../constants/copy';
import { jobPostOptions } from '../../data/dashboardData';
import {
  fetchCustomerApplications,
  fetchCustomerNotifications,
  hireApplication,
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

// ─── Section components ────────────────────────────────────────────────────────
import { HeroSection } from './sections/HeroSection';
import {
  ProfileSection,
  buildInitialEditedProfile,
  buildSavePayload,
} from './sections/ProfileSection';
import { StatsSection } from './sections/StatsSection';
import {
  LabourSection,
  mapDirectRequestToLabourCard,
} from './sections/LabourSection';
import { NotificationsSection } from './sections/NotificationsSection';
import {
  ApplicationsSection,
  dedupeApplicationsByMobile,
} from './sections/ApplicationsSection';

// ─── Shared location helpers ──────────────────────────────────────────────────

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
  if (!normalizedJobLocation || !customerTokens.length) return false;
  return customerTokens.some((token) => normalizedJobLocation.includes(token));
};

// ─── Profile normalisation ────────────────────────────────────────────────────

const getCustomerProfile = (profile, sessionUser) => {
  if (profile?.customer) return profile.customer;
  if (profile && Object.keys(profile).length) return profile;
  return sessionUser || {};
};

// ─── Filter initial state ─────────────────────────────────────────────────────

const INITIAL_FILTERS = {
  search: '',
  district: 'All',
  category: 'All',
  availability: 'All',
  rating: 'All',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CustomerDashboard({
  language,
  onLogout,
  onPostJob,
  postedJobs,
  session,
}) {
  const dispatch = useDispatch();
  const text = copy[language];

  // ── Redux profile ──
  const { data: apiProfile, status, updateStatus, error } = useSelector(
    (state) => state.profile.customer
  );
  const profile = apiProfile || session?.user || {};
  const customerProfile = getCustomerProfile(profile, session?.user);

  // ── Filter state ──
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const deferredSearch = useDeferredValue(filters.search);

  // ── Job modal ──
  const [jobModalVisible, setJobModalVisible] = useState(false);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  // ── Jobs ──
  const [jobs, setJobs] = useState(postedJobs);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');

  // ── Applications ──
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState('');
  const [hiringApplicationId, setHiringApplicationId] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);

  // ── Profile editing ──
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState(customerProfile);

  // ── Notifications ──
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // ── Direct hire / available requests ──
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────────────────────

  // Fetch Redux profile
  useEffect(() => {
    if (
      session?.token &&
      session.token !== 'demo-session' &&
      session?.role === 'customer' &&
      status === 'idle'
    ) {
      dispatch(fetchProfile('customer'));
    }
  }, [dispatch, session?.role, session?.token, status]);

  // Fetch jobs
  useEffect(() => {
    let isMounted = true;
    const token =
      session?.token && session.token !== 'demo-session'
        ? session.token
        : undefined;

    const loadJobs = async () => {
      setJobsLoading(true);
      setJobsError('');
      try {
        const fetched = await fetchJobs(token);
        if (isMounted) setJobs(fetched);
      } catch (err) {
        if (isMounted) setJobsError(err.message || 'Failed to load jobs.');
      } finally {
        if (isMounted) setJobsLoading(false);
      }
    };

    loadJobs();
    return () => { isMounted = false; };
  }, [session?.token]);

  // Fetch applications
  useEffect(() => {
    let isMounted = true;
    const shouldUse =
      Boolean(session?.token) &&
      session.token !== 'demo-session' &&
      session?.role === 'customer';

    if (!shouldUse) {
      setApplications([]);
      setApplicationsError('');
      setApplicationsLoading(false);
      return;
    }

    const loadApplications = async () => {
      setApplicationsLoading(true);
      setApplicationsError('');
      try {
        const fetched = await fetchCustomerApplications(session.token);
        if (isMounted) setApplications(dedupeApplicationsByMobile(fetched));
      } catch (err) {
        if (isMounted)
          setApplicationsError(err.message || 'Failed to load applied labour.');
      } finally {
        if (isMounted) setApplicationsLoading(false);
      }
    };

    loadApplications();
    return () => { isMounted = false; };
  }, [session?.role, session?.token]);

  // Sync edit form when profile changes and editor is open
  useEffect(() => {
    if (isEditingProfile) setEditedProfile(customerProfile);
  }, [customerProfile, isEditingProfile]);

  // Fetch notifications (polling)
  useEffect(() => {
    let isMounted = true;
    const shouldUse =
      Boolean(session?.token) &&
      session.token !== 'demo-session' &&
      session?.role === 'customer';

    if (!shouldUse) {
      setNotifications([]);
      setNotificationsLoading(false);
      return;
    }

    const loadNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const fetched = await fetchCustomerNotifications(session.token);
        if (isMounted) setNotifications(fetched);
      } catch (err) {
        if (isMounted)
          setNotifications([
            {
              id: 'customer-notification-error',
              status: 'error',
              statusLabel: 'Error',
              message: err.message || 'Failed to load notifications.',
              timestamp: new Date().toISOString(),
              actorName: 'System',
            },
          ]);
      } finally {
        if (isMounted) setNotificationsLoading(false);
      }
    };

    loadNotifications();
    const intervalId = setInterval(loadNotifications, 8000);
    return () => { isMounted = false; clearInterval(intervalId); };
  }, [session?.role, session?.token]);

  // Fetch available labour requests (polling)
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
          ? await fetchNearbyLabourRequests(session.token, city)
          : await fetchAvailableLabourRequests(session.token);
        if (isMounted) setAvailableRequests(requests);
      } catch (err) {
        if (isMounted)
          setAvailableRequestsError(err.message || 'Failed to load available labour.');
      } finally {
        if (isMounted) setAvailableRequestsLoading(false);
      }
    };

    loadAvailableRequests();
    const intervalId = setInterval(loadAvailableRequests, 8000);
    return () => { isMounted = false; clearInterval(intervalId); };
  }, [customerProfile?.city, session?.role, session?.token]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Derived data
  // ─────────────────────────────────────────────────────────────────────────────

  const filteredLabours = useMemo(
    () =>
      filterJobs(availableRequests.map(mapDirectRequestToLabourCard), {
        ...filters,
        search: deferredSearch,
      }),
    [availableRequests, deferredSearch, filters]
  );

  const customerLocation =
    customerProfile?.address ||
    customerProfile?.city ||
    session?.user?.address ||
    session?.user?.city ||
    '';

  const matchedJobs = useMemo(
    () =>
      jobs.filter((job) =>
        isMatchingLocation(
          `${job.location || ''}, ${job.city || ''}`,
          customerLocation
        )
      ),
    [customerLocation, jobs]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers — Filters
  // ─────────────────────────────────────────────────────────────────────────────

  const handleChangeFilter = (field, value) => {
    startTransition(() => {
      setFilters((current) => ({ ...current, [field]: value }));
    });
  };

  const handleClearFilters = () => {
    startTransition(() => setFilters(INITIAL_FILTERS));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers — Job Posting
  // ─────────────────────────────────────────────────────────────────────────────

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
    };

    try {
      const createdJob = await createJob(payload, token);
      const refreshedJobs = await fetchJobs(token);
      setJobs(refreshedJobs.length ? refreshedJobs : [createdJob, ...jobs]);
      if (!token) onPostJob(createdJob);
      setJobModalVisible(false);
      Alert.alert(text.jobPostedTitle, text.jobPostedBody);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to post job.');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers — Profile
  // ─────────────────────────────────────────────────────────────────────────────

  const handleToggleProfileEditor = () => {
    if (!isEditingProfile) setEditedProfile(customerProfile);
    setIsEditingProfile((current) => !current);
  };

  const handleProfileFieldChange = (field, value) => {
    setEditedProfile((current) => ({ ...current, [field]: value }));
  };

  const handleSaveProfile = async () => {
    const result = await dispatch(
      saveProfile(buildSavePayload(editedProfile, customerProfile))
    );
    if (saveProfile.fulfilled.match(result)) {
      setIsEditingProfile(false);
      Alert.alert(text.profileUpdatedTitle, text.profileUpdatedMessage);
      return;
    }
    Alert.alert('Error', result.payload || 'Failed to update profile.');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers — Applications / Hire
  // ─────────────────────────────────────────────────────────────────────────────

  const handleHireLabour = async (application) => {
    try {
      setHiringApplicationId(application.id);
      const updated = await hireApplication(application.id, session.token);
      const refreshedNotifications = await fetchCustomerNotifications(session.token);
      setApplications((current) =>
        dedupeApplicationsByMobile(
          current.map((item) => (item.id === updated.id ? updated : item))
        )
      );
      setNotifications(refreshedNotifications);
      Alert.alert('Success', `${updated.labour.name} has been hired successfully.`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to hire labour.');
    } finally {
      setHiringApplicationId('');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers — Direct Hire
  // ─────────────────────────────────────────────────────────────────────────────

  const handleOpenDirectHire = (request) => {
    setSelectedDirectRequest(request);
    setDirectHireForm({
      location: customerProfile?.address || customerProfile?.city || '',
      timing: '',
      notes: '',
    });
  };

  const handleDirectHireFieldChange = (field, value) => {
    setDirectHireForm((current) => ({ ...current, [field]: value }));
  };

  const handleCloseDirectHire = () => {
    setSelectedDirectRequest(null);
    setDirectHireForm({ location: '', timing: '', notes: '' });
    setDirectHiringRequestId('');
  };

  const handleConfirmDirectHire = async () => {
    if (!selectedDirectRequest) return;
    if (!directHireForm.location.trim()) {
      Alert.alert('Error', 'Location is required for direct hire.');
      return;
    }
    try {
      setDirectHiringRequestId(selectedDirectRequest.id);
      const hired = await directHireLabour(
        selectedDirectRequest.id,
        directHireForm,
        session.token
      );
      const directNotifications = normalizeDirectHireNotifications(hired, 'customer');
      setAvailableRequests((current) =>
        current.filter((r) => r.id !== hired.id)
      );
      setNotifications((current) =>
        mergeUniqueNotifications(directNotifications, current)
      );
      handleCloseDirectHire();
      Alert.alert('Success', `${hired.labour.name} has been directly hired.`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to directly hire labour.');
    } finally {
      setDirectHiringRequestId('');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Section 1: Hero ── */}
      <HeroSection
        text={text}
        customerProfile={customerProfile}
        session={session}
        onLogout={onLogout}
      />

      {/* ── Section 2: Profile editor ── */}
      <ProfileSection
        text={text}
        customerProfile={customerProfile}
        editedProfile={editedProfile}
        isEditingProfile={isEditingProfile}
        status={status}
        updateStatus={updateStatus}
        error={error}
        onToggleEdit={handleToggleProfileEditor}
        onFieldChange={handleProfileFieldChange}
        onSave={handleSaveProfile}
      />

      {/* ── Section 3: Stats + Post Job + Popular Skills ── */}
      <StatsSection
        text={text}
        onOpenModal={() => setJobModalVisible(true)}
      />

      {/* ── Section 4: Available Labour + Jobs + Direct Hire modal ── */}
      <LabourSection
        text={text}
        filters={filters}
        filteredLabours={filteredLabours}
        availableRequests={availableRequests}
        availableRequestsLoading={availableRequestsLoading}
        availableRequestsError={availableRequestsError}
        matchedJobs={matchedJobs}
        jobsLoading={jobsLoading}
        jobsError={jobsError}
        customerLocation={customerLocation}
        selectedDirectRequest={selectedDirectRequest}
        directHireForm={directHireForm}
        directHiringRequestId={directHiringRequestId}
        onChangeFilter={handleChangeFilter}
        onClearFilters={handleClearFilters}
        onOpenDirectHire={handleOpenDirectHire}
        onDirectHireFieldChange={handleDirectHireFieldChange}
        onConfirmDirectHire={handleConfirmDirectHire}
        onCloseDirectHire={handleCloseDirectHire}
      />

      {/* ── Section 5: Notifications ── */}
      <NotificationsSection
        text={text}
        notifications={notifications}
        notificationsLoading={notificationsLoading}
      />

      {/* ── Section 6: Applications + Hire modal ── */}
      <ApplicationsSection
        text={text}
        applications={applications}
        applicationsLoading={applicationsLoading}
        applicationsError={applicationsError}
        hiringApplicationId={hiringApplicationId}
        selectedApplication={selectedApplication}
        onSelectApplication={setSelectedApplication}
        onCloseSheet={() => setSelectedApplication(null)}
        onHireLabour={handleHireLabour}
      />

      {/* ── Info panel + Messages (unchanged layout items) ── */}
      <InfoPanel title={text.notifyTitle} body={text.notifyCustomer} />

      {/* ── Job Post Modal (global, managed here) ── */}
      <JobPostModal
        copy={text}
        options={jobPostOptions}
        visible={jobModalVisible}
        onClose={() => setJobModalVisible(false)}
        onSubmit={handlePostJob}
        submitting={isSubmittingJob}
      />
    </ScrollView>
  );
}
