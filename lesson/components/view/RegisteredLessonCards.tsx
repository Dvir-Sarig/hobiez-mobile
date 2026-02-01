import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Lesson } from '../../types/Lesson';
import { formatLessonTimeReadable, formatPrice } from '../../../shared/services/formatService';
import { getLessonIcon, getLessonBackground } from '../../types/LessonType';
import { useNavigation } from '@react-navigation/native';

interface RegisteredLessonCardsProps {
  lessons: Lesson[];
  coachInfoMap: { [key: string]: { name: string; email: string } };
  onOpenDeleteModal: (lesson: Lesson) => void; // unregister action
  isLoading?: boolean;
  returnScrollY?: number; // added for restoring scroll position
}

const computeCapacityColor = (registered: number, capacity: number) => {
  if (!capacity) return '#64b5f6';
  const ratio = registered / capacity;
  if (ratio >= 1) return '#ff5252';
  if (ratio >= 0.75) return '#ffa726';
  return '#64b5f6';
};

// Glassy skeleton mirroring layout
const LoadingSkeleton = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, { toValue: 1, duration: 1100, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(animatedValue, { toValue: 0, duration: 1100, useNativeDriver: Platform.OS !== 'web' }),
      ])
    ).start();
  }, [animatedValue]);
  const pulse = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });
  return (
    <View style={styles.card}>
      {/* Simulate title bar */}
      <View style={styles.titleBar}>
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

// Redesigned card item with title bar and background
import { ImageBackground } from 'react-native';
const RegisteredLessonCardItem: React.FC<{
  lesson: Lesson;
  coachName: string;
  icon: { IconComponent: any; iconName: string };
  onOpenDeleteModal: (lesson: Lesson) => void;
  navigation: any;
  returnScrollY?: number;
}> = ({ lesson, coachName, icon, onOpenDeleteModal, navigation, returnScrollY = 0 }) => {
  const { IconComponent, iconName } = icon;
  const registered = lesson.registeredCount ?? 0;
  const capacity = lesson.capacityLimit ?? 0;
  const capColor = computeCapacityColor(registered, capacity);
  const locationText = lesson.location?.address
    ? lesson.location.address
    : [lesson.location?.city, lesson.location?.country].filter(Boolean).join(', ');

  const scaleRef = useRef(new Animated.Value(1));
  const scale = scaleRef.current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  const lessonBg = getLessonBackground(lesson.title);

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>            
      <Pressable
        style={styles.pressable}
        android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => onOpenDeleteModal(lesson)}
      >
        {/* Title bar with background image or color */}
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
              <TouchableOpacity onPress={() => navigation.navigate('CoachProfilePage', { coachId: lesson.coachId, originScreen: 'SearchLessons', originTab: 'registered', returnScrollY })}>
                <Text numberOfLines={1} style={styles.lessonCoach}>👤 {coachName}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.detailRowWrap}>
              <View style={styles.detailChip}>
                <Icon name="timer" size={14} color="#64b5f6" style={styles.chipIcon} />
                <Text style={styles.detailChipText}>{lesson.duration} min</Text>
              </View>
              <View style={styles.detailChip}>
                <Icon name="attach-money" size={14} color="#64b5f6" style={styles.chipIcon} />
                <Text style={styles.detailChipText}>{formatPrice(lesson.price)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.capacityCol}>
            <View style={[styles.capacityPill, { borderColor: capColor, backgroundColor: capColor + '22' }]}>                  
              <Text style={[styles.capacityText, { color: capColor }]}>👥 {registered}/{capacity}</Text>
            </View>
            {/* Removed the X button */}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const RegisteredLessonCards: React.FC<RegisteredLessonCardsProps> = ({
  lessons,
  coachInfoMap,
  onOpenDeleteModal,
  isLoading = false,
  returnScrollY = 0,
}) => {
  const navigation = useNavigation<any>();

  const sorted = useMemo(
    () => [...lessons].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
    [lessons]
  );

  if (isLoading) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </ScrollView>
    );
  }

  if (lessons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="event-busy" size={48} color="#90caf9" />
        <Text style={styles.emptyTitle}>No Registered Lessons</Text>
        <Text style={styles.emptyText}>You haven't registered for any lessons yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {sorted.map((lesson) => {
        const coachInfo = coachInfoMap[lesson.coachId];
        const coachName = coachInfo?.name || '...';
        const icon = getLessonIcon(lesson.title);
        return (
          <RegisteredLessonCardItem
            key={lesson.id}
            lesson={lesson}
            coachName={coachName}
            icon={icon}
            onOpenDeleteModal={onOpenDeleteModal}
            navigation={navigation}
            returnScrollY={returnScrollY}
          />
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 8,
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
  capacityCol: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    flexShrink: 0,
    minWidth: 90,
    position: 'relative',
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
    position: 'absolute',
    bottom: -40,
    right: 0,
    marginTop: 0,
  },
  capacityText: {
    fontSize: 14,
    fontWeight: '700',
  },
  unregisterIconBtn: {
    marginTop: 8,
    marginLeft: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
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
  // metaRow and emptyContainer unchanged
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  metaCoach: { fontSize: 13.5, color: 'rgba(255,255,255,0.95)', fontWeight: '500', maxWidth: 150 },
  metaLocation: { flex: 1, fontSize: 12.5, color: 'rgba(255,255,255,0.70)', textAlign: 'right' },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginTop: 14, marginBottom: 6 },
  emptyText: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 20 },
  // Skeleton pieces
  skelAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)' },
  skelTitle: { height: 14, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 6, marginBottom: 6, width: '70%' },
  skelTime: { height: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 6, width: '45%' },
  skelPill: { height: 28, width: 70, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', marginLeft: 10 },
  skelUnreg: { height: 30, width: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.15)', marginLeft: 8 },
  skelChip: { height: 26, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)' },
  skelMeta: { height: 14, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 6, marginTop: 10 },
});

export default RegisteredLessonCards;
