// LabourDashboard/index.js
// Main orchestrator — manages all state and wires up the 6 section components.
// Each section owns its own rendering logic and local data helpers.
// CSS is shared via the global styles.js

import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { copy } from '../../constants/copy';
import { labourProfile } from '../../data/dashboardData';
import {
  applyToJob,
  fetchLabourNotifications,
} from '../../services/applicationService';
import {
  fetchMyAvailability,
  markLabourAvailable,
  normalizeDirectHireNotifications,
} from '../../services/directHireService';
import { fetchJobs } from '../../services/jobService';
import {
  createSkill,
  editSkill,
  fetchProfile,
  removeSkill,
  saveProfile,
} from '../../store/profileSlice';
import { mergeUniqueNotifications } from '../../utils/notificationUtils';
import { styles } from './styles';

// ─── Section components ────────────────────────────────────────────────────────
import { HeroSection } from './sections/HeroSection';
import { StatsSection } from './sections/StatsSection';
import { NotificationsSection } from './sections/NotificationsSection';
import {
  ProfileSection,
  EMPTY_SKILL_FORM,
  normalizeSkills,
  buildSkillPayload,
  validateSkillForm,
} from './sections/ProfileSection';
import {
  JobsSection,
  filterJobsByLocation,
  buildLabourLocation,
} from './sections/JobsSection';
import { ReviewsSection } from './sections/ReviewsSection';

// ─── i18n for skill editor ────────────────────────────────────────────────────

const SKILL_EDITOR_COPY = {
  en: {
    addSkill: 'Add skill',
    addCertificate: 'Add certificate',
    skillPlaceholder: 'Type skill',
    certificatePlaceholder: 'Type certificate',
    saveSkills: 'Save skills',
    cancelSkills: 'Cancel',
    removeHint: 'Tap chip to remove',
  },
  hi: {
    addSkill: 'स्किल जोड़ें',
    addCertificate: 'सर्टिफिकेट जोड़ें',
    skillPlaceholder: 'स्किल लिखें',
    certificatePlaceholder: 'सर्टिफिकेट लिखें',
    saveSkills: 'स्किल सेव करें',
    cancelSkills: 'रद्द करें',
    removeHint: 'हटाने के लिए chip दबाएं',
  },
  bho: {
    addSkill: 'Skill जोड़ीं',
    addCertificate: 'Certificate जोड़ीं',
    skillPlaceholder: 'Skill लिखीं',
    certificatePlaceholder: 'Certificate लिखीं',
    saveSkills: 'Skill save करीं',
    cancelSkills: 'Cancel करीं',
    removeHint: 'हटावे खातिर chip दबाईं',
  },
};

// ─── Profile normalisation ─────────────────────────────────────────────────────

const getLabourProfile = (profile, sessionUser, sessionToken) => {
  if (profile?.labour) return profile.labour;
  if (profile && Object.keys(profile).length) return profile;
  if (sessionUser && Object.keys(sessionUser).length) return sessionUser;
  return sessionToken === 'demo-session' ? labourProfile : {};
};

// ─── Date helper ──────────────────────────────────────────────────────────────

