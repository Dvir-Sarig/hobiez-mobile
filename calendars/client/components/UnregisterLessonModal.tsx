import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { Lesson } from '../../../lesson/types/Lesson';
import { formatPrice } from '../../../shared/services/formatService';
import UnregisterConfirmationModal from '../../../lesson/components/management/registration/UnregisterConfirmationModal';
import { Avatar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Entypo, FontAwesome5 } from '@expo/vector-icons';
import { getLessonIcon } from '../../../lesson/types/LessonType';

interface Props {
  lesson: Lesson | null;
  coachInfoMap: { [key: string]: { name: string; email: string } };
  isOpen: boolean;
  onClose: () => void;
  onUnregister: (lessonId: number) => void | Promise<void>;
}

const getCapacityColor = (registered: number, limit: number): string => {
  const ratio = limit ? registered / limit : 0;
  if (!limit) return '#90a4ae';
  if (ratio >= 0.95) return '#ff5252';
  if (ratio >= 0.75) return '#ffa726';
  return '#64b5f6';
};

const UnregisterLessonModal: React.FC<Props> = ({
  lesson,
  coachInfoMap,
  isOpen,
  onClose,
  onUnregister
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!lesson) return null;

  const coach = coachInfoMap[lesson.coachId];
  const registered = lesson.registeredCount ?? 0;
  const capacity = lesson.capacityLimit ?? 0;
  const capacityColor = getCapacityColor(registered, capacity);
  const dateStr = dayjs(lesson.time).format('MMM DD, YYYY');
  const timeStr = dayjs(lesson.time).format('HH:mm');
  const locationText = lesson.location?.address || [lesson.location?.city, lesson.location?.country].filter(Boolean).join(', ');
  const { IconComponent, iconName } = getLessonIcon(lesson.title);

  const handleUnregisterPress = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmUnregister = async () => {
    try {
      setIsProcessing(true);
      await onUnregister(lesson.id);
      setShowConfirmationModal(false);
      onClose();
    } catch (error) {
      // silent
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCoachPress = () => {
    onClose();
    // navigate to profile
    // @ts-ignore
    navigation.navigate('CoachProfilePage', { coachId: lesson.coachId, fromUnregisterViewModal: true, lessonId: lesson.id });
  };

  const renderCoachAvatar = () => {
    const coachName = coach?.name || 'C';
    return <Avatar.Text label={coachName.charAt(0)} size={34} style={{ backgroundColor:'#1976d2' }} />;
  };

  return (
    <>
      <Modal visible={isOpen && !showConfirmationModal} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.shell}>
            {/* Header */}
            <LinearGradient colors={['#0d47a1','#1976d2']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.headerBar}> 
              <View style={styles.headerLeft}> 
                <Avatar.Icon size={42} style={styles.lessonIconAvatar} icon={() => <IconComponent name={iconName} size={22} color="#ffffff" />} />
                <View style={styles.headerTextCol}> 
                  <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
                  <View style={styles.headerMetaRow}> 
                    <Icon name="event" size={14} color="#bbdefb" />
                    <Text style={styles.headerMetaText}>{dateStr}</Text>
                    <Icon name="schedule" size={14} color="#bbdefb" style={{ marginLeft:10 }} />
                    <Text style={styles.headerMetaText}>{timeStr}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close lesson details">
                <Icon name="close" size={22} color="#ffffff" />
              </TouchableOpacity>
            </LinearGradient>

            {/* Scrollable Content */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Metric Chips */}
              <View style={styles.metricRow}> 
                {typeof lesson.price === 'number' && (
                  <View style={[styles.metricChip, styles.metricChipEmphasis]}> 
                    <Icon name="attach-money" size={16} color="#0d47a1" />
                    <Text style={[styles.metricChipText, styles.metricChipTextEmphasis]}>{formatPrice(lesson.price)}</Text>
                  </View>
                )}
                {lesson.duration ? (
                  <View style={[styles.metricChip, styles.metricChipEmphasis]}> 
                    <Ionicons name="timer-outline" size={16} color="#0d47a1" />
                    <Text style={[styles.metricChipText, styles.metricChipTextEmphasis]}>{lesson.duration}m</Text>
                  </View>
                ) : null}
              </View>

              {/* Capacity Section */}
              {capacity > 0 && (
                <View style={styles.sectionCard}> 
                  <View style={styles.sectionHeaderRow}> 
                    <View style={styles.sectionHeaderLeft}> 
                      <FontAwesome5 name="users" size={16} color={capacityColor} />
                      <Text style={styles.sectionTitle}>Capacity</Text>
                    </View>
                    <View style={[styles.capacityPill,{ borderColor:capacityColor }]}> 
                      <Text style={[styles.capacityPillText,{ color:capacityColor }]}>{registered}/{capacity}</Text>
                    </View>
                  </View>
                  <Text style={styles.capacityHint}>{registered >= capacity ? 'Fully booked' : capacity - registered <= 2 ? 'Almost full — last spots' : registered === 0 ? 'Be the first to join' : 'Spots available'}</Text>
                </View>
              )}

              {!!lesson.description && (
                <View style={styles.sectionCard}> 
                  <Text style={styles.sectionLabel}>Description</Text>
                  <Text style={styles.bodyText}>{lesson.description}</Text>
                </View>
              )}

              {locationText ? (
                <View style={styles.sectionCard}> 
                  <Text style={styles.sectionLabel}>Location</Text>
                  <View style={styles.inlineRow}> 
                    <Entypo name="location-pin" size={18} color="#0d47a1" style={{ marginRight:6 }} />
                    <Text style={styles.bodyText} numberOfLines={2}>{locationText}</Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.sectionCard}> 
                <Text style={styles.sectionLabel}>Coach</Text>
                <TouchableOpacity onPress={handleCoachPress} style={styles.coachRow} accessibilityLabel="View coach profile"> 
                  {renderCoachAvatar()}
                  <Text style={styles.coachNameText} numberOfLines={1}>{coach?.name || 'Coach'}</Text>
                  <Icon name="chevron-right" size={20} color="#0d47a1" />
                </TouchableOpacity>
              </View>

              <View style={[styles.sectionCard, styles.noticeCard]}> 
                <View style={styles.noticeHeaderRow}> 
                  <Icon name="info" size={18} color="#1565c0" />
                  <Text style={styles.noticeTitle}>You are registered</Text>
                </View>
                <Text style={styles.noticeBody}>If you cannot attend you can release your spot. You will be asked to confirm.</Text>
              </View>

              <View style={{ height:110 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footerBar}> 
              <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} disabled={isProcessing} accessibilityLabel="Keep registration"> 
                <Text style={[styles.secondaryBtnText, isProcessing && { opacity:0.5 }]}>Keep Spot</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dangerBtn, isProcessing && styles.dangerBtnDisabled]} onPress={handleUnregisterPress} disabled={isProcessing} accessibilityLabel="Begin unregistration"> 
                {isProcessing ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.dangerBtnText}>Unregister</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <UnregisterConfirmationModal
        lesson={lesson}
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmUnregister}
        coachInfo={coach}
      />
    </>
  );
};

