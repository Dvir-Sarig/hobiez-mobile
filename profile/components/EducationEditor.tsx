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
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  educationList: Education[];
  onChange: (updated: Education[]) => void;
  hideTitle?: boolean;
}

export default function EducationEditor({ educationList, onChange, hideTitle }: Props) {
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
    <View style={{ marginTop: 12 }}>
      {!hideTitle && <Text style={styles.title}>Education</Text>}

      {educationList.map((edu, index) => (
        <View key={index} style={styles.entry}>
          <View style={styles.entryHeader}> 
              <Text style={styles.entryBadge}>#{index + 1}</Text>
              <TouchableOpacity onPress={() => removeItem(index)} style={styles.iconRemoveBtn}>
                <MaterialIcons name="delete-outline" size={18} color="#d32f2f" />
              </TouchableOpacity>
            </View>
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
        <MaterialIcons name="add-circle-outline" size={18} color="#fff" style={{marginRight:6}} />
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
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#0d47a1',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  entryHeader:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginBottom:8,
  },
  entryBadge:{
    backgroundColor:'#1976d2',
    color:'#fff',
    paddingHorizontal:10,
    paddingVertical:4,
    borderRadius:12,
    fontSize:12,
    fontWeight:'700',
    letterSpacing:0.5,
  },
  iconRemoveBtn:{
    width:34,
    height:34,
    borderRadius:17,
    backgroundColor:'rgba(211,47,47,0.08)',
    alignItems:'center',
    justifyContent:'center',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    fontSize: 14,
    color: '#0f172a',
  },
  dateButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#64b5f6',
    backgroundColor: '#e3f2fd',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#1565c0',
    fontWeight: '600',
  },
  removeButton: {
    display:'none'
  },
  removeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  addButton: {
    backgroundColor: '#1976d2',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
    flexDirection:'row',
    justifyContent:'center',
    shadowColor:'#000',
    shadowOpacity:0.18,
    shadowRadius:6,
    shadowOffset:{width:0,height:3}
  },
  addText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing:0.5,
  },
});

