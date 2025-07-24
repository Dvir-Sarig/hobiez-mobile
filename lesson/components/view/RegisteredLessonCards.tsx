import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Platform,
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
  onOpenDeleteModal: (lesson: Lesson) => void;
  isLoading?: boolean;
}

const getCapacityColor = (registered: number, capacity: number): string => {
  const percentage = (registered / capacity) * 100;
  if (percentage >= 90) return '#d32f2f';
  if (percentage >= 70) return '#f57c00';
  return '#2e7d32';
};

const LoadingSkeleton = () => {
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Animated.View style={[styles.avatar, { opacity }]} />
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
        <Animated.View style={[styles.skeletonButton, { opacity }]} />
      </View>
      <Animated.View style={[styles.skeletonDetail, { opacity }]} />
      <Animated.View style={[styles.skeletonDetail, { opacity }]} />
      <Animated.View style={[styles.skeletonDetail, { opacity }]} />
      <Animated.View style={[styles.skeletonDetail, { opacity }]} />
      <Animated.View style={[styles.skeletonDetail, { opacity }]} />
    </View>
  );
};

const RegisteredLessonCards: React.FC<RegisteredLessonCardsProps> = ({
  lessons,
  coachInfoMap,
  onOpenDeleteModal,
  isLoading = false,
}) => {
  const navigation = useNavigation<any>();

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
        <Text style={styles.emptyText}>
          You haven't registered for any lessons yet. Start exploring available lessons!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {lessons.map((lesson) => {
        const coachInfo = coachInfoMap[lesson.coachId];
        const capacityColor = getCapacityColor(
          lesson.registeredCount ?? 0,
          lesson.capacityLimit ?? 0
        );
        const { IconComponent, iconName } = getLessonIcon(lesson.title);
        
        return (
          <View key={lesson.id} style={styles.card}>
            <View style={styles.header}>
              <Avatar.Icon
                size={40}
                icon={() => <IconComponent name={iconName} size={24} color="#fff" />}
                style={styles.avatar}
                color="#4caf50"
              />
              <Text numberOfLines={1} style={styles.title}>
                {lesson.title}
              </Text>
              <TouchableOpacity
                style={styles.unregisterButton}
                onPress={() => onOpenDeleteModal(lesson)}
              >
                <Text style={styles.unregisterText}>Unregister</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.detail}>
                <Icon name="access-time" size={18} style={styles.detailIcon} />
                <Text>{formatLessonTimeReadable(lesson.time)}</Text>
              </View>
              <View style={styles.detail}>
                <Icon name="timer" size={18} style={styles.detailIcon} />
                <Text>{lesson.duration} min</Text>
              </View>
              <View style={styles.detail}>
                <Icon name="attach-money" size={18} style={styles.detailIcon} />
                <Text>{formatPrice(lesson.price)}</Text>
              </View>
              <View style={styles.detail}>
                <Icon name="people" size={18} style={styles.detailIcon} />
                <Text style={{ color: capacityColor }}>
                  {lesson.registeredCount}/{lesson.capacityLimit} registered
                </Text>
              </View>
              {coachInfo && (
                <TouchableOpacity 
                  style={styles.detail}
                  onPress={() => navigation.navigate('CoachProfilePage', { coachId: lesson.coachId })}
                >
                  <Icon name="person" size={18} style={styles.detailIcon} />
                  <Text style={styles.coach}>{coachInfo.name}</Text>
                </TouchableOpacity>
              )}
              {lesson.location && (
                <View style={styles.detail}>
                  <Icon name="location-on" size={18} style={styles.detailIcon} />
                  <Text>
                    {lesson.location.address || `${lesson.location.city}, ${lesson.location.country}`}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 0,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#e8f5e9',
    borderBottomWidth: 1,
    borderBottomColor: '#c8e6c9',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4caf50',
  },
  title: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#2e7d32',
  },
  content: {
    padding: 16,
  },
  detail: {
    fontSize: 15,
    marginTop: 8,
    color: '#424242',
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 8,
    color: '#757575',
  },
  coach: {
    fontSize: 15,
    marginTop: 8,
    color: '#1565c0',
    textDecorationLine: 'none',
    fontWeight: '500',
  },
  unregisterButton: {
    backgroundColor: '#ef5350',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  unregisterText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#424242',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
  },
  skeletonTitle: {
    height: 20,
    width: '60%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonDetail: {
    height: 16,
    width: '80%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 8,
  },
  skeletonButton: {
    height: 32,
    width: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
});

export default RegisteredLessonCards;
