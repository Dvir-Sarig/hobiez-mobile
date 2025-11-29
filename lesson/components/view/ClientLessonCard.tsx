import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Pressable,
} from 'react-native';
import { Avatar } from 'react-native-paper';
import { Lesson } from '../../types/Lesson';
import { formatLessonTimeReadable } from '../../../shared/services/formatService';
import { getLessonIcon } from '../../types/LessonType';
import { useNavigation } from '@react-navigation/native';

interface ClientLessonCardsProps {
  lessons: Lesson[];
  coachInfoMap: { [key: string]: { name: string; email: string } };
  onOpenLessonModal: (lesson: Lesson) => void;
  isLoading?: boolean;
  returnScrollY?: number; // added for returning to same position
}

// Glassy loading skeleton aligned with new compact layout
const LoadingSkeleton = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
            duration: 1100,
            useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();
  }, [animatedValue]);

  const pulse = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  return (
    <View style={styles.card}>      
      <View style={styles.rowTop}>        
        <Animated.View style={[styles.skelAvatar, { opacity: pulse }]} />
        <View style={styles.titleTimeContainer}>
          <Animated.View style={[styles.skelTitle, { opacity: pulse }]} />
          <Animated.View style={[styles.skelTime, { opacity: pulse }]} />
        </View>
        <Animated.View style={[styles.skelPill, { opacity: pulse }]} />
      </View>
      <View style={styles.metaRow}>        
        <Animated.View style={[styles.skelMeta, { width: '30%', opacity: pulse }]} />
        <Animated.View style={[styles.skelMeta, { width: '55%', opacity: pulse }]} />
      </View>
    </View>
  );
};

const ClientLessonCards: React.FC<ClientLessonCardsProps> = ({
  lessons,
  coachInfoMap,
  onOpenLessonModal,
  isLoading = false,
  returnScrollY = 0,
}) => {
  const navigation = useNavigation<any>();

  const sortedLessons = useMemo(
    () => [...lessons].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
    [lessons]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </View>
    );
  }

  if (lessons.length === 0) {
    return (
      <View style={styles.noResultsContainer}>
        <Text style={styles.noResultsTitle}>No Lessons Found</Text>
        <Text style={styles.noResultsText}>
          Try adjusting your search filters or check back later for new lessons.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sortedLessons.map((lesson) => {
        const coachInfo = coachInfoMap[lesson.coachId];
        const coachName = coachInfo?.name || '...';
        const { IconComponent, iconName } = getLessonIcon(lesson.title);
        const registered = lesson.registeredCount ?? 0;
        const capacity = lesson.capacityLimit ?? 0;
        const capacityRatio = capacity > 0 ? registered / capacity : 0;
        const capacityColor = capacityRatio >= 1
          ? '#ff5252'
          : capacityRatio >= 0.75
            ? '#ffa726'
            : '#64b5f6';

        // Animated press feedback
        const scale = new Animated.Value(1);
        const onPressIn = () => {
          Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
        };
        const onPressOut = () => {
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
        };

        const locationText = lesson.location?.address
          ? lesson.location.address
          : [lesson.location?.city, lesson.location?.country].filter(Boolean).join(', ');

        return (
          <Animated.View key={lesson.id} style={[styles.card, { transform: [{ scale }] }]}>            
            <Pressable
              android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
              style={styles.pressable}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={() => onOpenLessonModal(lesson)}
            >
              <View style={styles.rowTop}>
                <Avatar.Icon
                  size={42}
                  icon={() => <IconComponent name={iconName} size={22} color="#fff" />}
                  style={styles.lessonIcon}
                />
                <View style={styles.titleTimeContainer}>
                  <Text numberOfLines={1} style={styles.title}>{lesson.title}</Text>
                  <Text style={styles.time}>🕒 {formatLessonTimeReadable(lesson.time)}</Text>
                </View>
                <View style={[styles.capacityPill, { borderColor: capacityColor }]}>                  
                  <Text style={[styles.capacityText, { color: capacityColor }]}>👥 {registered}/{capacity}</Text>
                </View>
              </View>
              <View style={styles.metaRow}>                
                <TouchableOpacity onPress={() => navigation.navigate('CoachProfilePage', { coachId: lesson.coachId, originScreen: 'SearchLessons', originTab: 'available', returnScrollY })}>
                  <Text numberOfLines={1} style={styles.metaCoach}>👤 {coachName}</Text>
                </TouchableOpacity>
                {locationText ? (
                  <Text numberOfLines={1} style={styles.metaLocation}>📍 {locationText}</Text>
                ) : null}
              </View>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12 },
  card: {
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: 'hidden',
  },
  pressable: { flex: 1 },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  lessonIcon: {
    backgroundColor: '#1976d2',
  },
  titleTimeContainer: { flex: 1, marginLeft: 12 },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: '#fff',
    marginBottom: 2,
  },
  time: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  capacityPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaCoach: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '500',
    maxWidth: 140,
  },
  metaLocation: {
    flex: 1,
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.70)',
    textAlign: 'right',
  },
  noResultsContainer: {
    padding: 28,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  noResultsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Skeleton styles (glassy look)
  skelAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  skelTitle: {
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
    marginBottom: 6,
    width: '70%',
  },
  skelTime: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
    width: '45%',
  },
  skelPill: {
    height: 28,
    width: 70,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginLeft: 10,
  },
  skelMeta: {
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
    marginTop: 10,
  },
});

export default ClientLessonCards;
