import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CoachProfile } from '../../types/profile';
import BaseProfileView from './BaseProfileView';

interface CoachProfileViewProps {
  profileData: CoachProfile;
  onEditClick?: () => void;
  onViewCalendarClick?: () => void;
  onWhatsAppPress?: () => void;
}

export default function CoachProfileView({ profileData, onEditClick, onViewCalendarClick, onWhatsAppPress }: CoachProfileViewProps) {
  return (
    <BaseProfileView profileData={profileData} onEditClick={onEditClick}>
      <View style={styles.actionButtonsContainer}>
        {onViewCalendarClick && (
          <TouchableOpacity style={styles.calendarButton} onPress={onViewCalendarClick}>
            <MaterialIcons name="calendar-today" size={20} color="#fff" />
            <Text style={styles.calendarButtonText}>View Calendar</Text>
          </TouchableOpacity>
        )}
        {onWhatsAppPress && (
          <TouchableOpacity style={styles.whatsAppButton} onPress={onWhatsAppPress}>
            <MaterialCommunityIcons name="whatsapp" size={20} color="#fff" />
            <Text style={styles.whatsAppButtonText}>WhatsApp</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.section}>
        <SectionHeader icon="work" title="Experience" />
        <Text style={styles.longText}>{profileData.experience || 'No experience info yet'}</Text>
      </View>

      <View style={styles.section}>
        <SectionHeader icon="school" title="Education" />
        {profileData.education && profileData.education.length > 0 ? profileData.education.map((edu, i) => (
          <View key={i} style={[styles.eduBlock, i === profileData.education.length - 1 && styles.eduBlockLast]}>
            <Text style={styles.eduDegree}>{edu.degree}</Text>
            <Text style={styles.eduInstitution}>{edu.institution}</Text>
            <Text style={styles.eduDates}>{edu.startDate} – {edu.endDate || 'Present'}</Text>
            {!!edu.fieldOfStudy && <Text style={styles.metaText}>{edu.fieldOfStudy}</Text>}
            {!!edu.description && <Text style={styles.metaText}>{edu.description}</Text>}
            {edu.gpa !== null && edu.gpa !== undefined && <Text style={styles.metaBadge}>GPA {edu.gpa}</Text>}
          </View>
        )) : <Text style={styles.emptyText}>No education added yet</Text>}
      </View>

      <View style={styles.section}>
        <SectionHeader icon="star" title="Skills" />
        <View style={styles.chipContainer}>
          {profileData.skills && profileData.skills.length > 0 ? profileData.skills.map((skill, i) => (
            <View key={i} style={styles.skillChip}><Text style={styles.skillChipText}>{skill.name} · {skill.level}</Text></View>
          )) : <Text style={styles.emptyText}>No skills listed</Text>}
        </View>
      </View>

      <View style={[styles.section, { marginBottom: 42 }]}>
        <SectionHeader icon="language" title="Languages" />
        <View style={styles.chipContainer}>
          {profileData.genericProfile.languages && profileData.genericProfile.languages.length > 0 ? profileData.genericProfile.languages.map((lang, i) => (
            <View key={i} style={styles.langChip}><Text style={styles.langChipText}>{lang}</Text></View>
          )) : <Text style={styles.emptyText}>No languages listed</Text>}
        </View>
      </View>
    </BaseProfileView>
  );
}

function SectionHeader({ icon, title }: { icon: any; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrapper}><MaterialIcons name={icon} size={18} color="#1976d2" /></View>
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
  longText: {
    fontSize: 14,
    color: '#37474f',
    lineHeight: 20,
  },
  eduBlock: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(13,71,161,0.08)',
    paddingBottom: 12,
  },
  eduBlockLast: {
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  eduDegree: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0d47a1',
  },
  eduInstitution: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1565c0',
    marginTop: 2,
  },
  eduDates: {
    fontSize: 11,
    color: '#607d8b',
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: '#455a64',
    marginTop: 4,
  },
  metaBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#1976d2',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillChip: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  skillChipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  langChip: {
    backgroundColor: '#1565c0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  langChipText: {
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
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 5,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    flex: 1,
    marginRight: 5,
  },
  calendarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  whatsAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    flex: 1,
    marginLeft: 5,
  },
  whatsAppButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
