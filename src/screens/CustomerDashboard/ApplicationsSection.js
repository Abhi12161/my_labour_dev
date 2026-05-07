// sections/ApplicationsSection.js
// Section 6: Applied Labour list + Applicant Profile bottom sheet + Hire action
// Data: applications, applicationsLoading, applicationsError
// Actions: hire labour, open/close applicant sheet

import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LabourCard } from '../../components/LabourCard';
import { styles } from './styles';
import { localStyles } from './sharedStyles';

// ─── Data helpers ─────────────────────────────────────────────────────────────

/**
 * Returns a skill's display label, falling back to `fallback`.
 * Re-exported here so ApplicationsSection is self-contained.
 * @param {string|object} skill
 * @param {string} fallback
 * @returns {string}
 */
export function getSkillLabel(skill, fallback = 'General') {
  return typeof skill === 'string' ? skill : skill?.name || fallback;
}

/**
 * Maps an application object to the shape expected by <LabourCard>.
 * @param {object} application
 * @returns {object}
 */
export function mapApplicationToLabourCard(application) {
  return {
    id: application.labour.id,
    name: application.labour.name,
    primarySkill: application.job.skill,
    skills: (
      application.labour.skills?.length
        ? application.labour.skills
        : [application.job.skill]
    ).map((skill) =>
      typeof skill === 'string' ? skill : skill?.name || application.job.skill
    ),
    rating: application.labour.rating || 0,
    reviews: 0,
    distance: application.job.location,
    location: application.labour.address,
    availability: application.status === 'hired' ? 'Hired' : 'Applied',
    photoLabel: (application.labour.name || 'L').charAt(0).toUpperCase(),
  };
}

/**
 * Deduplicates applications by job+mobile combination, keeping the most recent.
 * @param {Array} applications
 * @returns {Array}
 */
export function dedupeApplicationsByMobile(applications) {
  const seen = new Map();

  applications.forEach((application) => {
    const key = `${application.job.id}|${application.labour.mobile}`;
    const existing = seen.get(key);

    if (
      !existing ||
      new Date(application.appliedAt) > new Date(existing.appliedAt)
    ) {
      seen.set(key, application);
    }
  });

  return Array.from(seen.values());
}

// ─── Sub-component: Applicant Profile Modal ────────────────────────────────────

