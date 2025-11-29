import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SupportedHobby, SUPPORTED_HOBBIES } from '../types/profile';

interface Props {
  selectedHobbies: SupportedHobby[];
  onAdd: (hobby: SupportedHobby) => void;
  onRemove: (hobby: SupportedHobby) => void;
  editable?: boolean;
}

const HobbySelector: React.FC<Props> = ({ selectedHobbies, onAdd, onRemove, editable = true }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <MaterialIcons name="sports" size={24} color="#1976d2" />
        <Text style={styles.label}>Hobbies</Text>
      </View>
      <View style={styles.chipContainer}>
        {selectedHobbies.map((hobby) => (
          <TouchableOpacity 
            key={hobby} 
            onPress={() => editable && onRemove(hobby)} 
            style={styles.chipSelected}
          >
            <Text style={styles.chipText}>{hobby}</Text>
            {editable && <MaterialIcons name="close" size={16} color="#fff" style={styles.closeIcon} />}
          </TouchableOpacity>
        ))}
        {editable && SUPPORTED_HOBBIES.filter((h: SupportedHobby) => !selectedHobbies.includes(h)).map((hobby: SupportedHobby) => (
          <TouchableOpacity 
            key={hobby} 
            onPress={() => onAdd(hobby)} 
            style={styles.chip}
          >
            <Text style={styles.chipTextUnselected}>{hobby}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#0d47a1',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1976d2',
    marginLeft: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  chipSelected: {
    backgroundColor: '#1976d2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  chipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextUnselected: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  closeIcon: {
    marginLeft: 6,
  },
});

export default HobbySelector;
