import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { lessonTypes, getLessonIcon } from '../../types/LessonType';
import { MaterialIcons } from '@expo/vector-icons';
import SearchLocationField from './SearchLocationField';

interface SearchFormProps {
  searchQuery: {
    maxPrice: string;
    lessonType: string;
    maxParticipants: string;
    coachName: string;
    location: any;
    radiusKm?: number | null;
  };
  setSearchQuery: (query: SearchFormProps['searchQuery']) => void;
  onSearch: (query: any) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ searchQuery, setSearchQuery, onSearch }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lessonTypeModalVisible, setLessonTypeModalVisible] = useState(false);

  const handleSearchClick = () => {
    const requestBody: any = {
      maxPrice: parseFloat(searchQuery.maxPrice) || undefined,
      lessonType: searchQuery.lessonType || undefined,
      maxParticipants: parseInt(searchQuery.maxParticipants) || undefined,
      coachName: searchQuery.coachName || undefined,
    };

    if (searchQuery.location?.latitude && searchQuery.location?.longitude) {
      requestBody.location = {
        latitude: searchQuery.location.latitude,
        longitude: searchQuery.location.longitude,
        radiusKm: searchQuery.radiusKm,
      };
    }

    onSearch(requestBody);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.wrapper} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>🔍 Find your next lesson</Text>

          <View style={styles.inlineRow}>
            <TextInput
              style={[styles.input, styles.inlineInput]}
              placeholder="Coach Name"
              value={searchQuery.coachName}
              onChangeText={(text) => setSearchQuery({ ...searchQuery, coachName: text })}
            />

            <Pressable
              style={[styles.input, styles.inlineInput]}
              onPress={() => setLessonTypeModalVisible(true)}
            >
              <Text style={styles.pickerText}>
                {searchQuery.lessonType || 'Any Lesson'}
              </Text>
            </Pressable>
          </View>

          <View style={{ marginTop: -20, marginBottom: 12 }}>
            <SearchLocationField
              location={searchQuery.location || { city: '', country: '', address: null, latitude: null, longitude: null }}
              onLocationSelect={(loc) => setSearchQuery({ ...searchQuery, location: loc })}
              radiusKm={searchQuery.radiusKm}
              onRadiusChange={(r) => setSearchQuery({ ...searchQuery, radiusKm: r })}
            />
          </View>

          {showAdvanced && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Max Price"
                keyboardType="numeric"
                value={searchQuery.maxPrice}
                onChangeText={(text) => setSearchQuery({ ...searchQuery, maxPrice: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Max Participants"
                keyboardType="numeric"
                value={searchQuery.maxParticipants}
                onChangeText={(text) => setSearchQuery({ ...searchQuery, maxParticipants: text })}
              />
            </>
          )}

          <TouchableOpacity onPress={() => setShowAdvanced((prev) => !prev)}>
            <Text style={styles.advancedToggle}>{showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.searchButton} onPress={handleSearchClick}>
            <MaterialIcons name="search" size={20} color="white" />
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <Modal
          transparent
          visible={lessonTypeModalVisible}
          animationType="slide"
          onRequestClose={() => setLessonTypeModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setLessonTypeModalVisible(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Lesson Type</Text>
              <TouchableOpacity
                style={[styles.modalItem, styles.clearOption]}
                onPress={() => {
                  setSearchQuery({ ...searchQuery, lessonType: '' });
                  setLessonTypeModalVisible(false);
                }}
              >
                <View style={styles.modalItemContent}>
                  <MaterialIcons name="filter-list" size={24} color="#666" />
                  <Text style={[styles.modalItemText, styles.clearOptionText]}>Any Lesson</Text>
                </View>
              </TouchableOpacity>
              {lessonTypes.map((type) => {
                const { IconComponent, iconName } = getLessonIcon(type);
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.modalItem,
                      searchQuery.lessonType === type && styles.selectedItem
                    ]}
                    onPress={() => {
                      setSearchQuery({ ...searchQuery, lessonType: type });
                      setLessonTypeModalVisible(false);
                    }}
                  >
                    <View style={styles.modalItemContent}>
                      <IconComponent name={iconName} size={24} color="#1976d2" />
                      <Text style={[
                        styles.modalItemText,
                        searchQuery.lessonType === type && styles.selectedItemText
                      ]}>
                        {type}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0d47a1',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#90caf9',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  inlineInput: {
    flex: 1,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 14,
  },
  advancedToggle: {
    color: '#1976d2',
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  searchButton: {
    flexDirection: 'row',
    backgroundColor: '#1976d2',
    paddingVertical: 14,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 0,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#0d47a1',
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  clearOption: {
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  clearOptionText: {
    color: '#666',
    fontWeight: '500',
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
  },
  selectedItemText: {
    color: '#1976d2',
    fontWeight: '600',
  },
});

export default SearchForm;