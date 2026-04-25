import { useEffect, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { colors, radius } from '../theme/tokens';
import { PrimaryButton } from './PrimaryButton';

const initialForm = {
  title: '',
  skill: 'Raj Mistri',
  description: '',
  city: 'Muzaffarpur',
  timing: 'Today',
  level: 'Skilled',
};

function OptionGroup({ label, options, value, onChange }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsRow}>
        {options.map((option) => {
          const active = option === value;

          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={[styles.optionChip, active && styles.optionChipActive]}>
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function JobPostModal({ copy, onClose, onSubmit, options, visible }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (visible) {
      setForm(initialForm);
    }
  }, [visible]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = () => {
    onSubmit(form);
    setForm(initialForm);
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{copy.postJobTitle}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeLabel}>{copy.close}</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.group}>
              <Text style={styles.label}>{copy.jobTitle}</Text>
              <TextInput
                style={styles.input}
                value={form.title}
                onChangeText={(value) => updateField('title', value)}
                placeholder={copy.jobTitlePlaceholder}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <OptionGroup
              label={copy.requiredSkill}
              options={options.skills}
              value={form.skill}
              onChange={(value) => updateField('skill', value)}
            />

            <View style={styles.group}>
              <Text style={styles.label}>{copy.description}</Text>
              <TextInput
                multiline
                style={[styles.input, styles.textarea]}
                value={form.description}
                onChangeText={(value) => updateField('description', value)}
                placeholder={copy.descriptionPlaceholder}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <OptionGroup
              label={copy.locationLabel}
              options={options.cities}
              value={form.city}
              onChange={(value) => updateField('city', value)}
            />

            <OptionGroup
              label={copy.dateTime}
              options={options.timings}
              value={form.timing}
              onChange={(value) => updateField('timing', value)}
            />

            <OptionGroup
              label={copy.skillLevel}
              options={options.levels}
              value={form.level}
              onChange={(value) => updateField('level', value)}
            />
          </ScrollView>

          <PrimaryButton label={copy.postJobButton} onPress={submit} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 18, 20, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.panel,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '88%',
    padding: 20,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    flexShrink: 1,
  },
  closeButton: {
    backgroundColor: colors.panelMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLabel: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  content: {
    gap: 14,
    paddingBottom: 8,
  },
  group: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontWeight: '700',
  },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelMuted,
    paddingHorizontal: 16,
    color: colors.text,
  },
  textarea: {
    minHeight: 110,
    paddingVertical: 14,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    backgroundColor: colors.panelMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionChipActive: {
    backgroundColor: colors.primary,
  },
  optionText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  optionTextActive: {
    color: colors.panel,
  },
});
