// sections/ProfileSection.js
// Section 4: Labour profile card (view + edit) + Skills editor + Preferences
// Data: labourAccountProfile, editedProfile, skillForm, normalizedSkills
// Actions: onToggleEdit, onSaveProfile, onCancelEdit,
//          onStartSkillsEdit, onEditSkill, onSaveSkill, onDeleteSkill, onCancelSkillsEdit

import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { labourProfile } from '../../data/dashboardData';
import { styles } from './styles';

// ─── Data helpers ─────────────────────────────────────────────────────────────

/**
 * Initial state for the skill form (add new skill).
 */
export const EMPTY_SKILL_FORM = {
  skillId: null,
  name: '',
  experienceYears: '',
  level: '',
  notes: '',
};

/**
 * Normalises the skills array so every entry is a full object
 * (handles both string and object skills from the API).
 *
 * @param {Array} skills
 * @returns {Array<{ _id, name, experienceYears, level, notes }>}
 */
export function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];

  return skills.map((skill) =>
    typeof skill === 'string'
      ? { _id: skill, name: skill, experienceYears: '', level: '', notes: '' }
      : skill
  );
}

/**
 * Builds the save payload for the skill API call.
 * @param {object} skillForm
 * @returns {object}
 */
export function buildSkillPayload(skillForm) {
  return {
    name: skillForm.name.trim(),
    experienceYears: skillForm.experienceYears,
    level: skillForm.level.trim(),
    notes: skillForm.notes.trim(),
  };
}

/**
 * Validates the skill form.
 * @param {object} skillForm
 * @returns {string|null} Error message, or null if valid.
 */
export function validateSkillForm(skillForm) {
  if (!skillForm.name.trim()) return 'Skill name is required.';
  if (
    !skillForm.experienceYears.trim() ||
    Number.isNaN(Number(skillForm.experienceYears))
  )
    return 'Experience years must be a number.';
  if (!skillForm.level.trim()) return 'Skill level is required.';
  return null;
}

// ─── Sub-component: profile view mode ─────────────────────────────────────────

function ProfileViewMode({ labourAccountProfile, text, onEdit, onUpdateSkills }) {
  return (
    <>
      <View style={styles.profileHeaderRow}>
        <View style={styles.profileHeaderBadge}>
          <Ionicons name="chatbubble-ellipses-outline" size={12} color="#ffffff" />
          <Text style={styles.profileHeaderBadgeText}>Labour profile</Text>
        </View>
        <Pressable style={styles.profileHeaderEditPill} onPress={onEdit}>
          <Ionicons name="create-outline" size={10} color="#ffffff" />
          <Text style={styles.profileHeaderEditPillText}>Edit Profile</Text>
        </Pressable>
      </View>

      <View style={styles.profileContentRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarLetter}>
            {labourAccountProfile?.name?.charAt(0) || 'A'}
          </Text>
        </View>

        <View style={styles.profileInfoBlock}>
          <Text style={styles.profileName}>{labourAccountProfile?.name}</Text>
          <Text style={styles.profileWork}>
            {labourAccountProfile?.bio || labourAccountProfile?.title}
          </Text>

          <View style={styles.profileMetaRow}>
            <View style={styles.profileMetaItem}>
              <Ionicons name="location" size={10} color="#ff8d63" />
              <Text style={styles.profileMetaText}>
                {labourAccountProfile?.address || labourAccountProfile?.location}
              </Text>
            </View>
            <View style={styles.profileMetaItem}>
              <Ionicons name="call" size={10} color="#ffffff" />
              <Text style={styles.profileMetaText}>
                {labourAccountProfile?.mobile || labourAccountProfile?.phone}
              </Text>
            </View>
            <View style={styles.profileMetaItem}>
              <Ionicons name="star" size={10} color="#f7c948" />
              <Text style={styles.profileMetaText}>
                {labourAccountProfile?.rating} ({labourAccountProfile?.reviews})
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.profileActionRow}>
        <Pressable style={styles.profileActionLight} onPress={onUpdateSkills}>
          <Ionicons name="briefcase-outline" size={13} color="#0e5a49" />
          <Text style={styles.profileActionLightText}>{text.updateSkills}</Text>
        </Pressable>
        <Pressable style={styles.profileActionDark} onPress={onEdit}>
          <Ionicons name="create-outline" size={13} color="#ffffff" />
          <Text style={styles.profileActionDarkText}>{text.editProfile}</Text>
        </Pressable>
      </View>
    </>
  );
}

// ─── Sub-component: profile edit mode ─────────────────────────────────────────

