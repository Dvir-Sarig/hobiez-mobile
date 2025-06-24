import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar } from 'react-native-big-calendar';
import dayjs from 'dayjs';
import { useAuth } from '../../auth/AuthContext';
import { fetchCoachLessons, deleteLesson, editLesson, fetchSingleLesson, fetchRegisteredClients } from '../../lesson/services/lessonService';
import { fetchClientGlobalInfo } from '../../profile/services/clientService';
import { Lesson } from '../../lesson/types/Lesson';
import { formatLessonToEvent } from '../shared/utils/calendar.utils';
import ViewLessonModal from '../../lesson/components/view/ViewLessonModal';
import EditLessonModal from '../../lesson/components/management/editing/EditLessonModal';
import DeleteConfirmationModal from '../../lesson/components/management/deletion/DeleteConfirmationModal';
import RegisteredClientsModal from '../../lesson/components/management/registration/RegisteredClientsModal';
import { formatLessonTimeReadable } from '../../shared/services/formatService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CalendarEvent } from '../shared/types/calendar.types';
import { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CoachCalendarView = () => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEditLessonModal, setShowEditLessonModal] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
  const [showRegisteredClientsModal, setShowRegisteredClientsModal] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);
  const [editLessonData, setEditLessonData] = useState({
    description: '',
    time: dayjs(),
    capacityLimit: '',
    duration: 0,
    location: { city: '', country: '' }
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDateLessons, setSelectedDateLessons] = useState<Lesson[]>([]);
  const [registeredClients, setRegisteredClients] = useState<{ id: string; name: string }[]>([]);

  const { userId: coachId } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const handleOpenModal = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLesson(null);
    setIsModalOpen(false);
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
    if (coachId) {
      try {
        const lessons = await fetchCoachLessons(coachId);
        const formatted = lessons.map(formatLessonToEvent);
        setEvents(formatted);
      } catch (error) {
        console.error('Error fetching coach lessons:', error);
      }
    }
  }, [coachId]);

  const handleEditLesson = async () => {
    try {
      setIsEditingLesson(true);
      // Get the exact time components from the selected time
      const selectedTime = dayjs(editLessonData.time).toDate();
      const year = selectedTime.getFullYear();
      const month = selectedTime.getMonth();
      const day = selectedTime.getDate();
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();

      // Create a new date with the exact time components and format it as ISO string
      // but without timezone conversion
      const exactTime = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

      const editData = {
        description: editLessonData.description,
        time: exactTime,
        capacityLimit: parseInt(editLessonData.capacityLimit, 10),
        duration: editLessonData.duration,
        location: editLessonData.location
      };

      const message = await editLesson(selectedLesson?.id!, editData);
      setShowEditLessonModal(false);
      setIsModalOpen(false);
      const updatedLesson = await fetchSingleLesson(selectedLesson?.id!);
      setEvents((prev) =>
        prev.map((event) =>
          event.id === updatedLesson.id ? formatLessonToEvent(updatedLesson) : event
        )
      );
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'An error occurred while editing.');
    } finally {
      setIsEditingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    try {
      setIsDeletingLesson(true);
      const message = await deleteLesson(lessonId);
      setEvents((prev) => prev.filter((event) => event.id !== lessonId));
      setSelectedDateLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
      setShowDeleteConfirmationModal(false);
      setSelectedLesson(null);
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to delete lesson');
    } finally {
      setIsDeletingLesson(false);
    }
  };

  const confirmDeleteLesson = async () => {
    if (selectedLesson) {
      await handleDeleteLesson(selectedLesson.id);
    }
  };

  const loadRegisteredClients = async (lessonId: number) => {
    try {
      setIsLoadingClients(true);
      const clientIds = await fetchRegisteredClients(lessonId);
      const clientsWithInfo = await Promise.all(
        clientIds.map(async (id) => {
          try {
            const clientInfo = await fetchClientGlobalInfo(id);
            return { id, name: clientInfo.name };
          } catch (error) {
            return { id, name: `Client ${id}` };
          }
        })
      );
      setRegisteredClients(clientsWithInfo);
    } catch (error) {
      console.error('Error fetching clients:', (error as Error).message);
      setRegisteredClients([]);
    } finally {
      setIsLoadingClients(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  useEffect(() => {
    if (events.length > 0) {
      handleDateSelect((selectedDate ?? dayjs()).toDate());
    }
  }, [events]);

  useEffect(() => {
    if (selectedLesson) {
      loadRegisteredClients(selectedLesson.id);
    }
  }, [selectedLesson]);

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

        <View style={styles.detailRow}>
          <Icon name="people" size={16} color="#666" />
          <Text style={styles.detailText}>
            {lesson.registeredCount || 0}/{lesson.capacityLimit} registered
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainDrawer', { screen: 'CoachLessons' })}>
          <Icon name="arrow-back" size={24} color="#1976d2" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Icon name="calendar-today" size={24} color="#1976d2" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>My Schedule</Text>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarHeaderText}>
            Tap any day to view lessons
          </Text>
        </View>
        <Calendar
          events={events}
          height={300}
          mode="week"
          locale="en"
          hideNowIndicator
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
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>
            {selectedDate.format('dddd')}
          </Text>
          <Text style={styles.selectedDateNumber}>
            {selectedDate.format('D')}
          </Text>
          <Text style={styles.selectedDateMonth}>
            {selectedDate.format('MMMM YYYY')}
          </Text>
        </View>
        
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

      <ViewLessonModal
        lesson={selectedLesson}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEditClick={(lesson) => {
          setSelectedLesson(lesson);
          setEditLessonData({
            description: lesson.description,
            time: dayjs(lesson.time),
            capacityLimit: lesson.capacityLimit.toString(),
            duration: lesson.duration,
            location: lesson.location || { city: '', country: '' }
          });
          setShowEditLessonModal(true);
          setIsModalOpen(false);
        }}
        onViewClients={(lesson) => {
          setSelectedLesson(lesson);
          loadRegisteredClients(lesson.id);
          setShowRegisteredClientsModal(true);
          setIsModalOpen(false);
        }}
        onDelete={(lesson) => {
          setSelectedLesson(lesson);
          setShowDeleteConfirmationModal(true);
          setIsModalOpen(false);
        }}
        isEditing={isEditingLesson}
        isDeleting={isDeletingLesson}
        isLoadingClients={isLoadingClients}
      />

      <EditLessonModal
        isOpen={showEditLessonModal}
        onClose={() => setShowEditLessonModal(false)}
        onSubmit={handleEditLesson}
        lessonData={editLessonData}
        setLessonData={setEditLessonData}
        isSubmitting={isEditingLesson}
      />

      <DeleteConfirmationModal
        lesson={selectedLesson}
        isOpen={showDeleteConfirmationModal}
        onClose={() => setShowDeleteConfirmationModal(false)}
        onConfirmDelete={confirmDeleteLesson}
        isDeleting={isDeletingLesson}
      />

      <RegisteredClientsModal
        isOpen={showRegisteredClientsModal}
        onClose={() => setShowRegisteredClientsModal(false)}
        lessonId={selectedLesson?.id || 0}
        registeredClients={registeredClients}
        isLoading={isLoadingClients}
      />
    </View>
  );
};

export default CoachCalendarView;

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
  calendarHeader: {
    backgroundColor: '#1976d2',
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  calendarHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  lessonsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  selectedDateNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1976d2',
    marginHorizontal: 8,
  },
  selectedDateMonth: {
    fontSize: 14,
    color: '#666',
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
