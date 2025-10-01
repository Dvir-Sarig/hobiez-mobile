import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Lesson } from '../../../types/Lesson';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface DeleteConfirmationModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  isDeleting?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting = false
}) => {
  if (!lesson) return null;

  const formatLessonTimeReadable = (time: string) => {
    try { return format(new Date(time), 'EEE, MMM dd, yyyy  ·  HH:mm'); } catch { return time; }
  };

  const isFree = lesson.price === 0;

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
      <View style={styles.overlayPolished}>
        <View style={styles.glassCard}>
          {/* Header */}
          <LinearGradient colors={['#0d47a1','#1976d2']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.headerGradient}>
            <View style={styles.headerLeft}> 
              <View style={styles.headerIconBadge}>
                <Ionicons name="trash-outline" size={22} color="#ffffff" />
              </View>
              <View style={{flex:1}}>
                <Text style={styles.title}>Delete Lesson</Text>
                <Text style={styles.subtitle} numberOfLines={1}>{lesson.title}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close delete confirmation" style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#ffffff" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.contentScroll}>
            {/* Warning Banner */}
            <View style={styles.warningBanner}> 
              <Ionicons name="alert-circle" size={18} color="#b45309" style={{marginRight:8}} />
              <Text style={styles.warningText}>This action is permanent and cannot be undone.</Text>
            </View>
            {/* Core Info Card */}
            <View style={styles.infoCard}> 
              {/* Title + Date / Time Badge Row */}
              <View style={styles.infoHeaderRow}>
                <Text style={[styles.lessonTitle,{marginBottom:0, flex:1}]} numberOfLines={2}>{lesson.title}</Text>
                <View style={styles.dateBadge} accessibilityLabel="Lesson date and time">
                  <Ionicons name="time-outline" size={13} color="#1976d2" style={{marginRight:5}} />
                  <Text style={styles.dateBadgeText} numberOfLines={2} ellipsizeMode="tail">{formatLessonTimeReadable(lesson.time)}</Text>
                </View>
              </View>
              {lesson.description ? (
                <Text style={styles.description} numberOfLines={3}>{lesson.description}</Text>
              ) : (
                <Text style={styles.descriptionPlaceholder}>No description provided.</Text>
              )}

              {/* Adjusted pill rows (removed time pill; moved capacity up) */}
              <View style={styles.pillRow}> 
                <InfoPill icon="hourglass-outline" label={`${lesson.duration} min`} />
                <InfoPill icon="people-outline" label={`${lesson.registeredCount ?? 0}/${lesson.capacityLimit ?? 0} booked`} />
              </View>
              <View style={[styles.pillRow,{marginTop:10}]}> 
                <InfoPill icon={isFree? 'pricetag-outline':'cash-outline'} label={isFree? 'Free': `$${lesson.price}`} accent={isFree} />
              </View>
              {lesson.location && (
                <View style={styles.locationRow}> 
                  <Ionicons name="location-outline" size={16} color="#1976d2" style={{marginRight:6}} />
                  <Text style={styles.locationText} numberOfLines={2}>{lesson.location.address || `${lesson.location.city}, ${lesson.location.country}`}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Bar */}
          <View style={styles.footerBar}> 
            <Pressable
              onPress={onClose}
              disabled={isDeleting}
              accessibilityLabel="Cancel deletion"
              style={({pressed})=>[
                styles.cancelBtn,
                pressed && styles.btnPressed,
                isDeleting && styles.disabledBtn
              ]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onConfirmDelete}
              disabled={isDeleting}
              accessibilityLabel="Confirm delete lesson"
              style={({pressed})=>[
                styles.deleteBtn,
                pressed && styles.deleteBtnPressed,
                isDeleting && styles.deleteBtnDisabled
              ]}
            >
              {isDeleting? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="trash" size={18} color="#fff" style={{marginRight:6}} />
                  <Text style={styles.deleteText}>Delete</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Reusable Info Pill (updated: allow multiline & adaptive width)
const InfoPill = ({ icon, label, accent }: { icon: any; label: string; accent?: boolean }) => {
  const multi = label.length > 20; // heuristic
  return (
    <View style={[styles.infoPill, accent && styles.infoPillAccent, multi && styles.infoPillTall]}> 
      <Ionicons name={icon} size={13} color={accent? '#166534':'#1976d2'} style={{marginRight:6, marginTop: multi ? 2 : 0}} />
      <Text
        style={[styles.infoPillText, accent && styles.infoPillTextAccent, multi && styles.infoPillTextWrap]}
        numberOfLines={multi ? 2 : 1}
      >{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayPolished:{ flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'center', padding:18 },
  glassCard:{ borderRadius:28, overflow:'hidden', backgroundColor:'rgba(255,255,255,0.94)', borderWidth:1, borderColor:'rgba(255,255,255,0.65)', maxHeight:'90%', width:'92%', alignSelf:'center', shadowColor:'#000', shadowOpacity:0.25, shadowRadius:18, shadowOffset:{width:0,height:10} },
  headerGradient:{ paddingVertical:18, paddingHorizontal:22, flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.25)' },
  headerLeft:{ flexDirection:'row', alignItems:'center', flex:1, gap:14 },
  headerIconBadge:{ width:46, height:46, borderRadius:16, backgroundColor:'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.4)', shadowColor:'#000', shadowOpacity:0.2, shadowRadius:6, shadowOffset:{width:0,height:3} },
  closeBtn:{ width:42, height:42, borderRadius:16, backgroundColor:'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.4)' },
  title:{ fontSize:19, fontWeight:'800', color:'#ffffff', letterSpacing:0.5 },
  subtitle:{ fontSize:12, fontWeight:'600', color:'rgba(255,255,255,0.85)', marginTop:2 },
  contentScroll:{ padding:20 },
  warningBanner:{ flexDirection:'row', alignItems:'flex-start', backgroundColor:'#fef3c7', borderRadius:18, paddingVertical:10, paddingHorizontal:14, borderWidth:1, borderColor:'#fde68a', marginBottom:18 },
  warningText:{ flex:1, fontSize:12.5, fontWeight:'600', color:'#92400e', lineHeight:18 },
  infoCard:{ backgroundColor:'#ffffff', borderRadius:22, padding:18, shadowColor:'#0d47a1', shadowOpacity:0.05, shadowRadius:10, shadowOffset:{width:0,height:4}, borderWidth:1, borderColor:'rgba(13,71,161,0.08)' },
  infoHeaderRow:{ flexDirection:'row', alignItems:'flex-start', marginBottom:8 },
  dateBadge:{ flexDirection:'row', alignItems:'center', backgroundColor:'#f1f6fa', paddingVertical:6, paddingHorizontal:10, borderRadius:14, borderWidth:1, borderColor:'rgba(25,118,210,0.18)', marginLeft:8, flexShrink:1, maxWidth:'70%', flexWrap:'wrap' },
  dateBadgeText:{ fontSize:11, fontWeight:'700', color:'#1976d2', letterSpacing:0.3, flexShrink:1, lineHeight:14 },
  lessonTitle:{ fontSize:16, fontWeight:'800', color:'#0d47a1', marginBottom:8, letterSpacing:0.3 },
  description:{ fontSize:13.5, fontWeight:'500', color:'#0f172a', lineHeight:19 },
  descriptionPlaceholder:{ fontSize:13, fontWeight:'500', color:'#607d8b', fontStyle:'italic' },
  pillRow:{ flexDirection:'row', flexWrap:'wrap', gap:10, marginTop:14 },
  infoPill:{ flexGrow:1, flexShrink:1, flexBasis:'48%', flexDirection:'row', alignItems:'center', backgroundColor:'#f1f6fa', borderRadius:16, paddingVertical:8, paddingHorizontal:10, borderWidth:1, borderColor:'rgba(25,118,210,0.18)' },
  infoPillAccent:{ backgroundColor:'#dcfce7', borderColor:'#bbf7d0' },
  infoPillTall:{ alignItems:'flex-start', paddingVertical:8 },
  infoPillText:{ fontSize:11.5, fontWeight:'700', color:'#1976d2', letterSpacing:0.3, flexShrink:1, flexGrow:1 },
  infoPillTextAccent:{ color:'#166534' },
  infoPillTextWrap:{ lineHeight:14 },
  locationRow:{ flexDirection:'row', alignItems:'flex-start', marginTop:16 },
  locationText:{ flex:1, fontSize:12.5, fontWeight:'600', color:'#374151', lineHeight:18 },
  footerBar:{ flexDirection:'row', gap:14, paddingHorizontal:20, paddingVertical:18, backgroundColor:'rgba(255,255,255,0.9)', borderTopWidth:1, borderTopColor:'rgba(25,118,210,0.12)', shadowColor:'#000', shadowOpacity:0.1, shadowRadius:12, shadowOffset:{width:0,height:4} },
  cancelBtn:{ flex:1, backgroundColor:'rgba(255,255,255,0.55)', borderRadius:16, alignItems:'center', justifyContent:'center', paddingVertical:14, borderWidth:1.2, borderColor:'rgba(25,118,210,0.25)' },
  cancelText:{ fontSize:14, fontWeight:'700', color:'#0d47a1' },
  deleteBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'#dc2626', borderRadius:16, paddingVertical:14, shadowColor:'#000', shadowOpacity:0.22, shadowRadius:10, shadowOffset:{width:0,height:4} },
  deleteBtnPressed:{ opacity:0.85 },
  deleteBtnDisabled:{ backgroundColor:'#f87171' },
  deleteText:{ color:'#ffffff', fontSize:14, fontWeight:'800', letterSpacing:0.5 },
  btnPressed:{ opacity:0.85 },
  disabledBtn:{ opacity:0.6 },
});

export default DeleteConfirmationModal;
