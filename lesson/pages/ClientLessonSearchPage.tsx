import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
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
import { lessonCacheService } from '../services/lessonCacheService';

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
  const route = useRoute<any>();
  const { userId } = useAuth();

  // Add polling interval state
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [registeredSectionY, setRegisteredSectionY] = useState(0);

  // Function to handle refresh of all lesson data
  const refreshAllLessonData = async () => {
    await fetchLessonsData(true);
    await fetchClientRegisteredLessonsData();
  };

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
      
      // Clear cache after registration
      await lessonCacheService.clearAllCache(userId);
      
      // Refresh all lesson data
      await refreshAllLessonData();
      // Scroll to My Registered Lessons section after a short delay
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: registeredSectionY, animated: true });
        }
      }, 500);
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
      
      // Clear cache after unregistration
      await lessonCacheService.clearAllCache(userId);
      
      // Refresh all lesson data
      await refreshAllLessonData();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const fetchClientRegisteredLessonsData = async () => {
    try {
      setIsLoadingRegisteredLessons(true);
      if (!userId) return;

      // Try to get from cache first
      const cachedRegisteredLessons = await lessonCacheService.getRegisteredLessons(userId);
      if (cachedRegisteredLessons) {
        setRegisteredLessons(cachedRegisteredLessons);
        return;
      }

      // If not in cache, fetch from API
      const data = await fetchClientRegisteredLessons(userId);
      const lessonsWithCounts = await fetchLessonsWithRegistrationCounts(data);
      
      // Cache the results
      await lessonCacheService.setRegisteredLessons(userId, lessonsWithCounts);
      
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

      // First try to search in cache
      const cachedLessons = await lessonCacheService.getAvailableLessons();
      if (cachedLessons) {
        // Ensure all coach info is loaded before filtering
        const coachIds = Array.from(new Set(cachedLessons.map(l => l.coachId)));
        await Promise.all(
          coachIds
            .filter(id => !coachInfoMap[id])
            .map(id => fetchCoachInfoData(id))
        );

        const filteredLessons = cachedLessons.filter(lesson => {
          // Filter by price
          if (searchRequest.maxPrice && lesson.price > searchRequest.maxPrice) {
            return false;
          }

          // Filter by lesson type
          if (searchRequest.lessonType && lesson.title !== searchRequest.lessonType) {
            return false;
          }

          // Filter by coach name
          if (searchRequest.coachName) {
            const coachName = lesson.coachId && coachInfoMap[lesson.coachId]?.name;
            if (!coachName || !coachName.toLowerCase().includes(searchRequest.coachName.toLowerCase())) {
              return false;
            }
          }

          // Filter by max participants
          if (searchRequest.maxParticipants && lesson.capacityLimit > searchRequest.maxParticipants) {
            return false;
          }

          // Filter by location
          if (searchRequest.location && lesson.location?.latitude && lesson.location?.longitude) {
            const distance = calculateDistance(
              searchRequest.location.latitude,
              searchRequest.location.longitude,
              lesson.location.latitude,
              lesson.location.longitude
            );
            if (distance > searchRequest.location.radiusKm) {
              return false;
            }
          }

          // Filter by day
          if (searchRequest.day) {
            const lessonDate = new Date(lesson.time).toISOString().split('T')[0];
            if (lessonDate !== searchRequest.day) {
              return false;
            }
          }

          return true;
        });

        setLessons(filteredLessons);
        return;
      }

      // If no results in cache or cache is empty, fetch from API
      const data = await searchLessons(searchRequest);
      const lessonsWithCounts = await fetchLessonsWithRegistrationCounts(data);
      setLessons(lessonsWithCounts);
      lessonsWithCounts.forEach((lesson) => {
        if (lesson.coachId) fetchCoachInfoData(lesson.coachId);
      });
    } catch (error) {
      console.error('Error searching lessons:', error);
    } finally {
      setIsLoadingLessons(false);
    }
  };

  // Helper function to calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const fetchLessonsData = async (forceRefresh = false) => {
    try {
      setIsLoadingLessons(true);

      // Only check cache if not forcing refresh
      if (!forceRefresh) {
        const cachedLessons = await lessonCacheService.getAvailableLessons();
        if (cachedLessons) {
          setLessons(cachedLessons);
          cachedLessons.forEach((lesson) => {
            if (lesson.coachId) fetchCoachInfoData(lesson.coachId);
          });
          return;
        }
      }

      // Always fetch fresh data from API when forceRefresh is true
      const lessonsData = await fetchLessons();
      const lessonsWithCounts = await fetchLessonsWithRegistrationCounts(lessonsData);
      lessonsWithCounts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      
      // Cache the fresh results
      await lessonCacheService.setAvailableLessons(lessonsWithCounts);
      
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
    onCalendarPress,
    onRefresh
  }: { 
    title: string; 
    icon: string; 
    isRegistered?: boolean;
    onCalendarPress?: () => void;
    onRefresh?: () => void;
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
        <View style={styles.headerActions}>
          {onRefresh && (
            <Pressable 
              onPress={onRefresh}
              disabled={isLoadingLessons}
              style={({ pressed }) => [
                styles.refreshButton,
                pressed && { opacity: 0.7 }
              ]}
            >
              <Text style={[
                styles.refreshIcon,
                isLoadingLessons && { opacity: 0.5 }
              ]}>🔄</Text>
            </Pressable>
          )}
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
    </View>
  );

  // Set up polling on component mount
  useEffect(() => {
    if (userId) {
      // Initial fetch
      fetchUserInfo(userId, 'client').then(setClientInfo);
      refreshAllLessonData();

      // Set up 3-minute polling
      const interval = setInterval(() => {
        refreshAllLessonData();
      }, 3 * 60 * 1000); // 3 minutes

      setPollingInterval(interval);

      // Cleanup on unmount
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchClientRegisteredLessonsData();
      }
    }, [userId])
  );

  useEffect(() => {
    if (route.params?.reopenRegistrationModal && route.params.lessonId) {
      const lessonToOpen = lessons.find(l => l.id === route.params.lessonId);
      if (lessonToOpen) {
        setSelectedLesson(lessonToOpen);
        setIsModalOpen(true);
  
        // ריקון הפרמטרים כדי למנוע פתיחה חוזרת
        navigation.setParams({
          lessonId: undefined
        });
      }
    }
  }, [route.params, lessons]);  

  useEffect(() => {
    if (route.params?.reopenUnregisterModal && route.params.lessonId) {
      // Find the lesson by ID in registered lessons
      const lessonToOpen = registeredLessons.find(l => l.id === route.params.lessonId);
      if (lessonToOpen) {
        setLessonToUnregister(lessonToOpen);
        setIsUnregisterModalOpen(true);
      }
      // Do not clear params to avoid linter error
    }
  }, [route.params, registeredLessons]);

  return (
    <ScrollView style={styles.container} ref={scrollViewRef}>
      <SearchForm
        searchQuery={searchQuery}
        setSearchQuery={handleSetSearchQuery}
        onSearch={handleSearch}
      />

      <View style={{ marginTop: 24 }}>
        <SectionHeader 
          title="Available Lessons" 
          icon="📚" 
          onRefresh={refreshAllLessonData}
        />
        <ClientLessonCards
          lessons={lessons}
          coachInfoMap={coachInfoMap}
          onOpenLessonModal={handleOpenModal}
          isLoading={isLoadingLessons}
        />
      </View>

      <View style={{ marginTop: 32 }} onLayout={event => setRegisteredSectionY(event.nativeEvent.layout.y)}>
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
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2e7d32',
    marginLeft: 6,
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
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  registeredHeaderCard: {
    backgroundColor: '#e8f5e9',
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0d47a1',
    flexShrink: 1,
  },
  registeredHeaderText: {
    color: '#2e7d32',
  },
  calendarIcon: {
    fontSize: 20,
  },
  calendarButtonText: {
    color: '#2e7d32',
    fontSize: 11,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 4,
  },
  refreshIcon: {
    fontSize: 18,
  },
});
