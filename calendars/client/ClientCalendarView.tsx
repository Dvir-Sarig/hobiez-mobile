import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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
import { lessonCacheService } from '../../lesson/services/lessonCacheService';
import { LinearGradient } from 'expo-linear-gradient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ClientCalendarView: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [coachInfoMap, setCoachInfoMap] = useState<{ [key: string]: { name: string; email: string } }>({});
  const [selectedCoachInfo, setSelectedCoachInfo] = useState<{ name: string; email: string } | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDateLessons, setSelectedDateLessons] = useState<Lesson[]>([]);
  const [weekAnchor, setWeekAnchor] = useState(dayjs());

  const { userId } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const origin = route.params?.origin;

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

  const handleOpenCoachModal = (coachId: string) => {
    const coachInfo = coachInfoMap[coachId];
    if (coachInfo) {
      setSelectedCoachInfo(coachInfo);
      setIsCoachModalOpen(true);
    }
  };

  const handleUnregister = async (lessonId: number) => {
    try {
      const message = await deleteClientFromLesson(userId!, lessonId);
      handleCloseModal();
      // Clear the registered lessons cache
      await lessonCacheService.clearRegisteredLessons(userId!);
      setEvents((prev) => prev.filter((e) => e.id !== lessonId));
      setSelectedDateLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
    } catch (error) {
      console.error('Error unregistering:', error);
      Alert.alert('Error', 'An error occurred while unregistering.');
    }
  };

  const fetchCoachInfoData = async (coachId: string) => {
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
        const cachedLessons = await lessonCacheService.getRegisteredLessons(userId);
        if (cachedLessons) {
          const formattedLessons = cachedLessons.map((lesson: Lesson) => {
            fetchCoachInfoData(lesson.coachId);
            return formatLessonToEvent(lesson);
          });
          setEvents(formattedLessons);
        } else {
          const lessons = await fetchClientRegisteredLessons(userId);
          const lessonsWithCounts = await fetchLessonsWithRegistrationCounts(lessons);
            const formattedLessons = lessonsWithCounts.map((lesson: Lesson) => {
              fetchCoachInfoData(lesson.coachId);
              return formatLessonToEvent(lesson);
            });
          await lessonCacheService.setRegisteredLessons(userId, lessonsWithCounts);
          setEvents(formattedLessons);
        }
      } catch (error) {
        // silently ignore or handle error UI elsewhere
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
      // If returning from coach profile with a request to reopen a lesson modal
      const openClientCalendarLessonModal = route.params?.openClientCalendarLessonModal;
      const lessonId = route.params?.lessonId;
      const weekAnchorDate = route.params?.weekAnchorDate;
      const selectedDateParam = route.params?.selectedDate;
      if (weekAnchorDate) {
        const wa = dayjs(weekAnchorDate);
        if (wa.isValid()) setWeekAnchor(wa);
      }
      if (selectedDateParam) {
        const sd = dayjs(selectedDateParam);
        if (sd.isValid()) setSelectedDate(sd);
      }
      if (openClientCalendarLessonModal && lessonId) {
        const ev = events.find(e=> e.id === lessonId);
        if (ev) {
          const lesson: Lesson = {
            id: ev.id as number,
            title: ev.title,
            description: ev.description || '',
            time: ev.start.toISOString(),
            duration: ev.duration,
            price: ev.price,
            location: ev.location,
            coachId: ev.coachId,
            capacityLimit: ev.capacityLimit,
            registeredCount: ev.registeredCount,
          };
          setSelectedLesson(lesson);
          setIsModalOpen(true);
        }
        (navigation as any).setParams({ openClientCalendarLessonModal: undefined, lessonId: undefined });
      }
    });

    return unsubscribe;
  }, [navigation, fetchLessons, events, route.params]);

  // Lesson type visual mapping (inferred from title if no explicit type prop)
  const lessonTypeMap: Record<string,{abbr:string; bg:string; border:string}> = {
    Tennis:{ abbr:'TN', bg:'#fff3e0', border:'#ffb74d' },
    Yoga:{ abbr:'YG', bg:'#e0f2f1', border:'#26a69a' },
    Surf:{ abbr:'SF', bg:'#e0f7fa', border:'#26c6da' },
    Football:{ abbr:'FB', bg:'#e8f5e9', border:'#66bb6a' },
    Basketball:{ abbr:'BB', bg:'#fbe9e7', border:'#ff8a65' },
    Paddle:{ abbr:'PD', bg:'#ede7f6', border:'#9575cd' }
  };
  const inferType = (title:string) => {
    const key = Object.keys(lessonTypeMap).find(k => new RegExp(`(^|\\s)${k}(\\s|$)`,`i`).test(title));
    return key || 'Tennis';
  };

  const goPrevWeek = () => { const d = weekAnchor.subtract(1,'week'); setWeekAnchor(d); handleDateSelect(d.toDate()); };
  const goNextWeek = () => { const d = weekAnchor.add(1,'week'); setWeekAnchor(d); handleDateSelect(d.toDate()); };
  const goToday = () => { const d = dayjs(); setWeekAnchor(d); handleDateSelect(d.toDate()); };

  const weekRangeLabel = useMemo(()=>{ const start = weekAnchor.startOf('week').add(1,'day'); const end = start.add(6,'day'); return `${start.format('MMM D')} – ${end.format(start.month()!==end.month()? 'MMM D':'D, YYYY')}`; },[weekAnchor]);

  const renderLessonCard = (lesson: Lesson) => {
    const typeKey = inferType(lesson.title);
    const visual = lessonTypeMap[typeKey];
    const fillPct = Math.min(100, ((lesson.registeredCount||0)/(lesson.capacityLimit||1))*100);
    return (
      <TouchableOpacity key={lesson.id} style={styles.dayLessonCard} onPress={()=>handleOpenModal(lesson)} activeOpacity={0.85}> 
        {/* debug time placement */}
        {false && <Text style={{fontSize:9,color:'#555'}}>DBG {dayjs(lesson.time).format('HH:mm')}</Text>}
        <View style={[styles.typeBadge,{backgroundColor:visual.bg, borderColor:visual.border}]}> 
          <Text style={[styles.typeBadgeText,{color:'#0d47a1'}]}>{visual.abbr}</Text>
        </View>
        <View style={{flex:1}}>
          <Text style={styles.dayLessonTitle} numberOfLines={1}>{lesson.title}</Text>
          <Text style={styles.dayLessonMeta} numberOfLines={1}>{dayjs(lesson.time).format('HH:mm')} · {lesson.duration}m · {(lesson.registeredCount||0)}/{lesson.capacityLimit}</Text>
          {lesson.location && <Text style={styles.dayLessonLocation} numberOfLines={1}>{lesson.location.address || `${lesson.location.city}, ${lesson.location.country}`}</Text>}
          <View style={styles.capacityBar}><View style={[styles.capacityFill,{width:`${fillPct}%`}]} /></View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#0d47a1','#1565c0','#1e88e5']} style={styles.gradientContainer}>
      <View style={styles.overlayLayer}> 
        {/* Header */}
        <View style={styles.headerPolished}> 
          <TouchableOpacity onPress={() => {
            (navigation as any).navigate('SearchLessons', { focusRegistered: true });
          }} style={styles.headerIconBtn} accessibilityLabel="Back to registered lessons"> 
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

        {/* Calendar Card */}
        <View style={styles.calendarCard}> 
          <Calendar
            events={events}
            date={weekAnchor.toDate()}
            height={Dimensions.get('window').height * 0.42}
            mode="week"
            weekStartsOn={1}
            hourRowHeight={44}
            swipeEnabled
            showTime
            onPressCell={(d)=>{ handleDateSelect(d);} }
            onPressEvent={(e)=>{ handleOpenModal(e);} }
            renderEvent={(event, touchableOpacityProps)=>{ 
              const { key: itemKey, style: evtStyle, ...restProps } = (touchableOpacityProps || {}) as any;
              const typeKey = inferType(event.title || '');
              const visual = lessonTypeMap[typeKey];
              // Strip backgroundColor from incoming style to avoid overriding our custom color
              let cleanedStyle = evtStyle;
              if (cleanedStyle) {
                if (Array.isArray(cleanedStyle)) {
                  cleanedStyle = cleanedStyle.map(s => (s && typeof s === 'object' && 'backgroundColor' in s ? { ...s, backgroundColor: undefined } : s));
                } else if (typeof cleanedStyle === 'object') {
                  const { backgroundColor, ...rest } = cleanedStyle; // remove backgroundColor
                  cleanedStyle = rest;
                }
              }
              return (
                <TouchableOpacity
                  key={itemKey ?? `evt-${event.id}`}
                  {...restProps}
                  activeOpacity={0.85}
                  accessibilityLabel={`${event.title} at ${dayjs(event.start).format('HH:mm')}`}
                  style={[styles.compactEventContainer, cleanedStyle, { backgroundColor: visual.bg, borderColor: visual.border }]}
                >
                  <View style={[styles.compactStripe,{backgroundColor:visual.border}]} />
                  <Text style={[styles.compactAbbr,{color:'#0d47a1'}]}>{visual.abbr}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Selected Day Lessons */}
        <View style={styles.dayListCard}> 
          <View style={styles.dayListHeaderRow}> 
            <View>
              <Text style={styles.dayHeading}>{selectedDate.format('dddd')}</Text>
              <Text style={styles.daySubHeading}>{selectedDate.format('D MMM YYYY')}</Text>
            </View>
            <View style={styles.countBadge}><Text style={styles.countBadgeText}>{selectedDateLessons.length}</Text></View>
          </View>
          {selectedDateLessons.length>0 ? (
            <ScrollView showsVerticalScrollIndicator={false} style={{flex:1}} contentContainerStyle={{paddingBottom:12}}>{selectedDateLessons.map(renderLessonCard)}</ScrollView>
          ) : (
            <View style={styles.emptyState}> 
              <Icon name="event-busy" size={44} color="#ffffff" style={{opacity:0.55}} />
              <Text style={styles.emptyTitle}>No lessons</Text>
              <Text style={styles.emptySubtitle}>Select another day or check back later.</Text>
            </View>
          )}
        </View>

        {/* Modals */}
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
          onClose={()=>setIsCoachModalOpen(false)}
          coachInfo={selectedCoachInfo}
        />
      </View>
    </LinearGradient>
  );
};

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
  emptyState:{ alignItems:'center', paddingVertical:32 },
  emptyTitle:{ fontSize:16, fontWeight:'800', color:'#0d47a1', marginTop:12 },
  emptySubtitle:{ fontSize:12.5, fontWeight:'600', color:'#1e3a8a', marginTop:4, textAlign:'center', paddingHorizontal:18 },
  // Compact event styles
  compactEventContainer:{ flexDirection:'row', alignItems:'center', paddingHorizontal:6, gap:4, borderRadius:8, borderWidth:1, minHeight:26 },
  compactStripe:{ position:'absolute', left:0, top:0, bottom:0, width:3, borderTopLeftRadius:6, borderBottomLeftRadius:6 },
  compactAbbr:{ fontSize:10, fontWeight:'800', letterSpacing:0.5 },
  // Keep original style keys (unused) to avoid runtime style referencing issues
  container:{}, header:{}, headerTitleContainer:{}, headerIcon:{}, calendarContainer:{}, calendarHeader:{}, calendarHeaderText:{}, lessonsContainer:{}, selectedDateContainer:{}, selectedDateText:{}, selectedDateNumber:{}, selectedDateMonth:{}, lessonsList:{}, lessonCard:{}, lessonHeader:{}, lessonTitle:{}, lessonTime:{}, lessonDetails:{}, detailRow:{}, detailText:{}, noLessonsContainer:{}, noLessonsText:{}
});

export default ClientCalendarView;
