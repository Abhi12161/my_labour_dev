import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

function FilterGroup({ icon, label, options, selected, onSelect }) {
  return (
    <View style={styles.group}>
      <View style={styles.groupHeader}>
        <Ionicons name={icon} size={13} color="#0c5a49" />
        <Text style={styles.groupLabel}>{label}</Text>
      </View>

      <View style={styles.optionRow}>
        {options.map((option) => {
          const active = selected === option;

          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              style={[styles.optionChip, active && styles.optionChipActive]}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function FilterBar({ copy, filters, options, onChangeFilter, onClear }) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleWrap}>
          <Ionicons name="options-outline" size={13} color="#0c5a49" />
          <Text style={styles.title}>{copy.filtersTitle}</Text>
        </View>

        <Pressable onPress={onClear} style={styles.clearButton}>
          <Text style={styles.clearLabel}>{copy.clearFilters}</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={14} color="#718278" />
        <TextInput
          style={styles.searchInput}
          placeholder={copy.searchPlaceholder}
          placeholderTextColor="#718278"
          value={filters.search}
          onChangeText={(value) => onChangeFilter('search', value)}
        />
      </View>

      <FilterGroup
        icon="location-outline"
        label={copy.district}
        options={options.district}
        selected={filters.district}
        onSelect={(value) => onChangeFilter('district', value)}
      />

      <FilterGroup
        icon="hammer-outline"
        label={copy.category}
        options={options.category}
        selected={filters.category}
        onSelect={(value) => onChangeFilter('category', value)}
      />

      <FilterGroup
        icon="time-outline"
        label={copy.availability}
        options={options.availability}
        selected={filters.availability}
        onSelect={(value) => onChangeFilter('availability', value)}
      />

      <FilterGroup
        icon="star-outline"
        label={copy.rating}
        options={options.rating}
        selected={filters.rating}
        onSelect={(value) => onChangeFilter('rating', value)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 14,
    borderWidth: 1,
    borderColor: '#e6ece8',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#273632',
    fontSize: 12,
    fontWeight: '700',
  },
  clearButton: {
    backgroundColor: '#edf5f1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearLabel: {
    color: '#0c5a49',
    fontSize: 10,
    fontWeight: '700',
  },
  searchWrap: {
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dbe7e1',
    backgroundColor: '#f8fbf9',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#28443d',
    fontSize: 12,
    paddingVertical: 10,
  },
  group: {
    gap: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupLabel: {
    color: '#273632',
    fontSize: 12,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    backgroundColor: '#edf5f1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  optionChipActive: {
    backgroundColor: '#0c5a49',
  },
  optionText: {
    color: '#325048',
    fontSize: 10.5,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#ffffff',
  },
});
