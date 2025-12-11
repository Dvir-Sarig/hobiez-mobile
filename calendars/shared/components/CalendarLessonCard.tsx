import React from 'react';
import { Image } from 'react-native';
import { getLessonBackground } from '../../../lesson/types/LessonType';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';

interface CalendarLessonCardProps {
  lesson: {
    id: number;
    title: string;
    time: string;
    duration: number;
    location?: { address?: string | null; city?: string; country?: string };
    capacityLimit?: number;
    registeredCount?: number;
  };
  typeVisual: { abbr: string; bg: string; border: string };
  onPress: (lesson: any) => void;
}

export const CalendarLessonCard: React.FC<CalendarLessonCardProps> = ({ lesson, typeVisual, onPress }) => {
  const fillPct = Math.min(100, ((lesson.registeredCount || 0) / (lesson.capacityLimit || 1)) * 100);
  const lessonImageSource = getLessonBackground(lesson.title);
  return (
    <TouchableOpacity key={lesson.id} style={styles.dayLessonCard} onPress={() => onPress(lesson)} activeOpacity={0.85}>
      {lessonImageSource && (
        <Image source={lessonImageSource} style={styles.lessonBanner} resizeMode="cover" />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.dayLessonTitle} numberOfLines={1}>{lesson.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginVertical: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="schedule" size={14} color="#1976d2" style={{ marginRight: 2 }} />
            <Text style={styles.dayLessonMeta}>{dayjs(lesson.time).format('HH:mm')}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="timer" size={14} color="#1976d2" style={{ marginRight: 2 }} />
            <Text style={styles.dayLessonMeta}>{lesson.duration} min</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="group" size={14} color="#1976d2" style={{ marginRight: 2 }} />
            <Text style={styles.dayLessonMeta}>{lesson.registeredCount || 0}/{lesson.capacityLimit}</Text>
          </View>
        </View>
        {lesson.location && (
          <Text style={styles.dayLessonLocation} numberOfLines={1}>
            {(lesson.location.address ?? undefined) || `${lesson.location.city || ''}, ${lesson.location.country || ''}`}
          </Text>
        )}
        <View style={styles.capacityBar}><View style={[styles.capacityFill, { width: `${fillPct}%` }]} /></View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dayLessonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(13,71,161,0.1)',
    shadowColor: '#0d47a1',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
  },
  lessonBanner: {
    width: '100%',
    height: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#f3f3f3',
  },
  cardContent: {
    padding: 14,
  },
  typeBadge: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dayLessonTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0d47a1',
    marginBottom: 4,
  },
  dayLessonMeta: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1976d2',
  },
  dayLessonLocation: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  capacityBar: {
    height: 5,
    backgroundColor: '#e0f2fe',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  capacityFill: {
    height: 5,
    backgroundColor: '#1976d2',
  },
});

