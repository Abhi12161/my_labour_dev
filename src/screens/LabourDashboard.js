import { ScrollView, StyleSheet, Text, View } from 'react-native';

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

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero section with user greeting and logout */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroBadge}>{text.labourDashboardBadge}</Text>
            <Text style={styles.heroTitle}>
              {text.hello}, {session.user.name}
            </Text>
            <Text style={styles.heroSubtitle}>{text.labourSubtitle}</Text>
          </View>
          <PrimaryButton label={text.logout} onPress={onLogout} variant="ghost" />
        </View>

        {/* <LanguageSwitcher  selected={language} onChange={onChangeLanguage} /> */}

        <View style={styles.profileBar}>
          <Text style={styles.profileText}>{session.user.email}</Text>
          <Text style={styles.profileText}>{session.user.phone}</Text>
        </View>
      </View>

      {/* Overview statistics grid */}
      <View style={styles.statsGrid}>
        {labourOverviewStats.map((item) => (
          <StatCard key={item.id} label={text[item.labelKey]} value={item.value} />
        ))}
      </View>

      {/* Profile section */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{text.profileTitle}</Text>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{labourProfile.photoLabel}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{labourProfile.name}</Text>
            <Text style={styles.profileTitleText}>{labourProfile.title}</Text>
            <Text style={styles.profileMeta}>{labourProfile.location}</Text>
            <Text style={styles.profileMeta}>{labourProfile.phone}</Text>
            <Text style={styles.profileMeta}>
              {text.ratingLabel}: {labourProfile.rating} ({labourProfile.reviews})
            </Text>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <PrimaryButton label={text.updateSkills} onPress={() => {}} variant="ghost" />
          <PrimaryButton label={text.editProfile} onPress={() => {}} variant="ghost" />
        </View>
      </View>

      {/* Skills and certifications section */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{text.skillsTitle}</Text>
        <View style={styles.skillRow}>
          {[...labourProfile.skills, ...labourProfile.certifications].map((skill) => (
            <View key={skill} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
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
            <JobCard key={job.id} copy={text} job={job} actionLabel={text.applyNow} />
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
    backgroundColor: colors.hero,
    borderRadius: radius.xl,
    padding: 24,
    gap: 18,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 12,
  },
  heroBadge: {
    // alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    color: colors.panel,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '800',
    maxWidth:135
  },
  heroTitle: {
    color: colors.panel,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#d9e6e0',
    fontSize: 15,
    lineHeight: 24,
  },
  profileBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  profileText: {
    color: '#d9e6e0',
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
  panelTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  profileHeader: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.panelMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.textMuted,
    fontSize: 24,
    fontWeight: '700',
  },
  profileCopy: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  profileTitleText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  profileMeta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
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
});