function ProfileEditMode({
  editedProfile,
  updateStatus,
  text,
  onFieldChange,
  onSave,
  onCancel,
}) {
  return (
    <>
      <View style={styles.profileHeaderRow}>
        <View style={styles.profileHeaderBadge}>
          <Ionicons name="create-outline" size={12} color="#ffffff" />
          <Text style={styles.profileHeaderBadgeText}>Edit Profile</Text>
        </View>
        <Pressable style={styles.profileHeaderEditPill} onPress={onCancel}>
          <Text style={styles.profileHeaderEditPillText}>Close</Text>
        </Pressable>
      </View>

      <View style={styles.editForm}>
        <TextInput
          style={styles.editInput}
          value={editedProfile.name || ''}
          onChangeText={(v) => onFieldChange('name', v)}
          placeholder="Name"
          placeholderTextColor="#b8d1cb"
        />
        <TextInput
          style={styles.editInput}
          value={editedProfile.address || editedProfile.location || ''}
          onChangeText={(v) => onFieldChange('address', v)}
          placeholder="Address"
          placeholderTextColor="#b8d1cb"
        />
        <TextInput
          style={styles.editInput}
          value={editedProfile.mobile || editedProfile.phone || ''}
          onChangeText={(v) => onFieldChange('mobile', v)}
          placeholder="Phone"
          placeholderTextColor="#b8d1cb"
        />
        <TextInput
          style={styles.editInput}
          value={editedProfile.bio || editedProfile.title || ''}
          onChangeText={(v) => onFieldChange('bio', v)}
          placeholder="Bio"
          placeholderTextColor="#b8d1cb"
        />
        <TextInput
          style={styles.editInput}
          value={editedProfile.profileImage || ''}
          onChangeText={(v) => onFieldChange('profileImage', v)}
          placeholder="Profile image URL"
          placeholderTextColor="#b8d1cb"
        />
      </View>

      <View style={styles.profileActionRow}>
        <Pressable
          style={styles.profileActionLight}
          onPress={onSave}
          disabled={updateStatus === 'loading'}
        >
          <Ionicons name="save-outline" size={13} color="#0e5a49" />
          <Text style={styles.profileActionLightText}>
            {updateStatus === 'loading' ? 'Saving...' : text.save}
          </Text>
        </Pressable>
        <Pressable style={styles.profileActionDark} onPress={onCancel}>
          <Ionicons name="close-outline" size={13} color="#ffffff" />
          <Text style={styles.profileActionDarkText}>{text.cancel}</Text>
        </Pressable>
      </View>
    </>
  );
}

// ─── Sub-component: skills editor ─────────────────────────────────────────────

