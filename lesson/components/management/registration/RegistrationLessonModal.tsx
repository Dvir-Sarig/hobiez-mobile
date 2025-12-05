import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from 'react-native-paper';
import { Lesson } from '../../../types/Lesson';
import { formatPrice } from '../../../../shared/services/formatService';
import { MaterialIcons, FontAwesome5, Ionicons, Entypo } from '@expo/vector-icons';
import { RootStackParamList } from '../../../../types';
import { fetchCoachGlobalInfo, CoachGlobalInfo } from '../../../../profile/services/coachService';
import { LinearGradient } from 'expo-linear-gradient';
import { getLessonIcon } from '../../../types/LessonType';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  lesson: Lesson | null;
  coachName?: string;
  isOpen: boolean;
  onClose: () => void;
  onRegister: (lessonId: number) => void;
}

const getCapacityColor = (registered: number, limit: number): string => {
  const ratio = limit ? registered / limit : 0;
  if (ratio >= 0.95) return '#ff5252';
  if (ratio >= 0.75) return '#ffa726';
  return '#64b5f6';
};

const RegistrationLessonModal: React.FC<Props> = ({
  lesson,
  coachName: initialCoachName,
  isOpen,
  onClose,
  onRegister,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [coachGlobalInfo, setCoachGlobalInfo] = useState<CoachGlobalInfo | null>(null);
  const [isLoadingCoachInfo, setIsLoadingCoachInfo] = useState(false);

  useEffect(() => {
    const fetchCoachInfo = async () => {
      if (!lesson?.coachId) return;
      setIsLoadingCoachInfo(true);
      try {
        const info = await fetchCoachGlobalInfo(lesson.coachId);
        setCoachGlobalInfo(info);
      } catch (error) {
        console.error('Error fetching coach info:', error);
      } finally {
        setIsLoadingCoachInfo(false);
      }
    };
    if (isOpen) fetchCoachInfo();
  }, [isOpen, lesson?.coachId]);

  if (!lesson) return null;

  const handleCoachPress = () => {
    onClose();
    // @ts-ignore
    navigation.navigate('CoachProfilePage', { coachId: lesson.coachId, fromRegistrationModal: true, lessonId: lesson.id });
  };

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      await onRegister(lesson.id);
    } finally {
      setIsLoading(false);
    }
  };

  const coachName = coachGlobalInfo?.name || initialCoachName || 'Coach';
  const registered = lesson.registeredCount ?? 0;
  const capacity = lesson.capacityLimit ?? 0;
  const capacityColor = getCapacityColor(registered, capacity);
  const timeDate = new Date(lesson.time);
  const dateStr = timeDate.toLocaleDateString();
  const timeStr = timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const { IconComponent, iconName } = getLessonIcon(lesson.title);
  const locationText = lesson.location?.address || [lesson.location?.city, lesson.location?.country].filter(Boolean).join(', ');

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
          {/* Header */}
          <LinearGradient colors={['#0d47a1','#1976d2']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.headerBar}> 
            <View style={styles.headerLeft}> 
              <View style={styles.lessonIconWrap}> 
                <Avatar.Icon size={42} style={styles.lessonIconAvatar} icon={() => <IconComponent name={iconName} size={22} color="#ffffff" />} />
              </View>
              <View style={styles.headerTextCol}> 
                <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
                <View style={styles.headerMetaRow}> 
                  <MaterialIcons name="event" size={14} color="#bbdefb" />
                  <Text style={styles.headerMetaText}>{dateStr}</Text>
                  <MaterialIcons name="schedule" size={14} color="#bbdefb" style={{ marginLeft:10 }} />
                  <Text style={styles.headerMetaText}>{timeStr}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close registration modal">
              <MaterialIcons name="close" size={22} color="#ffffff" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Content Scroll */}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Metric Chips (date & time removed, now in header) */}
            <View style={styles.metricRow}> 
              <View style={[styles.metricChip, styles.metricChipEmphasis]}> 
                <MaterialIcons name="attach-money" size={16} color="#0d47a1" />
                <Text style={[styles.metricChipText, styles.metricChipTextEmphasis]}>{formatPrice(lesson.price)}</Text>
              </View>
              <View style={[styles.metricChip, styles.metricChipEmphasis]}> 
                <Ionicons name="timer-outline" size={16} color="#0d47a1" />
                <Text style={[styles.metricChipText, styles.metricChipTextEmphasis]}>{lesson.duration}m</Text>
              </View>
            </View>

            {/* Capacity */}
            <View style={styles.sectionCard}> 
              <View style={styles.sectionHeaderRow}> 
                <View style={styles.sectionHeaderLeft}> 
                  <FontAwesome5 name="users" size={16} color={capacityColor} />
                  <Text style={styles.sectionTitle}>Capacity</Text>
                </View>
                <View style={[styles.capacityPill,{ borderColor: capacityColor }]}> 
                  <Text style={[styles.capacityPillText,{ color: capacityColor }]}>{registered}/{capacity}</Text>
                </View>
              </View>
              <Text style={styles.capacityHint}>{registered >= capacity ? 'Fully booked' : capacity - registered <= 2 ? 'Almost full — last spots' : registered === 0 ? 'Be the first to join' : 'Spots available'}</Text>
            </View>

            {/* Description */}
            {!!lesson.description && (
              <View style={styles.sectionCard}> 
                <Text style={styles.sectionLabel}>Description</Text>
                <Text style={styles.bodyText}>{lesson.description}</Text>
              </View>
            )}

            {/* Location */}
            {locationText ? (
              <View style={styles.sectionCard}> 
                <Text style={styles.sectionLabel}>Location</Text>
                <View style={styles.inlineRow}> 
                  <Entypo name="location-pin" size={18} color="#0d47a1" style={{ marginRight:6 }} />
                  <Text style={styles.bodyText} numberOfLines={2}>{locationText}</Text>
                </View>
              </View>
            ):null}

            {/* Coach */}
            <View style={styles.sectionCard}> 
              <Text style={styles.sectionLabel}>Coach</Text>
              <TouchableOpacity onPress={handleCoachPress} style={styles.coachRow} accessibilityLabel="View coach profile"> 
                {renderCoachAvatar()}
                <Text style={styles.coachNameText} numberOfLines={1}>{isLoadingCoachInfo? 'Loading...' : coachName}</Text>
                <MaterialIcons name="chevron-right" size={20} color="#0d47a1" />
              </TouchableOpacity>
            </View>

            <View style={{ height: 110 }} />
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footerBar}> 
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isLoading} accessibilityLabel="Cancel registration"> 
              <Text style={[styles.cancelBtnText, isLoading && { opacity:0.5 }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]} onPress={handleRegister} disabled={isLoading} accessibilityLabel="Confirm registration"> 
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.primaryBtnText}>Secure Spot</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'center', padding:20 },
  shell:{ backgroundColor:'rgba(255,255,255,0.96)', borderRadius:30, overflow:'hidden', maxHeight:'92%', ...Platform.select({ ios:{ shadowColor:'#000', shadowOpacity:0.25, shadowRadius:18, shadowOffset:{width:0,height:8}}, android:{ elevation:10 } }) },
  headerBar:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:18, paddingVertical:16 },
  headerLeft:{ flexDirection:'row', alignItems:'center', flex:1, gap:12 },
  headerTextCol:{ flex:1 },
  lessonIconWrap:{},
  lessonIconAvatar:{ backgroundColor:'#1976d2' },
  headerTitle:{ fontSize:20, fontWeight:'800', color:'#ffffff', flex:0, letterSpacing:0.4 },
  headerMetaRow:{ flexDirection:'row', alignItems:'center', marginTop:4 },
  headerMetaText:{ fontSize:12.5, fontWeight:'700', color:'#ffffff', marginLeft:4, letterSpacing:0.5 },
  closeBtn:{ width:40, height:40, borderRadius:14, backgroundColor:'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.4)' },
  scrollContent:{ padding:20, paddingBottom:0 },
  metricRow:{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:22 },
  metricChip:{ flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'#f1f5f9', paddingVertical:6, paddingHorizontal:10, borderRadius:14, borderWidth:1, borderColor:'rgba(13,71,161,0.12)' },
  metricChipEmphasis:{ backgroundColor:'#ffffff', paddingVertical:8, paddingHorizontal:14, borderWidth:1, borderColor:'rgba(13,71,161,0.25)', shadowColor:'#0d47a1', shadowOpacity:0.08, shadowRadius:6, shadowOffset:{width:0,height:3} },
  metricChipText:{ fontSize:12, fontWeight:'700', color:'#0d47a1', letterSpacing:0.3 },
  metricChipTextEmphasis:{ fontSize:14, fontWeight:'800', letterSpacing:0.5 },
  sectionCard:{ backgroundColor:'#ffffff', borderRadius:22, padding:18, marginBottom:18, borderWidth:1, borderColor:'rgba(13,71,161,0.08)', shadowColor:'#0d47a1', shadowOpacity:0.06, shadowRadius:10, shadowOffset:{width:0,height:4} },
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
  footerBar:{ flexDirection:'row', alignItems:'center', gap:14, padding:18, borderTopWidth:1, borderTopColor:'rgba(13,71,161,0.10)', backgroundColor:'rgba(255,255,255,0.94)' },
  cancelBtn:{ flex:1, backgroundColor:'rgba(255,255,255,0.55)', borderRadius:18, alignItems:'center', justifyContent:'center', paddingVertical:14, borderWidth:1.5, borderColor:'rgba(25,118,210,0.25)' },
  cancelBtnText:{ color:'#0d47a1', fontSize:14, fontWeight:'700', letterSpacing:0.4 },
  primaryBtn:{ flex:1.4, backgroundColor:'#1976d2', borderRadius:18, alignItems:'center', justifyContent:'center', paddingVertical:14, shadowColor:'#000', shadowOpacity:0.25, shadowRadius:10, shadowOffset:{width:0,height:4} },
  primaryBtnDisabled:{ backgroundColor:'#90a4ae' },
  primaryBtnText:{ color:'#ffffff', fontSize:15, fontWeight:'800', letterSpacing:0.5 },
});

export default RegistrationLessonModal;
