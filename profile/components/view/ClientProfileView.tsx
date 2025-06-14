import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ClientProfile } from '../../types/profile';
import BaseProfileView from './BaseProfileView';

interface ClientProfileViewProps {
  profileData: ClientProfile;
  onEditClick?: () => void;
}

export default function ClientProfileView({
  profileData,
  onEditClick,
}: ClientProfileViewProps) {
  return (
    <BaseProfileView profileData={profileData} onEditClick={onEditClick}>
      {/* Hobbies */}
      <View style={styles.section}>
        <SectionHeader icon="sports" title="Hobbies" />
        <View style={styles.chipContainer}>
          {profileData.hobbies?.map((hobby, index) => (
            <View key={index} style={styles.primaryChip}>
              <Text style={styles.chipText}>{hobby}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Languages */}
      <View style={[styles.section, { marginBottom: 32 }]}>
        <SectionHeader icon="language" title="Languages" />
        <View style={styles.chipContainer}>
          {profileData.genericProfile.languages?.map((lang, index) => (
            <View key={index} style={styles.secondaryChip}>
              <Text style={styles.secondaryChipText}>{lang}</Text>
            </View>
          ))}
        </View>
      </View>
    </BaseProfileView>
  );
}

function SectionHeader({ icon, title }: { icon: any; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <MaterialIcons name={icon} size={20} color="#1976d2" style={styles.icon} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a237e',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  primaryChip: {
    backgroundColor: '#bbdefb',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    color: '#0d47a1',
    fontWeight: '600',
  },
  secondaryChip: {
    backgroundColor: '#f8bbd0',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
  },
  secondaryChipText: {
    fontSize: 14,
    color: '#880e4f',
    fontWeight: '600',
  },
});
