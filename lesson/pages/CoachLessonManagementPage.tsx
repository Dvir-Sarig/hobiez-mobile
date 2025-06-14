import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, Alert, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
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
  const [registeredClients, setRegisteredClients] = useState<{ id: number; name: string }[]>([]);
  const [lessonToView, setLessonToView] = useState<Lesson | null>(null);
  const [showViewLessonModal, setShowViewLessonModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingRegisteredClients, setLoadingRegisteredClients] = useState(false);
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);

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

      const createdLesson = await createLesson(lessonData, parseInt(userId, 10));
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

  const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
    <View style={styles.sectionHeaderCard}>
      <View style={styles.headerContent}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
        <TouchableOpacity 
          style={styles.calendarButton}
          onPress={() => navigation.navigate('CoachCalendar' as never)}
        >
          <Icon name="calendar-today" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionHeader title="My Lessons" icon="book" />

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={() => setShowNewLessonModal(true)}
        >
          <Icon name="add" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.createButtonText}>Create New Lesson</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      ) : lessons.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Icon name="school" size={40} color="#1976d2" style={styles.emptyStateIcon} />
          <Text style={styles.emptyStateTitle}>No Lessons Yet</Text>
          <Text style={styles.emptyStateText}>
            Your clients are waiting! Create your first lesson to start teaching.
          </Text>
        </View>
      ) : (
        <LessonCard
          lessons={lessons}
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  buttonContainer: {
    padding: 16,
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
});
