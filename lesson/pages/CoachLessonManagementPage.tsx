import React, { useEffect, useState, useReducer, useCallback } from 'react';
import { View, Text, Button, ScrollView, Alert, ActivityIndicator, StyleSheet, TouchableOpacity, Pressable, Modal, Platform, RefreshControl } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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
import { LinearGradient } from 'expo-linear-gradient';
import { lessonCacheService } from '../services/lessonCacheService';

export default function CoachDashboardScreen() {
  const [coachInfo, setCoachInfo] = useState<{ name: string; email: string } | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  // Unified modal state machine
  type ModalState =
    | { screen: 'none' }
    | { screen: 'create' }
    | { screen: 'view'; lesson: Lesson }
    | { screen: 'edit'; lesson: Lesson }
    | { screen: 'delete'; lesson: Lesson }
    | { screen: 'registered'; lesson: Lesson };

  type ModalAction =
    | { type: 'OPEN_CREATE' }
    | { type: 'OPEN_VIEW'; lesson: Lesson }
    | { type: 'OPEN_EDIT'; lesson: Lesson }
    | { type: 'OPEN_DELETE'; lesson: Lesson }
    | { type: 'OPEN_REGISTERED'; lesson: Lesson }
    | { type: 'CLOSE' };

  const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
    switch (action.type) {
      case 'OPEN_CREATE': return { screen: 'create' };
      case 'OPEN_VIEW': return { screen: 'view', lesson: action.lesson };
      case 'OPEN_EDIT': return { screen: 'edit', lesson: action.lesson };
      case 'OPEN_DELETE': return { screen: 'delete', lesson: action.lesson };
      case 'OPEN_REGISTERED': return { screen: 'registered', lesson: action.lesson };
      case 'CLOSE': return { screen: 'none' };
      default: return state;
    }
  };

  const [modalState, dispatchModal] = useReducer(modalReducer, { screen: 'none' });
  const lessonToView = modalState.screen === 'view' || modalState.screen === 'edit' || modalState.screen === 'delete' || modalState.screen === 'registered' ? modalState.lesson : null;
  const selectedLessonForClients = modalState.screen === 'registered' ? modalState.lesson : null;
  const showNewLessonModal = modalState.screen === 'create';
  const showViewLessonModal = modalState.screen === 'view';
  const showEditLessonModal = modalState.screen === 'edit';
  const showDeleteConfirmationModal = modalState.screen === 'delete';
  const showRegisteredClientsModal = modalState.screen === 'registered';
  const [registeredClients, setRegisteredClients] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRegisteredClients, setLoadingRegisteredClients] = useState(false);
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const { userId } = useAuth();
  const navigation = useNavigation();
  const route = useRoute<any>();

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

  const [viewLessonLoading, setViewLessonLoading] = useState(false);
  // track desired re-open target when returning from nested screens
  const [pendingReturn, setPendingReturn] = useState<'view' | null>(null);

  const fetchLessonsData = async (force:boolean=false) => {
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

      await createLesson(lessonData, userId);
      dispatchModal({ type:'CLOSE' });
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
      dispatchModal({ type:'CLOSE' });
      const updatedLesson = await fetchSingleLesson(selectedLesson.id);
      setLessons(prev =>
        prev.map(lesson =>
          lesson.id === updatedLesson.id ? { ...updatedLesson, registeredCount: lesson.registeredCount } : lesson
        )
      );
      // After editing, reopen view modal automatically
      dispatchModal({ type:'OPEN_VIEW', lesson: { ...updatedLesson, registeredCount: (lessons.find(l=> l.id===updatedLesson.id)?.registeredCount) || updatedLesson.registeredCount } as Lesson });
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
      dispatchModal({ type:'CLOSE' });
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

  const SectionHeader = ({ title }: { title: string }) => (
    <View style={styles.sectionHeaderCard}>
      <View style={styles.headerContent}>
        <Text
          style={styles.sectionHeaderText}
          numberOfLines={1}
          adjustsFontSizeToFit
          maxFontSizeMultiplier={1.1}
          minimumFontScale={0.9}
        >{title}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.calendarButton,
            pressed && styles.calendarButtonPressed,
          ]}
          onPress={() => navigation.navigate('CoachCalendar' as never)}
          android_ripple={{ color: 'rgba(255,255,255,0.25)', borderless: true }}
        >
          <View style={styles.calendarButtonContent}>
            <Icon name="calendar-today" size={16} color="#ffffff" style={styles.calendarIcon} />
            <Text
              style={styles.calendarButtonText}
              adjustsFontSizeToFit
              maxFontSizeMultiplier={1.1}
              numberOfLines={1}
              minimumFontScale={0.9}
            >Calendar</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (pendingReturn === 'view' && lessonToView) {
        dispatchModal({ type: 'OPEN_VIEW', lesson: lessonToView });
        setPendingReturn(null);
      }
    });
    return unsubscribe;
  }, [navigation, pendingReturn, lessonToView]);

  useEffect(() => {
    if (route.params?.openCoachLessonModal && route.params.lessonId && userId) {
      (async () => {
        setViewLessonLoading(true);
        try { await lessonCacheService.clearAllCache(userId as any); } catch {}
        // Fetch fresh single lesson first to avoid race with lessons state
        let fresh: Lesson | null = null;
        try {
          fresh = await fetchSingleLesson(route.params.lessonId);
        } catch (e) {
          fresh = null;
        }
        // In parallel (after single fetch) refresh full list silently so page reflects updates when modal closes
        fetchLessonsData(true);
        if (fresh) {
          // Merge into lessons state immediately so list shows correct counts even before bulk refresh returns
          setLessons(prev => {
            const exists = prev.some(l=> l.id === fresh!.id);
            if (exists) return prev.map(l=> l.id === fresh!.id ? { ...fresh!, registeredCount: fresh!.registeredCount } : l);
            return [...prev, fresh!];
          });
          dispatchModal({ type:'OPEN_VIEW', lesson: fresh });
        } else {
          // fallback to whatever we have
          const fallback = lessons.find(l=> l.id === route.params.lessonId);
          if (fallback) {
            dispatchModal({ type:'OPEN_VIEW', lesson: fallback });
          }
        }
        setViewLessonLoading(false);
        (navigation as any).setParams({ openCoachLessonModal: undefined, lessonId: undefined });
      })();
    }
  }, [route.params?.openCoachLessonModal, route.params?.lessonId]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchLessonsData(true);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0d47a1','#1565c0','#1e88e5']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.gradientBackground}> 
        <View pointerEvents='none' style={styles.decorBubbleOne} />
        <View pointerEvents='none' style={styles.decorBubbleTwo} />
        <View pointerEvents='none' style={styles.decorBubbleThree} />
        <ScrollView contentContainerStyle={styles.scrollInner} showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl tintColor="#ffffff" refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          <SectionHeader title="My Lessons" />

          {/* Old top buttons replaced by floating action bar */}
          <View style={styles.buttonContainerHidden} />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : filteredLessons.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Icon name="school" size={44} color="#1976d2" style={styles.emptyStateIcon} />
              <Text style={styles.emptyStateTitle}>No Lessons Found</Text>
              <Text style={styles.emptyStateText}>
                {selectedDay ? 'No lessons scheduled for this day.' : 'Create your first lesson to start coaching clients.'}
              </Text>
              <TouchableOpacity style={styles.emptyCtaButton} onPress={()=>dispatchModal({ type:'OPEN_CREATE' })}>
                <Text style={styles.emptyCtaText}>Create Lesson</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.lessonsWrapper}> 
              <LessonCard
                lessons={filteredLessons}
                onEdit={(lesson: Lesson) => dispatchModal({ type:'OPEN_VIEW', lesson })}
              />
            </View>
          )}

          <View style={{height:140}} />
        </ScrollView>
        <View style={styles.fabBar}> 
          <TouchableOpacity style={styles.secondaryFab} onPress={()=>setShowDatePicker(true)} activeOpacity={0.85}>
            <Icon name="calendar-today" size={22} color="#1976d2" />
            <Text style={styles.secondaryFabText}>{selectedDay ? selectedDay.toLocaleDateString() : 'Filter Date'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryFab} onPress={()=>dispatchModal({ type:'OPEN_CREATE' })} activeOpacity={0.9}>
            <Icon name="add" size={22} color="#1976d2" />
            <Text style={styles.primaryFabText}>New Lesson</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Modals remain outside gradient for stacking */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentEnhanced}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.monthNavigation}> 
              <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavButtonNew}><Text style={styles.monthNavButtonTextNew}>←</Text></TouchableOpacity>
              <Text style={styles.monthTitleNew}>{getMonthName(currentMonth)}</Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavButtonNew}><Text style={styles.monthNavButtonTextNew}>→</Text></TouchableOpacity>
            </View>

            <View style={styles.weekDaysContainer}>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d,i)=>(<Text key={i} style={styles.weekDayText}>{d}</Text>))}</View>
            <View style={styles.calendarGrid}>
              {generateDates().map((date, index) => (
                date ? (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [
                      styles.dateItemNew,
                      selectedDay?.toDateString() === date.toDateString() && styles.selectedDateItemNew,
                      pressed && styles.dateItemPressedNew,
                      new Date().toDateString() === date.toDateString() && styles.todayDateItemNew
                    ]}
                    onPress={() => { setSelectedDay(date); setShowDatePicker(false); }}
                  >
                    <Text style={[
                      styles.dateNumberNew,
                      selectedDay?.toDateString() === date.toDateString() && styles.selectedDateTextNew,
                      new Date().toDateString() === date.toDateString() && styles.todayDateTextNew
                    ]}>{date.getDate()}</Text>
                  </Pressable>
                ) : (<View key={index} style={styles.emptyDateItem} />)
              ))}
            </View>
            {selectedDay && (
              <TouchableOpacity
                style={styles.clearButtonNew}
                onPress={()=>{ setSelectedDay(null); setShowDatePicker(false); }}
                accessibilityLabel="Clear selected date filter"
                activeOpacity={0.85}
              >
                <Icon name="close" size={16} color="#ffffff" style={{marginRight:6}} />
                <Text style={styles.clearButtonTextNew}>Clear Date Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <CoachLessonModal
        isOpen={showNewLessonModal}
        onClose={() => dispatchModal({ type:'CLOSE' })}
        onSubmit={handleCreateLesson}
        newLesson={newLesson}
        setNewLesson={setNewLesson}
        isSubmitting={isCreatingLesson}
      />
      <ViewLessonModal
        isOpen={showViewLessonModal}
        onClose={() => dispatchModal({ type:'CLOSE' })}
        lesson={lessonToView}
        onEditClick={() => {
          if (lessonToView) setSelectedLesson(lessonToView);
          setEditLessonData({
            description: lessonToView?.description || '',
            time: dayjs(lessonToView?.time),
            capacityLimit: lessonToView?.capacityLimit.toString() || '',
            duration: lessonToView?.duration || 0,
            location: lessonToView?.location || defaultLocation
          });
          if (lessonToView) dispatchModal({ type:'OPEN_EDIT', lesson: lessonToView });
        }}
        onViewClients={() => {
          if (lessonToView) dispatchModal({ type:'OPEN_REGISTERED', lesson: lessonToView });
        }}
        onDelete={(lesson) => {
          setSelectedLesson(lesson);
          dispatchModal({ type:'OPEN_DELETE', lesson });
        }}
      />
      {viewLessonLoading && (
        <View style={styles.inlineLoadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.inlineLoadingText}>Loading latest lesson...</Text>
        </View>
      )}
      <RegisteredClientsModal
        isOpen={showRegisteredClientsModal}
        onClose={() => dispatchModal({ type:'CLOSE' })}
        lessonId={selectedLessonForClients?.id || 0}
        registeredClients={registeredClients}
        isLoading={loadingRegisteredClients}
        onNavigateProfile={()=>{
          // After viewing profile, we want to come back to lesson view modal
          setPendingReturn('view');
          dispatchModal({ type:'CLOSE' });
        }}
        originScreen="CoachLessons"
      />
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmationModal}
        onClose={() => dispatchModal({ type:'CLOSE' })}
        onConfirmDelete={async () => {
          if (selectedLesson) {
            await handleDeleteLesson(selectedLesson.id);
          }
        }}
        lesson={selectedLesson}
        isDeleting={isDeletingLesson}
      />
      <EditLessonModal
        isOpen={showEditLessonModal}
        onClose={() => dispatchModal({ type:'CLOSE' })}
        onSubmit={handleEditLesson}
        lessonData={editLessonData}
        setLessonData={setEditLessonData}
        isSubmitting={isEditingLesson}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1 },
  gradientBackground:{ flex:1 },
  decorBubbleOne:{ position:'absolute', top:-70, left:-50, width:180, height:180, borderRadius:90, backgroundColor:'rgba(255,255,255,0.08)' },
  decorBubbleTwo:{ position:'absolute', top:140, right:-60, width:220, height:220, borderRadius:110, backgroundColor:'rgba(255,255,255,0.05)' },
  decorBubbleThree:{ position:'absolute', bottom:-80, left:-40, width:160, height:160, borderRadius:80, backgroundColor:'rgba(255,255,255,0.06)' },
  // Reduce top padding so the custom section header visually touches the app header
  scrollInner:{ paddingBottom:0, paddingTop:0 },
  lessonsWrapper:{ paddingHorizontal:4, paddingTop:4 },
  sectionHeaderCard:{ backgroundColor:'rgba(255,255,255,0.15)', paddingVertical:14, paddingHorizontal:18, borderBottomLeftRadius:24, borderBottomRightRadius:24, shadowColor:'#000', shadowOffset:{width:0,height:3}, shadowOpacity:0.13, shadowRadius:8, elevation:5, borderWidth:1, borderColor:'rgba(255,255,255,0.25)', marginBottom:8, marginTop:0 },
  headerContent:{ flexDirection:'row', alignItems:'center' },
  sectionHeaderText:{ flex:1, fontSize:26, fontWeight:'800', color:'#fff', letterSpacing:0.5, marginRight:14 },
  calendarButton:{ flexShrink:0, backgroundColor:'rgba(255,255,255,0.32)', paddingHorizontal:12, paddingVertical:8, borderRadius:16, borderWidth:1, borderColor:'rgba(255,255,255,0.55)', shadowColor:'#000', shadowOpacity:0.12, shadowRadius:5, shadowOffset:{width:0,height:3}, maxWidth:140 },
  calendarButtonPressed:{ backgroundColor:'rgba(255,255,255,0.55)' },
  calendarButtonContent:{ flexDirection:'row', alignItems:'center', justifyContent:'center' },
  calendarIcon:{ fontSize:16, marginRight:4 },
  calendarButtonText:{ color:'#ffffff', fontWeight:'700', fontSize:12.5, letterSpacing:0.5 },
  buttonContainerHidden:{ display:'none' },
  loadingContainer:{ flex:1, justifyContent:'center', alignItems:'center', paddingTop:100 },
  emptyStateCard:{ margin:18, backgroundColor:'rgba(255,255,255,0.95)', borderRadius:26, padding:26, alignItems:'center', shadowColor:'#0d47a1', shadowOpacity:0.12, shadowRadius:16, shadowOffset:{width:0,height:6}, borderWidth:1, borderColor:'rgba(255,255,255,0.6)' },
  emptyStateIcon:{ marginBottom:14 },
  emptyStateTitle:{ fontSize:24, fontWeight:'800', color:'#0d47a1', marginBottom:10 },
  emptyStateText:{ fontSize:14, color:'#455a64', textAlign:'center', lineHeight:20 },
  emptyCtaButton:{ marginTop:18, backgroundColor:'#1976d2', paddingVertical:14, paddingHorizontal:24, borderRadius:18, shadowColor:'#000', shadowOpacity:0.25, shadowRadius:8, shadowOffset:{ width:0, height:4 } },
  emptyCtaText:{ color:'#fff', fontWeight:'700', fontSize:15, letterSpacing:0.5 },
  fabBar:{ position:'absolute', bottom:24, left:0, right:0, flexDirection:'row', justifyContent:'center', gap:16, paddingHorizontal:24 },
  primaryFab:{ flex:1, backgroundColor:'#ffffff', paddingVertical:18, borderRadius:20, alignItems:'center', flexDirection:'row', justifyContent:'center', shadowColor:'#000', shadowOpacity:0.25, shadowRadius:10, shadowOffset:{ width:0, height:4 } },
  primaryFabText:{ color:'#1976d2', fontSize:15, fontWeight:'700', marginLeft:8 },
  secondaryFab:{ flex:1, backgroundColor:'rgba(255,255,255,0.35)', paddingVertical:18, borderRadius:20, alignItems:'center', flexDirection:'row', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.55)', shadowColor:'#000', shadowOpacity:0.15, shadowRadius:8, shadowOffset:{width:0,height:3} },
  secondaryFabText:{ color:'#fff', fontSize:15, fontWeight:'700', marginLeft:8 },
  modalOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'center', alignItems:'center', padding:24 },
  modalContentEnhanced:{ backgroundColor:'rgba(255,255,255,0.97)', borderRadius:28, padding:22, width:'90%', maxHeight:'80%', shadowColor:'#000', shadowOpacity:0.3, shadowRadius:18, shadowOffset:{ width:0, height:10 }, borderWidth:1, borderColor:'rgba(255,255,255,0.6)' },
  modalHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:20, paddingBottom:12, borderBottomWidth:1, borderBottomColor:'rgba(13,71,161,0.15)' },
  modalTitle:{ fontSize:22, fontWeight:'800', color:'#0d47a1' },
  closeButton:{ fontSize:26, color:'#607d8b', padding:4 },
  monthNavigation:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  monthNavButtonNew:{ padding:10, borderRadius:14, backgroundColor:'#e3f2fd' },
  monthNavButtonTextNew:{ fontSize:18, color:'#1976d2', fontWeight:'700' },
  monthTitleNew:{ fontSize:18, fontWeight:'700', color:'#0d47a1' },
  weekDaysContainer:{ flexDirection:'row', justifyContent:'space-around', marginBottom:8, paddingHorizontal:4 },
  weekDayText:{ width:'13%', textAlign:'center', fontSize:12, fontWeight:'700', color:'#0d47a1' },
  calendarGrid:{ flexDirection:'row', flexWrap:'wrap', gap:8, justifyContent:'center', paddingHorizontal:4 },
  dateItemNew:{ width:'13%', aspectRatio:1, justifyContent:'center', alignItems:'center', borderRadius:14, backgroundColor:'rgba(255,255,255,0.65)', borderWidth:1.5, borderColor:'rgba(25,118,210,0.15)', marginBottom:6 },
  selectedDateItemNew:{ backgroundColor:'#1976d2', borderColor:'#1976d2' },
  todayDateItemNew:{ borderColor:'#1976d2', borderWidth:2 },
  dateItemPressedNew:{ backgroundColor:'#bbdefb' },
  dateNumberNew:{ fontSize:14, fontWeight:'600', color:'#0f172a' },
  selectedDateTextNew:{ color:'#fff' },
  todayDateTextNew:{ color:'#1976d2', fontWeight:'700' },
  clearButtonNew:{ marginTop:14, paddingVertical:12, paddingHorizontal:18, borderRadius:18, backgroundColor:'#1976d2', alignItems:'center', justifyContent:'center', flexDirection:'row', shadowColor:'#000', shadowOpacity:0.2, shadowRadius:6, shadowOffset:{ width:0, height:3 }, borderWidth:1, borderColor:'rgba(255,255,255,0.35)' },
  clearButtonTextNew:{ color:'#ffffff', fontWeight:'700', letterSpacing:0.4, fontSize:13 },
  emptyDateItem:{ width:'13%', aspectRatio:1, marginBottom:6 },
  inlineLoadingOverlay:{ position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.45)', justifyContent:'center', alignItems:'center', zIndex:50 },
  inlineLoadingText:{ marginTop:16, color:'#ffffff', fontSize:14, fontWeight:'600', letterSpacing:0.4 },
});
