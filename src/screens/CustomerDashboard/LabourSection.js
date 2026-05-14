// sections/LabourSection.js
// Section 4: Available Labour list + Filter bar + Jobs list + Direct Hire modal
// Data: availableRequests, jobs, filteredLabours, matchedJobs, filters
// Actions: filter changes, direct hire flow

import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { FilterBar } from '../../components/FilterBar';
import { JobCard } from '../../components/JobCard';
import { LabourCard } from '../../components/LabourCard';
import { labourFilterOptions } from '../../data/dashboardData';
import { styles } from '../styles';
import { localStyles } from './sharedStyles';

// ─── Data helpers ─────────────────────────────────────────────────────────────

/**
 * Maps a direct-hire request object to the shape expected by <LabourCard>.
 * @param {object} request
 * @returns {object}
 */
export function mapDirectRequestToLabourCard(request) {
  return {
    id: request.id,
    name: request.labour.name,
    primarySkill:
      request.labour.skills?.[0]?.name || request.labour.skills?.[0] || 'General',
    skills: (request.labour.skills?.length ? request.labour.skills : ['General']).map(
      (skill) => (typeof skill === 'string' ? skill : skill?.name || 'General')
    ),
    rating: request.labour.rating || 0,
    reviews: 0,
    distance: request.city || 'Nearby',
    location: request.labour.address,
    availability: request.statusLabel,
    photoLabel: (request.labour.name || 'L').charAt(0).toUpperCase(),
    requestId: request.id,
  };
}

/**
 * Returns a skill's display label, falling back to `fallback`.
 * @param {string|object} skill
 * @param {string} fallback
 * @returns {string}
 */
export function getSkillLabel(skill, fallback = 'General') {
  return typeof skill === 'string' ? skill : skill?.name || fallback;
}

// ─── Sub-component: Direct Hire Modal ────────────────────────────────────────

