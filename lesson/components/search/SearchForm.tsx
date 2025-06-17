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
    day?: Date | null;
  };
  setSearchQuery: (query: SearchFormProps['searchQuery']) => void;
  onSearch: (query: any) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ searchQuery, setSearchQuery, onSearch }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lessonTypeModalVisible, setLessonTypeModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const generateDates = () => {
    const dates = [];
    const today = new Date(currentMonth);
    // Get the first day of the current month
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    // Get the last day of the current month
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Add dates for the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(today);
      date.setDate(i);
      dates.push(date);
    }
    return dates;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

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

    if (searchQuery.day) {
      const formattedDate = searchQuery.day.toISOString().split('T')[0];
      requestBody.day = formattedDate;
    }

    onSearch(requestBody);
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Select Day';
    return date.toLocaleDateString();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
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
              <Pressable
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.datePickerContainer}>
                  <MaterialIcons name="calendar-today" size={20} color="#1976d2" />
                  <Text style={styles.pickerText}>
                    {formatDate(searchQuery.day)}
                  </Text>
                </View>
              </Pressable>
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

        <Modal
          transparent
          animationType="fade"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
            <View style={styles.dateModalContainer}>
              <View style={styles.monthNavigation}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton}>
                  <MaterialIcons name="chevron-left" size={24} color="#1976d2" />
                </TouchableOpacity>
                <Text style={styles.monthTitle}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
                  <MaterialIcons name="chevron-right" size={24} color="#1976d2" />
                </TouchableOpacity>
              </View>
              <View style={styles.calendarContainer}>
                <View style={styles.weekDaysContainer}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Text key={day} style={styles.weekDayText}>{day}</Text>
                  ))}
                </View>
                <View style={styles.datesContainer}>
                  {generateDates().map((date) => (
                    <TouchableOpacity
                      key={date.toISOString()}
                      style={[
                        styles.dateItem,
                        date.getDate() === searchQuery.day?.getDate() && 
                        date.getMonth() === searchQuery.day?.getMonth() && 
                        styles.selectedDateItem
                      ]}
                      onPress={() => {
                        setSearchQuery({ ...searchQuery, day: date });
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={[
                        styles.dateItemText,
                        date.getDate() === searchQuery.day?.getDate() && 
                        date.getMonth() === searchQuery.day?.getMonth() && 
                        styles.selectedDateText
                      ]}>
                        {date.getDate()}
                      </Text>
                      <Text style={styles.dayNameText}>{getDayName(date)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                style={styles.clearDateButton}
                onPress={() => {
                  setSearchQuery({ ...searchQuery, day: null });
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.clearDateText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1976d2',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  inlineInput: {
    flex: 1,
  },
  pickerText: {
    color: '#666',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchButton: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  advancedToggle: {
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1976d2',
  },
  modalItem: {
    padding: 12,
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
  selectedItem: {
    backgroundColor: '#e3f2fd',
  },
  selectedItemText: {
    color: '#1976d2',
    fontWeight: '500',
  },
  clearOption: {
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
  },
  clearOptionText: {
    color: '#666',
  },
  dateModalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxWidth: 400,
  },
  calendarContainer: {
    marginTop: 8,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  datesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dateItem: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 8,
  },
  dateItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedDateItem: {
    backgroundColor: '#1976d2',
  },
  selectedDateText: {
    color: 'white',
  },
  dayNameText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  clearDateButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fbe9e7',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearDateText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: '500',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
  },
});

export default SearchForm;