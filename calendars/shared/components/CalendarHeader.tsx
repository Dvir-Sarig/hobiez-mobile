import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CalendarHeaderProps } from '../types/calendar.types';

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ title, onBack }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity onPress={onBack} style={styles.button}>
        <Text style={styles.buttonText}>← Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CalendarHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  button: {
    borderWidth: 1,
    borderColor: '#1976d2',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16
  },
  buttonText: {
    color: '#1976d2',
    fontWeight: '500',
    fontSize: 16
  }
});
