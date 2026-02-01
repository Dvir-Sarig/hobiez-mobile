import React, { useMemo, useRef } from 'react';
import { ImageBackground } from 'react-native';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Lesson } from '../../types/Lesson';
import { formatLessonTimeReadable } from '../../../shared/services/formatService';
import { formatPrice } from '../../../shared/services/formatService';
import { getLessonIcon, getLessonBackground } from '../../types/LessonType';
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
      {/* Simulate title bar */}
      <View style={styles.titleBar}>
        <Animated.View style={[styles.titleBarIconWrap, { opacity: pulse }]} />
        <Animated.View style={[styles.skelTitle, { opacity: pulse, flex: 1, marginLeft: 8 }]} />
      </View>
      {/* Simulate main content row */}
      <View style={styles.cardContentRow}>
        <View style={styles.infoCol}>
          <Animated.View style={[styles.skelTime, { opacity: pulse, width: '60%', marginBottom: 8 }]} />
          <Animated.View style={[styles.skelMeta, { opacity: pulse, width: '40%' }]} />
        </View>
        <View style={styles.capacityCol}>
          <Animated.View style={[styles.skelPill, { opacity: pulse }]} />
        </View>
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
            : '#1976d2';

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

        const lessonBg = getLessonBackground(lesson.title);
        return (
          <Animated.View key={lesson.id} style={[styles.card, { transform: [{ scale }] }]}>            
            <Pressable
              style={styles.pressable}
              android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={() => onOpenLessonModal(lesson)}
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
              {/* Card main content */}
              <View style={styles.cardContentRow}>
                <View style={styles.infoCol}>
                  <View style={styles.infoRow}>
                    <Text style={styles.lessonTime}>🕒 {formatLessonTimeReadable(lesson.time)}</Text>
                    {locationText ? (
                      <Text numberOfLines={1} style={styles.lessonLocation}>📍 {locationText}</Text>
                    ) : null}
                  </View>
                  <View style={styles.infoRow}>
                    <TouchableOpacity onPress={() => navigation.navigate('CoachProfilePage', { coachId: lesson.coachId, originScreen: 'SearchLessons', originTab: 'available', returnScrollY })}>
                      <Text numberOfLines={1} style={styles.lessonCoach}>👤 {coachName}</Text>
                    </TouchableOpacity>
                  </View>
                  {/* Add detail row for duration and price if available */}
                  {(lesson.duration || lesson.price) && (
                    <View style={styles.detailRowWrap}>
                      {lesson.duration && (
                        <View style={styles.detailChip}>
                          <Icon name="timer" size={14} color="#64b5f6" style={styles.chipIcon} />
                          <Text style={styles.detailChipText}>{lesson.duration} min</Text>
                        </View>
                      )}
                      {lesson.price && (
                        <View style={styles.detailChip}>
                          <Icon name="attach-money" size={14} color="#64b5f6" style={styles.chipIcon} />
                          <Text style={styles.detailChipText}>{formatPrice(lesson.price)}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
                <View style={styles.capacityCol}>
                  <View style={[styles.capacityPill, { borderColor: capacityColor, backgroundColor: capacityColor + '22' }]}>                  
                    <Text style={[styles.capacityText, { color: capacityColor }]}>👥 {registered}/{capacity}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
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
    // titleBarOverlay removed
    titleBarContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      zIndex: 2,
    },
  container: { padding: 12 },
  card: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 0,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#f0f4fa',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    overflow: 'hidden',
    minHeight: 110,
  },
  pressable: { flex: 1 },
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
  titleBarIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#1565c0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  titleBarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
    flex: 1,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  infoCol: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  lessonTime: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  lessonLocation: {
    fontSize: 16,
    color: '#888',
    fontWeight: '700',
    letterSpacing: 0.2,
    maxWidth: 120,
  },
  lessonCoach: {
    fontSize: 16,
    color: '#555',
    fontWeight: '700',
    letterSpacing: 0.2,
    maxWidth: 120,
  },
    detailRowWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 18,
      marginTop: -2,
      marginBottom: 2,
      paddingHorizontal: 0,
      marginLeft: -6,
    },
    detailChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.13)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
    },
    chipIcon: { marginRight: 4 },
    detailChipText: { fontSize: 16, fontWeight: '700', color: '#1976d2', letterSpacing: 0.2 },
  capacityCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexShrink: 0,
    minWidth: 90,
  },
  capacityPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginTop: 45,
  },
  capacityText: {
    fontSize: 14,
    fontWeight: '700',
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
