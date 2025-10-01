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
  completionPercent?: number;
}

export default function ClientProfileView({
  profileData,
  onEditClick,
  completionPercent,
}: ClientProfileViewProps) {
  return (
    <BaseProfileView profileData={profileData} onEditClick={onEditClick} completionPercent={completionPercent}>
      {/* Hobbies */}
      <View style={styles.section}>
        <SectionHeader icon="sports" title="Hobbies" />
        <View style={styles.chipContainer}>
          {profileData.hobbies?.map((hobby, i) => (
            <View key={i} style={styles.primaryChip}>
              <Text style={styles.primaryChipText}>{hobby}</Text>
            </View>
          ))}
          {(!profileData.hobbies || profileData.hobbies.length===0) && <Text style={styles.emptyText}>No hobbies added yet</Text>}
        </View>
      </View>

      {/* Languages */}
      <View style={[styles.section,{marginBottom:42}]}>
        <SectionHeader icon="language" title="Languages" />
        <View style={styles.chipContainer}>
          {profileData.genericProfile.languages?.map((lang,i)=>(
            <View key={i} style={styles.secondaryChip}>
              <Text style={styles.secondaryChipText}>{lang}</Text>
            </View>
          ))}
          {(!profileData.genericProfile.languages || profileData.genericProfile.languages.length===0) && <Text style={styles.emptyText}>No languages listed</Text>}
        </View>
      </View>
    </BaseProfileView>
  );
}

function SectionHeader({ icon, title }: { icon: any; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrapper}>
        <MaterialIcons name={icon} size={18} color="#1976d2" />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 18,
    borderRadius: 22,
    marginTop: 18,
    shadowColor: '#0d47a1',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0d47a1',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryChip: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  primaryChipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  secondaryChip: {
    backgroundColor: '#1565c0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  secondaryChipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  emptyText: {
    color: '#607d8b',
    fontSize: 13,
    fontStyle: 'italic',
  },
});
