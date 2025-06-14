import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types/profile';

interface Props {
  selectedLanguages: SupportedLanguage[];
  onAdd: (lang: SupportedLanguage) => void;
  onRemove: (lang: SupportedLanguage) => void;
  editable?: boolean;
}

const LanguageSelector: React.FC<Props> = ({ selectedLanguages, onAdd, onRemove, editable = true }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <MaterialIcons name="translate" size={24} color="#1976d2" />
        <Text style={styles.label}>Languages</Text>
      </View>
      <View style={styles.chipContainer}>
        {selectedLanguages.map((lang) => (
          <TouchableOpacity 
            key={lang} 
            onPress={() => editable && onRemove(lang)} 
            style={styles.chipSelected}
          >
            <Text style={styles.chipText}>{lang}</Text>
            {editable && <MaterialIcons name="close" size={16} color="#fff" style={styles.closeIcon} />}
          </TouchableOpacity>
        ))}
        {editable && SUPPORTED_LANGUAGES.filter((l: SupportedLanguage) => !selectedLanguages.includes(l)).map((lang: SupportedLanguage) => (
          <TouchableOpacity 
            key={lang} 
            onPress={() => onAdd(lang)} 
            style={styles.chip}
          >
            <Text style={styles.chipTextUnselected}>{lang}</Text>
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

export default LanguageSelector;
