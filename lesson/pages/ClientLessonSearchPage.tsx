import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { fetchUserInfo } from '../../auth/services/UserInfoUtils';
import {
  fetchLessons,
  registerToLesson,
  deleteClientFromLesson,
  fetchClientRegisteredLessons,
  searchLessons,
  fetchLessonsWithRegistrationCounts,
} from '../services/lessonService';
import { fetchCoachGlobalInfo } from '../../profile/services/coachService';
import ClientLessonCards from '../components/view/ClientLessonCard';
import RegisteredLessonCards from '../components/view/RegisteredLessonCards';
import RegistrationLessonModal from '../components/management/registration/RegistrationLessonModal';
import CoachProfileModal from '../../profile/components/modals/CoachProfileModal';
import UnregisterConfirmationModal from '../components/management/registration/UnregisterConfirmationModal';
import { useAuth } from '../../auth/AuthContext';
import { Lesson } from '../types/Lesson';
import SearchForm from '../components/search/SearchForm';
import { Location } from '../../profile/types/profile';

export default function ClientDashboardScreen() {
  const [clientInfo, setClientInfo] = useState<{ name: string; email: string } | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [registeredLessons, setRegisteredLessons] = useState<Lesson[]>([]);
  const [coachInfoMap, setCoachInfoMap] = useState<{ [key: string]: { name: string; email: string } }>({});
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [selectedCoachInfo, setSelectedCoachInfo] = useState<{ name: string; email: string } | null>(null);
  const [isUnregisterModalOpen, setIsUnregisterModalOpen] = useState(false);
  const [lessonToUnregister, setLessonToUnregister] = useState<Lesson | null>(null);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [isLoadingRegisteredLessons, setIsLoadingRegisteredLessons] = useState(true);
  const [searchQuery, setSearchQuery] = useState({
    maxPrice: '',
    lessonType: '',
    maxParticipants: '',
    coachName: '',
    location: null as Location | null,
    radiusKm: 0.5,
    day: null as Date | null,
  });

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { userId } = useAuth();

  const fetchCoachInfoData = async (coachId: string) => {
    if (!coachInfoMap[coachId]) {
      try {
        const coachInfo = await fetchCoachGlobalInfo(coachId);
        setCoachInfoMap((prev) => ({ ...prev, [coachId]: coachInfo }));
      } catch (error) {
        console.error('Error fetching coach info:', error);
      }
    }
  };

  const handleOpenModal = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLesson(null);
    setIsModalOpen(false);
  };

  const handleRegisterToLesson = async (lessonId: number) => {
    try {
      if (!userId) return;
      await registerToLesson(userId, lessonId);
      handleCloseModal();
      fetchLessonsData();
      fetchClientRegisteredLessonsData();
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes("already registered")) {
        Alert.alert(
          "Time Slot Unavailable",
          "You already have a lesson scheduled at this time. Please choose a different time slot.",
          [{ text: "OK", style: "default" }]
        );
      } else {
        Alert.alert(
          "Registration Failed",
          "We couldn't register you for this lesson. Please try again later.",
          [{ text: "OK", style: "default" }]
        );
      }
    }
  };

  const handleUnregister = async () => {
    if (!lessonToUnregister || !userId) return;
    try {
      await deleteClientFromLesson(userId, lessonToUnregister.id);
      setIsUnregisterModalOpen(false);
      fetchLessonsData();
      fetchClientRegisteredLessonsData();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const fetchClientRegisteredLessonsData = async () => {
    try {
      setIsLoadingRegisteredLessons(true);
      if (!userId) return;
      const data = await fetchClientRegisteredLessons(userId);
      const lessonsWithCounts = await fetchLessonsWithRegistrationCounts(data);
      setRegisteredLessons(lessonsWithCounts);
    } catch (e) {
      console.error('Error fetching registered lessons', e);
    } finally {
      setIsLoadingRegisteredLessons(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsLoadingLessons(true);
      const searchRequest = {
        maxPrice: searchQuery.maxPrice ? parseFloat(searchQuery.maxPrice) : null,
        lessonType: searchQuery.lessonType || null,
        maxParticipants: searchQuery.maxParticipants ? parseInt(searchQuery.maxParticipants, 10) : null,
        coachName: searchQuery.coachName || null,
        location: searchQuery.location?.latitude && searchQuery.location?.longitude ? {
          latitude: searchQuery.location.latitude,
          longitude: searchQuery.location.longitude,
          radiusKm: searchQuery.radiusKm
        } : null,
        day: searchQuery.day ? searchQuery.day.toISOString().split('T')[0] : null
      };
      const data = await searchLessons(searchRequest);
      const lessonsWithCounts = await fetchLessonsWithRegistrationCounts(data);
      setLessons(lessonsWithCounts);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingLessons(false);
    }
  };

  const fetchLessonsData = async () => {
    try {
      setIsLoadingLessons(true);
      const lessonsData = await fetchLessons();
      const lessonsWithCounts = await fetchLessonsWithRegistrationCounts(lessonsData);
      lessonsWithCounts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      setLessons(lessonsWithCounts);
      lessonsWithCounts.forEach((lesson) => {
        if (lesson.coachId) fetchCoachInfoData(lesson.coachId);
      });
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setIsLoadingLessons(false);
    }
  };

  const handleSetSearchQuery = (query: any) => {
    setSearchQuery(prev => ({
      ...prev,
      ...query,
      radiusKm: query.radiusKm ?? prev.radiusKm
    }));
  };

  const SectionHeader = ({ 
    title, 
    icon, 
    isRegistered = false,
    onCalendarPress
  }: { 
    title: string; 
    icon: string; 
    isRegistered?: boolean;
    onCalendarPress?: () => void;
  }) => (
    <View style={[
      styles.sectionHeaderCard,
      isRegistered && styles.registeredHeaderCard
    ]}>
      <View style={styles.headerContent}>
        <Text style={[
          styles.sectionHeaderText,
          isRegistered && styles.registeredHeaderText
        ]}>
          {icon} {title}
        </Text>
        {isRegistered && onCalendarPress && (
          <Pressable 
            style={({ pressed }) => [
              styles.calendarButton,
              pressed && styles.calendarButtonPressed
            ]}
            onPress={onCalendarPress}
          >
            <View style={styles.calendarButtonContent}>
              <Text style={styles.calendarIcon}>📅</Text>
              <Text style={styles.calendarButtonText}>View Calendar</Text>
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );

  useEffect(() => {
    if (userId) {
      fetchUserInfo(userId, 'client').then(setClientInfo);
      fetchLessonsData();
      fetchClientRegisteredLessonsData();
    }
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchClientRegisteredLessonsData();
      }
    }, [userId])
  );

  return (
    <ScrollView style={styles.container}>
      <SearchForm
        searchQuery={searchQuery}
        setSearchQuery={handleSetSearchQuery}
        onSearch={handleSearch}
      />

      <View style={{ marginTop: 24 }}>
        <SectionHeader title="Available Lessons" icon="📚" />
        <ClientLessonCards
          lessons={lessons}
          coachInfoMap={coachInfoMap}
          onOpenLessonModal={handleOpenModal}
          isLoading={isLoadingLessons}
        />
      </View>

      <View style={{ marginTop: 32 }}>
        <SectionHeader 
          title="My Registered Lessons" 
          icon="✅" 
          isRegistered={true}
          onCalendarPress={() => navigation.navigate('ClientCalendar')}
        />
        <RegisteredLessonCards
          lessons={registeredLessons}
          coachInfoMap={coachInfoMap}
          onOpenDeleteModal={(lesson) => {
            setLessonToUnregister(lesson);
            setIsUnregisterModalOpen(true);
          }}
          isLoading={isLoadingRegisteredLessons}
        />
      </View>

      {selectedLesson && (
        <RegistrationLessonModal
          lesson={selectedLesson}
          coachInfo={coachInfoMap[selectedLesson.coachId]}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onRegister={handleRegisterToLesson}
          onOpenCoachModal={(coachId) => {
            const info = coachInfoMap[coachId];
            if (info) {
              setSelectedCoachInfo(info);
              setIsCoachModalOpen(true);
            }
          }}
        />
      )}

      {selectedCoachInfo && (
        <CoachProfileModal
          isOpen={isCoachModalOpen}
          onClose={() => setIsCoachModalOpen(false)}
          coachInfo={selectedCoachInfo}
        />
      )}

      {lessonToUnregister && (
        <UnregisterConfirmationModal
          lesson={lessonToUnregister}
          isOpen={isUnregisterModalOpen}
          onClose={() => setIsUnregisterModalOpen(false)}
          onConfirm={handleUnregister}
          coachInfo={lessonToUnregister.coachId ? coachInfoMap[lessonToUnregister.coachId] : undefined}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eef3f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchBox: {
    marginBottom: 20,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#1976d2',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  calendarButton: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2e7d32',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    transform: [{ scale: 1 }],
  },
  calendarButtonPressed: {
    backgroundColor: '#c8e6c9',
    transform: [{ scale: 0.98 }],
  },
  calendarButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionHeaderCard: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  registeredHeaderCard: {
    backgroundColor: '#e8f5e9',
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0d47a1',
  },
  registeredHeaderText: {
    color: '#2e7d32',
  },
  calendarIcon: {
    fontSize: 20,
  },
  calendarButtonText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '500',
  },
});
