import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Skill, SupportedHobby } from '../types/profile';
import { Chip } from 'react-native-paper';

const LEVELS: Skill['level'][] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

const SUPPORTED_HOBBIES: SupportedHobby[] = [
  'Tennis', 'Yoga', 'Surfing', 'Swimming', 'Running', 'Cycling',
  'Basketball', 'Soccer', 'Volleyball', 'Dancing', 'Martial Arts',
  'Golf', 'Skiing', 'Hiking', 'Rock Climbing', 'Pilates',
  'CrossFit', 'Boxing', 'Weightlifting', 'Meditation'
];

interface Props {
  selectedSkills: Skill[];
  onAdd: (skill: Skill) => void;
  onRemove: (skill: Skill) => void;
}

export default function SkillSelector({ selectedSkills, onAdd, onRemove }: Props) {
  const [selectedSport, setSelectedSport] = useState<SupportedHobby | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Skill['level'] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const availableHobbies = SUPPORTED_HOBBIES.filter(
    (hobby) => !selectedSkills.some((skill) => skill.name === hobby)
  );

  const handleAdd = () => {
    if (selectedSport && selectedLevel) {
      const newSkill: Skill = {
        name: selectedSport,
        level: selectedLevel,
        category: 'COACHING',
      };
      onAdd(newSkill);
      setSelectedSport(null);
      setSelectedLevel(null);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Skills</Text>

      {/* Selected chips */}
      <View style={styles.chipsContainer}>
        {selectedSkills.map((skill, index) => (
          <Chip
            key={index}
            style={styles.chip}
            onClose={() => onRemove(skill)}
          >
            {`${skill.name} (${skill.level})`}
          </Chip>
        ))}
      </View>

      {/* Add skill button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add Skill</Text>
      </TouchableOpacity>

      {/* Modal with pickers */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Skill</Text>

            <Text style={styles.modalLabel}>Sport</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedSport}
                onValueChange={(itemValue) => setSelectedSport(itemValue)}
              >
                <Picker.Item label="Select a sport..." value={null} />
                {availableHobbies.map((hobby) => (
                  <Picker.Item key={hobby} label={hobby} value={hobby} />
                ))}
              </Picker>
            </View>

            <Text style={styles.modalLabel}>Level</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedLevel}
                onValueChange={(itemValue) => setSelectedLevel(itemValue)}
              >
                <Picker.Item label="Select level..." value={null} />
                {LEVELS.map((level) => (
                  <Picker.Item key={level} label={level} value={level} />
                ))}
              </Picker>
            </View>

            {/* Modal buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !(selectedSport && selectedLevel) && styles.disabledButton,
                ]}
                onPress={handleAdd}
                disabled={!selectedSport || !selectedLevel}
              >
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 24,
  },
  label: {
    fontWeight: '800',
    fontSize: 20,
    color: '#0d47a1',
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#e1f5fe',
  },
  addButton: {
    backgroundColor: '#0d47a1',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0d47a1',
    marginBottom: 12,
  },
  modalLabel: {
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
    color: '#1976d2',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#bbdefb',
    borderRadius: 12,
    backgroundColor: '#f0f8ff',
    overflow: 'hidden',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#0d47a1',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
  },
});
