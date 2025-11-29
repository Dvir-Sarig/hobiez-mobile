import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Lesson } from '../../../types/Lesson';
import { Ionicons, MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { formatPrice } from '../../../../shared/services/formatService';
import { Avatar } from 'react-native-paper';
import { getLessonIcon } from '../../../types/LessonType';

interface DeleteConfirmationModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void | Promise<void>;
  isDeleting?: boolean;
}

const getCapacityColor = (registered: number, limit: number): string => {
  const ratio = limit ? registered / limit : 0;
  if (!limit) return '#90a4ae';
  if (ratio >= 0.95) return '#ff5252';
  if (ratio >= 0.75) return '#ffa726';
  return '#64b5f6';
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting = false,
}) => {
  if (!lesson) return null;

  const timeDate = new Date(lesson.time);
  const dateStr = timeDate.toLocaleDateString();
  const timeStr = timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const registered = lesson.registeredCount ?? 0;
  const capacity = lesson.capacityLimit ?? 0;
  const capacityColor = getCapacityColor(registered, capacity);
  const locationText = lesson.location?.address || [lesson.location?.city, lesson.location?.country].filter(Boolean).join(', ');
  const { IconComponent, iconName } = getLessonIcon(lesson.title);
  const isFree = lesson.price === 0;

  const handleDelete = async () => {
    await onConfirmDelete();
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
                <Text style={styles.headerTitle} numberOfLines={1}>Delete Lesson</Text>
                <View style={styles.headerMetaRow}> 
                  <MaterialIcons name="event" size={14} color="#bbdefb" />
                  <Text style={styles.headerMetaText}>{dateStr}</Text>
                  <MaterialIcons name="schedule" size={14} color="#bbdefb" style={{ marginLeft:10 }} />
                  <Text style={styles.headerMetaText}>{timeStr}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close delete lesson modal">
              <MaterialIcons name="close" size={22} color="#ffffff" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Content */}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}> 
            {/* Title & Subtitle */}
            <View style={styles.sectionCard}> 
              <Text style={styles.sectionLabel}>Lesson</Text>
              <Text style={styles.lessonTitle} numberOfLines={2}>{lesson.title}</Text>
              {lesson.description ? (
                <Text style={styles.bodyText} numberOfLines={4}>{lesson.description}</Text>
              ) : (
                <Text style={styles.placeholderText}>No description provided.</Text>
              )}
            </View>

            {/* Metric Chips */}
            <View style={styles.metricRow}> 
              <View style={[styles.metricChip, styles.metricChipEmphasis]}> 
                <MaterialIcons name="attach-money" size={16} color="#0d47a1" />
                <Text style={[styles.metricChipText, styles.metricChipTextEmphasis]}>{isFree ? 'Free' : formatPrice(lesson.price)}</Text>
              </View>
              {lesson.duration ? (
                <View style={[styles.metricChip, styles.metricChipEmphasis]}> 
                  <Ionicons name="timer-outline" size={16} color="#0d47a1" />
                  <Text style={[styles.metricChipText, styles.metricChipTextEmphasis]}>{lesson.duration}m</Text>
                </View>
              ): null}
            </View>

            {/* Capacity */}
            {capacity > 0 && (
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
                <Text style={styles.capacityHint}>{registered === 0 ? 'No participants yet' : `${registered} participant${registered > 1 ? 's' : ''} enrolled`}</Text>
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
            ): null}

            {/* Warning */}
            <View style={[styles.sectionCard, styles.warningCard]}> 
              <View style={styles.warningHeaderRow}> 
                <MaterialIcons name="warning" size={20} color="#ff8f00" />
                <Text style={styles.warningTitle}>Permanent Deletion</Text>
              </View>
              <Text style={styles.warningBody}>This lesson and all associated registrations will be permanently removed. Participants will no longer see it. This cannot be undone.</Text>
            </View>

            <View style={{ height: 110 }} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.footerBar}> 
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isDeleting} accessibilityLabel="Cancel lesson deletion"> 
              <Text style={[styles.cancelBtnText, isDeleting && { opacity:0.5 }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dangerBtn, isDeleting && styles.dangerBtnDisabled]} onPress={handleDelete} disabled={isDeleting} accessibilityLabel="Confirm delete lesson"> 
              {isDeleting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <View style={{ flexDirection:'row', alignItems:'center' }}>
                  <Ionicons name="trash-outline" size={17} color="#ffffff" style={{ marginRight:6 }} />
                  <Text style={styles.dangerBtnText}>Delete</Text>
                </View>
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
  lessonTitle:{ fontSize:17, fontWeight:'800', color:'#0d47a1', marginBottom:10, letterSpacing:0.4 },
  bodyText:{ fontSize:14, fontWeight:'500', color:'#0f172a', lineHeight:20 },
  placeholderText:{ fontSize:13, fontWeight:'500', color:'#607d8b', fontStyle:'italic' },
  inlineRow:{ flexDirection:'row', alignItems:'center' },
  capacityPill:{ paddingHorizontal:12, paddingVertical:6, borderRadius:18, borderWidth:1, backgroundColor:'#f1f5f9', minWidth:70, alignItems:'center' },
  capacityPillText:{ fontSize:13, fontWeight:'800', letterSpacing:0.5 },
  capacityHint:{ fontSize:11, fontWeight:'600', color:'rgba(13,71,161,0.70)', letterSpacing:0.4 },
  warningCard:{ backgroundColor:'#fff8e1', borderColor:'rgba(255,143,0,0.35)' },
  warningHeaderRow:{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 },
  warningTitle:{ fontSize:15, fontWeight:'800', color:'#ff8f00', letterSpacing:0.5 },
  warningBody:{ fontSize:13, fontWeight:'600', color:'#7a5d00', lineHeight:19 },
  footerBar:{ flexDirection:'row', alignItems:'center', gap:14, padding:18, borderTopWidth:1, borderTopColor:'rgba(13,71,161,0.12)', backgroundColor:'rgba(255,255,255,0.94)' },
  cancelBtn:{ flex:1, backgroundColor:'rgba(255,255,255,0.55)', borderRadius:18, alignItems:'center', justifyContent:'center', paddingVertical:14, borderWidth:1.5, borderColor:'rgba(25,118,210,0.25)' },
  cancelBtnText:{ color:'#0d47a1', fontSize:14, fontWeight:'700', letterSpacing:0.4 },
  dangerBtn:{ flex:1.4, backgroundColor:'#1976d2', borderRadius:18, alignItems:'center', justifyContent:'center', paddingVertical:14, shadowColor:'#000', shadowOpacity:0.25, shadowRadius:10, shadowOffset:{width:0,height:4} },
  dangerBtnDisabled:{ backgroundColor:'#90a4ae' },
  dangerBtnText:{ color:'#ffffff', fontSize:15, fontWeight:'800', letterSpacing:0.5 },
});

export default DeleteConfirmationModal;
