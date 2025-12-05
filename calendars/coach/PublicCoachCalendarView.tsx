import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar } from 'react-native-big-calendar';
import dayjs from 'dayjs';
import { useAuth } from '../../auth/AuthContext';
import { fetchCoachLessons, registerToLesson } from '../../lesson/services/lessonService';
import { Lesson } from '../../lesson/types/Lesson';
import { fetchPublicCoachProfile } from '../../profile/utils/profileService';
import RegistrationLessonModal from '../../lesson/components/management/registration/RegistrationLessonModal';
import { formatLessonToEvent } from '../shared/utils/calendar.utils';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CalendarEvent } from '../shared/types/calendar.types';
import { RootStackParamList } from '../../types';
import { lessonCacheService } from '../../lesson/services/lessonCacheService';
import { LinearGradient } from 'expo-linear-gradient';
import { CoachProfile } from '../../profile/types/profile';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PublicCoachCalendarView: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDateLessons, setSelectedDateLessons] = useState<Lesson[]>([]);
  const [weekAnchor, setWeekAnchor] = useState(dayjs());

  const { userId } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { coachId } = route.params;

  const handleOpenModal = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLesson(null);
    setIsModalOpen(false);
  };

  const handleRegister = async (lessonId: number) => {
    try {
      await registerToLesson(userId!, lessonId);
      Alert.alert('Success', 'You have been registered for the lesson.');
      handleCloseModal();
      // Optionally, refresh lessons to show updated registration status
      fetchLessons();
    } catch (error) {
      console.error('Error registering:', error);
      Alert.alert('Error', 'An error occurred while registering.');
    }
  };

  const fetchLessons = useCallback(async () => {
    if (coachId) {
      try {
        const lessons = await fetchCoachLessons(coachId);
        const formattedLessons = lessons.map(formatLessonToEvent);
        setEvents(formattedLessons);
      } catch (error) {
        console.error('Error fetching coach lessons:', error);
      }
    }
  }, [coachId]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (coachId) {
        try {
          const profile = await fetchPublicCoachProfile(coachId);
          setCoachProfile(profile);
        } catch (error) {
          console.error('Error fetching coach profile:', error);
        }
      }
    };
    fetchProfile();
    fetchLessons();
  }, [coachId, fetchLessons]);

  useEffect(() => {
    if (events.length > 0) {
      handleDateSelect((selectedDate ?? dayjs()).toDate());
    }
  }, [events]);

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
        <View style={styles.headerPolished}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn} accessibilityLabel="Back to profile">
            <Icon name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={{flex:1}}>
            <Text style={styles.headerTitle}>{coachProfile ? `${coachProfile.genericProfile.name}'s Schedule` : 'Coach Schedule'}</Text>
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
            swipeEnabled
            showTime
            onPressCell={(d)=>{ handleDateSelect(d);} }
            onPressEvent={(e)=>{ handleOpenModal(e as Lesson);} }
            renderEvent={(event, touchableOpacityProps)=>{
              const { key: itemKey, style: evtStyle, ...restProps } = (touchableOpacityProps || {}) as any;
              const typeKey = inferType(event.title || '');
              const visual = lessonTypeMap[typeKey];
              let cleanedStyle = evtStyle;
              if (cleanedStyle) {
                if (Array.isArray(cleanedStyle)) {
                  cleanedStyle = cleanedStyle.map(s => (s && typeof s === 'object' && 'backgroundColor' in s ? { ...s, backgroundColor: undefined } : s));
                } else if (typeof cleanedStyle === 'object') {
                  const { backgroundColor, ...rest } = cleanedStyle;
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

        {selectedLesson && (
          <RegistrationLessonModal
            lesson={selectedLesson}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onRegister={handleRegister}
            coachName={coachProfile ? coachProfile.genericProfile.name : 'Coach'}
          />
        )}
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
  compactEventContainer:{ flexDirection:'row', alignItems:'center', paddingHorizontal:6, gap:4, borderRadius:8, borderWidth:1, minHeight:26 },
  compactStripe:{ position:'absolute', left:0, top:0, bottom:0, width:3, borderTopLeftRadius:6, borderBottomLeftRadius:6 },
compactAbbr:{ fontSize:10, fontWeight:'800', letterSpacing:0.5 },
});

export default PublicCoachCalendarView;
