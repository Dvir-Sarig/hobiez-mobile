import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CoachProfile } from '../../types/profile';
import BaseProfileView from './BaseProfileView';

interface CoachProfileViewProps {
  profileData: CoachProfile;
  onEditClick?: () => void;
}

export default function CoachProfileView({ profileData, onEditClick }: CoachProfileViewProps) {
  return (
    <BaseProfileView profileData={profileData} onEditClick={onEditClick}>
      {/* Experience */}
      <View style={styles.section}>
        <SectionHeader icon="work" title="Experience" />
        <Text style={styles.textBody}>
          {profileData.experience || 'No experience information available'}
        </Text>
      </View>

      {/* Education */}
      <View style={styles.section}>
        <SectionHeader icon="school" title="Education" />
        {profileData.education?.map((edu, index) => (
          <View key={index} style={styles.eduBlock}>
            <Text style={styles.eduDegree}>{edu.degree}</Text>
            <Text style={styles.eduInstitution}>{edu.institution}</Text>
            <Text style={styles.eduDates}>
              {edu.startDate} – {edu.endDate || 'Present'}
            </Text>
            {edu.fieldOfStudy && <Text style={styles.textBody}>Field: {edu.fieldOfStudy}</Text>}
            {edu.description && <Text style={styles.textBody}>{edu.description}</Text>}
            {edu.gpa !== null && edu.gpa !== undefined && (
              <Text style={styles.textBody}>GPA: {edu.gpa}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <SectionHeader icon="star" title="Skills" />
        <View style={styles.chipContainer}>
          {profileData.skills?.map((skill, index) => (
            <View key={index} style={styles.primaryChip}>
              <Text style={styles.chipText}>{skill.name} ({skill.level})</Text>
              {skill.description && (
                <Text style={styles.skillDescription}>{skill.description}</Text>
              )}
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
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  textBody: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 6,
  },
  eduBlock: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  eduDegree: {
    fontSize: 15,
    fontWeight: '600',
    color: '#263238',
  },
  eduInstitution: {
    fontSize: 14,
    color: '#555',
  },
  eduDates: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  primaryChip: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },
  skillDescription: {
    fontSize: 12,
    color: '#607d8b',
    marginTop: 4,
  },
  secondaryChip: {
    backgroundColor: '#fce4ec',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  secondaryChipText: {
    fontSize: 14,
    color: '#d81b60',
    fontWeight: '500',
  },
});
