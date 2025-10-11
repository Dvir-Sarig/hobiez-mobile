import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, Alert, ActivityIndicator, StyleSheet, TouchableOpacity, Pressable, Modal, Platform } from 'react-native';
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

  const [returnAfter, setReturnAfter] = useState({ edit:false, clients:false, delete:false });

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
      if (returnAfter.edit) {
        // restore view modal with updated lesson
        const prevRegistered = lessons.find(l=> l.id === updatedLesson.id)?.registeredCount || 0;
        setLessonToView({ ...updatedLesson, registeredCount: prevRegistered });
        setShowViewLessonModal(true);
        setReturnAfter(r=>({...r, edit:false}));
      }
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

  const SectionHeader = ({ title }: { title: string }) => (
    <View style={styles.sectionHeaderCard}>
      <View style={styles.headerContent}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.calendarButton,
            pressed && styles.calendarButtonPressed,
          ]}
          onPress={() => navigation.navigate('CoachCalendar' as never)}
        >
          <View style={styles.calendarButtonContent}>
            <Icon name="calendar-today" size={18} color="#ffffff" style={styles.calendarIcon} />
            <Text style={styles.calendarButtonText}>View Calendar</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );

  useEffect(()=>{
    const unsubscribe = navigation.addListener('focus', ()=>{
      const reopen = route.params?.reopenRegisteredClientsModal;
      const lid = route.params?.lessonId;
      if (reopen && lid) {
        const lesson = lessons.find(l=> l.id === lid);
        if (lesson) {
          setSelectedLessonForClients(lesson);
          setShowRegisteredClientsModal(true);
        }
      }
    });
    return unsubscribe;
  },[navigation, route.params, lessons]);

  useEffect(() => {
    if (route.params?.openCoachLessonModal && route.params.lessonId) {
      const lesson = lessons.find(l => l.id === route.params.lessonId);
      if (lesson) {
        setLessonToView(lesson);
        setShowViewLessonModal(true);
        // clear param to avoid re-open
        (navigation as any).setParams({ openCoachLessonModal: undefined, lessonId: undefined });
      }
    }
  }, [route.params, lessons]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0d47a1','#1565c0','#1e88e5']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.gradientBackground}> 
        <View pointerEvents='none' style={styles.decorBubbleOne} />
        <View pointerEvents='none' style={styles.decorBubbleTwo} />
        <View pointerEvents='none' style={styles.decorBubbleThree} />
        <ScrollView contentContainerStyle={styles.scrollInner} showsVerticalScrollIndicator={false}>
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
              <TouchableOpacity style={styles.emptyCtaButton} onPress={()=>setShowNewLessonModal(true)}>
                <Text style={styles.emptyCtaText}>Create Lesson</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.lessonsWrapper}> 
              <LessonCard
                lessons={filteredLessons}
                onEdit={(lesson: Lesson) => {
                  setLessonToView(lesson);
                  setShowViewLessonModal(true);
                }}
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
          <TouchableOpacity style={styles.primaryFab} onPress={()=>setShowNewLessonModal(true)} activeOpacity={0.9}>
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
              <TouchableOpacity style={styles.clearButtonNew} onPress={()=>{ setSelectedDay(null); setShowDatePicker(false); }}>
                <Text style={styles.clearButtonTextNew}>Clear Filter</Text>
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
      <ViewLessonModal
        isOpen={showViewLessonModal}
        onClose={() => setShowViewLessonModal(false)}
        lesson={lessonToView}
        onEditClick={() => {
          setShowViewLessonModal(false);
          setReturnAfter(r=>({...r, edit:true}));
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
          setReturnAfter(r=>({...r, clients:true}));
          setSelectedLessonForClients(lessonToView);
          setShowRegisteredClientsModal(true);
        }}
        onDelete={(lesson) => {
          setShowViewLessonModal(false);
            setReturnAfter(r=>({...r, delete:true}));
          setSelectedLesson(lesson);
          setShowDeleteConfirmationModal(true);
        }}
      />
      <RegisteredClientsModal
        isOpen={showRegisteredClientsModal}
        onClose={() => {
          setShowRegisteredClientsModal(false);
          if (returnAfter.clients && lessonToView) {
            setShowViewLessonModal(true);
          }
          setReturnAfter(r=>({...r, clients:false}));
        }}
        lessonId={selectedLessonForClients?.id || 0}
        registeredClients={registeredClients}
        isLoading={loadingRegisteredClients}
        onNavigateProfile={()=>{ setShowRegisteredClientsModal(false); }}
      />
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmationModal}
        onClose={() => {
          setShowDeleteConfirmationModal(false);
          if (returnAfter.delete && selectedLesson) {
            // user canceled delete, return to view
            setLessonToView(selectedLesson);
            setShowViewLessonModal(true);
          }
          setReturnAfter(r=>({...r, delete:false}));
        }}
        onConfirmDelete={async () => {
          if (selectedLesson) {
            await handleDeleteLesson(selectedLesson.id);
            // if deletion originated from view, do NOT return
            setReturnAfter(r=>({...r, delete:false}));
          }
        }}
        lesson={selectedLesson}
        isDeleting={isDeletingLesson}
      />
      <EditLessonModal
        isOpen={showEditLessonModal}
        onClose={() => {
          setShowEditLessonModal(false);
          if (returnAfter.edit && lessonToView) {
            // user canceled edit, just reopen original view
            setShowViewLessonModal(true);
            setReturnAfter(r=>({...r, edit:false}));
          }
        }}
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
  scrollInner:{ paddingBottom:0, paddingTop:4 },
  lessonsWrapper:{ paddingHorizontal:4, paddingTop:4 },
  sectionHeaderCard:{ backgroundColor:'rgba(255,255,255,0.15)', padding:20, borderBottomLeftRadius:28, borderBottomRightRadius:28, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.15, shadowRadius:10, elevation:6, borderWidth:1, borderColor:'rgba(255,255,255,0.25)', marginBottom:10 },
  headerContent:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  sectionHeaderText:{ fontSize:28, fontWeight:'800', color:'#fff', letterSpacing:0.5 },
  calendarButton:{ backgroundColor:'rgba(255,255,255,0.35)', paddingHorizontal:14, paddingVertical:10, borderRadius:18, borderWidth:1, borderColor:'rgba(255,255,255,0.55)', shadowColor:'#000', shadowOpacity:0.15, shadowRadius:6, shadowOffset:{width:0,height:3} },
  calendarButtonPressed:{ backgroundColor:'rgba(255,255,255,0.55)' },
  calendarButtonContent:{ flexDirection:'row', alignItems:'center' },
  calendarIcon:{ fontSize:18, marginRight:6 },
  calendarButtonText:{ color:'#ffffff', fontWeight:'700', fontSize:13, letterSpacing:0.5 },
  buttonContainerHidden:{ display:'none' },
  loadingContainer:{ flex:1, justifyContent:'center', alignItems:'center', paddingTop:100 },
  emptyStateCard:{ margin:18, backgroundColor:'rgba(255,255,255,0.95)', borderRadius:26, padding:26, alignItems:'center', shadowColor:'#0d47a1', shadowOpacity:0.12, shadowRadius:16, shadowOffset:{width:0,height:6}, borderWidth:1, borderColor:'rgba(255,255,255,0.6)' },
  emptyStateIcon:{ marginBottom:14 },
  emptyStateTitle:{ fontSize:24, fontWeight:'800', color:'#0d47a1', marginBottom:10 },
  emptyStateText:{ fontSize:14, color:'#455a64', textAlign:'center', lineHeight:20 },
  emptyCtaButton:{ marginTop:18, backgroundColor:'#1976d2', paddingVertical:14, paddingHorizontal:24, borderRadius:18, shadowColor:'#000', shadowOpacity:0.25, shadowRadius:8, shadowOffset:{width:0,height:4} },
  emptyCtaText:{ color:'#fff', fontWeight:'700', fontSize:15, letterSpacing:0.5 },
  fabBar:{ position:'absolute', bottom:24, left:0, right:0, flexDirection:'row', justifyContent:'center', gap:16, paddingHorizontal:24 },
  primaryFab:{ flex:1, backgroundColor:'#ffffff', paddingVertical:18, borderRadius:20, alignItems:'center', flexDirection:'row', justifyContent:'center', shadowColor:'#000', shadowOpacity:0.25, shadowRadius:10, shadowOffset:{width:0,height:4} },
  primaryFabText:{ color:'#1976d2', fontSize:15, fontWeight:'700', marginLeft:8 },
  secondaryFab:{ flex:1, backgroundColor:'rgba(255,255,255,0.35)', paddingVertical:18, borderRadius:20, alignItems:'center', flexDirection:'row', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.55)', shadowColor:'#000', shadowOpacity:0.15, shadowRadius:8, shadowOffset:{width:0,height:3} },
  secondaryFabText:{ color:'#fff', fontSize:15, fontWeight:'700', marginLeft:8 },
  modalOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'center', alignItems:'center', padding:24 },
  modalContentEnhanced:{ backgroundColor:'rgba(255,255,255,0.97)', borderRadius:28, padding:22, width:'90%', maxHeight:'80%', shadowColor:'#000', shadowOpacity:0.3, shadowRadius:18, shadowOffset:{width:0,height:10}, borderWidth:1, borderColor:'rgba(255,255,255,0.6)' },
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
  clearButtonNew:{ marginTop:14, paddingVertical:12, borderRadius:16, backgroundColor:'#1976d2', alignItems:'center', shadowColor:'#000', shadowOpacity:0.2, shadowRadius:6, shadowOffset:{width:0,height:3} },
  clearButtonTextNew:{ color:'#fff', fontWeight:'700', letterSpacing:0.5 },
  emptyDateItem:{ width:'13%', aspectRatio:1, marginBottom:6 },
});
