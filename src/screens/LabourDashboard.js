import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { InfoPanel } from '../components/InfoPanel';
import { JobCard } from '../components/JobCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatCard } from '../components/StatCard';
import { copy } from '../constants/copy';
import {
  labourMessages,
  labourOverviewStats,
  labourProfile,
  labourReviews,
  labourWorkHistory,
} from '../data/dashboardData';
import { saveJobApplication, saveProfileUpdate, saveTodayWorkRequest } from '../services/http';
import { colors, radius } from '../theme/tokens';

/**
 * LabourDashboard Component
 *
 * This component renders the dashboard for labour workers who want to find jobs.
 * It includes:
 * - Overview statistics
 * - Profile information
 * - Skills and certifications
 * - Work preferences
 * - Available jobs to apply for
 * - Reviews and ratings
 * - Work history
 * - Notifications and messaging
 */
export function LabourDashboard({
  language,
  onChangeLanguage,
  onLogout,
  postedJobs,
  session,
}) {
  // Get localized text based on selected language
  const text = copy[language];

  // State for profile editing
  const [profile, setProfile] = useState(labourProfile);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  useEffect(() => {
    if (isEditingProfile) {
      setEditedProfile(profile);
    }
  }, [isEditingProfile]);
  // State for notifications
  const [notifications, setNotifications] = useState([]);

  // State for applied jobs
  const [appliedJobs, setAppliedJobs] = useState([]);

  /**
   * Handle profile edit save
   */
  const handleSaveProfile = async () => {
    try {
      await saveProfileUpdate(editedProfile, session.user.id);

      setProfile(editedProfile); // 🔥 UI update

      Alert.alert(text.profileUpdatedTitle, text.profileUpdatedMessage);
      setIsEditingProfile(false);
    } catch {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditingProfile(false);
  };

  /**
   * Handle job application
   */
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
              setAppliedJobs(prev => [...prev, job.id]);

              // Add notification
              const notification = {
                id: Date.now(),
                type: 'application',
                message: text.applicationSubmitted.replace('{job}', job.title),
                timestamp: new Date().toISOString(),
              };
              setNotifications(prev => [notification, ...prev]);

              // Save to admin database
              await saveJobApplication(job, session.user);

              Alert.alert(text.applicationSuccessTitle, text.applicationSuccessMessage);
            } catch (_error) {
              // Remove from applied jobs if API call failed
              setAppliedJobs(prev => prev.filter(id => id !== job.id));
              Alert.alert('Error', 'Failed to submit application. Please try again.');
            }
          }
        }
      ]
    );
  };

  /**
   * Handle "Today Work" button press
   */
  const handleTodayWork = async () => {
    Alert.alert(
      text.todayWorkConfirmTitle,
      text.todayWorkConfirmMessage,
      [
        { text: text.cancel, style: 'cancel' },
        {
          text: text.confirm,
          onPress: async () => {
            try {
              // Add notification
              const notification = {
                id: Date.now(),
                type: 'today_work',
                message: text.todayWorkNotification,
                timestamp: new Date().toISOString(),
              };
              setNotifications(prev => [notification, ...prev]);

              // Save to admin database
              await saveTodayWorkRequest(session.user);

              Alert.alert(text.todayWorkSuccessTitle, text.todayWorkSuccessMessage);
            } catch (_error) {
              Alert.alert('Error', 'Failed to submit today work request. Please try again.');
            }
          }
        }
      ]
    );
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
        {labourOverviewStats.map((item, index) => (
          <StatCard key={item.id}
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
            onPress={() => console.log('Clicked', item.labelKey)} />
        ))}
      </View>

      {/* Today Work Button */}
      <View style={styles.todayWorkContainer}>
        <PrimaryButton
          label={text.todayWorkButton}
          onPress={handleTodayWork}
          variant="primary"
        />
      </View>

      {/* Notifications section */}
      {notifications.length > 0 && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{text.notificationsTitle}</Text>
          <View style={styles.notificationList}>
            {notifications.slice(0, 3).map((notification) => (
              <View key={notification.id} style={styles.notificationItem}>
                <Text style={styles.notificationText}>{notification.message}</Text>
                <Text style={styles.notificationTime}>
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Profile section */}
      <View style={styles.profileWrapper}>
        <LinearGradient
          colors={['rgba(0, 150, 136, 1)', 'rgba(32, 122, 99, 1)']}
          style={styles.profilePanel}
        >

          <Text style={styles.profilePanelTitle}>
            {text.profileTitle}
          </Text>

          <View style={styles.profileHeaderNew}>

            {/* AVATAR */}
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.avatarNew}
            >
              <Text style={styles.avatarTextNew}>
                {profile.name?.charAt(0)}
              </Text>
            </LinearGradient>

            {/* PROFILE */}
            <View style={styles.profileCopyNew}>
              {isEditingProfile ? (
                <>
                  <TextInput
                    style={styles.editInputNew}
                    value={editedProfile.name}
                    onChangeText={(v) =>
                      setEditedProfile(p => ({ ...p, name: v }))
                    }
                    placeholder="Name"
                  />
                  <TextInput
                    style={styles.editInputNew}
                    value={editedProfile.title}
                    onChangeText={(v) =>
                      setEditedProfile(p => ({ ...p, title: v }))
                    }
                    placeholder="Title"
                  />
                  <TextInput
                    style={styles.editInputNew}
                    value={editedProfile.location}
                    onChangeText={(v) =>
                      setEditedProfile(p => ({ ...p, location: v }))
                    }
                    placeholder="Location"
                  />
                  <TextInput
                    style={styles.editInputNew}
                    value={editedProfile.phone}
                    onChangeText={(v) =>
                      setEditedProfile(p => ({ ...p, phone: v }))
                    }
                    placeholder="Phone"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.profileNameNew}>{profile.name}</Text>
                  <Text style={styles.profileTitleTextNew}>{profile.title}</Text>
                  <Text style={styles.profileMetaNew}>📍 {profile.location}</Text>
                  <Text style={styles.profileMetaNew}>📞 {profile.phone}</Text>
                  <Text style={styles.profileMetaNew}>
                    ⭐ {profile.rating} ({profile.reviews})
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* BUTTONS */}
          <View style={styles.buttonRowNew}>
            {isEditingProfile ? (
              <>
                <PrimaryButton label="Save" onPress={handleSaveProfile} />
                <PrimaryButton label="Cancel" onPress={handleCancelEdit} variant="ghost" />
              </>
            ) : (
              <>
                <PrimaryButton label={text.updateSkills} onPress={() => { }} variant="ghost" />
                <PrimaryButton label={text.editProfile} onPress={() => setIsEditingProfile(true)} variant="ghost" />
              </>
            )}
          </View>

        </LinearGradient>
      </View>

      {/* Skills and certifications section */}
      <View style={styles.skillsWrapper}>
        <LinearGradient
          colors={['rgba(0, 150, 136, 1)', 'rgba(0, 150, 136, 1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.skillsPanel}
        >
          <Text style={styles.skillsTitle}>{text.skillsTitle}</Text>

          <View style={styles.skillsRowNew}>
            {[...labourProfile.skills, ...labourProfile.certifications].map((skill) => (
              <LinearGradient
                key={skill}
                colors={['#1f7a63', '#145a4a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.skillChipNew}
              >
                <Text style={styles.skillTextNew}>{skill}</Text>
              </LinearGradient>
            ))}
          </View>
        </LinearGradient>
      </View>

      {/* Work preferences section */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{text.preferencesTitle}</Text>
        <View style={styles.preferenceList}>
          {labourProfile.preferences.map((item) => (
            <Text key={item} style={styles.preferenceItem}>
              - {item}
            </Text>
          ))}
        </View>
      </View>

      {/* Available jobs section */}
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

      {/* Reviews section */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{text.reviewsTitle}</Text>
        <View style={styles.preferenceList}>
          {labourReviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <Text style={styles.reviewText}>{review.text}</Text>
              <Text style={styles.reviewAuthor}>{review.author}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Work history section */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{text.workHistoryTitle}</Text>
        <View style={styles.preferenceList}>
          {labourWorkHistory.map((item) => (
            <Text key={item.id} style={styles.preferenceItem}>
              - {item.title} | {item.customer} | {text.ratingLabel} {item.rating}
            </Text>
          ))}
        </View>
      </View>

      {/* Notifications info panel */}
      <InfoPanel title={text.notifyTitle} body={text.notifyLabour} />

      {/* Messages section */}
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

// Styles for the LabourDashboard component
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
  panel: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0 10px 18px rgba(18, 35, 32, 0.08)',
  },
  profileWrapper: {
    marginTop: 12,
  },

  profilePanel: {
    borderRadius: 20,
    padding: 16,
    gap: 14,

    overflow: 'hidden',
  },

  profilePanelTitle: {
    fontSize: 16,
    fontWeight: '800',
  },

  profileHeaderNew: {
    flexDirection: 'row',
    gap: 12,
  },

  avatarNew: {
    width: 60,
    height: 60,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarTextNew: {
    color: colors.primarySoft,
    fontSize: 18,
    fontWeight: '800',
  },

  profileCopyNew: {
    flex: 1,
    gap: 4,
  },

  profileNameNew: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primarySoft,
  },

  profileTitleTextNew: {
    fontSize: 13,
    color: colors.primarySoft,
  },

  profileMetaNew: {
    fontSize: 12,
    color: colors.primarySoft,
  },

  editInputNew: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9fafb',
  },

  buttonRowNew: {
    flexDirection: 'row',
    gap: 10,
  },
  todayWorkContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  notificationList: {
    gap: 8,
  },
  notificationItem: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: 12,
    gap: 4,
  },
  notificationText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  notificationTime: {
    color: colors.textMuted,
    fontSize: 12,
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
  preferenceList: {
    gap: 8,
  },
  preferenceItem: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  jobsList: {
    gap: 12,
  },
  reviewItem: {
    backgroundColor: colors.panelMuted,
    borderRadius: radius.md,
    padding: 16,
    gap: 8,
  },
  reviewText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  reviewAuthor: {
    color: colors.primary,
    fontSize: 12,
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
  blurContainer: {
    backgroundColor: 'rgba(249, 249, 249, 0.2)', // aapka glass effect
    padding: 16,
  },
  skillsWrapper: {
    marginTop: 12,
  },

  skillsPanel: {
    borderRadius: 20,
    padding: 16,
    gap: 14,

    // soft shadow
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  skillsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  skillsRowNew: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  skillChipNew: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,

    // shadow for chip
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  skillTextNew: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});