import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar } from 'react-native-big-calendar';
import dayjs from 'dayjs';
import { useAuth } from '../../auth/AuthContext';
import { deleteClientFromLesson, fetchClientRegisteredLessons, fetchLessonsWithRegistrationCounts } from '../../lesson/services/lessonService';
import { Lesson } from '../../lesson/types/Lesson';
import { fetchCoachGlobalInfo } from '../../profile/services/coachService';
import UnregisterLessonModal from './components/UnregisterLessonModal';
import UnregisterConfirmationModal from '../../lesson/components/management/registration/UnregisterConfirmationModal';
import CoachProfileModal from '../../profile/components/modals/CoachProfileModal';
import { formatLessonToEvent } from '../shared/utils/calendar.utils';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CalendarEvent } from '../shared/types/calendar.types';
import { formatLessonTimeReadable } from '../../shared/services/formatService';
import { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ClientCalendarView: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [coachInfoMap, setCoachInfoMap] = useState<{ [key: number]: { name: string; email: string } }>({});
  const [selectedCoachInfo, setSelectedCoachInfo] = useState<{ name: string; email: string } | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDateLessons, setSelectedDateLessons] = useState<Lesson[]>([]);

  const { userId } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const handleOpenModal = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLesson(null);
    setIsModalOpen(false);
  };

  const handleOpenDeleteModal = (lesson: Lesson) => {
    setLessonToDelete(lesson);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setLessonToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDeleteLesson = async () => {
    if (lessonToDelete) {
      await handleUnregister(lessonToDelete.id);
      handleCloseDeleteModal();
    }
  };

  const handleOpenCoachModal = (coachId: number) => {
    const coachInfo = coachInfoMap[coachId];
    if (coachInfo) {
      setSelectedCoachInfo(coachInfo);
      setIsCoachModalOpen(true);
    }
  };

  const handleUnregister = async (lessonId: number) => {
    try {
      const message = await deleteClientFromLesson(parseInt(userId!), lessonId);
      handleCloseModal();
      setEvents((prev) => prev.filter((e) => e.id !== lessonId));
    } catch (error) {
      console.error('Error unregistering:', error);
      Alert.alert('Error', 'An error occurred while unregistering.');
    }
  };

  const fetchCoachInfoData = async (coachId: number) => {
    if (!coachInfoMap[coachId]) {
      try {
        const coachInfo = await fetchCoachGlobalInfo(coachId);
        setCoachInfoMap((prev) => ({ ...prev, [coachId]: coachInfo }));
      } catch (error) {
        console.error(`Error fetching coach ${coachId}:`, error);
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    const selectedDay = dayjs(date);
    setSelectedDate(selectedDay);
    
    // Filter lessons for the selected date
    const lessonsForDate = events
      .filter(event => dayjs(event.start).isSame(selectedDay, 'day'))
      .map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        time: event.start.toISOString(),
        duration: event.duration,
        price: event.price,
        location: event.location,
        coachId: event.coachId,
        capacityLimit: event.capacityLimit,
        registeredCount: event.registeredCount,
      }));
    
    setSelectedDateLessons(lessonsForDate);
  };

  const fetchLessons = useCallback(async () => {
    if (userId) {
      try {
        const lessons = await fetchClientRegisteredLessons(userId);
        const lessonsWithCounts = await fetchLessonsWithRegistrationCounts(lessons);
        const formattedLessons = lessonsWithCounts.map((lesson: Lesson) => {
          fetchCoachInfoData(lesson.coachId);
          return formatLessonToEvent(lesson);
        });
        setEvents(formattedLessons);
        
      } catch (error) {
        console.error('Error fetching registered lessons:', error);
      }
    }
  }, [userId]);

  useEffect(() => {
    if (events.length > 0) {
      handleDateSelect((selectedDate ?? dayjs()).toDate());
    }
  }, [events]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // Add a focus listener to refresh data when the screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchLessons();
    });

    return unsubscribe;
  }, [navigation, fetchLessons]);

  const renderLessonCard = (lesson: Lesson) => (
    <TouchableOpacity
      key={lesson.id}
      style={styles.lessonCard}
      onPress={() => handleOpenModal(lesson)}
    >
      <View style={styles.lessonHeader}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonTime}>
          {formatLessonTimeReadable(lesson.time)}
        </Text>
      </View>
      
      <View style={styles.lessonDetails}>
        <View style={styles.detailRow}>
          <Icon name="person" size={16} color="#666" />
          <Text style={styles.detailText}>
            {coachInfoMap[lesson.coachId]?.name || 'Loading...'}
          </Text>
        </View>
        
        {lesson.location && (
          <View style={styles.detailRow}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.detailText}>
              {lesson.location.address || `${lesson.location.city}, ${lesson.location.country}`}
            </Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Icon name="timer" size={16} color="#666" />
          <Text style={styles.detailText}>{lesson.duration} minutes</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainDrawer', { screen: 'SearchLessons' })}>
          <Icon name="arrow-back" size={24} color="#1976d2" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Icon name="calendar-today" size={24} color="#1976d2" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>My Schedule</Text>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          events={events}
          height={300}
          mode="week"
          onPressEvent={(event: CalendarEvent) => {
            handleOpenModal(event);
          }}
          onPressCell={(date) => handleDateSelect(date)}
          swipeEnabled
          scrollOffsetMinutes={480}
          weekStartsOn={1}
          hourRowHeight={40}
          eventCellStyle={{ backgroundColor: '#1976d2', borderRadius: 6 }}
        />
      </View>

      <View style={styles.lessonsContainer}>
        <Text style={styles.dateHeader}>
          {selectedDate.format('MMMM D, YYYY')}
        </Text>
        
        {selectedDateLessons.length > 0 ? (
          <ScrollView style={styles.lessonsList}>
            {selectedDateLessons.map(renderLessonCard)}
          </ScrollView>
        ) : (
          <View style={styles.noLessonsContainer}>
            <Icon name="event-busy" size={48} color="#ccc" />
            <Text style={styles.noLessonsText}>No lessons scheduled for this day</Text>
          </View>
        )}
      </View>

      <UnregisterLessonModal
        lesson={selectedLesson}
        coachInfoMap={coachInfoMap}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUnregister={handleUnregister} 
      />

      <UnregisterConfirmationModal
        lesson={lessonToDelete}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDeleteLesson}
      />

      <CoachProfileModal
        isOpen={isCoachModalOpen}
        onClose={() => setIsCoachModalOpen(false)}
        coachInfo={selectedCoachInfo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1976d2',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lessonsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  lessonsList: {
    flex: 1,
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  lessonHeader: {
    marginBottom: 12,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 4,
  },
  lessonTime: {
    fontSize: 14,
    color: '#666',
  },
  lessonDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  noLessonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  noLessonsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default ClientCalendarView;
