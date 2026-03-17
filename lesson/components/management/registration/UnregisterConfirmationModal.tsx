import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Platform,
  Alert,
  ImageBackground,
} from 'react-native';
import { Lesson } from '../../../../lesson/types/Lesson';
import { formatLessonTimeReadable, formatPrice } from '../../../../shared/services/formatService';
import { MaterialIcons, Entypo, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { fetchCoachGlobalInfo, CoachGlobalInfo } from '../../../../profile/services/coachService';
import { getLessonBackground, getLessonIcon, getLessonTypeDisplayName } from '../../../../lesson/types/LessonType';

interface Props {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  coachInfo?: { name: string };
  hasDeclaredPayment?: boolean;
}

// Capacity color (shared logic with registration)
const getCapacityColor = (registered: number, limit: number): string => {
  const ratio = limit ? registered / limit : 0;
  if (!limit) return '#90a4ae';
  if (ratio >= 0.95) return '#ff5252';
  if (ratio >= 0.75) return '#ffa726';
  return '#64b5f6';
};

const UnregisterConfirmationModal: React.FC<Props> = ({
  lesson,
  isOpen,
  onClose,
  onConfirm,
  coachInfo,
  hasDeclaredPayment = false,
}) => {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCoachInfo, setIsLoadingCoachInfo] = useState(false);
  const [coachGlobalInfo, setCoachGlobalInfo] = useState<CoachGlobalInfo | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!lesson?.coachId) return;
      setIsLoadingCoachInfo(true);
      try {
        const info = await fetchCoachGlobalInfo(lesson.coachId);
        setCoachGlobalInfo(info);
      } catch (e) {
        console.error('Error fetching coach info', e);
      } finally {
        setIsLoadingCoachInfo(false);
      }
    };
    if (isOpen) load();
  }, [isOpen, lesson?.coachId]);

  if (!lesson) return null;

  const registered = lesson.registeredCount ?? 0;
  const capacity = lesson.capacityLimit ?? 0;
  const capacityColor = getCapacityColor(registered, capacity);
  const timeDate = new Date(lesson.time);
  const dateStr = timeDate.toLocaleDateString();
  const timeStr = timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const coachName = coachGlobalInfo?.name || coachInfo?.name || 'מאמן';
  const locationText = lesson.location?.address || [lesson.location?.city, lesson.location?.country].filter(Boolean).join(', ');
  const { IconComponent, iconName } = getLessonIcon(lesson.title);
  const lessonBg = getLessonBackground(lesson.title);
  const lessonDisplayName = getLessonTypeDisplayName(lesson.title);
  const hoursUntilLesson = (new Date(lesson.time).getTime() - Date.now()) / (1000 * 60 * 60);
  const isCloseToLesson = hoursUntilLesson <= 24 && hoursUntilLesson > 6;

  const handleCoachPress = () => {
    onClose();
    navigation.navigate('CoachProfilePage', { coachId: lesson.coachId, fromUnregisterModal: true, lessonId: lesson.id });
  };

  const handleUnregister = async () => {
    // 6-hour cancellation rule
    const lessonTime = new Date(lesson.time);
    const now = new Date();
    const hoursUntilLesson = (lessonTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilLesson < 6) {
      Alert.alert(
        'ביטול לא מותר',
        'לא ניתן לבטל רישום לשיעור פחות מ-6 שעות לפני תחילתו.\n\nכדי לבטל את הרישום, אנא צור קשר עם המאמן שלך ישירות (בטלפון או בוואטסאפ) ובקש ממנו להסיר אותך מהשיעור.',
        [
          { text: 'צפה בפרטי מאמן', style: 'default', onPress: handleCoachPress },
          { text: 'אישור', style: 'cancel' },
        ]
      );
      return;
    }
    try {
      setIsLoading(true);
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  const renderCoachAvatar = () => {
    if (isLoadingCoachInfo) return <Avatar.Text label={coachName.charAt(0)} size={34} style={{ backgroundColor:'rgba(255,255,255,0.25)' }} labelStyle={{ color:'#0d47a1' }} />;
    if (coachGlobalInfo?.profilePictureUrl) {
      return <Avatar.Image source={{ uri: coachGlobalInfo.profilePictureUrl }} size={34} style={{ backgroundColor:'rgba(255,255,255,0.18)' }} />;
    }
    return <Avatar.Text label={coachName.charAt(0)} size={34} style={{ backgroundColor:'#1976d2' }} />;
  };

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.shell}>
          {lessonBg ? (
            <ImageBackground
              source={lessonBg}
              style={styles.headerBar}
              imageStyle={styles.headerImage}
              resizeMode="cover"
            >
              <View style={styles.headerOverlay}>
                <View style={styles.headerLeft}>
                  <View style={styles.lessonIconWrap}>
                    <Avatar.Icon size={42} style={styles.lessonIconAvatar} icon={() => <IconComponent name={iconName} size={22} color="#ffffff" />} />
                  </View>
                  <View style={styles.headerTextCol}>
                    <Text style={styles.headerEyebrow}>ביטול רישום</Text>
                    <Text style={styles.headerTitle} numberOfLines={1}>{lessonDisplayName}</Text>
                    <View style={styles.headerMetaRow}>
                      <MaterialIcons name="event" size={14} color="#bbdefb" />
                      <Text style={styles.headerMetaText}>{dateStr}</Text>
                      <MaterialIcons name="schedule" size={14} color="#bbdefb" style={{ marginStart:10 }} />
                      <Text style={styles.headerMetaText}>{timeStr}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="סגור חלון ביטול רישום">
                  <MaterialIcons name="close" size={22} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </ImageBackground>
          ) : (
            <View style={styles.headerBar}>
              <View style={styles.headerLeft}>
                <View style={styles.lessonIconWrap}>
                  <Avatar.Icon size={42} style={styles.lessonIconAvatar} icon={() => <IconComponent name={iconName} size={22} color="#ffffff" />} />
                </View>
                <View style={styles.headerTextCol}>
                  <Text style={styles.headerEyebrow}>ביטול רישום</Text>
                  <Text style={styles.headerTitle} numberOfLines={1}>{lessonDisplayName}</Text>
                  <View style={styles.headerMetaRow}>
                    <MaterialIcons name="event" size={14} color="#bbdefb" />
                    <Text style={styles.headerMetaText}>{dateStr}</Text>
                    <MaterialIcons name="schedule" size={14} color="#bbdefb" style={{ marginStart:10 }} />
                    <Text style={styles.headerMetaText}>{timeStr}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="סגור חלון ביטול רישום">
                <MaterialIcons name="close" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.intentCard}>
              <View style={styles.intentIconWrap}>
                <MaterialIcons name="exit-to-app" size={20} color="#d32f2f" />
              </View>
              <View style={styles.intentTextCol}>
                <Text style={styles.intentTitle}>לעזוב את השיעור הזה?</Text>
                <Text style={styles.intentBody}>המקום שלך ישתחרר מיידית ויוכל להיתפס על ידי משתתף אחר.</Text>
              </View>
            </View>

            <View style={styles.metricRow}>
              {typeof lesson.price === 'number' && (
                <View style={[styles.metricChip, styles.metricChipEmphasisDanger]}>
                  <MaterialIcons name="attach-money" size={16} color="#0d47a1" />
                  <Text style={[styles.metricChipText, styles.metricChipTextEmphasisDanger]}>{formatPrice(lesson.price)}</Text>
                </View>
              )}
              {lesson.duration ? (
                <View style={[styles.metricChip, styles.metricChipEmphasisDanger]}>
                  <Ionicons name="timer-outline" size={16} color="#0d47a1" />
                  <Text style={[styles.metricChipText, styles.metricChipTextEmphasisDanger]}>{lesson.duration} דק׳</Text>
                </View>
              ) : null}
              <View style={[styles.metricChip, styles.metricChipSoft]}>
                <MaterialIcons name="event-available" size={16} color="#0d47a1" />
                <Text style={styles.metricChipText}>{formatLessonTimeReadable(lesson.time)}</Text>
              </View>
            </View>

            {/* Capacity */}
            {capacity > 0 && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeaderLeft}>
                    <FontAwesome5 name="users" size={16} color={capacityColor} />
                    <Text style={styles.sectionTitle}>תפוסה</Text>
                  </View>
                  <View style={[styles.capacityPill, { borderColor: capacityColor }]}> 
                    <Text style={[styles.capacityPillText, { color: capacityColor }]}>{registered}/{capacity}</Text>
                  </View>
                </View>
                <Text style={styles.capacityHint}>{registered >= capacity ? 'מלא' : capacity - registered <= 2 ? 'כמעט מלא — מקומות אחרונים' : registered === 0 ? 'היה הראשון להצטרף' : 'מקומות פנויים'}</Text>
              </View>
            )}

            {isCloseToLesson && (
              <View style={[styles.sectionCard, styles.urgencyCard]}>
                <View style={styles.warningHeaderRow}>
                  <MaterialIcons name="schedule-send" size={20} color="#1565c0" />
                  <Text style={[styles.warningTitle, styles.urgencyTitle]}>השיעור מתקרב</Text>
                </View>
                <Text style={styles.urgencyBody}>נותרו פחות מ-24 שעות לתחילת השיעור. אם אינך בטוח, מומלץ לעדכן גם את המאמן ישירות כדי למנוע אי-הבנות.</Text>
              </View>
            )}

            {/* Description */}
            {!!lesson.description && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionLabel}>תיאור</Text>
                <Text style={styles.bodyText}>{lesson.description}</Text>
              </View>
            )}

            {/* Location */}
            {locationText ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionLabel}>מיקום</Text>
                <View style={styles.inlineRow}>
                  <Entypo name="location-pin" size={18} color="#b71c1c" style={{ marginStart:6 }} />
                  <Text style={styles.bodyText} numberOfLines={2}>{locationText}</Text>
                </View>
              </View>
            ) : null}

            {/* Coach */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>מאמן</Text>
              <TouchableOpacity onPress={handleCoachPress} style={styles.coachRow} accessibilityLabel="צפה בפרופיל מאמן">
                {renderCoachAvatar()}
                <Text style={styles.coachNameText} numberOfLines={1}>{isLoadingCoachInfo ? 'טוען...' : coachName}</Text>
                <MaterialIcons name="chevron-left" size={20} color="#b71c1c" />
              </TouchableOpacity>
            </View>

            {/* Warning / Confirmation */}
            <View style={[styles.sectionCard, styles.warningCard]}> 
              <View style={styles.warningHeaderRow}> 
                <MaterialIcons name="warning" size={20} color="#ff8f00" />
                <Text style={styles.warningTitle}>עזיבת שיעור זה</Text>
              </View>
              <Text style={styles.warningBody}>תאבד את המקום השמור שלך. אם השיעור יתמלא לאחר הביטול, ייתכן שלא תוכל להצטרף מחדש. פעולה זו אינה ניתנת לביטול מתוך האפליקציה.</Text>
            </View>

            {/* Payment refund notice */}
            {hasDeclaredPayment && (
              <View style={[styles.sectionCard, styles.refundCard]}>
                <View style={styles.warningHeaderRow}>
                  <MaterialIcons name="payments" size={20} color="#b45309" />
                  <Text style={[styles.warningTitle, { color: '#b45309' }]}>תשלום כבר הוצהר</Text>
                </View>
                <Text style={styles.refundBody}>
                  סימנת שיעור זה כשולם. אם כבר העברת כסף, צור קשר עם המאמן ישירות כדי לבקש החזר לפני ביטול הרישום.
                </Text>
                <TouchableOpacity onPress={handleCoachPress} style={styles.contactCoachBtn} accessibilityLabel="צור קשר עם מאמן">
                  <MaterialIcons name="person" size={15} color="#1976d2" />
                  <Text style={styles.contactCoachText}>צפה בפרטי מאמן</Text>
                  <MaterialIcons name="chevron-left" size={15} color="#1976d2" />
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 110 }} />
          </ScrollView>
          <View style={styles.footerBar}> 
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isLoading} accessibilityLabel="ביטול"> 
              <Text style={[styles.cancelBtnText, isLoading && { opacity:0.5 }]}>שמור מקום</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dangerBtn, isLoading && styles.dangerBtnDisabled]} onPress={handleUnregister} disabled={isLoading} accessibilityLabel="אישור ביטול רישום"> 
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <View style={styles.dangerBtnContent}>
                  <Ionicons name="exit-outline" size={17} color="#ffffff" />
                  <Text style={styles.dangerBtnText}>בטל רישום</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'center', padding:20 },
  shell:{ width: width * 0.92, backgroundColor:'rgba(255,255,255,0.96)', borderRadius:30, overflow:'hidden', maxHeight:'92%', alignSelf:'center', ...Platform.select({ ios:{ shadowColor:'#000', shadowOpacity:0.25, shadowRadius:18, shadowOffset:{width:0,height:8}}, android:{ elevation:10 } }) },
  headerBar:{ backgroundColor:'#1976d2', flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:18, paddingVertical:16 },
  headerImage:{},
  headerOverlay:{ backgroundColor:'rgba(0,0,0,0.28)', marginHorizontal:-18, marginVertical:-16, paddingHorizontal:18, paddingVertical:16, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  headerLeft:{ flexDirection:'row', alignItems:'center', flex:1, gap:12 },
  headerTextCol:{ flex:1 },
  lessonIconWrap:{},
  lessonIconAvatar:{ backgroundColor:'rgba(255,255,255,0.25)' },
  headerEyebrow:{ fontSize:11.5, fontWeight:'800', color:'rgba(255,255,255,0.82)', letterSpacing:0.8, marginBottom:3, textAlign:'left', writingDirection:'rtl' },
  headerTitle:{ fontSize:20, fontWeight:'800', color:'#ffffff', letterSpacing:0.4, textAlign:'left', writingDirection:'rtl' },
  headerMetaRow:{ flexDirection:'row', alignItems:'center', marginTop:4 },
  headerMetaText:{ fontSize:12.5, fontWeight:'700', color:'#ffffff', marginStart:4, letterSpacing:0.5, writingDirection:'rtl' },
  closeBtn:{ width:40, height:40, borderRadius:14, backgroundColor:'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.4)' },
  scrollContent:{ padding:20, paddingBottom:0 },
  intentCard:{ flexDirection:'row', alignItems:'flex-start', gap:12, backgroundColor:'#fff5f5', borderRadius:20, padding:16, borderWidth:1, borderColor:'rgba(211,47,47,0.18)', marginBottom:18 },
  intentIconWrap:{ width:38, height:38, borderRadius:14, backgroundColor:'rgba(211,47,47,0.10)', alignItems:'center', justifyContent:'center', flexShrink:0 },
  intentTextCol:{ flex:1 },
  intentTitle:{ fontSize:15, fontWeight:'800', color:'#b71c1c', marginBottom:4, textAlign:'left', writingDirection:'rtl' },
  intentBody:{ fontSize:13, fontWeight:'600', color:'#7f1d1d', lineHeight:19, textAlign:'left', writingDirection:'rtl' },
  metricRow:{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:22 },
  metricChip:{ flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'#f1f5f9', paddingVertical:6, paddingHorizontal:10, borderRadius:14, borderWidth:1, borderColor:'rgba(13,71,161,0.12)' },
  metricChipSoft:{ backgroundColor:'#f6fbff', borderColor:'rgba(21,101,192,0.16)' },
  metricChipEmphasisDanger:{ backgroundColor:'#ffffff', paddingVertical:8, paddingHorizontal:14, borderWidth:1, borderColor:'rgba(13,71,161,0.25)', shadowColor:'#0d47a1', shadowOpacity:0.08, shadowRadius:6, shadowOffset:{width:0,height:3} },
  metricChipText:{ fontSize:12, fontWeight:'700', color:'#0d47a1', letterSpacing:0.3, writingDirection:'rtl' },
  metricChipTextEmphasisDanger:{ fontSize:14, fontWeight:'800', letterSpacing:0.5 },
  sectionCard:{ backgroundColor:'#ffffff', borderRadius:22, padding:18, marginBottom:18, borderWidth:1, borderColor:'rgba(13,71,161,0.08)', shadowColor:'#0d47a1', shadowOpacity:0.05, shadowRadius:10, shadowOffset:{width:0,height:4} },
  sectionHeaderRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
  sectionHeaderLeft:{ flexDirection:'row', alignItems:'center', gap:8 },
  sectionTitle:{ fontSize:14, fontWeight:'700', color:'#0d47a1', letterSpacing:0.4, textAlign:'left', writingDirection:'rtl' },
  sectionLabel:{ fontSize:12, fontWeight:'800', color:'#0d47a1', marginBottom:8, letterSpacing:0.6, textTransform:'uppercase', textAlign:'left', writingDirection:'rtl' },
  bodyText:{ fontSize:14, fontWeight:'500', color:'#0f172a', lineHeight:20, textAlign:'left', writingDirection:'rtl' },
  inlineRow:{ flexDirection:'row', alignItems:'center' },
  capacityPill:{ paddingHorizontal:12, paddingVertical:6, borderRadius:18, borderWidth:1, backgroundColor:'#fef2f2', minWidth:70, alignItems:'center' },
  capacityPillText:{ fontSize:13, fontWeight:'800', letterSpacing:0.5 },
  capacityHint:{ fontSize:11, fontWeight:'600', color:'rgba(183,28,28,0.75)', letterSpacing:0.4, writingDirection:'rtl' },
  coachRow:{ flexDirection:'row', alignItems:'center', gap:12, paddingVertical:4 },
  coachNameText:{ fontSize:15, fontWeight:'700', color:'#0d47a1', flex:1, textAlign:'left', writingDirection:'rtl' },
  warningCard:{ backgroundColor:'#fff8e1', borderColor:'rgba(255,143,0,0.35)' },
  urgencyCard:{ backgroundColor:'#eef6ff', borderColor:'rgba(21,101,192,0.22)' },
  warningHeaderRow:{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 },
  warningTitle:{ fontSize:15, fontWeight:'800', color:'#ff8f00', letterSpacing:0.5, textAlign:'left', writingDirection:'rtl' },
  warningBody:{ fontSize:13, fontWeight:'600', color:'#7a5d00', lineHeight:19, textAlign:'left', writingDirection:'rtl' },
  urgencyTitle:{ color:'#1565c0' },
  urgencyBody:{ fontSize:13, fontWeight:'600', color:'#1e3a8a', lineHeight:19, textAlign:'left', writingDirection:'rtl' },
  refundCard:{ backgroundColor:'#fffbeb', borderColor:'rgba(180,83,9,0.30)' },
  refundBody:{ fontSize:13, fontWeight:'600', color:'#92400e', lineHeight:19, marginBottom:12, textAlign:'left', writingDirection:'rtl' },
  contactCoachBtn:{ flexDirection:'row', alignItems:'center', gap:6, alignSelf:'flex-start', backgroundColor:'#f1f6fb', paddingHorizontal:12, paddingVertical:7, borderRadius:12, borderWidth:1, borderColor:'rgba(25,118,210,0.25)' },
  contactCoachText:{ fontSize:12.5, fontWeight:'700', color:'#1976d2', textAlign:'left', writingDirection:'rtl' },
  footerBar:{ flexDirection:'row', alignItems:'center', gap:14, padding:18, borderTopWidth:1, borderTopColor:'rgba(13,71,161,0.12)', backgroundColor:'rgba(255,255,255,0.94)' },
  cancelBtn:{ flex:1, backgroundColor:'rgba(255,255,255,0.55)', borderRadius:18, alignItems:'center', justifyContent:'center', paddingVertical:14, borderWidth:1.5, borderColor:'rgba(25,118,210,0.25)' },
  cancelBtnText:{ color:'#0d47a1', fontSize:14, fontWeight:'700', letterSpacing:0.4, textAlign:'left', writingDirection:'rtl' },
  dangerBtn:{ flex:1.4, backgroundColor:'#d32f2f', borderRadius:18, alignItems:'center', justifyContent:'center', paddingVertical:14, shadowColor:'#000', shadowOpacity:0.25, shadowRadius:10, shadowOffset:{width:0,height:4} },
  dangerBtnDisabled:{ backgroundColor:'#90a4ae' },
  dangerBtnContent:{ flexDirection:'row', alignItems:'center', gap:6 },
  dangerBtnText:{ color:'#ffffff', fontSize:15, fontWeight:'800', letterSpacing:0.5, textAlign:'left', writingDirection:'rtl' },
});

export default UnregisterConfirmationModal;
