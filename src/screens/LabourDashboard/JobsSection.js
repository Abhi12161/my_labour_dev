// sections/JobsSection.js
// Section 5: Location-matched jobs list with Apply action
// Data: matchedJobs, appliedJobs, labourLocation
// Actions: onApplyForJob

import { Text, View } from 'react-native';
import { JobCard } from '../../components/JobCard';
import { styles } from './styles';

// ─── Data helpers ─────────────────────────────────────────────────────────────

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

/**
 * Returns true if a job's combined location string contains any of the
 * labour's location tokens.
 *
 * @param {string} jobLocation  - combined "location, city" string
 * @param {string} labourLocation
 * @returns {boolean}
 */
export function isMatchingLocation(jobLocation, labourLocation) {
  const normalizedJobLocation = normalizeLocationValue(jobLocation);
  const labourTokens = getLocationTokens(labourLocation);

  if (!normalizedJobLocation || !labourTokens.length) return false;

  return labourTokens.some((token) => normalizedJobLocation.includes(token));
}

/**
 * Filters jobs array to only those matching the labour's location.
 *
 * @param {Array}  jobs
 * @param {string} labourLocation
 * @returns {Array}
 */
export function filterJobsByLocation(jobs, labourLocation) {
  return jobs.filter((job) =>
    isMatchingLocation(`${job.location || ''}, ${job.city || ''}`, labourLocation)
  );
}

/**
 * Builds the combined labour location string from profile + session.
 *
 * @param {object} labourAccountProfile
 * @param {object} session
 * @returns {string}
 */
export function buildLabourLocation(labourAccountProfile, session) {
  return [
    labourAccountProfile?.address,
    labourAccountProfile?.location,
    labourAccountProfile?.city,
    session?.user?.address,
    session?.user?.location,
    session?.user?.city,
  ]
    .filter(Boolean)
    .join(', ');
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * JobsSection
 * Renders location-matched jobs with Apply / Applied buttons.
 *
 * Props:
 *   text           {object}   - i18n copy object
 *   matchedJobs    {Array}    - pre-filtered job objects
 *   appliedJobs    {Array}    - ids of already-applied jobs
 *   jobsLoading    {boolean}
 *   jobsError      {string}
 *   labourLocation {string}   - human-readable location (for empty state message)
 *   onApplyForJob  {function(job)} - called when Apply is tapped
 */
export function JobsSection({
  text,
  matchedJobs,
  appliedJobs,
  jobsLoading,
  jobsError,
  labourLocation,
  onApplyForJob,
}) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{text.availableJobsTitle}</Text>

      <View style={styles.jobsList}>
        {jobsLoading ? (
          <Text style={styles.detailCardTitle}>Loading jobs...</Text>
        ) : null}
        {jobsError ? (
          <Text style={styles.detailCardTitle}>{jobsError}</Text>
        ) : null}

        {!jobsLoading &&
          matchedJobs.map((job) => (
            <JobCard
              key={job.id}
              copy={text}
              job={job}
              actionLabel={
                appliedJobs.includes(job.id) ? text.applied : text.applyNow
              }
              onActionPress={() => onApplyForJob(job)}
              disabled={appliedJobs.includes(job.id)}
            />
          ))}

        {!jobsLoading && !matchedJobs.length ? (
          <Text style={styles.detailCardTitle}>
            {labourLocation
              ? `No jobs found for ${labourLocation}.`
              : 'Add your location to see matching jobs.'}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

