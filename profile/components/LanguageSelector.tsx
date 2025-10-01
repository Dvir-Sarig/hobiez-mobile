import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types/profile';

interface Props {
  selectedLanguages: SupportedLanguage[];
  onAdd: (lang: SupportedLanguage) => void;
  onRemove: (lang: SupportedLanguage) => void;
  editable?: boolean;
  hideHeader?: boolean;
}

const LanguageSelector: React.FC<Props> = ({ selectedLanguages, onAdd, onRemove, editable = true, hideHeader = false }) => {
  return (
    <View style={styles.container}>
      {!hideHeader && (
        <View style={styles.headerContainer}>
          <MaterialIcons name="translate" size={24} color="#1976d2" />
          <Text style={styles.label}>Languages</Text>
        </View>
      )}
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

export default LanguageSelector;
