import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { lessonTypes, LessonType } from '../../lesson/types/LessonType';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  selectedSkills: LessonType[];
  onAdd: (skill: LessonType) => void;
  onRemove: (skill: LessonType) => void;
  hideLabel?: boolean;
}

export default function SkillSelector({ selectedSkills, onAdd, onRemove, hideLabel = false }: Props) {
  const [selectedSport, setSelectedSport] = useState<LessonType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const availableHobbies = lessonTypes.filter(
    (hobby) => !selectedSkills.some((skill) => skill === hobby)
  );

  const handleAdd = () => {
    if (selectedSport) {
      onAdd(selectedSport);
      setSelectedSport(null);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      {!hideLabel && <Text style={styles.label}>Coaching Types</Text>}
      {/* Selected chips */}
      <View style={styles.chipsContainer}>
        {selectedSkills.map((skill, index) => (
          <View key={index} style={styles.skillPill}>
            <Text style={styles.skillPillText}>{`${skill}`}</Text>
            <TouchableOpacity onPress={() => onRemove(skill)} style={styles.removePillBtn}>
              <MaterialIcons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Add skill button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add-circle-outline" size={18} color="#fff" style={{marginRight:6}} />
        <Text style={styles.addButtonText}>Add Coaching Type</Text>
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
            <Text style={styles.modalTitle}>Add Coaching Type</Text>

            <Text style={styles.modalLabel}>Type</Text>
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

            {/* Level removed for simplified UX */}

            {/* Modal buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !selectedSport && styles.disabledButton,
                ]}
                onPress={handleAdd}
                disabled={!selectedSport}
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
    marginTop: 8,
    marginBottom: 24,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#0d47a1',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  label: {
    fontWeight: '700',
    fontSize: 13,
    color: '#1976d2',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: { // legacy unused kept
    backgroundColor: '#e3f2fd',
    borderRadius: 18,
    marginRight: 4,
  },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginRight: 4,
    marginBottom: 6,
  },
  skillPillText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  removePillBtn: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)'
  },
  addButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    flexDirection: 'row',
    justifyContent: 'center'
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0d47a1',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  modalLabel: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#1976d2',
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: '#bbdefb',
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
    overflow: 'hidden',
    marginBottom: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#1976d2',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  disabledButton: {
    backgroundColor: '#90a4ae',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#475569',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
