import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, Alert, ActivityIndicator, StyleSheet, TouchableOpacity, Pressable, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchUserInfo } from '../../auth/services/UserInfoUtils';
import { fetchCoachLessons, createLesson, deleteLesson, fetchSingleLesson, fetchRegisteredClients, editLesson } from '../services/lessonService';
import { fetchClientGlobalInfo } from '../../profile/services/clientService';
import LessonCard from '../components/view/CoachLessonCard';
import CoachLessonModal from '../components/management/creation/CreateNewLessonModal';
import DeleteConfirmationModal from '../components/management/deletion/DeleteConfirmationModal';
import EditLessonModal from '../components/management/editing/EditLessonModal';
import RegisteredClientsModal from '../components/management/registration/RegisteredClientsModal';
import ViewLessonModal from '../components/view/ViewLessonModal';
import dayjs from 'dayjs';
import { useAuth } from '../../auth/AuthContext';
import { Lesson } from '../types/Lesson';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CoachDashboardScreen() {
  const [coachInfo, setCoachInfo] = useState<{ name: string; email: string } | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showNewLessonModal, setShowNewLessonModal] = useState(false);
  const [showEditLessonModal, setShowEditLessonModal] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
  const [showRegisteredClientsModal, setShowRegisteredClientsModal] = useState(false);
  const [selectedLessonForClients, setSelectedLessonForClients] = useState<Lesson | null>(null);
  const [registeredClients, setRegisteredClients] = useState<{ id: string; name: string }[]>([]);
  const [lessonToView, setLessonToView] = useState<Lesson | null>(null);
  const [showViewLessonModal, setShowViewLessonModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingRegisteredClients, setLoadingRegisteredClients] = useState(false);
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { userId } = useAuth();
  const navigation = useNavigation();

  const defaultLocation = { city: '', country: '' };

  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    time: '',
    price: 0,
    capacityLimit: 0,
    duration: 0,
    location: defaultLocation
  });

  const [editLessonData, setEditLessonData] = useState({
    description: '',
    time: dayjs(),
    capacityLimit: '',
    duration: 0,
    location: defaultLocation
  });

  const fetchLessonsData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const lessonsWithCounts = await fetchCoachLessons(userId);
      setLessons(lessonsWithCounts);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      Alert.alert('Error', 'Failed to fetch lessons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchLessonsData();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const coachData = await fetchUserInfo(userId, 'coach');
      setCoachInfo(coachData);
      fetchLessonsData();
    })();
  }, [userId]);

  useEffect(() => {
    if (selectedDay) {
      const filtered = lessons.filter(lesson => {
        const lessonDate = new Date(lesson.time);
        return lessonDate.toDateString() === selectedDay.toDateString();
      });
      setFilteredLessons(filtered);
    } else {
      setFilteredLessons(lessons);
    }
  }, [selectedDay, lessons]);

  const handleCreateLesson = async () => {
    if (!userId) return;
  
    if (!newLesson.time || isNaN(new Date(newLesson.time).getTime())) {
      Alert.alert("Error", "Invalid date/time selected for the lesson.");
      return;
    }
  
    try {
      setIsCreatingLesson(true);
      const selectedTime = new Date(newLesson.time);
      const year = selectedTime.getFullYear();
      const month = selectedTime.getMonth();
      const day = selectedTime.getDate();
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();

      const exactTime = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
      
      const lessonData = {
        ...newLesson,
        time: exactTime
      };

      const createdLesson = await createLesson(lessonData, userId);
      setShowNewLessonModal(false);
      await fetchLessonsData();
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to create lesson');
    } finally {
      setIsCreatingLesson(false);
    }
  };

  const handleEditLesson = async () => {
    if (!selectedLesson) return;
    try {
      setIsEditingLesson(true);
      const selectedTime = dayjs(editLessonData.time).toDate();
      const year = selectedTime.getFullYear();
      const month = selectedTime.getMonth();
      const day = selectedTime.getDate();
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();

      const exactTime = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

      const editData = {
        description: editLessonData.description,
        time: exactTime,
        capacityLimit: parseInt(editLessonData.capacityLimit, 10),
        duration: editLessonData.duration,
        location: editLessonData.location
      };

      await editLesson(selectedLesson.id, editData);
      setShowEditLessonModal(false);
      const updatedLesson = await fetchSingleLesson(selectedLesson.id);
      setLessons(prev =>
        prev.map(lesson =>
          lesson.id === updatedLesson.id ? { ...updatedLesson, registeredCount: lesson.registeredCount } : lesson
        )
      );
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to edit lesson');
    } finally {
      setIsEditingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    try {
      setIsDeletingLesson(true);
      await deleteLesson(lessonId);
      await fetchLessonsData();
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to delete lesson');
    } finally {
      setIsDeletingLesson(false);
      setShowDeleteConfirmationModal(false);
      setSelectedLesson(null);
    }
  };

  const confirmDeleteLesson = async () => {
    if (selectedLesson) {
      await handleDeleteLesson(selectedLesson.id);
    }
  };

  const loadRegisteredClients = async (lessonId: number) => {
    try {
      setLoadingRegisteredClients(true);
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
      setLoadingRegisteredClients(false);
    }
  };

  useEffect(() => {
    if (selectedLessonForClients) {
      loadRegisteredClients(selectedLessonForClients.id);
    }
  }, [selectedLessonForClients]);

  const generateDates = () => {
    const dates = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      dates.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month, day));
    }

    return dates;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
    <View style={styles.sectionHeaderCard}>
      <View style={styles.headerContent}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
        <Pressable 
          style={({ pressed }) => [
            styles.calendarButton,
            pressed && styles.calendarButtonPressed
          ]}
          onPress={() => navigation.navigate('CoachCalendar' as never)}
        >
          <View style={styles.calendarButtonContent}>
            <Text style={styles.calendarIcon}>📅</Text>
            <Text style={styles.calendarButtonText}>View Calendar</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionHeader title="My Lessons" icon="book" />

      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={() => setShowNewLessonModal(true)}
          >
            <Icon name="add" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.createButtonText}>Create New Lesson</Text>
          </TouchableOpacity>

          <Pressable 
            style={({ pressed }) => [
              styles.filterButton,
              pressed && styles.filterButtonPressed
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.filterButtonContent}>
              <Icon name="calendar-today" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.filterButtonText}>
                {selectedDay ? selectedDay.toLocaleDateString() : 'Filter by Date'}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      ) : filteredLessons.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Icon name="school" size={40} color="#1976d2" style={styles.emptyStateIcon} />
          <Text style={styles.emptyStateTitle}>No Lessons Found</Text>
          <Text style={styles.emptyStateText}>
            {selectedDay ? 'No lessons scheduled for this day.' : 'Your clients are waiting! Create your first lesson to start teaching.'}
          </Text>
        </View>
      ) : (
        <LessonCard
          lessons={filteredLessons}
          onEdit={(lesson: Lesson) => {
            setLessonToView(lesson);
            setShowViewLessonModal(true);
          }}
          onEditLesson={(lesson: Lesson) => {
            setSelectedLesson(lesson);
            setEditLessonData({
              description: lesson.description || '',
              time: dayjs(lesson.time),
              capacityLimit: lesson.capacityLimit.toString() || '',
              duration: lesson.duration || 0,
              location: lesson.location || defaultLocation
            });
            setShowEditLessonModal(true);
          }}
          onDelete={(lesson: Lesson) => {
            setSelectedLesson(lesson);
            setShowDeleteConfirmationModal(true);
          }}
          onViewClients={(lesson: Lesson) => {
            setSelectedLessonForClients(lesson);
            setShowRegisteredClientsModal(true);
          }}
        />
      )}

      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.monthNavigation}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavButton}>
                <Text style={styles.monthNavButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>{getMonthName(currentMonth)}</Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavButton}>
                <Text style={styles.monthNavButtonText}>→</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysContainer}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <Text key={index} style={styles.weekDayText}>{day}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {generateDates().map((date, index) => (
                date ? (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [
                      styles.dateItem,
                      selectedDay?.toDateString() === date.toDateString() && styles.selectedDateItem,
                      pressed && styles.dateItemPressed,
                      new Date().toDateString() === date.toDateString() && styles.todayDateItem
                    ]}
                    onPress={() => {
                      setSelectedDay(date);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={[
                      styles.dateNumber,
                      selectedDay?.toDateString() === date.toDateString() && styles.selectedDateText,
                      new Date().toDateString() === date.toDateString() && styles.todayDateText
                    ]}>
                      {date.getDate()}
                    </Text>
                  </Pressable>
                ) : (
                  <View key={index} style={styles.emptyDateItem} />
                )
              ))}
            </View>

            {selectedDay && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSelectedDay(null);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.clearButtonText}>Clear Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <CoachLessonModal
        isOpen={showNewLessonModal}
        onClose={() => setShowNewLessonModal(false)}
        onSubmit={handleCreateLesson}
        newLesson={newLesson}
        setNewLesson={setNewLesson}
        isSubmitting={isCreatingLesson}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteConfirmationModal}
        onClose={() => setShowDeleteConfirmationModal(false)}
        onConfirmDelete={confirmDeleteLesson}
        lesson={selectedLesson}
        isDeleting={isDeletingLesson}
      />

      <RegisteredClientsModal
        isOpen={showRegisteredClientsModal}
        onClose={() => setShowRegisteredClientsModal(false)}
        lessonId={selectedLessonForClients?.id || 0}
        registeredClients={registeredClients}
        isLoading={loadingRegisteredClients}
      />

      <ViewLessonModal
        isOpen={showViewLessonModal}
        onClose={() => setShowViewLessonModal(false)}
        lesson={lessonToView}
        onEditClick={() => {
          setShowViewLessonModal(false);
          setSelectedLesson(lessonToView);
          setEditLessonData({
            description: lessonToView?.description || '',
            time: dayjs(lessonToView?.time),
            capacityLimit: lessonToView?.capacityLimit.toString() || '',
            duration: lessonToView?.duration || 0,
            location: lessonToView?.location || defaultLocation
          });
          setShowEditLessonModal(true);
        }}
        onViewClients={() => {
          setShowViewLessonModal(false);
          setSelectedLessonForClients(lessonToView);
          setShowRegisteredClientsModal(true);
        }}
        onDelete={(lesson) => {
          setShowViewLessonModal(false);
          setSelectedLesson(lesson);
          setShowDeleteConfirmationModal(true);
        }}
      />

      <EditLessonModal
        isOpen={showEditLessonModal}
        onClose={() => setShowEditLessonModal(false)}
        onSubmit={handleEditLesson}
        lessonData={editLessonData}
        setLessonData={setEditLessonData}
        isSubmitting={isEditingLesson}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  sectionHeaderCard: {
    backgroundColor: '#0d47a1',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  calendarButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1976d2',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    transform: [{ scale: 1 }],
  },
  calendarButtonPressed: {
    backgroundColor: '#bbdefb',
    transform: [{ scale: 0.98 }],
  },
  calendarButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calendarIcon: {
    fontSize: 20,
  },
  calendarButtonText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  createButton: {
    backgroundColor: '#1976d2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1976d2',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  filterButton: {
    backgroundColor: '#1976d2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonPressed: {
    backgroundColor: '#1565c0',
    transform: [{ scale: 0.98 }],
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1976d2',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    padding: 4,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
  },
  monthNavButtonText: {
    fontSize: 18,
    color: '#1976d2',
    fontWeight: '600',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  weekDayText: {
    width: '13%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  dateItem: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  emptyDateItem: {
    width: '13%',
    aspectRatio: 1,
  },
  selectedDateItem: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  todayDateItem: {
    borderColor: '#1976d2',
    borderWidth: 2,
  },
  dateItemPressed: {
    backgroundColor: '#bbdefb',
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedDateText: {
    color: '#fff',
  },
  todayDateText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  clearButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#1976d2',
    fontSize: 16,
    fontWeight: '500',
  },
});
