import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { Lesson } from '../../../types/Lesson';
import { formatLessonTimeReadable, formatPrice } from '../../../../shared/services/formatService';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

interface RegisteredLessonsListProps {
  registeredLessons: Lesson[];
  onOpenCoachModal: (coachId: string) => void;
  onOpenDeleteModal: (lesson: Lesson) => void;
  coachInfoMap: { [key: string]: { name: string; email: string } };
}

const getLessonIcon = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes('yoga')) return <MaterialCommunityIcons name="meditation" size={20} color="#fff" />;
  if (lower.includes('tennis')) return <FontAwesome5 name="table-tennis" size={20} color="#fff" />;
  return <Ionicons name="calendar-outline" size={20} color="#fff" />;
};

const RegisteredLessonsList: React.FC<RegisteredLessonsListProps> = ({
                                                                       registeredLessons,
                                                                       onOpenCoachModal,
                                                                       onOpenDeleteModal,
                                                                       coachInfoMap,
                                                                     }) => {
  const navigation = useNavigation<any>();

  const renderLesson = ({ item }: { item: Lesson }) => {
    const coachName = coachInfoMap[item.coachId]?.name || 'טוען...';

    return (
        <View style={styles.card}>
          <View style={styles.row}>
            {getLessonIcon(item.title)}
            <View style={styles.lessonInfo}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.time}>{formatLessonTimeReadable(item.time)}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CoachProfile', { coachId: item.coachId })}>
                <Text style={styles.coachLink}>מאמן: {coachName}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => onOpenDeleteModal(item)} style={styles.unregisterBtn}>
              <Text style={styles.unregisterText}>ביטול רישום</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.details}>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.secondary}>
              משך: {item.duration} דק׳ | מחיר: {formatPrice(item.price)} | תפוסה: {item.capacityLimit} | רשומים: {item.registeredCount}
            </Text>
          </View>
        </View>
    );
  };

  return (
      <View style={{ padding: 16 }}>
        <Text style={styles.header}>השיעורים שנרשמתי אליהם</Text>
        {registeredLessons.length === 0 ? (
            <Text style={styles.emptyText}>אינך רשום לאף שיעור.</Text>
        ) : (
            <FlatList
                data={registeredLessons}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderLesson}
            />
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 12,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#1565c0',
    marginEnd: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  time: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  coachLink: {
    fontSize: 13,
    color: '#1565c0',
    marginTop: 2,
    textDecorationLine: 'underline',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  unregisterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d32f2f',
  },
  unregisterText: {
    color: '#d32f2f',
    fontWeight: '500',
  },
  details: {
    marginTop: 12,
    paddingStart: 52,
  },
  description: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  secondary: {
    fontSize: 12,
    color: '#666',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default RegisteredLessonsList;
