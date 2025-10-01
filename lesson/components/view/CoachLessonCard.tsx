import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Lesson } from '../../types/Lesson';
import { formatLessonTimeReadable } from '../../../shared/services/formatService';
import { getLessonIcon } from '../../types/LessonType';

interface LessonCardsProps {
  lessons: Lesson[];
  onEdit: (lesson: Lesson) => void; // view details modal
  onEditLesson: (lesson: Lesson) => void; // open edit modal
  onDelete: (lesson: Lesson) => void;
  onViewClients: (lesson: Lesson) => void;
}

const getCapacityColor = (registered: number, capacity: number) => {
  const safeCapacity = capacity > 0 ? capacity : 1;
  const ratio = registered / safeCapacity;
  if (ratio >= 0.95) return '#d32f2f';
  if (ratio >= 0.75) return '#f57c00';
  return '#2e7d32';
};

const CoachLessonCards: React.FC<LessonCardsProps> = ({ lessons, onEdit, onEditLesson, onDelete, onViewClients }) => {
  const sorted = useMemo(() => lessons
    .filter(l => l.time && !isNaN(new Date(l.time).getTime()))
    .sort((a,b)=> new Date(a.time).getTime() - new Date(b.time).getTime()), [lessons]);

  return (
    <View style={styles.container}>
      {sorted.map((lesson) => {
        const { IconComponent, iconName } = getLessonIcon(lesson.title);
        const registered = lesson.registeredCount ?? 0;
        const capacity = lesson.capacityLimit ?? 0;
        const pct = capacity > 0 ? Math.min(100, Math.round((registered / capacity)*100)) : 0;
        const capColor = getCapacityColor(registered, capacity);
        const hasLocation = lesson.location && (lesson.location.address || lesson.location.city || lesson.location.country);
        const locationLabel = hasLocation ? (lesson.location.address || `${lesson.location.city}${lesson.location.city && lesson.location.country ? ', ' : ''}${lesson.location.country}`) : null;

        return (
          <View key={lesson.id} style={styles.card}> 
            <View style={styles.topRow}> 
              <Avatar.Icon
                size={40}
                icon={() => <IconComponent name={iconName} size={20} color="#fff" />}
                style={styles.avatar}
              />
              <View style={styles.infoBlock}> 
                <View style={styles.titleRow}> 
                  <Text style={styles.title} numberOfLines={1}>{lesson.title}</Text>
                  <Text style={styles.time} numberOfLines={1}>{formatLessonTimeReadable(lesson.time)}</Text>
                </View>
                {hasLocation && (
                  <View style={styles.locationInline}> 
                    <Icon name="location-on" size={12} color="#1976d2" style={{marginRight:3}} />
                    <Text style={styles.locationText} numberOfLines={1}>{locationLabel}</Text>
                  </View>
                )}
                <View style={styles.capacityRow}> 
                  <View style={[styles.capacityPill,{borderColor:capColor}]}> 
                    <Text style={[styles.capacityPillText,{color:capColor}]}>{registered}/{capacity||0}</Text>
                  </View>
                  <View style={styles.progressTrack}><View style={[styles.progressFill,{width:`${pct}%`, backgroundColor:capColor}]} /></View>
                  <Text style={[styles.pctText,{color:capColor}]}>{pct}%</Text>
                </View>
              </View>
            </View>
            <View style={styles.actionsRow}> 
              <TouchableOpacity accessibilityLabel="View lesson" style={styles.actionBtn} onPress={()=>onEdit(lesson)}>
                <Icon name="visibility" size={18} color="#1976d2" />
              </TouchableOpacity>
              <TouchableOpacity accessibilityLabel="Clients" style={styles.actionBtn} onPress={()=>onViewClients(lesson)}>
                <Icon name="people" size={18} color="#1565c0" />
              </TouchableOpacity>
              <TouchableOpacity accessibilityLabel="Edit lesson" style={styles.actionBtn} onPress={()=>onEditLesson(lesson)}>
                <Icon name="edit" size={16} color="#2e7d32" />
              </TouchableOpacity>
              <TouchableOpacity accessibilityLabel="Delete lesson" style={styles.actionBtn} onPress={()=>onDelete(lesson)}>
                <Icon name="delete" size={18} color="#d32f2f" />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
      {sorted.length === 0 && (
        <Text style={styles.emptyHint}>No lessons to display.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:{ paddingVertical:4 },
  card:{ backgroundColor:'rgba(255,255,255,0.82)', borderRadius:18, padding:12, marginBottom:10, shadowColor:'#0d47a1', shadowOpacity:0.06, shadowRadius:8, shadowOffset:{width:0,height:3}, borderWidth:1, borderColor:'rgba(255,255,255,0.45)' },
  topRow:{ flexDirection:'row', alignItems:'flex-start' },
  avatar:{ backgroundColor:'#1976d2', marginRight:10 },
  infoBlock:{ flex:1 },
  titleRow:{ flexDirection:'row', alignItems:'center' },
  title:{ flex:1, fontSize:15.5, fontWeight:'800', color:'#0d47a1', letterSpacing:0.3, paddingRight:6 },
  time:{ fontSize:11.5, fontWeight:'700', color:'#0f355e', marginLeft:4 },
  locationInline:{ flexDirection:'row', alignItems:'center', marginTop:4 },
  locationText:{ fontSize:11, fontWeight:'600', color:'#0f172a', flex:1 },
  capacityRow:{ flexDirection:'row', alignItems:'center', marginTop:6 },
  capacityPill:{ paddingHorizontal:6, paddingVertical:2, borderRadius:9, borderWidth:1.2, marginRight:6, minWidth:48, alignItems:'center' },
  capacityPillText:{ fontSize:10.5, fontWeight:'700', letterSpacing:0.3 },
  progressTrack:{ flex:1, height:5, backgroundColor:'#e3eef7', borderRadius:3, overflow:'hidden', marginRight:6 },
  progressFill:{ height:'100%', borderRadius:3 },
  pctText:{ fontSize:10.5, fontWeight:'700', width:34, textAlign:'right' },
  actionsRow:{ flexDirection:'row', justifyContent:'flex-end', marginTop:8 },
  actionBtn:{ width:34, height:34, borderRadius:12, backgroundColor:'#ffffff', alignItems:'center', justifyContent:'center', marginLeft:6, shadowColor:'#000', shadowOpacity:0.07, shadowRadius:4, shadowOffset:{width:0,height:2}, borderWidth:1, borderColor:'rgba(25,118,210,0.12)' },
  emptyHint:{ textAlign:'center', color:'#607d8b', fontSize:13, fontStyle:'italic', marginTop:16 }
});

export default React.memo(CoachLessonCards);
