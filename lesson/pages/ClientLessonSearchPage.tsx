import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  Platform,
  RefreshControl,
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
import  {SearchForm} from '../components/search/SearchForm';
import { Location } from '../../profile/types/profile';
import { lessonCacheService } from '../services/lessonCacheService';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

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
  const [activeTab, setActiveTab] = useState<'available' | 'registered'>('available');
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const { userId } = useAuth();

  // Add polling interval state
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [registeredSectionY, setRegisteredSectionY] = useState(0);
  const [currentScrollY, setCurrentScrollY] = useState(0); // track scroll

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
    onRefresh,
    subtitle,
  }: { 
    title: string; 
    icon: string; 
    isRegistered?: boolean;
    onCalendarPress?: () => void;
    onRefresh?: () => void;
    subtitle?: string;
  }) => (
    <View style={styles.simpleSectionHeader}> 
      <View style={styles.simpleHeaderLeft}> 
        <View style={[styles.simpleHeaderIconCircle, isRegistered && { backgroundColor:'rgba(76,175,80,0.18)', borderColor:'rgba(129,199,132,0.55)' }]}> 
          <Text style={styles.simpleHeaderIconText}>{icon}</Text>
        </View>
        <View style={styles.simpleHeaderTitleCol}> 
          <Text style={styles.simpleHeaderTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.simpleHeaderSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.simpleActionRow}> 
        {onRefresh && (
          <Pressable 
            onPress={onRefresh}
            disabled={isLoadingLessons && !isRegistered}
            style={({ pressed }) => [styles.simpleActionBtn, pressed && { opacity:0.55 }]}
          >
            <MaterialIcons name="refresh" size={18} color="#ffffff" />
          </Pressable>
        )}
        {isRegistered && onCalendarPress && (
          <Pressable 
            onPress={onCalendarPress}
            style={({ pressed }) => [styles.simpleActionBtnWide, pressed && { opacity:0.7 }]}
          >
            <MaterialIcons name="calendar-month" size={16} color="#ffffff" />
            <Text style={styles.simpleActionBtnText}>Calendar</Text>
          </Pressable>
        )}
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

  // Restore tab and scroll position if coming back from coach profile
  useEffect(() => {
    if (route.params?.restoreTab) {
      setActiveTab(route.params.restoreTab);
      // delay scroll until layout finishes
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (scrollViewRef.current && typeof route.params.restoreScrollY === 'number') {
            scrollViewRef.current.scrollTo({ y: route.params.restoreScrollY, animated: false });
          }
          // clear transient params (cast to any to bypass TS limitation)
          try { (navigation as any).setParams({ restoreTab: undefined, restoreScrollY: undefined }); } catch {}
        }, 40);
      });
    }
  }, [route.params?.restoreTab]);

  const availableCount = lessons.length;
  const registeredCount = registeredLessons.length;

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshAllLessonData();
    } finally {
      setRefreshing(false);
    }
  };

  const TabSwitcher = () => (
    <View style={styles.tabSwitcherContainer}>
      <Pressable
        style={[styles.tabButton, activeTab==='available' && styles.tabButtonActive]}
        onPress={()=>setActiveTab('available')}
      >
        <Text style={[styles.tabButtonText, activeTab==='available' && styles.tabButtonTextActive]}>Available ({availableCount})</Text>
      </Pressable>
      <Pressable
        style={[styles.tabButton, activeTab==='registered' && styles.tabButtonActive]}
        onPress={()=>setActiveTab('registered')}
      >
        <Text style={[styles.tabButtonText, activeTab==='registered' && styles.tabButtonTextActive]}>Registered ({registeredCount})</Text>
      </Pressable>
    </View>
  );

  const SummaryBar = () => (
    <View style={styles.summaryBar}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Total Lessons</Text>
        <Text style={styles.summaryValue}>{availableCount}</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>My Spots</Text>
        <Text style={styles.summaryValue}>{registeredCount}</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Filters</Text>
        <Text style={styles.summaryValue}>{[searchQuery.lessonType, searchQuery.maxPrice, searchQuery.maxParticipants, searchQuery.day, searchQuery.location?.city].filter(Boolean).length}</Text>
      </View>
    </View>
  );

  // Replace return layout with polished UI
  return (
    <LinearGradient colors={['#0d47a1','#1565c0','#1e88e5']} style={styles.gradientBg}>
      {/* Decorative background accents */}
      <View pointerEvents='none' style={styles.decorBubbleOne} />
      <View pointerEvents='none' style={styles.decorBubbleTwo} />
      <View pointerEvents='none' style={styles.decorBubbleThree} />
      <ScrollView
        style={styles.scrollOverlay}
        ref={scrollViewRef}
        onScroll={(e)=> setCurrentScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl tintColor="#ffffff" refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Hero Header */}
        <View style={styles.heroHeader}> 
          <View style={styles.heroTitleRow}> 
            <MaterialIcons name="search" size={26} color="#ffffff" style={styles.heroTitleIcon} />
            <Text style={styles.heroTitle}>Find Your Next Lesson</Text>
          </View>
          <Text style={styles.heroSubtitle}>Browse, register and manage your schedule</Text>
        </View>

        {/* Filter Card */}
        <View style={styles.filterCard}> 
          <SearchForm
            searchQuery={searchQuery}
            setSearchQuery={handleSetSearchQuery}
            onSearch={handleSearch}
          />
        </View>

        <SummaryBar />
        <TabSwitcher />

        {/* Conditional Sections */}
        {activeTab === 'available' && (
          <View style={styles.sectionWrapper}> 
            <SectionHeader 
              title="Available Lessons" 
              icon="📚" 
              onRefresh={refreshAllLessonData}
              subtitle="Open sessions"
            />
            {/* Removed visual wrapper so cards can use full width */}
            <ClientLessonCards
              lessons={lessons}
              coachInfoMap={coachInfoMap}
              onOpenLessonModal={handleOpenModal}
              isLoading={isLoadingLessons}
              returnScrollY={currentScrollY}
            />
          </View>
        )}

        {activeTab === 'registered' && (
          <View style={styles.sectionWrapper} onLayout={event => setRegisteredSectionY(event.nativeEvent.layout.y)}> 
            <SectionHeader 
              title="My Registered Lessons" 
              icon="✅" 
              isRegistered={true}
              onCalendarPress={() => navigation.navigate('ClientCalendar' as never)}
              subtitle="Booked spots"
            />
            {/* Removed visual wrapper so cards can use full width */}
            <RegisteredLessonCards
              lessons={registeredLessons}
              coachInfoMap={coachInfoMap}
              onOpenDeleteModal={(lesson) => {
                setLessonToUnregister(lesson);
                setIsUnregisterModalOpen(true);
              }}
              isLoading={isLoadingRegisteredLessons}
              returnScrollY={currentScrollY}
            />
          </View>
        )}

        {/* Modals */}
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

      {/* Floating Filter Shortcut */}
      <Pressable
        style={({pressed})=>[styles.fabFilter, pressed && styles.fabFilterPressed]}
        onPress={()=>{
          scrollViewRef.current?.scrollTo({y:0, animated:true});
        }}
      >
        <Text style={styles.fabFilterIcon}>🎯</Text>
        <Text style={styles.fabFilterText}>Filters</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // New polished layout styles
  gradientBg:{ flex:1 },
  scrollOverlay:{ flex:1, backgroundColor:'transparent' },
  scrollContent:{ paddingBottom:40 },
  heroHeader:{ paddingTop:Platform.OS==='ios'? 58:40, paddingHorizontal:20, paddingBottom:28 },
  heroTitleRow:{ flexDirection:'row', alignItems:'center', gap:10 },
  heroTitleIcon:{ opacity:0.95 },
  heroTitle:{ fontSize:26, fontWeight:'800', color:'#ffffff', letterSpacing:0.5 },
  heroSubtitle:{ marginTop:6, fontSize:13, fontWeight:'600', color:'rgba(255,255,255,0.85)' },
  filterCard:{ marginHorizontal:16, padding:0, backgroundColor:'transparent', borderWidth:0, borderColor:'transparent', shadowColor:'transparent' },
  sectionWrapper:{ marginTop:30 },
  // Removed sectionBodyCard visual container to allow cards to expand
  // sectionBodyCard:{},
  // Tweak existing header cards inside SectionHeader via overrides
  sectionHeaderCard:{ backgroundColor:'rgba(255,255,255,0.14)', borderWidth:1, borderColor:'rgba(255,255,255,0.30)', marginHorizontal:16, paddingVertical:12, paddingHorizontal:18, borderRadius:26, shadowColor:'#000', shadowOpacity:0.16, shadowRadius:10, shadowOffset:{width:0,height:4} },
  registeredHeaderCard:{ backgroundColor:'rgba(255,255,255,0.18)' },
  sectionHeaderText:{ fontSize:16, fontWeight:'800', color:'#ffffff', flexShrink:1 },
  registeredHeaderText:{ color:'#e8f5e9' },
  calendarButton:{ backgroundColor:'rgba(255,255,255,0.25)', paddingHorizontal:14, paddingVertical:8, borderRadius:16, borderWidth:1, borderColor:'rgba(255,255,255,0.45)' },
  calendarButtonPressed:{ backgroundColor:'rgba(255,255,255,0.35)' },
  calendarButtonContent:{ flexDirection:'row', alignItems:'center', gap:6 },
  calendarButtonText:{ color:'#ffffff', fontSize:12, fontWeight:'700' },
  refreshButton:{ padding:6 },
  refreshIcon:{ fontSize:18, color:'#ffffff' },
  // Newly added: missing headerContent style used in SectionHeader
  headerContent:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap:12 },
  // Newly added tab and summary styles
  tabSwitcherContainer:{ marginTop:26, flexDirection:'row', marginHorizontal:16, backgroundColor:'rgba(255,255,255,0.12)', padding:6, borderRadius:24, borderWidth:1, borderColor:'rgba(255,255,255,0.28)', gap:6 },
  tabButton:{ flex:1, paddingVertical:10, borderRadius:16, alignItems:'center', justifyContent:'center' },
  tabButtonActive:{ backgroundColor:'rgba(255,255,255,0.85)', shadowColor:'#000', shadowOpacity:0.15, shadowRadius:6, shadowOffset:{width:0,height:3} },
  tabButtonText:{ color:'#e3f2fd', fontWeight:'700', fontSize:13, letterSpacing:0.3 },
  tabButtonTextActive:{ color:'#0d47a1' },
  summaryBar:{ flexDirection:'row', marginTop:26, marginHorizontal:16, backgroundColor:'rgba(255,255,255,0.12)', paddingVertical:14, paddingHorizontal:20, borderRadius:28, borderWidth:1, borderColor:'rgba(255,255,255,0.25)', shadowColor:'#000', shadowOpacity:0.12, shadowRadius:10, shadowOffset:{width:0,height:4}, gap:18 },
  summaryItem:{ flex:1, alignItems:'center' },
  summaryLabel:{ fontSize:11, fontWeight:'700', color:'rgba(255,255,255,0.8)', letterSpacing:0.5 },
  summaryValue:{ marginTop:4, fontSize:18, fontWeight:'800', color:'#ffffff' },
  summaryDivider:{ width:1, backgroundColor:'rgba(255,255,255,0.35)', borderRadius:1 },
  // Newly added decorative bubbles styles
  decorBubbleOne:{ position:'absolute', top:-70, left:-50, width:180, height:180, borderRadius:90, backgroundColor:'rgba(255,255,255,0.08)' },
  decorBubbleTwo:{ position:'absolute', top:140, right:-60, width:220, height:220, borderRadius:110, backgroundColor:'rgba(255,255,255,0.05)' },
  decorBubbleThree:{ position:'absolute', bottom:-80, left:-40, width:160, height:160, borderRadius:80, backgroundColor:'rgba(255,255,255,0.06)' },
  fabFilter:{ position:'absolute', bottom:24, right:22, backgroundColor:'#ffffff', paddingHorizontal:18, paddingVertical:14, borderRadius:24, flexDirection:'row', alignItems:'center', gap:8, shadowColor:'#000', shadowOpacity:0.25, shadowRadius:10, shadowOffset:{width:0,height:4} },
  fabFilterPressed:{ opacity:0.9 },
  fabFilterIcon:{ fontSize:18 },
  fabFilterText:{ fontSize:13, fontWeight:'800', color:'#0d47a1', letterSpacing:0.5 },
  sectionHeaderOuter:{ marginHorizontal:16, marginTop:4 },
  sectionHeaderGradient:{ borderRadius:28, padding:2, position:'relative', shadowColor:'#000', shadowOpacity:0.25, shadowRadius:14, shadowOffset:{width:0,height:6} },
  sectionHeaderGlassLayer:{ ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(255,255,255,0.14)', borderRadius:26 },
  sectionHeaderMainRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:10, paddingHorizontal:14 },
  sectionHeaderLeft:{ flexDirection:'row', alignItems:'center', flex:1, gap:12 },
  sectionIconWrap:{ width:42, height:42, borderRadius:18, backgroundColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.35)', shadowColor:'#000', shadowOpacity:0.22, shadowRadius:5, shadowOffset:{width:0,height:3} },
  sectionIconWrapRegistered:{ backgroundColor:'rgba(255,255,255,0.22)' },
  sectionIconText:{ fontSize:22 },
  sectionHeaderTitleCol:{ flex:1 },
  sectionHeaderTitle:{ fontSize:16, fontWeight:'800', color:'#ffffff', letterSpacing:0.3 },
  sectionHeaderSubtitle:{ marginTop:2, fontSize:11, fontWeight:'600', color:'rgba(255,255,255,0.80)', letterSpacing:0.4 },
  sectionCountPill:{ backgroundColor:'rgba(255,255,255,0.20)', paddingHorizontal:10, paddingVertical:6, borderRadius:16, borderWidth:1, borderColor:'rgba(255,255,255,0.35)' },
  sectionCountText:{ color:'#ffffff', fontSize:13, fontWeight:'800' },
  sectionHeaderActions:{ flexDirection:'row', alignItems:'center', gap:8 },
  sectionActionBtn:{ backgroundColor:'rgba(255,255,255,0.20)', borderRadius:14, padding:8, borderWidth:1, borderColor:'rgba(255,255,255,0.35)' },
  sectionActionBtnWide:{ flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'rgba(255,255,255,0.25)', borderRadius:16, paddingVertical:7, paddingHorizontal:12, borderWidth:1, borderColor:'rgba(255,255,255,0.45)' },
  sectionActionBtnText:{ color:'#ffffff', fontSize:11, fontWeight:'700', letterSpacing:0.5 },
  // --- Simplified Section Header (new styles) ---
  simpleSectionHeader:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginHorizontal:16, marginTop:30, paddingVertical:12, paddingHorizontal:16, borderRadius:20, backgroundColor:'rgba(255,255,255,0.12)', borderWidth:1, borderColor:'rgba(255,255,255,0.22)' },
  simpleHeaderLeft:{ flexDirection:'row', alignItems:'center', flex:1, gap:12 },
  simpleHeaderIconCircle:{ width:42, height:42, borderRadius:14, backgroundColor:'rgba(25,118,210,0.18)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(144,202,249,0.45)' },
  simpleHeaderIconText:{ fontSize:22 },
  simpleHeaderTitleCol:{ flex:1 },
  simpleHeaderTitle:{ fontSize:16, fontWeight:'700', color:'#ffffff', letterSpacing:0.3 },
  simpleHeaderSubtitle:{ marginTop:2, fontSize:11, fontWeight:'500', color:'rgba(255,255,255,0.70)', letterSpacing:0.4 },
  simpleCountPill:{ backgroundColor:'rgba(255,255,255,0.20)', paddingHorizontal:10, paddingVertical:6, borderRadius:14, borderWidth:1, borderColor:'rgba(255,255,255,0.32)' },
  simpleCountPillText:{ color:'#ffffff', fontSize:12, fontWeight:'700' },
  simpleActionRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  simpleActionBtn:{ width:38, height:38, borderRadius:12, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,0.18)', borderWidth:1, borderColor:'rgba(255,255,255,0.30)' },
  simpleActionBtnWide:{ flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:12, height:38, borderRadius:12, backgroundColor:'rgba(76,175,80,0.28)', borderWidth:1, borderColor:'rgba(129,199,132,0.55)' },
  simpleActionBtnText:{ color:'#ffffff', fontSize:11, fontWeight:'700', letterSpacing:0.5 },
  // Preserve original style keys referenced elsewhere
  container:{ backgroundColor:'#eef3f8' }, header:{}, searchBox:{}, input:{}, button:{}, buttonText:{}, sectionTitle:{}, emptyText:{}, headerRow:{}, headerActions:{ flexDirection:'row', alignItems:'center', gap:8 }, calendarIcon:{ fontSize:20 },
});
