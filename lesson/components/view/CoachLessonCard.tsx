import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { getLessonBackground } from '../../types/LessonType';
import { Lesson } from '../../types/Lesson';
import { formatLessonTimeReadable } from '../../../shared/services/formatService';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
        const registered = lesson.registeredCount ?? 0;
        const capacity = lesson.capacityLimit ?? 0;
        const pct = capacity > 0 ? Math.min(100, Math.round((registered / capacity)*100)) : 0;
        const capColor = getCapacityColor(registered, capacity);
        const lessonBg = getLessonBackground(lesson.title);
        return (
          <TouchableOpacity
            key={lesson.id}
            style={styles.card}
            activeOpacity={0.85}
            accessibilityLabel={`Open details for lesson ${lesson.title}`}
            onPress={() => onEdit(lesson)}
          >
            {/* Title bar with image background for lesson types */}
            {lessonBg ? (
              <ImageBackground
                source={lessonBg}
                style={styles.titleBar}
                imageStyle={{ borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
                resizeMode="cover"
              >
                <View style={styles.titleBarContent}>
                  <Text numberOfLines={1} style={styles.titleBarTextBig}>{lesson.title}</Text>
                </View>
              </ImageBackground>
            ) : (
              <View style={styles.titleBar}>
                <View style={styles.titleBarContent}>
                  <Text numberOfLines={1} style={styles.titleBarTextBig}>{lesson.title}</Text>
                </View>
              </View>
            )}
            {/* Card main content: date and registration info only, styled for clarity */}
            <View style={styles.cardContentRow}>
              <View style={styles.infoCol}>
                <View style={styles.dateRow}>
                  <Icon name="schedule" size={18} color="#1976d2" style={{ marginRight: 6 }} />
                  <Text style={styles.lessonTime}>{formatLessonTimeReadable(lesson.time)}</Text>
                </View>
                <View style={styles.registerRow}>
                  <View style={[styles.capacityPill, { borderColor: capColor, backgroundColor: capColor + '22' }]}>                  
                    <Icon name="group" size={18} color={capColor} style={{ marginRight: 4 }} />
                    <Text style={[styles.capacityText, { color: capColor }]}>{registered}/{capacity}</Text>
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
  container:{ paddingHorizontal:4, paddingTop:2 },
  card:{ backgroundColor:'transparent', borderRadius:20, padding:8, marginBottom:0, borderWidth:0, shadowOpacity:0 },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    gap: 10,
  },
  titleBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 2,
  },
  titleBarTextBig: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  infoCol: {
    flex: 1,
    flexDirection: 'column',
    gap: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  lessonTime: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 0,
  },
  capacityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    minWidth: 70,
    marginBottom: 4,
  },
  capacityText: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(25,118,210,0.12)',
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 12,
    marginRight: 12,
  },
  progressFill:{ height:'100%', borderRadius:4 },
  pctText: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'right',
    color: '#1976d2',
    marginTop: 2,
  },
  emptyHint:{ textAlign:'center', color:'rgba(55,55,55,0.75)', fontSize:13, fontStyle:'italic', marginTop:16 }
});

export default React.memo(CoachLessonCards);