function DirectHireModal({
  selectedDirectRequest,
  directHireForm,
  directHiringRequestId,
  onFieldChange,
  onConfirmHire,
  onClose,
}) {
  if (!selectedDirectRequest) return null;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={Boolean(selectedDirectRequest)}
      onRequestClose={onClose}
    >
      <View style={localStyles.sheetOverlay}>
        <View style={localStyles.sheetCard}>
          {/* Header */}
          <View style={localStyles.sheetHeader}>
            <View>
              <Text style={localStyles.sheetTitle}>Direct Hire Labour</Text>
              <Text style={localStyles.sheetSubtitle}>
                {selectedDirectRequest?.labour?.name || 'Available labour'}
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
                  {(selectedDirectRequest?.labour?.name || 'L').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={localStyles.sheetName}>
                  {selectedDirectRequest?.labour?.name}
                </Text>
                <Text style={localStyles.sheetMeta}>
                  City:{' '}
                  {selectedDirectRequest?.city ||
                    selectedDirectRequest?.labour?.city ||
                    'Not provided'}
                </Text>
                <Text style={localStyles.sheetMeta}>
                  Status: {selectedDirectRequest?.statusLabel || 'Available'}
                </Text>
              </View>
            </View>

            {/* Contact */}
            <View style={localStyles.sheetInfoCard}>
              <Text style={localStyles.sheetSectionTitle}>Contact</Text>
              <Text style={localStyles.sheetInfoText}>
                Phone: {selectedDirectRequest?.labour?.mobile || 'Not provided'}
              </Text>
              <Text style={localStyles.sheetInfoText}>
                Address: {selectedDirectRequest?.labour?.address || 'Not provided'}
              </Text>
            </View>

            {/* Work details form */}
            <View style={localStyles.sheetInfoCard}>
              <Text style={localStyles.sheetSectionTitle}>Work Details</Text>
              <TextInput
                style={localStyles.input}
                value={directHireForm.location}
                onChangeText={(value) => onFieldChange('location', value)}
                placeholder="Work location"
              />
              <TextInput
                style={localStyles.input}
                value={directHireForm.timing}
                onChangeText={(value) => onFieldChange('timing', value)}
                placeholder="Timing"
              />
              <TextInput
                style={[localStyles.input, localStyles.multilineInput]}
                value={directHireForm.notes}
                onChangeText={(value) => onFieldChange('notes', value)}
                placeholder="Notes"
                multiline
              />
            </View>

            {/* Skills */}
            <View style={localStyles.sheetInfoCard}>
              <Text style={localStyles.sheetSectionTitle}>Skills</Text>
              <View style={localStyles.sheetSkillRow}>
                {(
                  selectedDirectRequest?.labour?.skills?.length
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

            {/* Confirm button */}
            <Pressable
              style={[
                localStyles.sheetHireButton,
                directHiringRequestId === selectedDirectRequest?.id &&
                  localStyles.sheetHireButtonDisabled,
              ]}
              disabled={directHiringRequestId === selectedDirectRequest?.id}
              onPress={onConfirmHire}
            >
              <Text style={localStyles.sheetHireButtonText}>
                {directHiringRequestId === selectedDirectRequest?.id
                  ? 'Hiring...'
                  : 'Confirm Direct Hire'}
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
 * LabourSection
 * Renders filter bar, available-labour cards, available jobs list,
 * and the direct-hire bottom sheet modal.
 *
 * Props:
 *   text                   {object}
 *   filters                {object}
 *   filteredLabours        {Array}   - already-filtered labour cards
 *   availableRequests      {Array}   - raw request objects (to look up on hire)
 *   availableRequestsLoading {boolean}
 *   availableRequestsError {string}
 *   matchedJobs            {Array}
 *   jobsLoading            {boolean}
 *   jobsError              {string}
 *   customerLocation       {string}
 *   selectedDirectRequest  {object|null}
 *   directHireForm         {object}
 *   directHiringRequestId  {string}
 *   onChangeFilter         {function(field, value)}
 *   onClearFilters         {function}
 *   onOpenDirectHire       {function(request)}
 *   onDirectHireFieldChange{function(field, value)}
 *   onConfirmDirectHire    {function}
 *   onCloseDirectHire      {function}
 */
export function LabourSection({
  text,
  filters,
  filteredLabours,
  availableRequests,
  availableRequestsLoading,
  availableRequestsError,
  matchedJobs,
  jobsLoading,
  jobsError,
  customerLocation,
  selectedDirectRequest,
  directHireForm,
  directHiringRequestId,
  onChangeFilter,
  onClearFilters,
  onOpenDirectHire,
  onDirectHireFieldChange,
  onConfirmDirectHire,
  onCloseDirectHire,
}) {
  return (
    <>
      {/* ── Filter bar ── */}
      <FilterBar
        copy={text}
        filters={filters}
        options={labourFilterOptions}
        onChangeFilter={onChangeFilter}
        onClear={onClearFilters}
      />

      {/* ── Available Labour ── */}
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
          {availableRequestsLoading ? (
            <Text style={{ color: '#6b7c74' }}>Loading available labour...</Text>
          ) : null}
          {availableRequestsError ? (
            <Text style={{ color: '#d14343' }}>{availableRequestsError}</Text>
          ) : null}

          {filteredLabours.length ? (
            filteredLabours.map((labour) => (
              <LabourCard
                key={labour.id}
                copy={text}
                labour={labour}
                actionLabel={
                  directHiringRequestId === labour.requestId ? 'Hiring...' : 'Direct Hire'
                }
                onActionPress={() => {
                  const request = availableRequests.find(
                    (item) => item.id === labour.requestId
                  );
                  if (request) onOpenDirectHire(request);
                }}
                disabled={directHiringRequestId === labour.requestId}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No direct available labour found right now.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Available Jobs ── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Ionicons name="briefcase-outline" size={13} color="#0c5a49" />
            <Text style={styles.sectionTitle}>{text.availableJobsTitle}</Text>
          </View>
        </View>

        <View style={styles.jobsList}>
          {jobsLoading ? (
            <Text style={{ color: '#6b7c74' }}>Loading jobs...</Text>
          ) : null}
          {jobsError ? (
            <Text style={{ color: '#d14343' }}>{jobsError}</Text>
          ) : null}
          {!jobsLoading && matchedJobs.length
            ? matchedJobs.map((job) => (
                <JobCard key={job.id} copy={text} job={job} />
              ))
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

      {/* ── Direct Hire Modal ── */}
      <DirectHireModal
        selectedDirectRequest={selectedDirectRequest}
        directHireForm={directHireForm}
        directHiringRequestId={directHiringRequestId}
        onFieldChange={onDirectHireFieldChange}
        onConfirmHire={onConfirmDirectHire}
        onClose={onCloseDirectHire}
      />
    </>
  );
}
