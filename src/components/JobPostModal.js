import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { colors } from '../theme/tokens';
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
              style={[styles.optionChip, active && styles.optionChipActive]}
            >
              <Text
                style={[
                  styles.optionText,
                  active && styles.optionTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function JobPostModal({
  copy,
  onClose,
  onSubmit,
  options,
  visible,
}) {
  const [form, setForm] = useState(initialForm);

  // 🔥 NEW (date picker state)
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>{copy.postJobTitle}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeLabel}>{copy.close}</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {/* TITLE */}
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

            {/* SKILL */}
            <OptionGroup
              label={copy.requiredSkill}
              options={options.skills}
              value={form.skill}
              onChange={(value) => updateField('skill', value)}
            />

            {/* DESCRIPTION */}
            <View style={styles.group}>
              <Text style={styles.label}>{copy.description}</Text>
              <TextInput
                multiline
                style={[styles.input, styles.textarea]}
                value={form.description}
                onChangeText={(value) =>
                  updateField('description', value)
                }
                placeholder={copy.descriptionPlaceholder}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* CITY */}
            <OptionGroup
              label={copy.locationLabel}
              options={options.cities}
              value={form.city}
              onChange={(value) => updateField('city', value)}
            />

            {/* DATE / TIME */}
            <OptionGroup
              label={copy.dateTime}
              options={options.timings}
              value={form.timing}
              onChange={(value) => {
                updateField('timing', value);

                if (value === 'Specific Date') {
                  setShowPicker(true);
                }
              }}
            />

            {/* 🔥 DATE PICKER */}
            {showPicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowPicker(false);

                  if (date) {
                    setSelectedDate(date);
                    updateField(
                      'timing',
                      date.toDateString()
                    );
                  }
                }}
              />
            )}

            {/* LEVEL */}
            <OptionGroup
              label={copy.skillLevel}
              options={options.levels}
              value={form.level}
              onChange={(value) => updateField('level', value)}
            />
          </ScrollView>

          <PrimaryButton
            label={copy.postJobButton}
            onPress={submit}
          />
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
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    padding: 20,
    paddingBottom: 24,
    gap: 16,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    color: '#111',
    fontSize: 20,
    fontWeight: '800',
  },

  closeButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  closeLabel: {
    color: '#374151',
    fontWeight: '600',
  },

  content: {
    gap: 14,
    paddingBottom: 8,
  },

  group: {
    gap: 8,
  },

  label: {
    color: '#111',
    fontWeight: '700',
  },

  input: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 14,
    color: '#111',
  },

  textarea: {
    minHeight: 100,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },

  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  optionChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  optionChipActive: {
    backgroundColor: '#1f7a63',
  },

  optionText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },

  optionTextActive: {
    color: '#fff',
  },
});