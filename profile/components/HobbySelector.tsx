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
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginLeft: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipSelected: {
    backgroundColor: '#1976d2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextUnselected: {
    color: '#424242',
    fontSize: 14,
    fontWeight: '500',
  },
  closeIcon: {
    marginLeft: 6,
  },
});

export default HobbySelector;
