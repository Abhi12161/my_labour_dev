import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { InfoPanel } from '../../components/InfoPanel';
import { JobCard } from '../../components/JobCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { StatCard } from '../../components/StatCard';
import { copy } from '../../constants/copy';
import {
  labourMessages,
  labourOverviewStats,
  labourProfile,
  labourReviews,
  labourWorkHistory,
} from '../../data/dashboardData';
import {
  saveJobApplication,
  saveTodayWorkRequest,
} from '../../services/http';
import {
  createSkill,
  editSkill,
  fetchProfile,
  removeSkill,
  saveProfile,
} from '../../store/profileSlice';
import { styles } from './styles';

const skillEditorCopy = {
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
    addSkill: 'à¤¸à¥à¤•à¤¿à¤² à¤œà¥‹à¤¡à¤¼à¥‡à¤‚',
    addCertificate: 'à¤¸à¤°à¥à¤Ÿà¤¿à¤«à¤¿à¤•à¥‡à¤Ÿ à¤œà¥‹à¤¡à¤¼à¥‡à¤‚',
    skillPlaceholder: 'à¤¸à¥à¤•à¤¿à¤² à¤²à¤¿à¤–à¥‡à¤‚',
    certificatePlaceholder: 'à¤¸à¤°à¥à¤Ÿà¤¿à¤«à¤¿à¤•à¥‡à¤Ÿ à¤²à¤¿à¤–à¥‡à¤‚',
    saveSkills: 'à¤¸à¥à¤•à¤¿à¤² à¤¸à¥‡à¤µ à¤•à¤°à¥‡à¤‚',
    cancelSkills: 'à¤°à¤¦à¥à¤¦ à¤•à¤°à¥‡à¤‚',
    removeHint: 'à¤¹à¤Ÿà¤¾à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤šà¤¿à¤ª à¤¦à¤¬à¤¾à¤à¤‚',
  },
  bho: {
    addSkill: 'Skill à¤œà¥‹à¤¡à¤¼à¥€à¤‚',
    addCertificate: 'Certificate à¤œà¥‹à¤¡à¤¼à¥€à¤‚',
    skillPlaceholder: 'Skill à¤²à¤¿à¤–à¥€à¤‚',
    certificatePlaceholder: 'Certificate à¤²à¤¿à¤–à¥€à¤‚',
    saveSkills: 'Skill save à¤•à¤°à¥€à¤‚',
    cancelSkills: 'Cancel à¤•à¤°à¥€à¤‚',
    removeHint: 'à¤¹à¤Ÿà¤¾à¤µà¥‡ à¤–à¤¾à¤¤à¤¿à¤° chip à¤¦à¤¬à¤¾à¤ˆà¤‚',
  },
};

