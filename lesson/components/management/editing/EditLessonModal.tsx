import React, { useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Location } from '../../../../profile/types/profile';
import LocationField from '../../../../integrations/google_location/LocationField';
import dayjs from 'dayjs';

interface EditLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  lessonData: {
    description: string;
    time: dayjs.Dayjs;
    capacityLimit: string;
    duration: number;
    location: { city: string; country: string };
  };
  setLessonData: React.Dispatch<React.SetStateAction<{
    description: string;
    time: dayjs.Dayjs;
    capacityLimit: string;
    duration: number;
    location: { city: string; country: string };
  }>>;
  isSubmitting?: boolean;
}

const EditLessonModal: React.FC<EditLessonModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  lessonData,
  setLessonData,
  isSubmitting = false
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const currentDate = lessonData.time ? lessonData.time.toDate() : new Date();
  const [date, setDate] = useState<Date>(currentDate);

  const onChangeDate = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setLessonData({ ...lessonData, time: dayjs(selectedDate) });
    }
  };

  const handleNumberChange = (field: string, value: string, isFloat = false) => {
    const parsed = isFloat ? parseFloat(value) : parseInt(value);
    setLessonData({ ...lessonData, [field]: isNaN(parsed) ? '' : parsed });
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Lesson</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color="#555" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          >
            <ScrollView style={styles.content}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.input}
                  multiline
                  numberOfLines={3}
                  value={lessonData.description}
                  onChangeText={(text) => setLessonData({ ...lessonData, description: text })}
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
                    value={lessonData.time.toDate()}
                    mode="datetime"
                    display="default"
                    onChange={onChangeDate}
                  />
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Duration (minutes)</Text>
                <View style={styles.inputWithIcon}>
                  <Icon name="timer" size={20} color="#1976d2" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputWithIconText]}
                    keyboardType="numeric"
                    value={lessonData.duration?.toString() || ''}
                    onChangeText={(value) => handleNumberChange('duration', value)}
                    placeholder="Enter duration in minutes"
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
                    value={lessonData.capacityLimit?.toString() || ''}
                    onChangeText={(value) => handleNumberChange('capacityLimit', value)}
                    placeholder="Enter maximum number of participants"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <LocationField
                  location={lessonData.location || { city: '', country: '' }}
                  onLocationSelect={(location: Location) => {
                    setLessonData((prev: any) => ({
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
            </ScrollView>
          </KeyboardAvoidingView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]} 
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1976d2',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditLessonModal;
