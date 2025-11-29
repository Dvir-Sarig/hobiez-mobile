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
import { getLessonIcon } from '../../types/LessonType';
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
      <View style={styles.topRow}>
        <Animated.View style={[styles.skelAvatar, { opacity: pulse }]} />
        <View style={styles.titleTimeContainer}>
          <Animated.View style={[styles.skelTitle, { opacity: pulse }]} />
          <Animated.View style={[styles.skelTime, { opacity: pulse }]} />
        </View>
        <Animated.View style={[styles.skelPill, { opacity: pulse }]} />
        <Animated.View style={[styles.skelUnreg, { opacity: pulse }]} />
      </View>
      <View style={styles.detailRowWrap}>
        <Animated.View style={[styles.skelChip, { opacity: pulse, width: 90 }]} />
        <Animated.View style={[styles.skelChip, { opacity: pulse, width: 70 }]} />
        <Animated.View style={[styles.skelChip, { opacity: pulse, width: 70 }]} />
      </View>
      <View style={styles.metaRow}>        
        <Animated.View style={[styles.skelMeta, { opacity: pulse, width: '40%' }]} />
        <Animated.View style={[styles.skelMeta, { opacity: pulse, width: '50%' }]} />
      </View>
    </View>
  );
};

// Single card item component (isolates hooks per item, avoiding hooks inside loops)
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

  // Hook now at top level of component (valid)
  const scaleRef = useRef(new Animated.Value(1));
  const scale = scaleRef.current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  const originScreen = navigation.getState()?.routes?.[navigation.getState().routes.length - 1]?.name;

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>            
      <Pressable
        style={styles.pressable}
        android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onLongPress={() => onOpenDeleteModal(lesson)}
      >
        <View style={styles.topRow}>
          <Avatar.Icon
            size={42}
            icon={() => <IconComponent name={iconName} size={22} color="#fff" />}
            style={styles.lessonIcon}
          />
          <View style={styles.titleTimeContainer}>
            <Text numberOfLines={1} style={styles.title}>{lesson.title}</Text>
            <Text style={styles.time}>🕒 {formatLessonTimeReadable(lesson.time)}</Text>
          </View>
          <View style={[styles.capacityPill, { borderColor: capColor }]}>                  
            <Text style={[styles.capacityText, { color: capColor }]}>👥 {registered}/{capacity}</Text>
          </View>
          <TouchableOpacity
            style={styles.unregisterIconBtn}
            onPress={() => onOpenDeleteModal(lesson)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="close" size={18} color="rgba(255,255,255,0.75)" />
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

        <View style={styles.metaRow}>                
          <TouchableOpacity onPress={() => navigation.navigate('CoachProfilePage', { coachId: lesson.coachId, originScreen: 'SearchLessons', originTab: 'registered', returnScrollY })}>
            <Text numberOfLines={1} style={styles.metaCoach}>👤 {coachName}</Text>
          </TouchableOpacity>
          {locationText ? (
            <Text numberOfLines={1} style={styles.metaLocation}>📍 {locationText}</Text>
          ) : null}
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
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  lessonIcon: { backgroundColor: '#1976d2' },
  titleTimeContainer: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: '600', letterSpacing: 0.2, color: '#fff', marginBottom: 2 },
  time: { fontSize: 12.5, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  capacityPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  capacityText: { fontSize: 12, fontWeight: '600' },
  unregisterIconBtn: {
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
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
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
  detailChipText: { fontSize: 12.5, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
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