const isSameDate = (left, right) => {
  const l = new Date(left);
  const r = new Date(right);
  return (
    l.getFullYear() === r.getFullYear() &&
    l.getMonth() === r.getMonth() &&
    l.getDate() === r.getDate()
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export function LabourDashboard({ language, onLogout, postedJobs, session }) {
  const dispatch = useDispatch();
  const text = copy[language];
  const editorText = SKILL_EDITOR_COPY[language] || SKILL_EDITOR_COPY.en;

  // ── Redux profile ──
  const {
    data: apiProfile,
    status,
    updateStatus,
    skillStatus,
    error,
    skillError,
  } = useSelector((state) => state.profile.labour);

  const profile = apiProfile || session?.user || {};
  const labourAccountProfile = getLabourProfile(
    profile,
    session?.user,
    session?.token
  );

  // ── Profile editing ──
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState(labourAccountProfile);

  // ── Skills editing ──
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skillForm, setSkillForm] = useState(EMPTY_SKILL_FORM);

  // ── Notifications / availability ──
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [availabilityRequest, setAvailabilityRequest] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // ── Jobs ──
  const [jobs, setJobs] = useState(postedJobs || []);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');
  const [appliedJobs, setAppliedJobs] = useState([]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────────────────────

  // Fetch Redux profile
  useEffect(() => {
    if (
      session?.token &&
      session.token !== 'demo-session' &&
      session?.role === 'labour' &&
      status === 'idle'
    ) {
      dispatch(fetchProfile('labour'));
    }
  }, [dispatch, session?.role, session?.token, status]);

  // Sync edit form when profile changes and editor is open
  useEffect(() => {
    if (isEditingProfile) setEditedProfile(labourAccountProfile);
  }, [isEditingProfile, labourAccountProfile]);

  // Fetch jobs (polling)
  useEffect(() => {
    let isMounted = true;
    const shouldUseApi =
      Boolean(session?.token) && session.token !== 'demo-session';

    const loadJobs = async () => {
      if (!shouldUseApi) {
        setJobs(postedJobs || []);
        setJobsError('');
        setJobsLoading(false);
        return;
      }

      setJobsLoading(true);
      setJobsError('');

      try {
        const fetched = await fetchJobs(session.token);
        if (isMounted) setJobs(fetched);
      } catch (err) {
        if (isMounted) {
          setJobsError(err.message || 'Failed to load jobs.');
          setJobs([]);
        }
      } finally {
        if (isMounted) setJobsLoading(false);
      }
    };

    loadJobs();
    const intervalId = setInterval(loadJobs, 80000);
    return () => { isMounted = false; clearInterval(intervalId); };
  }, [postedJobs, session?.token]);

  // Fetch notifications + availability (polling)
  useEffect(() => {
    let isMounted = true;
    const shouldUse =
      Boolean(session?.token) &&
      session.token !== 'demo-session' &&
      session?.role === 'labour';

    if (!shouldUse) {
      setNotifications([]);
      return;
    }

    const loadNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const [fetched, myAvailability] = await Promise.all([
          fetchLabourNotifications(session.token),
          fetchMyAvailability(session.token).catch(() => null),
        ]);

        const directNotifications = myAvailability
          ? normalizeDirectHireNotifications(myAvailability, 'labour')
          : [];

        if (isMounted) {
          setAvailabilityRequest(myAvailability);
          setNotifications(
            mergeUniqueNotifications(fetched, directNotifications)
          );
          setAppliedJobs(
            fetched
              .filter(
                (n) =>
                  n.jobId &&
                  ['applied', 'hired', 'accepted'].includes(n.status) &&
                  isSameDate(n.timestamp, new Date())
              )
              .map((n) => n.jobId)
          );
        }
      } catch (err) {
        if (isMounted) {
          setNotifications((current) =>
            current.length
              ? current
              : [
                  {
                    id: 'notification-error',
                    type: 'error',
                    message: err.message || 'Failed to load notifications.',
                    timestamp: new Date().toISOString(),
                  },
                ]
          );
        }
      } finally {
        if (isMounted) setNotificationsLoading(false);
      }
    };

    loadNotifications();
    const intervalId = setInterval(loadNotifications, 800000);
    return () => { isMounted = false; clearInterval(intervalId); };
  }, [session?.role, session?.token]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Derived data
  // ─────────────────────────────────────────────────────────────────────────────

  const labourLocation = useMemo(
    () => buildLabourLocation(labourAccountProfile, session),
    [labourAccountProfile, session]
  );

  const matchedJobs = useMemo(
    () => filterJobsByLocation(jobs, labourLocation),
    [jobs, labourLocation]
  );

  const normalizedSkills = useMemo(
    () => normalizeSkills(labourAccountProfile?.skills),
    [labourAccountProfile?.skills]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers — Profile
  // ─────────────────────────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    const result = await dispatch(
      saveProfile({
        role: 'labour',
        name: editedProfile.name,
        mobile: editedProfile.mobile || editedProfile.phone,
        address: editedProfile.address || editedProfile.location,
        bio: editedProfile.bio || editedProfile.title || '',
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

  const handleCancelEdit = () => {
    setEditedProfile(labourAccountProfile);
    setIsEditingProfile(false);
  };

  const handleProfileFieldChange = (field, value) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers — Skills
  // ─────────────────────────────────────────────────────────────────────────────

  const handleStartSkillsEdit = () => {
    setSkillForm(EMPTY_SKILL_FORM);
    setIsEditingSkills(true);
  };

  const handleEditSkill = (skill) => {
    setSkillForm({
      skillId: skill._id,
      name: skill.name || '',
      experienceYears: skill.experienceYears ? String(skill.experienceYears) : '',
      level: skill.level || '',
      notes: skill.notes || '',
    });
    setIsEditingSkills(true);
  };

  const handleCancelSkillsEdit = () => {
    setSkillForm(EMPTY_SKILL_FORM);
    setIsEditingSkills(false);
  };

  const handleSkillFieldChange = (field, value) => {
    setSkillForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveSkill = async () => {
    const validationError = validateSkillForm(skillForm);
    if (validationError) {
      Alert.alert('Error', validationError);
      return;
    }

    const payload = buildSkillPayload(skillForm);
    const action = skillForm.skillId
      ? editSkill({ skillId: skillForm.skillId, ...payload })
      : createSkill(payload);

    const result = await dispatch(action);

    if (
      createSkill.fulfilled.match(result) ||
      editSkill.fulfilled.match(result)
    ) {
      handleCancelSkillsEdit();
      Alert.alert(text.profileUpdatedTitle, text.profileUpdatedMessage);
      return;
    }
    Alert.alert('Error', result.payload || 'Failed to save skill.');
  };

  const handleDeleteSkill = async (skillId) => {
    const result = await dispatch(removeSkill(skillId));

    if (removeSkill.fulfilled.match(result)) {
      Alert.alert('Success', 'Skill deleted successfully');
      if (skillForm.skillId === skillId) handleCancelSkillsEdit();
      return;
    }
    Alert.alert('Error', result.payload || 'Failed to delete skill.');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers — Jobs / Apply
  // ─────────────────────────────────────────────────────────────────────────────

  const handleApplyForJob = (job) => {
    if (!session?.token || session.token === 'demo-session') {
      Alert.alert(
        'Login required',
        'Please login with a labour account to apply for jobs.'
      );
      return;
    }

    if (appliedJobs.includes(job.id)) {
      Alert.alert(
        text.alreadyAppliedTitle,
        'Aaj aap is job par already apply kar chuke hain.'
      );
      return;
    }

    const confirmApply = async () => {
      try {
        setAppliedJobs((prev) => [...prev, job.id]);
        await applyToJob(job.id, session.token);

        const [fetched, myAvailability] = await Promise.all([
          fetchLabourNotifications(session.token),
          fetchMyAvailability(session.token).catch(() => null),
        ]);
        const directNotifications = myAvailability
          ? normalizeDirectHireNotifications(myAvailability, 'labour')
          : [];
        setAvailabilityRequest(myAvailability);
        setNotifications(mergeUniqueNotifications(fetched, directNotifications));

        Alert.alert(text.applicationSuccessTitle, text.applicationSuccessMessage);
      } catch (err) {
        setAppliedJobs((prev) => prev.filter((id) => id !== job.id));
        Alert.alert('Error', 'Failed to submit application. Please try again.');
      }
    };

    if (Platform.OS === 'web') {
      confirmApply();
      return;
    }

    Alert.alert(
      text.applyConfirmTitle,
      text.applyConfirmMessage.replace('{job}', job.title),
      [
        { text: text.cancel, style: 'cancel' },
        { text: text.apply, onPress: confirmApply },
      ]
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers — Availability
  // ─────────────────────────────────────────────────────────────────────────────

  const handleTodayWork = async () => {
    if (!session?.token || session.token === 'demo-session') {
      Alert.alert('Login required', 'Please login with a labour account first.');
      return;
    }

    const markAvailable = async () => {
      try {
        setAvailabilityLoading(true);
        const request = await markLabourAvailable(session.token);
        const directNotifications = normalizeDirectHireNotifications(
          request,
          'labour'
        );
        setAvailabilityRequest(request);
        setNotifications((prev) =>
          mergeUniqueNotifications(directNotifications, prev)
        );
        Alert.alert(
          'Available',
          request.notification || 'You are now available for direct hire.'
        );
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to mark you available.');
      } finally {
        setAvailabilityLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      markAvailable();
      return;
    }

    Alert.alert(
      'Mark Available',
      'Customers will be able to directly hire you for urgent work.',
      [
        { text: text.cancel, style: 'cancel' },
        { text: text.confirm, onPress: markAvailable },
      ]
    );
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
        labourAccountProfile={labourAccountProfile}
        session={session}
        onLogout={onLogout}
      />

      {/* ── Section 2: Stats + Today's Work ── */}
      <StatsSection
        text={text}
        availabilityRequest={availabilityRequest}
        availabilityLoading={availabilityLoading}
        onTodayWork={handleTodayWork}
      />

      {/* ── Section 3: Notifications ── */}
      <NotificationsSection
        text={text}
        notifications={notifications}
        notificationsLoading={notificationsLoading}
      />

      {/* ── Section 4: Profile card + Skills + Preferences ── */}
      <ProfileSection
        text={text}
        editorText={editorText}
        labourAccountProfile={labourAccountProfile}
        editedProfile={editedProfile}
        isEditingProfile={isEditingProfile}
        isEditingSkills={isEditingSkills}
        skillForm={skillForm}
        normalizedSkills={normalizedSkills}
        status={status}
        updateStatus={updateStatus}
        skillStatus={skillStatus}
        skillError={skillError}
        error={error}
        onToggleEdit={() => setIsEditingProfile(true)}
        onCancelEdit={handleCancelEdit}
        onProfileFieldChange={handleProfileFieldChange}
        onSaveProfile={handleSaveProfile}
        onStartSkillsEdit={handleStartSkillsEdit}
        onCancelSkillsEdit={handleCancelSkillsEdit}
        onSkillFieldChange={handleSkillFieldChange}
        onSaveSkill={handleSaveSkill}
        onEditSkill={handleEditSkill}
        onDeleteSkill={handleDeleteSkill}
      />

      {/* ── Section 5: Available Jobs ── */}
      <JobsSection
        text={text}
        matchedJobs={matchedJobs}
        appliedJobs={appliedJobs}
        jobsLoading={jobsLoading}
        jobsError={jobsError}
        labourLocation={labourLocation}
        onApplyForJob={handleApplyForJob}
      />

      {/* ── Section 6: Reviews + Work History + Info + Messages ── */}
      <ReviewsSection text={text} />
    </ScrollView>
  );
}
