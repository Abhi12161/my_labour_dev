// sections/ProfileSection.js
// Section 2: Customer profile viewer + inline editor
// Data: customerProfile, editedProfile, isEditingProfile, status, error
// Actions: onToggleEdit, onFieldChange, onSave

import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';
import { localStyles } from './sharedStyles';

// ─── Data helpers ─────────────────────────────────────────────────────────────

/**
 * Returns initial state for the editable profile form.
 * @param {object} customerProfile
 * @returns {object}
 */
export function buildInitialEditedProfile(customerProfile) {
  return {
    name: customerProfile?.name || '',
    mobile: customerProfile?.mobile || customerProfile?.phone || '',
    address: customerProfile?.address || '',
    bio: customerProfile?.bio || '',
    profileImage: customerProfile?.profileImage || '',
  };
}

/**
 * Builds the save payload expected by the profileSlice / API.
 * @param {object} editedProfile
 * @param {object} customerProfile
 * @returns {object}
 */
export function buildSavePayload(editedProfile, customerProfile) {
  return {
    role: 'customer',
    name: editedProfile.name || customerProfile?.name || '',
    mobile:
      editedProfile.mobile ||
      editedProfile.phone ||
      customerProfile?.mobile ||
      customerProfile?.phone ||
      '',
    address: editedProfile.address || customerProfile?.address || '',
    bio: editedProfile.bio || customerProfile?.bio || '',
    profileImage:
      editedProfile.profileImage || customerProfile?.profileImage || '',
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ProfileSection
 * Shows profile info in read-only mode; switches to an inline form on "Edit".
 *
 * Props:
 *   text             {object}   - i18n copy object
 *   customerProfile  {object}   - current saved profile
 *   editedProfile    {object}   - local draft state
 *   isEditingProfile {boolean}
 *   status           {string}   - Redux fetch status
 *   updateStatus     {string}   - Redux save status
 *   error            {string}
 *   onToggleEdit     {function} - toggle editing mode
 *   onFieldChange    {function(field, value)} - update draft field
 *   onSave           {function} - dispatch save
 */
export function ProfileSection({
  text,
  customerProfile,
  editedProfile,
  isEditingProfile,
  status,
  updateStatus,
  error,
  onToggleEdit,
  onFieldChange,
  onSave,
}) {
  return (
    <View style={styles.sectionCard}>
      {/* ── Header ── */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Ionicons name="person-outline" size={13} color="#0c5a49" />
          <Text style={styles.sectionTitle}>Customer profile</Text>
        </View>
        <Pressable style={styles.countBadge} onPress={onToggleEdit}>
          <Text style={styles.countBadgeText}>
            {isEditingProfile ? 'Close' : 'Edit'}
          </Text>
        </Pressable>
      </View>

      {/* ── Status / error ── */}
      {status === 'loading' ? (
        <Text style={{ color: '#6b7c74' }}>Loading profile...</Text>
      ) : null}
      {error ? (
        <Text style={{ color: '#d14343' }}>{error}</Text>
      ) : null}

      {/* ── Edit form ── */}
      {isEditingProfile ? (
        <View style={{ gap: 12 }}>
          <TextInput
            style={localStyles.input}
            value={editedProfile.name || ''}
            onChangeText={(value) => onFieldChange('name', value)}
            placeholder="Name"
          />
          <TextInput
            style={localStyles.input}
            value={editedProfile.mobile || editedProfile.phone || ''}
            onChangeText={(value) => onFieldChange('mobile', value)}
            placeholder="Mobile"
            keyboardType="phone-pad"
          />
          <TextInput
            style={localStyles.input}
            value={editedProfile.address || ''}
            onChangeText={(value) => onFieldChange('address', value)}
            placeholder="Address"
          />
          <TextInput
            style={[localStyles.input, localStyles.multilineInput]}
            value={editedProfile.bio || ''}
            onChangeText={(value) => onFieldChange('bio', value)}
            placeholder="Bio"
            multiline
          />
          <Pressable
            style={localStyles.primaryAction}
            onPress={onSave}
            disabled={updateStatus === 'loading'}
          >
            <Text style={localStyles.primaryActionText}>
              {updateStatus === 'loading' ? 'Saving...' : text.save}
            </Text>
          </Pressable>
        </View>
      ) : (
        /* ── Read-only view ── */
        <View style={{ gap: 8 }}>
          <Text style={localStyles.profileLine}>
            {customerProfile?.address || 'Address not added yet'}
          </Text>
          <Text style={localStyles.profileLine}>
            {customerProfile?.bio || 'Bio not added yet'}
          </Text>
        </View>
      )}
    </View>
  );
}
