import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
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
}

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
        <View style={styles.headerTextContainer}>
          <Animated.View style={[styles.skeletonTitle, { opacity }]} />
          <Animated.View style={[styles.skeletonTime, { opacity }]} />
        </View>
        <Animated.View style={[styles.skeletonButton, { opacity }]} />
      </View>
      <View style={styles.details}>
        <Animated.View style={[styles.skeletonDetail, { opacity }]} />
        <Animated.View style={[styles.skeletonDetail, { opacity }]} />
      </View>
    </View>
  );
};

const ClientLessonCards: React.FC<ClientLessonCardsProps> = ({
  lessons,
  coachInfoMap,
  onOpenLessonModal,
  isLoading = false,
}) => {
  const navigation = useNavigation<any>();

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
      {lessons
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        .map((lesson) => {
          const coachInfo = coachInfoMap[lesson.coachId];
          const coachName = coachInfo?.name || 'Loading...';
          const { IconComponent, iconName } = getLessonIcon(lesson.title);

          return (
            <View key={lesson.id} style={styles.card}>
              <View style={styles.header}>
                <Avatar.Icon
                  size={40}
                  icon={() => <IconComponent name={iconName} size={24} color="#fff" />}
                  style={{ backgroundColor: '#1976d2' }}
                />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.title}>{lesson.title}</Text>
                  <Text style={styles.time}>{formatLessonTimeReadable(lesson.time)}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => onOpenLessonModal(lesson)}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.details}>
                <TouchableOpacity onPress={() => navigation.navigate('CoachProfilePage', { coachId: lesson.coachId })}>
                  <Text style={styles.coach}>👤 {coachName}</Text>
                </TouchableOpacity>
                <Text style={styles.capacity}>👥 {lesson.registeredCount ?? 0}/{lesson.capacityLimit ?? 0}</Text>
              </View>
              <View style={styles.locationRow}>
                <Text style={styles.location}>
                  📍 {lesson.location?.address
                     ? lesson.location.address
                     : [lesson.location?.city, lesson.location?.country].filter(Boolean).join(', ')
                   }
                 </Text>
                </View>
            </View>
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 14,
    color: '#546e7a',
  },
  details: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coach: {
    fontSize: 14,
    color: '#1565c0',
  },
  capacity: {
    fontSize: 14,
    color: '#546e7a',
  },
  viewButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  noResultsContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    margin: 16,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#546e7a',
    textAlign: 'center',
    lineHeight: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#90caf9',
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: '#90caf9',
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonTime: {
    height: 14,
    width: '60%',
    backgroundColor: '#90caf9',
    borderRadius: 4,
  },
  skeletonButton: {
    width: 60,
    height: 24,
    backgroundColor: '#90caf9',
    borderRadius: 6,
  },
  skeletonDetail: {
    height: 14,
    width: '40%',
    backgroundColor: '#90caf9',
    borderRadius: 4,
    marginTop: 8,
  },
  locationRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 13,
    color: '#757575',
    flexShrink: 1,
  },
});

export default ClientLessonCards;
