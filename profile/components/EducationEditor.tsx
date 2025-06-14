import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Education } from '../types/profile';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  educationList: Education[];
  onChange: (updated: Education[]) => void;
}

export default function EducationEditor({ educationList, onChange }: Props) {
  const [showDatePicker, setShowDatePicker] = useState<{
    index: number;
    field: 'startDate' | 'endDate' | null;
  }>({ index: -1, field: null });

  const updateItem = (index: number, updated: Partial<Education>) => {
    const newList = [...educationList];
    newList[index] = { ...newList[index], ...updated };
    onChange(newList);
  };

  const addItem = () => {
    onChange([
      ...educationList,
      {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: '',
        gpa: null,
        achievements: [],
      },
    ]);
  };

  const removeItem = (index: number) => {
    const newList = educationList.filter((_, i) => i !== index);
    onChange(newList);
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    if (showDatePicker.field && showDatePicker.index !== -1 && selectedDate) {
      updateItem(showDatePicker.index, {
        [showDatePicker.field]: selectedDate.toISOString().split('T')[0],
      });
    }
    setShowDatePicker({ index: -1, field: null });
  };

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={styles.title}>Education</Text>

      {educationList.map((edu, index) => (
        <View key={index} style={styles.entry}>
          <TextInput
            style={styles.input}
            placeholder="Institution"
            value={edu.institution}
            onChangeText={(val) => updateItem(index, { institution: val })}
          />
          <TextInput
            style={styles.input}
            placeholder="Degree"
            value={edu.degree}
            onChangeText={(val) => updateItem(index, { degree: val })}
          />
          <TextInput
            style={styles.input}
            placeholder="Field of Study"
            value={edu.fieldOfStudy}
            onChangeText={(val) => updateItem(index, { fieldOfStudy: val })}
          />

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker({ index, field: 'startDate' })}
          >
            <Text style={styles.dateText}>Start Date: {edu.startDate}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker({ index, field: 'endDate' })}
          >
            <Text style={styles.dateText}>End Date: {edu.endDate || 'Present'}</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Description"
            value={edu.description || ''}
            onChangeText={(val) => updateItem(index, { description: val })}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="GPA"
            value={edu.gpa?.toString() || ''}
            keyboardType="numeric"
            onChangeText={(val) => updateItem(index, { gpa: parseFloat(val) || null })}
          />

          <TouchableOpacity onPress={() => removeItem(index)} style={styles.removeButton}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      {showDatePicker.field && (
        <DateTimePicker
          value={
            new Date(educationList[showDatePicker.index]?.[showDatePicker.field] || new Date())
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      <TouchableOpacity onPress={addItem} style={styles.addButton}>
        <Text style={styles.addText}>Add Education</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: '800',
    fontSize: 20,
    color: '#0d47a1',
    marginBottom: 16,
  },
  entry: {
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbdefb',
    borderRadius: 16,
    backgroundColor: '#f5faff',
    ...Platform.select({
      ios: {
        shadowColor: '#1976d2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    fontSize: 16,
    color: '#212121',
  },
  dateButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#64b5f6',
    backgroundColor: '#e3f2fd',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 15,
    color: '#1565c0',
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#d32f2f',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  removeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  addButton: {
    backgroundColor: '#0d47a1',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

