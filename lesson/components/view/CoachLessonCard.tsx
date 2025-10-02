import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Lesson } from '../../types/Lesson';
import { formatLessonTimeReadable } from '../../../shared/services/formatService';
import { getLessonIcon } from '../../types/LessonType';

interface LessonCardsProps {
  lessons: Lesson[];
  onEdit: (lesson: Lesson) => void; // tap card to open view modal
}

const getCapacityColor = (registered: number, capacity: number) => {
  const safeCapacity = capacity > 0 ? capacity : 1;
  const ratio = registered / safeCapacity;
  if (ratio >= 0.95) return '#d32f2f';
  if (ratio >= 0.75) return '#f57c00';
  return '#2e7d32';
};

const CoachLessonCards: React.FC<LessonCardsProps> = ({ lessons, onEdit }) => {
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
          <TouchableOpacity
            key={lesson.id}
            style={styles.card}
            activeOpacity={0.85}
            accessibilityLabel={`Open details for lesson ${lesson.title}`}
            onPress={() => onEdit(lesson)}
          >
            <View style={styles.topRow}> 
              <Avatar.Icon
                size={44}
                icon={() => <IconComponent name={iconName} size={22} color="#fff" />}
                style={styles.avatar}
              />
              <View style={styles.infoBlock}> 
                <View style={styles.titleRow}> 
                  <Text style={styles.title} numberOfLines={1}>{lesson.title}</Text>
                  <Text style={styles.time} numberOfLines={1}>{formatLessonTimeReadable(lesson.time)}</Text>
                </View>
                {hasLocation && (
                  <View style={styles.locationInline}> 
                    <Icon name="location-on" size={12} color="#bbdefb" style={{marginRight:4}} />
                    <Text style={styles.locationText} numberOfLines={1}>{locationLabel}</Text>
                  </View>
                )}
                <View style={styles.capacityRow}> 
                  <View style={[styles.capacityPill,{borderColor:capColor}]}> 
                    <Text style={[styles.capacityPillText,{color:capColor}]}>{registered}/{capacity||0}</Text>
                  </View>
                  <View style={styles.progressTrack}><View style={[styles.progressFill,{width:`${pct}%`, backgroundColor:capColor}]} /></View>
                  <Text style={styles.pctText}>{pct}%</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
      {sorted.length === 0 && (
        <Text style={styles.emptyHint}>No lessons to display.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:{ paddingHorizontal:12, paddingTop:4 },
  card:{ backgroundColor:'rgba(255,255,255,0.08)', borderRadius:20, padding:14, marginBottom:14, borderWidth:1, borderColor:'rgba(255,255,255,0.18)', shadowColor:'#000', shadowOpacity:0.25, shadowRadius:12, shadowOffset:{width:0,height:4} },
  topRow:{ flexDirection:'row', alignItems:'flex-start' },
  avatar:{ backgroundColor:'#1976d2', marginRight:12, shadowColor:'#000', shadowOpacity:0.25, shadowRadius:6, shadowOffset:{width:0,height:3} },
  infoBlock:{ flex:1 },
  titleRow:{ flexDirection:'row', alignItems:'center', marginBottom:2 },
  title:{ flex:1, fontSize:15.5, fontWeight:'800', color:'#ffffff', letterSpacing:0.3, paddingRight:6 },
  time:{ fontSize:11.5, fontWeight:'600', color:'rgba(255,255,255,0.78)' },
  locationInline:{ flexDirection:'row', alignItems:'center', marginTop:4 },
  locationText:{ fontSize:11.5, fontWeight:'600', color:'rgba(255,255,255,0.70)', flex:1 },
  capacityRow:{ flexDirection:'row', alignItems:'center', marginTop:8 },
  capacityPill:{ paddingHorizontal:8, paddingVertical:4, borderRadius:12, borderWidth:1.5, marginRight:8, minWidth:54, alignItems:'center', backgroundColor:'rgba(0,0,0,0.25)' },
  capacityPillText:{ fontSize:11, fontWeight:'800', letterSpacing:0.4 },
  progressTrack:{ flex:1, height:6, backgroundColor:'rgba(255,255,255,0.22)', borderRadius:4, overflow:'hidden', marginRight:8 },
  progressFill:{ height:'100%', borderRadius:4 },
  pctText:{ fontSize:11, fontWeight:'700', width:40, textAlign:'right', color:'#ffffff' },
  emptyHint:{ textAlign:'center', color:'rgba(255,255,255,0.75)', fontSize:13, fontStyle:'italic', marginTop:16 }
});

export default React.memo(CoachLessonCards);
