import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Location } from '../../../../profile/types/profile';
import LocationField from '../../../../integrations/google_location/LocationField';
import { LessonType, lessonTypes, getLessonIcon } from '../../../types/LessonType';

interface CoachLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  newLesson: {
    title: string;
    description: string;
    time: string;
    price: number;
    capacityLimit: number;
    duration: number;
    location: {
      city: string;
      country: string;
    };
  };
  setNewLesson: React.Dispatch<React.SetStateAction<{
    title: string;
    description: string;
    time: string;
    price: number;
    capacityLimit: number;
    duration: number;
    location: {
      city: string;
      country: string;
    };
  }>>;
  isSubmitting?: boolean;
}

const CoachLessonModal: React.FC<CoachLessonModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newLesson,
  setNewLesson,
  isSubmitting = false,
}) => {
  const handleNumberChange = (field: string, value: string, isFloat = false) => {
    const parsed = isFloat ? parseFloat(value) : parseInt(value);
    setNewLesson({ ...newLesson, [field]: isNaN(parsed) ? '' : parsed });
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [lessonTypeModalVisible, setLessonTypeModalVisible] = useState(false);
  const [date, setDate] = useState<Date>(new Date());

  const onChangeDate = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      setDate(newDate);
      // Create a date string that preserves the exact time
      const year = newDate.getFullYear();
      const month = newDate.getMonth();
      const day = newDate.getDate();
      const hours = newDate.getHours();
      const minutes = newDate.getMinutes();
      const exactDate = new Date(year, month, day, hours, minutes);
      setNewLesson((prev: typeof newLesson) => ({ ...prev, time: exactDate.toISOString() }));
    }
  };

  // Initialize date when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setDate(now);
      if (!newLesson.time) {
        setNewLesson((prev: typeof newLesson) => ({ ...prev, time: now.toISOString() }));
      }
    }
  }, [isOpen]);

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Create New Lesson</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color="#555" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          >
            <ScrollView
              style={styles.content}
              contentContainerStyle={{ padding: 16, paddingBottom: 120, flexGrow: 1 }}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Lesson Type</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setLessonTypeModalVisible(true)}
                >
                  <Text style={styles.pickerText}>
                    {newLesson.title || 'Select Lesson Type'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.input}
                  multiline
                  numberOfLines={3}
                  value={newLesson.description}
                  onChangeText={(text) => setNewLesson({ ...newLesson, description: text })}
                  placeholder="Describe your lesson..."
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date & Time</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Icon name="calendar-today" size={20} color="#1976d2" style={styles.inputIcon} />
                  <Text style={styles.dateText}>{date.toLocaleString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="datetime"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeDate}
                  />
                )}
              </View>

              <View style={styles.inputGroup}>
                <LocationField
                  location={newLesson.location || { city: '', country: '' }}
                  onLocationSelect={(location: Location) => {
                    setNewLesson((prev: any) => ({
                      ...prev,
                      location: {
                        city: location.city,
                        country: location.country,
                        address: location.address,
                        latitude: location.latitude,
                        longitude: location.longitude,
                      },
                    }));
                  }}
                  label="Lesson Location"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Duration (minutes)</Text>
                <View style={styles.inputWithIcon}>
                  <Icon name="timer" size={20} color="#1976d2" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputWithIconText]}
                    keyboardType="numeric"
                    value={newLesson.duration?.toString() || ''}
                    onChangeText={(value) => handleNumberChange('duration', value)}
                    placeholder="Enter duration in minutes"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Price ($)</Text>
                <View style={styles.inputWithIcon}>
                  <Icon name="attach-money" size={20} color="#1976d2" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputWithIconText]}
                    keyboardType="numeric"
                    value={newLesson.price?.toString() || ''}
                    onChangeText={(value) => handleNumberChange('price', value, true)}
                    placeholder="Enter price in dollars"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Capacity Limit</Text>
                <View style={styles.inputWithIcon}>
                  <Icon name="people" size={20} color="#1976d2" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputWithIconText]}
                    keyboardType="numeric"
                    value={newLesson.capacityLimit?.toString() || ''}
                    onChangeText={(value) => handleNumberChange('capacityLimit', value)}
                    placeholder="Enter maximum number of participants"
                  />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.saveButton, isSubmitting && styles.submitButtonDisabled]} 
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Create Lesson</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
            {lessonTypes.map((type) => {
              const { IconComponent, iconName } = getLessonIcon(type);
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.modalItem,
                    newLesson.title === type && styles.selectedItem
                  ]}
                  onPress={() => {
                    setNewLesson({ ...newLesson, title: type });
                    setLessonTypeModalVisible(false);
                  }}
                >
                  <View style={styles.modalItemContent}>
                    <IconComponent name={iconName} size={24} color="#1976d2" />
                    <Text style={[
                      styles.modalItemText,
                      newLesson.title === type && styles.selectedItemText
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '90%',
    overflow: 'hidden',
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  inputIcon: {
    marginLeft: 12,
  },
  inputWithIconText: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#424242',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1976d2',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  selectedItem: {
    backgroundColor: '#e3f2fd',
  },
  selectedItemText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
});

export default CoachLessonModal;