export function LabourDashboard({
  language,
  onLogout,
  postedJobs,
  session,
}) {
  const dispatch = useDispatch();
  const text = copy[language];
  const editorText = skillEditorCopy[language] || skillEditorCopy.en;
  const { data: apiProfile, status, updateStatus, skillStatus, error, skillError } = useSelector(
    (state) => state.profile.labour
  );
  const profile = apiProfile || labourProfile;
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [notifications, setNotifications] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [skillForm, setSkillForm] = useState({
    skillId: null,
    name: '',
    experienceYears: '',
    level: '',
    notes: '',
  });

  useEffect(() => {
    if (
      session?.token &&
      session?.token !== 'demo-session' &&
      session?.role === 'labour' &&
      status === 'idle'
    ) {
      dispatch(fetchProfile('labour'));
    }
  }, [dispatch, session?.role, session?.token, status]);

  useEffect(() => {
    if (isEditingProfile) {
      setEditedProfile(profile);
    }
  }, [isEditingProfile, profile]);

  const normalizedSkills = Array.isArray(profile?.labour?.skills)
    ? profile.labour.skills.map((skill) =>
        typeof skill === 'string'
          ? {
              _id: skill,
              name: skill,
              experienceYears: '',
              level: '',
              notes: '',
            }
          : skill
      )
    : [];

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
    setEditedProfile(profile);
    setIsEditingProfile(false);
  };

  const handleStartSkillsEdit = () => {
    setSkillForm({
      skillId: null,
      name: '',
      experienceYears: '',
      level: '',
      notes: '',
    });
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
    setSkillForm({
      skillId: null,
      name: '',
      experienceYears: '',
      level: '',
      notes: '',
    });
    setIsEditingSkills(false);
  };

  const handleSaveSkills = async () => {
    if (!skillForm.name.trim()) {
      Alert.alert('Error', 'Skill name is required.');
      return;
    }

    if (!skillForm.experienceYears.trim() || Number.isNaN(Number(skillForm.experienceYears))) {
      Alert.alert('Error', 'Experience years must be a number.');
      return;
    }

    if (!skillForm.level.trim()) {
      Alert.alert('Error', 'Skill level is required.');
      return;
    }

    const action = skillForm.skillId
      ? editSkill({
          skillId: skillForm.skillId,
          name: skillForm.name.trim(),
          experienceYears: skillForm.experienceYears,
          level: skillForm.level.trim(),
          notes: skillForm.notes.trim(),
        })
      : createSkill({
          name: skillForm.name.trim(),
          experienceYears: skillForm.experienceYears,
          level: skillForm.level.trim(),
          notes: skillForm.notes.trim(),
        });

    const result = await dispatch(action);

    if (createSkill.fulfilled.match(result) || editSkill.fulfilled.match(result)) {
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
      if (skillForm.skillId === skillId) {
        handleCancelSkillsEdit();
      }
      return;
    }

    Alert.alert('Error', result.payload || 'Failed to delete skill.');
  };

  const handleApplyForJob = (job) => {
    if (appliedJobs.includes(job.id)) {
      Alert.alert(text.alreadyAppliedTitle, text.alreadyAppliedMessage);
      return;
    }

    Alert.alert(
      text.applyConfirmTitle,
      text.applyConfirmMessage.replace('{job}', job.title),
      [
        { text: text.cancel, style: 'cancel' },
        {
          text: text.apply,
          onPress: async () => {
            try {
              setAppliedJobs((prev) => [...prev, job.id]);

              setNotifications((prev) => [
                {
                  id: Date.now(),
                  type: 'application',
                  message: text.applicationSubmitted.replace('{job}', job.title),
                  timestamp: new Date().toISOString(),
                },
                ...prev,
              ]);

              await saveJobApplication(job, session.user);
              Alert.alert(text.applicationSuccessTitle, text.applicationSuccessMessage);
            } catch {
              setAppliedJobs((prev) => prev.filter((id) => id !== job.id));
              Alert.alert('Error', 'Failed to submit application. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleTodayWork = async () => {
    Alert.alert(text.todayWorkConfirmTitle, text.todayWorkConfirmMessage, [
      { text: text.cancel, style: 'cancel' },
      {
        text: text.confirm,
        onPress: async () => {
          try {
            setNotifications((prev) => [
              {
                id: Date.now(),
                type: 'today_work',
                message: text.todayWorkNotification,
                timestamp: new Date().toISOString(),
              },
              ...prev,
            ]);

            await saveTodayWorkRequest(session.user);
            Alert.alert(text.todayWorkSuccessTitle, text.todayWorkSuccessMessage);
          } catch {
            Alert.alert('Error', 'Failed to submit today work request. Please try again.');
          }
        },
      },
    ]);
  };

  const statStyles = {
    matches: {
      icon: 'people',
      gradient: ['#0f766e', '#115e59'],
      trend: 'up',
    },
    views: {
      icon: 'eye',
      gradient: ['#1d9bf0', '#2563eb'],
      trend: 'up',
    },
    completed: {
      icon: 'briefcase',
      gradient: ['#6d5efc', '#7c3aed'],
      trend: 'up',
    },
    response: {
      icon: 'bar-chart',
      gradient: ['#f0a43a', '#f97316'],
      trend: 'down',
    },
  };
 console.log('LabourDashboard render', { profile, status, error });
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroTopActions}>
            <View style={styles.badgeWrap}>
              <Ionicons name="home" size={11} color="#ffffff" />
              <Text style={styles.heroBadge}>{text.labourDashboardBadge}</Text>
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
            <Text style={styles.heroName}>{profile?.labour?.name || session?.user?.name || 'User'}</Text>

            <Text style={styles.heroSubtitle}>{text.customerSubtitle}</Text>
          </View>

          <View style={styles.heroAvatarWrap}>
            <View style={styles.heroAvatarCircle}>
              <Text style={styles.heroAvatarLetter}>
                {(profile?.labour?.name || session?.user?.name || 'A').charAt(0).toUpperCase()}
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
            <Text style={styles.contactText}>{profile?.labour?.mobile || session?.user?.mobile}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={12} color="#ffffff" />
            <Text style={styles.contactText}>{profile.labour?.address}</Text>
          </View>
          
        </View>
      </View>

      {status === 'loading' ? (
        <View style={styles.detailCard}>
          <Text style={styles.detailCardTitle}>Loading profile...</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.detailCard}>
          <Text style={styles.detailCardTitle}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.statsGrid}>
        {labourOverviewStats.map((item) => (
          <StatCard
            key={item.id}
            label={text[item.labelKey]}
            value={item.value}
            icon={statStyles[item.id]?.icon}
            trend={statStyles[item.id]?.trend}
            gradient={statStyles[item.id]?.gradient}
            onPress={() => {}}
            compact
          />
        ))}
      </View>

      <View style={styles.todayWorkCard}>
        <View style={styles.todayLeft}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>ðŸ‘·</Text>
          </View>

          <View style={styles.textWrap}>
            <Text style={styles.todayTitle}>{text.todayWorkButton}</Text>
            <Text style={styles.todaySubtitle}>
              View and manage all your work requests and bookings.
            </Text>
          </View>
        </View>

        <PrimaryButton label="Apply for Job" onPress={handleTodayWork} />
      </View>

      {notifications.length > 0 && (
        <View style={styles.detailCard}>
          <View style={styles.detailCardHeader}>
            <View style={styles.detailCardTitleWrap}>
              <Ionicons name="notifications-outline" size={13} color="#0c5a49" />
              <Text style={styles.detailCardTitle}>{text.notificationsTitle}</Text>
            </View>
          </View>

          <View style={styles.notificationList}>
            {notifications.slice(0, 3).map((notification) => (
              <View key={notification.id} style={styles.notificationCard}>
                <View style={styles.notificationTopRow}>
                  <View style={styles.notificationIconWrap}>
                    <Ionicons
                      name={notification.type === 'today_work' ? 'flash-outline' : 'document-text-outline'}
                      size={12}
                      color="#0c5a49"
                    />
                  </View>
                  <Text style={styles.notificationTime}>
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </Text>
                </View>

                <Text style={styles.notificationText}>{notification.message}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.profileSectionWrap}>
        <LinearGradient colors={['#0e5a49', '#11463d']} style={styles.profileCard}>
          {!isEditingProfile ? (
            <>
              <View style={styles.profileHeaderRow}>
                <View style={styles.profileHeaderBadge}>
                  <Ionicons name="chatbubble-ellipses-outline" size={12} color="#ffffff" />
                  <Text style={styles.profileHeaderBadgeText}>Labour profile</Text>
                </View>

                <Pressable style={styles.profileHeaderEditPill} onPress={() => setIsEditingProfile(true)}>
                  <Ionicons name="create-outline" size={10} color="#ffffff" />
                  <Text style={styles.profileHeaderEditPillText}>Edit Profile</Text>
                </Pressable>
              </View>

              <View style={styles.profileContentRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>{profile.labour?.name?.charAt(0) || 'A'}</Text>
                </View>

                <View style={styles.profileInfoBlock}>
                  <Text style={styles.profileName}>{profile.labour?.name}</Text>
                  <Text style={styles.profileWork}>{profile.labour?.bio || profile.labour?.title}</Text>

                  <View style={styles.profileMetaRow}>
                    <View style={styles.profileMetaItem}>
                      <Ionicons name="location" size={10} color="#ff8d63" />
                      <Text style={styles.profileMetaText}>{profile.labour?.address || profile.labour?.location}</Text>
                    </View>

                    <View style={styles.profileMetaItem}>
                      <Ionicons name="call" size={10} color="#ffffff" />
                      <Text style={styles.profileMetaText}>{profile.labour?.mobile || profile.labour?.phone}</Text>
                    </View>

                    <View style={styles.profileMetaItem}>
                      <Ionicons name="star" size={10} color="#f7c948" />
                      <Text style={styles.profileMetaText}>
                        {profile.labour?.rating} ({profile.labour?.reviews})
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.profileActionRow}>
                <Pressable style={styles.profileActionLight} onPress={handleStartSkillsEdit}>
                  <Ionicons name="briefcase-outline" size={13} color="#0e5a49" />
                  <Text style={styles.profileActionLightText}>{text.updateSkills}</Text>
                </Pressable>

                <Pressable style={styles.profileActionDark} onPress={() => setIsEditingProfile(true)}>
                  <Ionicons name="create-outline" size={13} color="#ffffff" />
                  <Text style={styles.profileActionDarkText}>{text.editProfile}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View style={styles.profileHeaderRow}>
                <View style={styles.profileHeaderBadge}>
                  <Ionicons name="create-outline" size={12} color="#ffffff" />
                  <Text style={styles.profileHeaderBadgeText}>Edit Profile</Text>
                </View>

                <Pressable style={styles.profileHeaderEditPill} onPress={handleCancelEdit}>
                  <Text style={styles.profileHeaderEditPillText}>Close</Text>
                </Pressable>
              </View>

              <View style={styles.editForm}>
                <TextInput
                  style={styles.editInput}
                  value={editedProfile.name}
                  onChangeText={(value) => setEditedProfile((prev) => ({ ...prev, name: value }))}
                  placeholder="Name"
                  placeholderTextColor="#b8d1cb"
                />
                <TextInput
                  style={styles.editInput}
                  value={editedProfile.address || editedProfile.location}
                  onChangeText={(value) => setEditedProfile((prev) => ({ ...prev, address: value }))}
                  placeholder="Address"
                  placeholderTextColor="#b8d1cb"
                />
                <TextInput
                  style={styles.editInput}
                  value={editedProfile.mobile || editedProfile.phone}
                  onChangeText={(value) => setEditedProfile((prev) => ({ ...prev, mobile: value }))}
                  placeholder="Phone"
                  placeholderTextColor="#b8d1cb"
                />
                <TextInput
                  style={styles.editInput}
                  value={editedProfile.bio || editedProfile.title || ''}
                  onChangeText={(value) => setEditedProfile((prev) => ({ ...prev, bio: value }))}
                  placeholder="Bio"
                  placeholderTextColor="#b8d1cb"
                />
                <TextInput
                  style={styles.editInput}
                  value={editedProfile.profileImage || ''}
                  onChangeText={(value) => setEditedProfile((prev) => ({ ...prev, profileImage: value }))}
                  placeholder="Profile image URL"
                  placeholderTextColor="#b8d1cb"
                />
              </View>

              <View style={styles.profileActionRow}>
                <Pressable style={styles.profileActionLight} onPress={handleSaveProfile} disabled={updateStatus === 'loading'}>
                  <Ionicons name="save-outline" size={13} color="#0e5a49" />
                  <Text style={styles.profileActionLightText}>
                    {updateStatus === 'loading' ? 'Saving...' : text.save}
                  </Text>
                </Pressable>

                <Pressable style={styles.profileActionDark} onPress={handleCancelEdit}>
                  <Ionicons name="close-outline" size={13} color="#ffffff" />
                  <Text style={styles.profileActionDarkText}>{text.cancel}</Text>
                </Pressable>
              </View>
            </>
          )}
        </LinearGradient>
      </View>

      <View style={styles.detailCard}>
        <View style={styles.detailCardHeader}>
          <View style={styles.detailCardTitleWrap}>
            <Ionicons name="medal-outline" size={13} color="#0c5a49" />
            <Text style={styles.detailCardTitle}>{text.skillsTitle}</Text>
          </View>

          {!isEditingSkills ? (
            <Pressable style={styles.detailCardLink} onPress={handleStartSkillsEdit}>
              <Text style={styles.detailCardLinkText}>{text.updateSkills}</Text>
              <Ionicons name="create-outline" size={11} color="#6b7c74" />
            </Pressable>
          ) : null}
        </View>

        {isEditingSkills ? (
          <View style={styles.skillEditorWrap}>
            <Text style={styles.detailCardHint}>{editorText.removeHint}</Text>

            <TextInput
              style={styles.editorInput}
              value={skillForm.name}
              onChangeText={(value) => setSkillForm((current) => ({ ...current, name: value }))}
              placeholder={editorText.skillPlaceholder}
              placeholderTextColor="#7e8b84"
            />
            <TextInput
              style={styles.editorInput}
              value={skillForm.experienceYears}
              onChangeText={(value) => setSkillForm((current) => ({ ...current, experienceYears: value }))}
              placeholder="Experience years"
              keyboardType="numeric"
              placeholderTextColor="#7e8b84"
            />
            <TextInput
              style={styles.editorInput}
              value={skillForm.level}
              onChangeText={(value) => setSkillForm((current) => ({ ...current, level: value }))}
              placeholder="Level"
              placeholderTextColor="#7e8b84"
            />
            <TextInput
              style={styles.editorInput}
              value={skillForm.notes}
              onChangeText={(value) => setSkillForm((current) => ({ ...current, notes: value }))}
              placeholder="Notes"
              multiline
              placeholderTextColor="#7e8b84"
            />

            {skillError ? <Text style={styles.detailCardHint}>{skillError}</Text> : null}

            <View style={styles.editorActionRow}>
              <Pressable style={styles.editorSecondaryButton} onPress={handleCancelSkillsEdit}>
                <Text style={styles.editorSecondaryButtonText}>{editorText.cancelSkills}</Text>
              </Pressable>
              <Pressable style={styles.editorPrimaryButton} onPress={handleSaveSkills} disabled={skillStatus === 'loading'}>
                <Text style={styles.editorPrimaryButtonText}>
                  {skillStatus === 'loading'
                    ? 'Saving...'
                    : skillForm.skillId
                      ? 'Update skill'
                      : editorText.saveSkills}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.detailChipRow}>
            {normalizedSkills.map((skill, index) => (
              <Pressable key={skill._id || skill.name} style={styles.detailChip} onPress={() => handleEditSkill(skill)}>
                <Ionicons
                  name={index % 2 === 0 ? 'hammer-outline' : 'briefcase-outline'}
                  size={12}
                  color="#0c5a49"
                />
                <Text style={styles.detailChipText}>
                  {skill.name}
                  {skill.level ? ` • ${skill.level}` : ''}
                </Text>
                {skill._id ? (
                  <Pressable onPress={() => handleDeleteSkill(skill._id)}>
                    <Ionicons name="trash-outline" size={12} color="#0c5a49" />
                  </Pressable>
                ) : null}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.detailCard}>
        <View style={styles.detailCardHeader}>
          <View style={styles.detailCardTitleWrap}>
            <Ionicons name="calendar-outline" size={13} color="#0c5a49" />
            <Text style={styles.detailCardTitle}>{text.preferencesTitle}</Text>
          </View>
        </View>

        <View style={styles.preferenceMetaRow}>
          {(profile.preferences || labourProfile.preferences).map((item, index) => (
            <View key={item} style={styles.preferenceMetaItem}>
              <Ionicons
                name={
                  index === 0
                    ? 'sparkles-outline'
                    : index === 1
                      ? 'moon-outline'
                      : 'location-outline'
                }
                size={12}
                color="#0c5a49"
              />
              <Text style={styles.preferenceMetaText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{text.availableJobsTitle}</Text>
        <View style={styles.jobsList}>
          {postedJobs.map((job) => (
            <JobCard
              key={job.id}
              copy={text}
              job={job}
              actionLabel={appliedJobs.includes(job.id) ? text.applied : text.applyNow}
              onActionPress={() => handleApplyForJob(job)}
              disabled={appliedJobs.includes(job.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.detailCard}>
        <View style={styles.detailCardHeader}>
          <View style={styles.detailCardTitleWrap}>
            <Ionicons name="star-outline" size={13} color="#0c5a49" />
            <Text style={styles.detailCardTitle}>{text.reviewsTitle}</Text>
          </View>
        </View>

        <View style={styles.reviewList}>
          {labourReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAuthorWrap}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>
                      {review.author?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <Text style={styles.reviewAuthor}>{review.author}</Text>
                </View>

                <View style={styles.reviewRatingChip}>
                  <Ionicons name="star" size={11} color="#f4b740" />
                  <Text style={styles.reviewRatingText}>5.0</Text>
                </View>
              </View>

              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.detailCard}>
        <View style={styles.detailCardHeader}>
          <View style={styles.detailCardTitleWrap}>
            <Ionicons name="time-outline" size={13} color="#0c5a49" />
            <Text style={styles.detailCardTitle}>{text.workHistoryTitle}</Text>
          </View>
        </View>

        <View style={styles.historyList}>
          {labourWorkHistory.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyTopRow}>
                <Text style={styles.historyTitle}>{item.title}</Text>
                <View style={styles.historyRatingChip}>
                  <Ionicons name="star" size={11} color="#f4b740" />
                  <Text style={styles.historyRatingText}>{item.rating}</Text>
                </View>
              </View>

              <View style={styles.historyMetaRow}>
                <Ionicons name="business-outline" size={12} color="#0c5a49" />
                <Text style={styles.historyMetaText}>{item.customer}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <InfoPanel title={text.notifyTitle} body={text.notifyLabour} />

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{text.messengerTitle}</Text>
        <View style={styles.messageList}>
          {labourMessages.map((item) => (
            <View key={item.id} style={styles.messageItem}>
              <Text style={styles.messageName}>{item.name}</Text>
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.messageStatus}>{item.status}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