function SkillsEditor({
  skillForm,
  skillStatus,
  skillError,
  editorText,
  normalizedSkills,
  onFieldChange,
  onSave,
  onCancel,
  onEditSkill,
  onDeleteSkill,
}) {
  return (
    <View style={styles.skillEditorWrap}>
      <Text style={styles.detailCardHint}>{editorText.removeHint}</Text>

      <TextInput
        style={styles.editorInput}
        value={skillForm.name}
        onChangeText={(v) => onFieldChange('name', v)}
        placeholder={editorText.skillPlaceholder}
        placeholderTextColor="#7e8b84"
      />
      <TextInput
        style={styles.editorInput}
        value={skillForm.experienceYears}
        onChangeText={(v) => onFieldChange('experienceYears', v)}
        placeholder="Experience years"
        keyboardType="numeric"
        placeholderTextColor="#7e8b84"
      />
      <TextInput
        style={styles.editorInput}
        value={skillForm.level}
        onChangeText={(v) => onFieldChange('level', v)}
        placeholder="Level"
        placeholderTextColor="#7e8b84"
      />
      <TextInput
        style={styles.editorInput}
        value={skillForm.notes}
        onChangeText={(v) => onFieldChange('notes', v)}
        placeholder="Notes"
        multiline
        placeholderTextColor="#7e8b84"
      />

      {skillError ? (
        <Text style={styles.detailCardHint}>{skillError}</Text>
      ) : null}

      <View style={styles.editorActionRow}>
        <Pressable style={styles.editorSecondaryButton} onPress={onCancel}>
          <Text style={styles.editorSecondaryButtonText}>
            {editorText.cancelSkills}
          </Text>
        </Pressable>
        <Pressable
          style={styles.editorPrimaryButton}
          onPress={onSave}
          disabled={skillStatus === 'loading'}
        >
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
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * ProfileSection
 * Combines the gradient profile card (view/edit), skills section,
 * and preferences panel.
 *
 * Props:
 *   text                {object}   - i18n copy object
 *   editorText          {object}   - skill editor i18n copy
 *   labourAccountProfile{object}   - current saved profile
 *   editedProfile       {object}   - local draft state for profile edit
 *   isEditingProfile    {boolean}
 *   isEditingSkills     {boolean}
 *   skillForm           {object}   - skill add/edit form state
 *   normalizedSkills    {Array}    - skill objects ready to render
 *   status              {string}   - Redux fetch status
 *   updateStatus        {string}   - Redux profile save status
 *   skillStatus         {string}   - Redux skill save status
 *   skillError          {string}
 *   error               {string}
 *   onToggleEdit        {function} - open profile edit
 *   onCancelEdit        {function} - close profile edit
 *   onProfileFieldChange{function(field, value)}
 *   onSaveProfile       {function}
 *   onStartSkillsEdit   {function}
 *   onCancelSkillsEdit  {function}
 *   onSkillFieldChange  {function(field, value)}
 *   onSaveSkill         {function}
 *   onEditSkill         {function(skill)}
 *   onDeleteSkill       {function(skillId)}
 */
export function ProfileSection({
  text,
  editorText,
  labourAccountProfile,
  editedProfile,
  isEditingProfile,
  isEditingSkills,
  skillForm,
  normalizedSkills,
  status,
  updateStatus,
  skillStatus,
  skillError,
  error,
  onToggleEdit,
  onCancelEdit,
  onProfileFieldChange,
  onSaveProfile,
  onStartSkillsEdit,
  onCancelSkillsEdit,
  onSkillFieldChange,
  onSaveSkill,
  onEditSkill,
  onDeleteSkill,
}) {
  return (
    <>
      {/* ── Redux loading / error ── */}
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

      {/* ── Gradient profile card ── */}
      <View style={styles.profileSectionWrap}>
        <LinearGradient colors={['#0e5a49', '#11463d']} style={styles.profileCard}>
          {!isEditingProfile ? (
            <ProfileViewMode
              labourAccountProfile={labourAccountProfile}
              text={text}
              onEdit={onToggleEdit}
              onUpdateSkills={onStartSkillsEdit}
            />
          ) : (
            <ProfileEditMode
              editedProfile={editedProfile}
              updateStatus={updateStatus}
              text={text}
              onFieldChange={onProfileFieldChange}
              onSave={onSaveProfile}
              onCancel={onCancelEdit}
            />
          )}
        </LinearGradient>
      </View>

      {/* ── Skills card ── */}
      <View style={styles.detailCard}>
        <View style={styles.detailCardHeader}>
          <View style={styles.detailCardTitleWrap}>
            <Ionicons name="medal-outline" size={13} color="#0c5a49" />
            <Text style={styles.detailCardTitle}>{text.skillsTitle}</Text>
          </View>

          {!isEditingSkills ? (
            <Pressable style={styles.detailCardLink} onPress={onStartSkillsEdit}>
              <Text style={styles.detailCardLinkText}>{text.updateSkills}</Text>
              <Ionicons name="create-outline" size={11} color="#6b7c74" />
            </Pressable>
          ) : null}
        </View>

        {isEditingSkills ? (
          <SkillsEditor
            skillForm={skillForm}
            skillStatus={skillStatus}
            skillError={skillError}
            editorText={editorText}
            normalizedSkills={normalizedSkills}
            onFieldChange={onSkillFieldChange}
            onSave={onSaveSkill}
            onCancel={onCancelSkillsEdit}
            onEditSkill={onEditSkill}
            onDeleteSkill={onDeleteSkill}
          />
        ) : (
          <View style={styles.detailChipRow}>
            {normalizedSkills.map((skill, index) => (
              <Pressable
                key={skill._id || skill.name}
                style={styles.detailChip}
                onPress={() => onEditSkill(skill)}
              >
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
                  <Pressable onPress={() => onDeleteSkill(skill._id)}>
                    <Ionicons name="trash-outline" size={12} color="#0c5a49" />
                  </Pressable>
                ) : null}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* ── Preferences card ── */}
      <View style={styles.detailCard}>
        <View style={styles.detailCardHeader}>
          <View style={styles.detailCardTitleWrap}>
            <Ionicons name="calendar-outline" size={13} color="#0c5a49" />
            <Text style={styles.detailCardTitle}>{text.preferencesTitle}</Text>
          </View>
        </View>

        <View style={styles.preferenceMetaRow}>
          {(
            labourAccountProfile?.preferences ||
            labourProfile.preferences ||
            []
          ).map((item, index) => (
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
    </>
  );
}

