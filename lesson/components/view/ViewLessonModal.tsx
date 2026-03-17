import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Lesson } from '../../types/Lesson';
import { getLessonBackground, getLessonTypeDisplayName } from '../../types/LessonType';
import { formatLessonTimeReadable, formatPrice } from '../../../shared/services/formatService';

interface ViewLessonModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onEditClick: (lesson: Lesson) => void;
  onViewClients: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
  isEditing?: boolean;
  isDeleting?: boolean;
  isLoadingClients?: boolean;
  pendingPaymentsCount?: number;
}

const APP_BLUE = '#1976d2';

const ViewLessonModal: React.FC<ViewLessonModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onEditClick,
  onViewClients,
  onDelete,
  isEditing = false,
  isDeleting = false,
  isLoadingClients = false,
  pendingPaymentsCount = 0,
}) => {
  if (!lesson) return null;

  const registered = lesson.registeredCount ?? 0;
  const limit = lesson.capacityLimit ?? 0;
  const ratio = limit === 0 ? 0 : Math.min(1, registered / limit);
  const capacityColor = APP_BLUE;
  const lessonBg = getLessonBackground(lesson.title);

  // NEW: collapsible description
  const [showFullDesc, setShowFullDesc] = useState(false);
  const description = lesson.description?.trim() || '';
  const isLongDesc = description.length > 220;
  const displayedDesc = !isLongDesc || showFullDesc ? description : description.slice(0, 220).trim() + '…';

  // Helpers
  const priceLabel = lesson.price === 0 ? 'חינם' : formatPrice(lesson.price);

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
      <View style={styles.overlayPolished}>
        <View style={styles.glassCard}>
          {/* Header */}
          {lessonBg ? (
            <ImageBackground
              source={lessonBg}
              style={styles.headerGradient}
              imageStyle={styles.headerImage}
              resizeMode="cover"
            >
              <View style={styles.headerImageOverlay}>
                <View style={{flex:1, paddingRight:12}}>
                  <Text style={styles.modalTitle}>{getLessonTypeDisplayName(lesson.title)}</Text>
                  <Text style={styles.subtitleTime}>{formatLessonTimeReadable(lesson.time)}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeGradientBtn} accessibilityLabel="סגור פרטי שיעור">
                  <Icon name="close" size={22} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </ImageBackground>
          ) : (
            <View style={styles.headerGradient}>
              <View style={{flex:1, paddingRight:12}}>
                <Text style={styles.modalTitle}>{getLessonTypeDisplayName(lesson.title)}</Text>
                <Text style={styles.subtitleTime}>{formatLessonTimeReadable(lesson.time)}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeGradientBtn} accessibilityLabel="סגור פרטי שיעור">
                <Icon name="close" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}

          <ScrollView style={{flex:1}} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* DESCRIPTION (collapsible) */}
            {description.length > 0 && (
              <SectionCard icon="description" label="תיאור">
                <Text style={styles.bodyText}>{displayedDesc || '—'}</Text>
                {isLongDesc && (
                  <TouchableOpacity onPress={()=> setShowFullDesc(p=>!p)} style={styles.readMoreBtn} accessibilityLabel={showFullDesc? 'כווץ תיאור':'הרחב תיאור מלא'}>
                    <Text style={styles.readMoreText}>{showFullDesc? 'הצג פחות':'קרא עוד'}</Text>
                  </TouchableOpacity>
                )}
              </SectionCard>
            )}
            {/* LOCATION */}
            {lesson.location && (
              <SectionCard icon="location-on" label="מיקום">
                <Text style={styles.bodyText} numberOfLines={2} ellipsizeMode="tail">
                  {lesson.location.address || `${lesson.location.city}, ${lesson.location.country}`}
                </Text>
              </SectionCard>
            )}
            {/* METRICS ROW (Duration + Price only) */}
            <View style={[styles.sectionBlock, styles.metricsRow]}> 
              <MetricPill icon="timer" label="משך" value={`${lesson.duration} דקות`} />
              <MetricPill label="מחיר" value={priceLabel} valueColor={lesson.price===0? '#2e7d32': undefined} />
            </View>
            {/* CAPACITY (combined simple card) */}
            <View style={[styles.sectionBlock, styles.capacityCard]}> 
              <View style={styles.capacityHeaderRow}>
                <View style={styles.capacityIconWrap}><Icon name="people-alt" size={16} color="#1976d2" /></View>
                <Text style={styles.capacityTitle}>תפוסה</Text>
                <Text style={[styles.capacityCount, {color:capacityColor}]}>{registered}/{limit || '—'}</Text>
              </View>
              <View style={styles.capacityBarTrack}>
                <View style={[styles.capacityBarFill,{width:`${ratio*100}%`, backgroundColor:capacityColor}]} />
              </View>
              <Text style={styles.capacityHintLine}>{limit === 0 ? 'ללא הגבלה' : `${Math.round(ratio*100)}% מלא`}</Text>
              {/* Inline Registered Action */}
              <TouchableOpacity
                style={styles.inlineActionBtn}
                onPress={()=> onViewClients(lesson)}
                disabled={isLoadingClients}
                accessibilityLabel="View registered clients"
                activeOpacity={0.85}
              >
                <Icon name="people" size={16} color="#1466c3" style={{marginRight:6}} />
                <Text style={styles.inlineActionText}>{isLoadingClients? 'טוען...':'צפה ברשומים'}</Text>
              </TouchableOpacity>
              {pendingPaymentsCount > 0 && (
                <TouchableOpacity
                  style={styles.pendingAlert}
                  onPress={() => onViewClients(lesson)}
                  activeOpacity={0.75}
                >
                  <Icon name="hourglass-top" size={15} color="#b45309" />
                  <Text style={styles.pendingAlertText}>
                    {pendingPaymentsCount === 1
                      ? 'לקוח 1 ממתין לאישור תשלום'
                      : `${pendingPaymentsCount} לקוחות ממתינים לאישור תשלום`}
                  </Text>
                  <Icon name="chevron-right" size={15} color="#b45309" />
                </TouchableOpacity>
              )}
            </View>
            <View style={{height:140}} />
          </ScrollView>
          {/* Footer Action Bar */}
          <View style={styles.footerBar}> 
            {/* Removed Registered button (moved inline) */}
            <TouchableOpacity
              style={[styles.primaryBtn, isEditing && styles.primaryBtnDisabled]}
              onPress={()=> onEditClick(lesson)}
              disabled={isEditing}
              accessibilityLabel="Edit lesson"
              activeOpacity={0.9}
            >
              <Icon name="edit" size={18} color="#fff" style={styles.btnIconLeft} />
              <Text style={styles.primaryBtnText}>{isEditing? 'עורך...':'עריכה'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteBtn, isDeleting && styles.deleteBtnDisabled]}
              onPress={()=> onDelete(lesson)}
              disabled={isDeleting}
              accessibilityLabel="מחק שיעור"
              activeOpacity={0.9}
            >
              <Icon name="delete" size={18} color="#0d47a1" style={styles.btnIconLeft} />
              <Text style={styles.deleteBtnText}>{isDeleting? 'מוחק...':'מחיקה'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Section Card Component
const SectionCard: React.FC<{ icon: string; label: string; children: React.ReactNode; }> = ({ icon, label, children }) => (
  <View style={[styles.sectionBlock, styles.sectionCard]}> 
    <View style={styles.sectionHeaderRow}>
      <View style={styles.sectionHeaderIconWrap}>
        <Icon name={icon} size={16} color="#1976d2" />
      </View>
      <Text style={styles.sectionLabel}>{label}</Text>
    </View>
    {children}
  </View>
);

// Metric Pill
const MetricPill: React.FC<{ icon?: string; label: string; value: string; valueColor?: string; }> = ({ icon, label, value, valueColor }) => (
  <View style={styles.metricPill}>
    {icon ? <Icon name={icon} size={14} color="#1976d2" style={{marginRight:6}} /> : null}
    <View style={{flex:1}}>
      <Text style={styles.metricPillLabel}>{label}</Text>
      <Text style={[styles.metricPillValue, valueColor && {color:valueColor}]} numberOfLines={1}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlayPolished:{ flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'center', padding:20 },
  glassCard:{ flex:1, borderRadius:30, overflow:'hidden', backgroundColor:'rgba(255,255,255,0.94)', borderWidth:1, borderColor:'rgba(255,255,255,0.75)', maxHeight:'92%', shadowColor:'#000', shadowOpacity:0.2, shadowRadius:18, shadowOffset:{width:0,height:8} },
  headerGradient:{ backgroundColor:'#1976d2', paddingVertical:20, paddingHorizontal:26, flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between' },
  headerImage:{},
  headerImageOverlay:{ backgroundColor:'rgba(0,0,0,0.28)', marginHorizontal:-26, marginVertical:-20, paddingVertical:20, paddingHorizontal:26, flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between' },
  modalTitle:{ fontSize:20, fontWeight:'800', color:'#ffffff', letterSpacing:0.5, marginBottom:4, textAlign:'left', writingDirection:'rtl' },
  subtitleTime:{ fontSize:12.5, fontWeight:'600', color:'rgba(255,255,255,0.82)', letterSpacing:0.4, textAlign:'left', writingDirection:'rtl' },
  closeGradientBtn:{ width:42, height:42, borderRadius:16, backgroundColor:'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.4)' },
  scrollContent:{ padding:22, paddingBottom:40 },
  sectionBlock:{ marginBottom:22 },
  sectionCard:{ backgroundColor:'#ffffff', borderRadius:22, padding:18, shadowColor:'#0d47a1', shadowOpacity:0.06, shadowRadius:10, shadowOffset:{width:0,height:4}, borderWidth:1, borderColor:'rgba(13,71,161,0.08)' },
  sectionHeaderRow:{ flexDirection:'row', alignItems:'center', marginBottom:10 },
  sectionHeaderIconWrap:{ width:32, height:32, borderRadius:12, backgroundColor:'#f1f6fa', alignItems:'center', justifyContent:'center', marginEnd:10, borderWidth:1, borderColor:'rgba(25,118,210,0.15)' },
  sectionLabel:{ fontSize:12.5, fontWeight:'800', letterSpacing:0.8, color:'#0d47a1', textTransform:'uppercase', textAlign:'left', writingDirection:'rtl' },
  bodyText:{ fontSize:14, fontWeight:'500', color:'#0f172a', lineHeight:20, textAlign:'left', writingDirection:'rtl' },
  metricsRow:{ flexDirection:'row', gap:12 },
  metricPill:{ flex:1, flexDirection:'row', alignItems:'center', backgroundColor:'#f3f7fb', borderRadius:18, paddingVertical:10, paddingHorizontal:12, borderWidth:1.5, borderColor:'rgba(25,118,210,0.15)' },
  metricPillLabel:{ fontSize:10, fontWeight:'800', color:'#0d47a1', textTransform:'uppercase', letterSpacing:0.6, textAlign:'left', writingDirection:'rtl' },
  metricPillValue:{ fontSize:13, fontWeight:'700', color:'#1976d2', marginTop:2, textAlign:'left', writingDirection:'rtl' },
  progressLabel:{ fontSize:12, fontWeight:'700', color:'#0d47a1', letterSpacing:0.5, marginBottom:10, textTransform:'uppercase', textAlign:'left', writingDirection:'rtl' },
  capacityBarTrack:{ height:14, borderRadius:8, backgroundColor:'#e3edf5', overflow:'hidden', borderWidth:1, borderColor:'rgba(25,118,210,0.15)' },
  capacityBarFill:{ height:'100%', borderRadius:8 },
  capacityHint:{ marginTop:6, fontSize:12, fontWeight:'600', color:'#445b6c', textAlign:'left', writingDirection:'rtl' },
  footerBar:{ position:'absolute', left:0, right:0, bottom:0, flexDirection:'row', gap:14, paddingHorizontal:20, paddingVertical:18, backgroundColor:'rgba(255,255,255,0.92)', borderTopWidth:1, borderTopColor:'rgba(25,118,210,0.15)', shadowColor:'#000', shadowOpacity:0.18, shadowRadius:14, shadowOffset:{width:0,height:4} },
  primaryBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'#186ac2', borderRadius:18, paddingVertical:14, shadowColor:'#000', shadowOpacity:0.20, shadowRadius:10, shadowOffset:{width:0,height:4} },
  primaryBtnDisabled:{ backgroundColor:'#90a4ae' },
  primaryBtnText:{ color:'#ffffff', fontSize:14, fontWeight:'800', letterSpacing:0.5, writingDirection:'rtl' },
  deleteBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'#e2eaf2', borderRadius:18, paddingVertical:14, shadowColor:'#000', shadowOpacity:0.10, shadowRadius:8, shadowOffset:{width:0,height:3}, borderWidth:1, borderColor:'rgba(13,71,161,0.20)' },
  deleteBtnDisabled:{ backgroundColor:'#cfd8e3' },
  deleteBtnText:{ color:'#0d47a1', fontSize:14, fontWeight:'800', letterSpacing:0.5, writingDirection:'rtl' },
  // NEW styles
  readMoreBtn:{ marginTop:8, alignSelf:'flex-start', paddingVertical:4, paddingHorizontal:10, borderRadius:12, backgroundColor:'#f1f6fa', borderWidth:1, borderColor:'rgba(25,118,210,0.18)' },
  readMoreText:{ fontSize:11.5, fontWeight:'700', color:'#1976d2', letterSpacing:0.3 },
  capacityCard:{ backgroundColor:'#ffffff', borderRadius:22, padding:18, shadowColor:'#0d47a1', shadowOpacity:0.05, shadowRadius:8, shadowOffset:{width:0,height:3}, borderWidth:1, borderColor:'rgba(13,71,161,0.08)' },
  capacityHeaderRow:{ flexDirection:'row', alignItems:'center', marginBottom:12 },
  capacityIconWrap:{ width:34, height:34, borderRadius:12, backgroundColor:'#f1f6fa', alignItems:'center', justifyContent:'center', marginEnd:10, borderWidth:1, borderColor:'rgba(25,118,210,0.15)' },
  capacityTitle:{ fontSize:12.5, fontWeight:'800', letterSpacing:0.8, color:'#0d47a1', textTransform:'uppercase', flex:1, textAlign:'left', writingDirection:'rtl' },
  capacityCount:{ fontSize:13, fontWeight:'800' },
  capacityHintLine:{ marginTop:6, fontSize:12, fontWeight:'600', color:'#445b6c', textAlign:'left', writingDirection:'rtl' },
  // Inline Registered action styles
  inlineActionBtn:{ marginTop:14, flexDirection:'row', alignItems:'center', alignSelf:'flex-start', backgroundColor:'#f1f6fa', borderRadius:16, paddingVertical:8, paddingHorizontal:14, borderWidth:1, borderColor:'rgba(20,102,195,0.25)' },
  inlineActionText:{ fontSize:12.5, fontWeight:'700', color:'#1466c3', writingDirection:'rtl' },
  btnIconLeft:{ marginEnd:6 },
  pendingAlert:{ marginTop:10, flexDirection:'row', alignItems:'center', gap:7, backgroundColor:'#fffbeb', borderRadius:14, paddingVertical:9, paddingHorizontal:12, borderWidth:1, borderColor:'rgba(180,83,9,0.25)' },
  pendingAlertText:{ flex:1, fontSize:12.5, fontWeight:'700', color:'#b45309', lineHeight:17, textAlign:'left', writingDirection:'rtl' },
});

export default ViewLessonModal;