export default UnregisterLessonModal;

const styles = StyleSheet.create({
  overlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'center', padding:20 },
  shell:{ backgroundColor:'rgba(255,255,255,0.96)', borderRadius:30, overflow:'hidden', maxHeight:'92%', ...Platform.select({ ios:{ shadowColor:'#000', shadowOpacity:0.25, shadowRadius:18, shadowOffset:{width:0,height:8}}, android:{ elevation:10 } }) },
  headerBar:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:18, paddingVertical:16 },
  headerLeft:{ flexDirection:'row', alignItems:'center', flex:1, gap:12 },
  headerTextCol:{ flex:1 },
  lessonIconAvatar:{ backgroundColor:'#1976d2' },
  headerTitle:{ fontSize:20, fontWeight:'800', color:'#ffffff', letterSpacing:0.4 },
  headerMetaRow:{ flexDirection:'row', alignItems:'center', marginTop:4 },
  headerMetaText:{ fontSize:12.5, fontWeight:'700', color:'#ffffff', marginLeft:4, letterSpacing:0.5 },
  closeBtn:{ width:40, height:40, borderRadius:14, backgroundColor:'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.4)' },
  scrollContent:{ padding:20, paddingBottom:0 },
  metricRow:{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:22 },
  metricChip:{ flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'#f1f5f9', paddingVertical:6, paddingHorizontal:10, borderRadius:14, borderWidth:1, borderColor:'rgba(13,71,161,0.12)' },
  metricChipEmphasis:{ backgroundColor:'#ffffff', paddingVertical:8, paddingHorizontal:14, borderWidth:1, borderColor:'rgba(13,71,161,0.25)', shadowColor:'#0d47a1', shadowOpacity:0.08, shadowRadius:6, shadowOffset:{width:0,height:3} },
  metricChipText:{ fontSize:12, fontWeight:'700', color:'#0d47a1', letterSpacing:0.3 },
  metricChipTextEmphasis:{ fontSize:14, fontWeight:'800', letterSpacing:0.5 },
  sectionCard:{ backgroundColor:'#ffffff', borderRadius:22, padding:18, marginBottom:18, borderWidth:1, borderColor:'rgba(13,71,161,0.08)', shadowColor:'#0d47a1', shadowOpacity:0.05, shadowRadius:10, shadowOffset:{width:0,height:4} },
  sectionHeaderRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
  sectionHeaderLeft:{ flexDirection:'row', alignItems:'center', gap:8 },
  sectionTitle:{ fontSize:14, fontWeight:'700', color:'#0d47a1', letterSpacing:0.4 },
  sectionLabel:{ fontSize:12, fontWeight:'800', color:'#0d47a1', marginBottom:8, letterSpacing:0.6, textTransform:'uppercase' },
  bodyText:{ fontSize:14, fontWeight:'500', color:'#0f172a', lineHeight:20 },
  inlineRow:{ flexDirection:'row', alignItems:'center' },
  capacityPill:{ paddingHorizontal:12, paddingVertical:6, borderRadius:18, borderWidth:1, backgroundColor:'#f1f5f9', minWidth:70, alignItems:'center' },
  capacityPillText:{ fontSize:13, fontWeight:'800', letterSpacing:0.5 },
  capacityHint:{ fontSize:11, fontWeight:'600', color:'rgba(13,71,161,0.70)', letterSpacing:0.4 },
  coachRow:{ flexDirection:'row', alignItems:'center', gap:12, paddingVertical:4 },
  coachNameText:{ fontSize:15, fontWeight:'700', color:'#0d47a1', flex:1 },
  noticeCard:{ backgroundColor:'#f0f7ff', borderColor:'rgba(13,71,161,0.18)' },
  noticeHeaderRow:{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 },
  noticeTitle:{ fontSize:15, fontWeight:'800', color:'#0d47a1', letterSpacing:0.5 },
  noticeBody:{ fontSize:13, fontWeight:'600', color:'#1e3a8a', lineHeight:19 },
  footerBar:{ flexDirection:'row', alignItems:'center', gap:14, padding:18, borderTopWidth:1, borderTopColor:'rgba(13,71,161,0.10)', backgroundColor:'rgba(255,255,255,0.94)' },
  secondaryBtn:{ flex:1, backgroundColor:'rgba(255,255,255,0.55)', borderRadius:18, alignItems:'center', justifyContent:'center', paddingVertical:14, borderWidth:1.5, borderColor:'rgba(25,118,210,0.25)' },
  secondaryBtnText:{ color:'#0d47a1', fontSize:14, fontWeight:'700', letterSpacing:0.4 },
  dangerBtn:{ flex:1.4, backgroundColor:'#d32f2f', borderRadius:18, alignItems:'center', justifyContent:'center', paddingVertical:14, shadowColor:'#000', shadowOpacity:0.25, shadowRadius:10, shadowOffset:{width:0,height:4}, borderWidth:1, borderColor:'rgba(255,255,255,0.35)' },
  dangerBtnDisabled:{ backgroundColor:'#b71c1c' },
  dangerBtnText:{ color:'#ffffff', fontSize:15, fontWeight:'800', letterSpacing:0.5 },
});