function ApplicantProfileModal({
  application,
  hiringApplicationId,
  hireButtonLabel,
  onHire,
  onClose,
}) {
  if (!application) return null;

  const isHired = application.status === 'hired';
  const isHiring = hiringApplicationId === application.id;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={Boolean(application)}
      onRequestClose={onClose}
    >
      <View style={localStyles.sheetOverlay}>
        <View style={localStyles.sheetCard}>
          {/* Header */}
          <View style={localStyles.sheetHeader}>
            <View>
              <Text style={localStyles.sheetTitle}>Applicant Profile</Text>
              <Text style={localStyles.sheetSubtitle}>
                {application?.job?.title || 'Applied labour details'}
              </Text>
            </View>
            <Pressable style={localStyles.sheetCloseButton} onPress={onClose}>
              <Text style={localStyles.sheetCloseText}>Close</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={localStyles.sheetContent}
          >
            {/* Hero row */}
            <View style={localStyles.sheetHero}>
              <View style={localStyles.sheetAvatar}>
                <Text style={localStyles.sheetAvatarText}>
                  {(application?.labour?.name || 'L').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={localStyles.sheetName}>{application?.labour?.name}</Text>
                <Text style={localStyles.sheetMeta}>
                  Applied for: {application?.job?.skill || 'General'}
                </Text>
                <Text style={localStyles.sheetMeta}>
                  Status: {application?.statusLabel || 'Pending'}
                </Text>
              </View>
            </View>

            {/* Contact */}
            <View style={localStyles.sheetInfoCard}>
              <Text style={localStyles.sheetSectionTitle}>Contact</Text>
              <Text style={localStyles.sheetInfoText}>
                Phone: {application?.labour?.mobile || 'Not provided'}
              </Text>
              <Text style={localStyles.sheetInfoText}>
                Address: {application?.labour?.address || 'Not provided'}
              </Text>
            </View>

            {/* Application details */}
            <View style={localStyles.sheetInfoCard}>
              <Text style={localStyles.sheetSectionTitle}>Application</Text>
              <Text style={localStyles.sheetInfoText}>
                Job: {application?.job?.title || 'Untitled Job'}
              </Text>
              <Text style={localStyles.sheetInfoText}>
                Location: {application?.job?.location || 'Not provided'}
              </Text>
              <Text style={localStyles.sheetInfoText}>
                Applied on:{' '}
                {application?.appliedAt
                  ? new Date(application.appliedAt).toLocaleString()
                  : 'Not available'}
              </Text>
            </View>

            {/* Bio */}
            {application?.labour?.bio ? (
              <View style={localStyles.sheetInfoCard}>
                <Text style={localStyles.sheetSectionTitle}>About</Text>
                <Text style={localStyles.sheetInfoText}>{application.labour.bio}</Text>
              </View>
            ) : null}

            {/* Skills */}
            <View style={localStyles.sheetInfoCard}>
              <Text style={localStyles.sheetSectionTitle}>Skills</Text>
              <View style={localStyles.sheetSkillRow}>
                {(
                  application?.labour?.skills?.length
                    ? application.labour.skills
                    : [application?.job?.skill || 'General']
                ).map((skill, index) => (
                  <View
                    key={`sheet-${getSkillLabel(
                      skill,
                      application?.job?.skill || 'General'
                    )}-${index}`}
                    style={localStyles.sheetSkillChip}
                  >
                    <Text style={localStyles.sheetSkillText}>
                      {getSkillLabel(skill, application?.job?.skill || 'General')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Hire button */}
            <Pressable
              style={[
                localStyles.sheetHireButton,
                (isHired || isHiring) && localStyles.sheetHireButtonDisabled,
              ]}
              disabled={isHired || isHiring}
              onPress={() => onHire(application)}
            >
              <Text style={localStyles.sheetHireButtonText}>
                {isHired ? 'Already Hired' : isHiring ? 'Hiring...' : hireButtonLabel}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * ApplicationsSection
 * Renders a list of labour applications with per-card hire buttons and a
 * tappable profile card that opens a detail bottom sheet.
 *
 * Props:
 *   text                 {object}        - i18n copy object
 *   applications         {Array}         - deduplicated application objects
 *   applicationsLoading  {boolean}
 *   applicationsError    {string}
 *   hiringApplicationId  {string}        - id of application currently being hired
 *   selectedApplication  {object|null}   - application open in the sheet
 *   onSelectApplication  {function}      - open sheet for an application
 *   onCloseSheet         {function}      - close the sheet
 *   onHireLabour         {function(application)} - fire hire API
 */
export function ApplicationsSection({
  text,
  applications,
  applicationsLoading,
  applicationsError,
  hiringApplicationId,
  selectedApplication,
  onSelectApplication,
  onCloseSheet,
  onHireLabour,
}) {
  return (
    <>
      <View style={styles.sectionCard}>
        {/* ── Header ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Ionicons name="person-add-outline" size={13} color="#0c5a49" />
            <Text style={styles.sectionTitle}>Applied labour</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{applications.length}</Text>
          </View>
        </View>

        {/* ── List ── */}
        <View style={styles.jobsList}>
          {applicationsLoading ? (
            <Text style={{ color: '#6b7c74' }}>Loading applied labour...</Text>
          ) : null}
          {applicationsError ? (
            <Text style={{ color: '#d14343' }}>{applicationsError}</Text>
          ) : null}

          {!applicationsLoading && applications.length
            ? applications.map((application) => (
                <View key={application.id} style={{ gap: 8 }}>
                  {/* Job meta */}
                  <View style={localStyles.applicationMetaCard}>
                    <Text style={localStyles.applicationJobTitle}>
                      {application.job.title}
                    </Text>
                    <Text style={localStyles.applicationJobMeta}>
                      {application.job.location} - {application.statusLabel}
                    </Text>
                  </View>

                  {/* Applicant quick card */}
                  <Pressable
                    style={localStyles.applicantProfileCard}
                    onPress={() => onSelectApplication(application)}
                  >
                    <Text style={localStyles.applicantProfileTitle}>
                      {application.labour.name}
                    </Text>
                    <Text style={localStyles.applicantProfileMeta}>
                      Phone: {application.labour.mobile}
                    </Text>
                    <Text style={localStyles.applicantProfileMeta}>
                      Address: {application.labour.address}
                    </Text>
                    <Text style={localStyles.applicantProfileMeta}>
                      Applied on:{' '}
                      {new Date(application.appliedAt).toLocaleString()}
                    </Text>
                    {application.labour.bio ? (
                      <Text style={localStyles.applicantProfileBio}>
                        {application.labour.bio}
                      </Text>
                    ) : null}

                    {/* Skills */}
                    <View style={localStyles.applicantSkillRow}>
                      {(
                        application.labour.skills?.length
                          ? application.labour.skills
                          : [application.job.skill]
                      )
                        .slice(0, 4)
                        .map((skill, index) => (
                          <View
                            key={`${application.id}-${getSkillLabel(
                              skill,
                              application.job.skill
                            )}-${index}`}
                            style={localStyles.applicantSkillChip}
                          >
                            <Text style={localStyles.applicantSkillText}>
                              {getSkillLabel(skill, application.job.skill)}
                            </Text>
                          </View>
                        ))}
                    </View>

                    <Text style={localStyles.viewProfileLink}>
                      Tap to view full profile
                    </Text>
                  </Pressable>

                  {/* Labour card with hire button */}
                  <LabourCard
                    copy={text}
                    labour={mapApplicationToLabourCard(application)}
                    actionLabel={
                      application.status === 'hired'
                        ? 'Hired'
                        : hiringApplicationId === application.id
                        ? 'Hiring...'
                        : text.hireNow
                    }
                    onActionPress={
                      application.status === 'hired'
                        ? undefined
                        : () => onHireLabour(application)
                    }
                    disabled={
                      application.status === 'hired' ||
                      hiringApplicationId === application.id
                    }
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

      {/* ── Applicant Profile Modal ── */}
      <ApplicantProfileModal
        application={selectedApplication}
        hiringApplicationId={hiringApplicationId}
        hireButtonLabel={text.hireNow}
        onHire={onHireLabour}
        onClose={onCloseSheet}
      />
    </>
  );
}

