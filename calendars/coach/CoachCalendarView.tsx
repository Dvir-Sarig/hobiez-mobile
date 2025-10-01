import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';

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
  const [weekAnchor, setWeekAnchor] = useState(dayjs());

  const { userId: coachId } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const typeColors: Record<string,{abbr:string; bg:string; border:string}> = {
    Tennis:{ abbr:'TN', bg:'#fff3e0', border:'#ffb74d' },
    Yoga:{ abbr:'YG', bg:'#e0f2f1', border:'#26a69a' },
    Surf:{ abbr:'SF', bg:'#e0f7fa', border:'#26c6da' },
    Football:{ abbr:'FB', bg:'#e8f5e9', border:'#66bb6a' },
    Basketball:{ abbr:'BB', bg:'#fbe9e7', border:'#ff8a65' },
    Paddle:{ abbr:'PD', bg:'#ede7f6', border:'#9575cd' }
  };
  const inferType = (title:string) => Object.keys(typeColors).find(k=> new RegExp(`(^|\\s)${k}(\\s|$)`,`i`).test(title)) || 'Tennis';

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
    const lessonsForDate = events
      .filter(event => dayjs(event.start).isSame(selectedDay, 'day'))
      .map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        time: dayjs(event.start).format('YYYY-MM-DDTHH:mm:ss'),
        duration: event.duration,
        price: event.price,
        location: event.location,
        coachId: event.coachId,
        capacityLimit: event.capacityLimit,
        registeredCount: event.registeredCount,
      }));
    setSelectedDateLessons(lessonsForDate);
  };

  // Deduplicate events by id
  const dedupeEvents = useCallback((items: CalendarEvent[]) => {
    const seen = new Set<number | string>();
    return items.filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }, []);

  const fetchLessons = useCallback(async () => {
    if (coachId) {
      try {
        const lessons = await fetchCoachLessons(coachId);
        const formatted = dedupeEvents(lessons.map(l => ({ ...formatLessonToEvent(l), allDay: false } as CalendarEvent)));
        setEvents(formatted);
      } catch (error) {
        // silent fail or show alert if needed
      }
    }
  }, [coachId, dedupeEvents]);

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

      await editLesson(selectedLesson?.id!, editData);
      setShowEditLessonModal(false);
      setIsModalOpen(false);
      const updatedLesson = await fetchSingleLesson(selectedLesson?.id!);
      setEvents(prev => dedupeEvents(prev.map((event) => (
        event.id === updatedLesson.id 
          ? ({ ...formatLessonToEvent(updatedLesson), allDay:false } as CalendarEvent)
          : event
      ))));
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'An error occurred while editing.');
    } finally {
      setIsEditingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    try {
      setIsDeletingLesson(true);
      await deleteLesson(lessonId);
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
          } catch {
            return { id, name: `Client ${id}` };
          }
        })
      );
      setRegisteredClients(clientsWithInfo);
    } catch {
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

  const goPrevWeek = () => { const d=weekAnchor.subtract(1,'week'); setWeekAnchor(d); handleDateSelect(d.toDate()); };
  const goNextWeek = () => { const d=weekAnchor.add(1,'week'); setWeekAnchor(d); handleDateSelect(d.toDate()); };
  const goToday = () => { const d=dayjs(); setWeekAnchor(d); handleDateSelect(d.toDate()); };
  const weekRangeLabel = useMemo(()=>{ const start = weekAnchor.startOf('week').add(1,'day'); const end = start.add(6,'day'); return `${start.format('MMM D')} – ${end.format(start.month()!==end.month()? 'MMM D':'D, YYYY')}`; },[weekAnchor]);

  const renderDayLessonCard = (lesson: Lesson) => {
    const t = inferType(lesson.title);
    const v = typeColors[t];
    const fill = Math.min(100, ((lesson.registeredCount||0)/(lesson.capacityLimit||1))*100);
    return (
      <TouchableOpacity key={lesson.id} style={styles.dayLessonCard} activeOpacity={0.85} onPress={()=>handleOpenModal(lesson)}>
        <View style={[styles.typeBadge,{backgroundColor:v.bg, borderColor:v.border}]}> 
          <Text style={[styles.typeBadgeText,{color:'#0d47a1'}]}>{v.abbr}</Text>
        </View>
        <View style={{flex:1}}>
          <Text style={styles.dayLessonTitle} numberOfLines={1}>{lesson.title}</Text>
            <Text style={styles.dayLessonMeta} numberOfLines={1}>{dayjs(lesson.time).format('HH:mm')} · {lesson.duration}m · {(lesson.registeredCount||0)}/{lesson.capacityLimit}</Text>
            {lesson.location && <Text style={styles.dayLessonLocation} numberOfLines={1}>{lesson.location.address || `${lesson.location.city}, ${lesson.location.country}`}</Text>}
            <View style={styles.capacityBar}><View style={[styles.capacityFill,{width:`${fill}%`}]} /></View>
        </View>
        <TouchableOpacity onPress={()=>{ setSelectedLesson(lesson); setShowRegisteredClientsModal(true); }} style={styles.inlineAction} accessibilityLabel="View registered">
          <Icon name="people" size={18} color="#0d47a1" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#0d47a1','#1565c0','#1e88e5']} style={styles.gradientContainer}>
      <View style={styles.overlayLayer}>
        <View style={styles.headerPolished}> 
          <TouchableOpacity onPress={() => navigation.navigate('CoachLessons' as never)} style={styles.headerIconBtn} accessibilityLabel="Back to My Lessons"> 
            <Icon name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={{flex:1}}>
            <Text style={styles.headerTitle}>My Schedule</Text>
            <Text style={styles.headerSubtitle}>{weekRangeLabel}</Text>
          </View>
          <View style={styles.navControls}> 
            <TouchableOpacity onPress={goPrevWeek} style={styles.navPill}><Icon name="chevron-left" size={20} color="#0d47a1" /></TouchableOpacity>
            <TouchableOpacity onPress={goToday} style={[styles.navPill, styles.todayPill]}><Text style={styles.todayText}>Today</Text></TouchableOpacity>
            <TouchableOpacity onPress={goNextWeek} style={styles.navPill}><Icon name="chevron-right" size={20} color="#0d47a1" /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.calendarCard}> 
          <Calendar
            events={events}
            date={weekAnchor.toDate()}
            height={Dimensions.get('window').height * 0.42}
            mode="week"
            weekStartsOn={1}
            hourRowHeight={44}
            hideNowIndicator
            swipeEnabled
            showTime
            onPressCell={(d)=>{ handleDateSelect(d);} }
            onPressEvent={(e)=>{ handleOpenModal(e);} }
            renderEvent={(event, touchableOpacityProps)=>{ 
              const { key: itemKey, style: evtStyle, ...restProps } = (touchableOpacityProps || {}) as any;
              const t = inferType(event.title || '');
              const v = typeColors[t];
              let cleanedStyle = evtStyle;
              if (cleanedStyle) {
                if (Array.isArray(cleanedStyle)) {
                  cleanedStyle = cleanedStyle.map(s => (s && typeof s === 'object' && 'backgroundColor' in s ? { ...s, backgroundColor: undefined } : s));
                } else if (typeof cleanedStyle === 'object') {
                  const { backgroundColor, ...rest } = cleanedStyle; // remove default bg
                  cleanedStyle = rest;
                }
              }
              return (
                <TouchableOpacity
                  key={itemKey ?? `evt-${event.id}`}
                  {...restProps}
                  activeOpacity={0.85}
                  accessibilityLabel={`${event.title} at ${dayjs(event.start).format('HH:mm')}`}
                  style={[styles.compactEventContainer, cleanedStyle, { backgroundColor: v.bg, borderColor: v.border }]}
                >
                  <View style={[styles.compactStripe,{backgroundColor:v.border}]} />
                  <Text style={[styles.compactAbbr,{color:'#0d47a1'}]}>{v.abbr}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <View style={styles.dayListCard}> 
          <View style={styles.dayListHeaderRow}> 
            <View>
              <Text style={styles.dayHeading}>{selectedDate.format('dddd')}</Text>
              <Text style={styles.daySubHeading}>{selectedDate.format('D MMM YYYY')}</Text>
            </View>
            <View style={styles.countBadge}><Text style={styles.countBadgeText}>{selectedDateLessons.length}</Text></View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={{flex:1}} contentContainerStyle={{paddingBottom:12}}>
            {selectedDateLessons.length>0 ? selectedDateLessons.map(renderDayLessonCard) : (
              <View style={styles.emptyState}> 
                <Icon name="event-busy" size={44} color="#ffffff" style={{opacity:0.55}} />
                <Text style={styles.emptyTitle}>No lessons</Text>
                <Text style={styles.emptySubtitle}>Create or select another day.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Modals */}
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
    </LinearGradient>
  );
};

export default CoachCalendarView;

const styles = StyleSheet.create({
  gradientContainer:{ flex:1 },
  overlayLayer:{ flex:1, paddingTop:Platform.OS==='ios'? 54:36, paddingHorizontal:18 },
  headerPolished:{ flexDirection:'row', alignItems:'center', marginBottom:16 },
  headerIconBtn:{ width:46, height:46, borderRadius:16, backgroundColor:'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.45)', marginRight:14 },
  headerTitle:{ fontSize:22, fontWeight:'800', color:'#ffffff', letterSpacing:0.5 },
  headerSubtitle:{ fontSize:12, fontWeight:'600', color:'rgba(255,255,255,0.85)', marginTop:4 },
  navControls:{ flexDirection:'row', alignItems:'center', gap:8 },
  navPill:{ backgroundColor:'#ffffff', paddingHorizontal:8, paddingVertical:5, borderRadius:10, borderWidth:1, borderColor:'rgba(13,71,161,0.25)', shadowColor:'#000', shadowOpacity:0.10, shadowRadius:3, shadowOffset:{width:0,height:1}, minHeight:30, minWidth:34, alignItems:'center', justifyContent:'center' },
  todayPill:{ backgroundColor:'#e3f2fd' },
  todayText:{ fontSize:11, fontWeight:'800', color:'#0d47a1', letterSpacing:0.5 },
  calendarCard:{ backgroundColor:'rgba(255,255,255,0.18)', borderRadius:30, borderWidth:1, borderColor:'rgba(255,255,255,0.35)', padding:10, marginBottom:18, shadowColor:'#000', shadowOpacity:0.15, shadowRadius:18, shadowOffset:{width:0,height:8} },
  eventBox:{ flex:1, flexDirection:'row', alignItems:'center', paddingHorizontal:6, paddingVertical:4, gap:4 },
  eventStripe:{ position:'absolute', left:0, top:0, bottom:0, width:4, borderTopLeftRadius:10, borderBottomLeftRadius:10 },
  eventAbbr:{ fontSize:11, fontWeight:'800', color:'#0d47a1' },
  dayListCard:{ flex:1, backgroundColor:'rgba(255,255,255,0.9)', borderRadius:30, padding:18, borderWidth:1, borderColor:'rgba(255,255,255,0.55)', shadowColor:'#000', shadowOpacity:0.15, shadowRadius:18, shadowOffset:{width:0,height:8} },
  dayListHeaderRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:14 },
  dayHeading:{ fontSize:18, fontWeight:'800', color:'#0d47a1' },
  daySubHeading:{ fontSize:12, fontWeight:'700', color:'#1976d2', marginTop:2 },
  countBadge:{ backgroundColor:'#0d47a1', paddingHorizontal:12, paddingVertical:6, borderRadius:16, borderWidth:1, borderColor:'#1565c0' },
  countBadgeText:{ fontSize:12, fontWeight:'800', color:'#ffffff', letterSpacing:0.5 },
  dayLessonCard:{ flexDirection:'row', backgroundColor:'#ffffff', borderRadius:20, padding:14, marginBottom:14, borderWidth:1, borderColor:'rgba(13,71,161,0.1)', shadowColor:'#0d47a1', shadowOpacity:0.08, shadowRadius:10, shadowOffset:{width:0,height:4} },
  typeBadge:{ width:46, height:46, borderRadius:16, borderWidth:1.5, alignItems:'center', justifyContent:'center', marginRight:12 },
  typeBadgeText:{ fontSize:13, fontWeight:'800', letterSpacing:0.5 },
  dayLessonTitle:{ fontSize:14.5, fontWeight:'800', color:'#0d47a1', marginBottom:4 },
  dayLessonMeta:{ fontSize:11.5, fontWeight:'700', color:'#1976d2' },
  dayLessonLocation:{ fontSize:11, fontWeight:'600', color:'#374151', marginTop:4 },
  capacityBar:{ height:5, backgroundColor:'#e0f2fe', borderRadius:4, overflow:'hidden', marginTop:8 },
  capacityFill:{ height:5, backgroundColor:'#1976d2' },
  inlineAction:{ marginLeft:10, width:40, alignItems:'center', justifyContent:'center' },
  emptyState:{ alignItems:'center', paddingVertical:32 },
  emptyTitle:{ fontSize:16, fontWeight:'800', color:'#0d47a1', marginTop:12 },
  emptySubtitle:{ fontSize:12.5, fontWeight:'600', color:'#1e3a8a', marginTop:4, textAlign:'center', paddingHorizontal:18 },
  compactEventContainer:{ flexDirection:'row', alignItems:'center', paddingHorizontal:6, gap:4, borderRadius:8, borderWidth:1, minHeight:26 },
  compactStripe:{ position:'absolute', left:0, top:0, bottom:0, width:3, borderTopLeftRadius:6, borderBottomLeftRadius:6 },
  compactAbbr:{ fontSize:10, fontWeight:'800', letterSpacing:0.5 },
  container:{}, header:{}, headerTitleContainer:{}, headerIcon:{}, headerTitleLegacy:{}, calendarContainer:{}, calendarHeader:{}, calendarHeaderText:{}, lessonsContainer:{}, selectedDateContainer:{}, selectedDateText:{}, selectedDateNumber:{}, selectedDateMonth:{}, lessonsList:{}, lessonCard:{}, lessonHeader:{}, lessonTitle:{}, lessonTime:{}, lessonDetails:{}, detailRow:{}, detailText:{}, noLessonsContainer:{}, noLessonsText:{},
});
