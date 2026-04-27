import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
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

export function LabourDashboard({
  language,
  onLogout,
  postedJobs,
  session,
}) {
  const text = copy[language];
  const [profile, setProfile] = useState(labourProfile);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [notifications, setNotifications] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    if (isEditingProfile) {
      setEditedProfile(profile);
    }
  }, [isEditingProfile, profile]);

  const handleSaveProfile = async () => {
    try {
      await saveProfileUpdate(editedProfile, session.user.id);
      setProfile(editedProfile);
      setIsEditingProfile(false);
      Alert.alert(text.profileUpdatedTitle, text.profileUpdatedMessage);
    } catch {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditingProfile(false);
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
            <Text style={styles.heroName}>{session?.user?.name || 'User'}</Text>

            <Text style={styles.heroSubtitle}>{text.customerSubtitle}</Text>
          </View>

          <View style={styles.heroAvatarWrap}>
            <View style={styles.heroAvatarCircle}>
              <Text style={styles.heroAvatarLetter}>
                {(session?.user?.name || 'A').charAt(0).toUpperCase()}
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
            <Text style={styles.contactText}>{session?.user?.email}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={12} color="#ffffff" />
            <Text style={styles.contactText}>{session?.user?.phone}</Text>
          </View>
        </View>
      </View>

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
            <Text style={styles.icon}>👷</Text>
          </View>

          <View style={styles.textWrap}>
            <Text style={styles.todayTitle}>{text.todayWorkButton}</Text>
            <Text style={styles.todaySubtitle}>
              View and manage all your work requests and bookings.
            </Text>
          </View>
        </View>

        <PrimaryButton label="View Today" onPress={handleTodayWork} />
      </View>

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
                  <Text style={styles.avatarLetter}>{profile.name?.charAt(0) || 'A'}</Text>
                </View>

                <View style={styles.profileInfoBlock}>
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={styles.profileWork}>{profile.title}</Text>

                  <View style={styles.profileMetaRow}>
                    <View style={styles.profileMetaItem}>
                      <Ionicons name="location" size={10} color="#ff8d63" />
                      <Text style={styles.profileMetaText}>{profile.location}</Text>
                    </View>

                    <View style={styles.profileMetaItem}>
                      <Ionicons name="call" size={10} color="#ffffff" />
                      <Text style={styles.profileMetaText}>{profile.phone}</Text>
                    </View>

                    <View style={styles.profileMetaItem}>
                      <Ionicons name="star" size={10} color="#f7c948" />
                      <Text style={styles.profileMetaText}>
                        {profile.rating} ({profile.reviews})
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.profileActionRow}>
                <Pressable style={styles.profileActionLight}>
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
                  value={editedProfile.title}
                  onChangeText={(value) => setEditedProfile((prev) => ({ ...prev, title: value }))}
                  placeholder="Work"
                  placeholderTextColor="#b8d1cb"
                />
                <TextInput
                  style={styles.editInput}
                  value={editedProfile.location}
                  onChangeText={(value) => setEditedProfile((prev) => ({ ...prev, location: value }))}
                  placeholder="Location"
                  placeholderTextColor="#b8d1cb"
                />
                <TextInput
                  style={styles.editInput}
                  value={editedProfile.phone}
                  onChangeText={(value) => setEditedProfile((prev) => ({ ...prev, phone: value }))}
                  placeholder="Phone"
                  placeholderTextColor="#b8d1cb"
                />
              </View>

              <View style={styles.profileActionRow}>
                <Pressable style={styles.profileActionLight} onPress={handleSaveProfile}>
                  <Ionicons name="save-outline" size={13} color="#0e5a49" />
                  <Text style={styles.profileActionLightText}>{text.save}</Text>
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

          <Pressable style={styles.detailCardLink}>
            <Text style={styles.detailCardLinkText}>View all</Text>
            <Ionicons name="arrow-forward" size={11} color="#6b7c74" />
          </Pressable>
        </View>

        <View style={styles.detailChipRow}>
          {[...labourProfile.skills, ...labourProfile.certifications].map((skill, index) => (
            <View key={skill} style={styles.detailChip}>
              <Ionicons
                name={index % 2 === 0 ? 'hammer-outline' : 'briefcase-outline'}
                size={12}
                color="#0c5a49"
              />
              <Text style={styles.detailChipText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.detailCard}>
        <View style={styles.detailCardHeader}>
          <View style={styles.detailCardTitleWrap}>
            <Ionicons name="calendar-outline" size={13} color="#0c5a49" />
            <Text style={styles.detailCardTitle}>{text.preferencesTitle}</Text>
          </View>
        </View>

        <View style={styles.preferenceMetaRow}>
          {labourProfile.preferences.map((item, index) => (
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
    paddingBottom: 10,
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
  heroBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 3,
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
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 19,
  },
  heroName: {
    color: '#54d7a0',
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 35,
  },
  heroSubtitle: {
    color: 'rgba(232, 243, 239, 0.78)',
    fontSize: 11,
    lineHeight: 16,
    maxWidth: 185,
  },
  heroAvatarWrap: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroAvatarCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: '#f3f0e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarLetter: {
    color: '#f8f7f0',
    fontSize: 31,
    fontWeight: '700',
  },
  heroAvatarEdit: {
    position: 'absolute',
    right: 2,
    bottom: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
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
  contactText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    gap: 6,
  },
  todayWorkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e6f4f1',
    padding: 14,
    borderRadius: 16,
    gap: 12,
  },
  todayLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  iconWrap: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#cdebe4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  icon: {
    fontSize: 22,
  },
  textWrap: {
    flex: 1,
  },
  todayTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f3d3e',
  },
  todaySubtitle: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 2,
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
  editForm: {
    gap: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e6ece8',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  detailCardTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailCardTitle: {
    color: '#273632',
    fontSize: 12,
    fontWeight: '700',
  },
  detailCardLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  detailCardLinkText: {
    color: '#718278',
    fontSize: 10,
    fontWeight: '600',
  },
  detailChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#edf5f1',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  detailChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#325048',
  },
  preferenceMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  preferenceMetaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    flex: 1,
    minWidth: '30%',
  },
  preferenceMetaText: {
    color: '#4f6760',
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    flexShrink: 1,
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
});
