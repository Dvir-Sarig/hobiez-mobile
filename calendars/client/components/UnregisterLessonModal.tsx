import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { Lesson } from '../../../lesson/types/Lesson';
import { formatPrice } from '../../../shared/services/formatService';
import UnregisterConfirmationModal from '../../../lesson/components/management/registration/UnregisterConfirmationModal';

interface Props {
  lesson: Lesson | null;
  coachInfoMap: { [key: number]: { name: string; email: string } };
  isOpen: boolean;
  onClose: () => void;
  onUnregister: (lessonId: number) => void;
}

const UnregisterLessonModal: React.FC<Props> = ({
  lesson,
  coachInfoMap,
  isOpen,
  onClose,
  onUnregister
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  if (!lesson) return null;

  const coach = coachInfoMap[lesson.coachId];

  const handleUnregisterPress = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmUnregister = async () => {
    try {
      await onUnregister(lesson.id);
      setShowConfirmationModal(false);
      onClose();
    } catch (error) {
      console.error('Error unregistering:', error);
    }
  };

  return (
    <>
      <Modal visible={isOpen && !showConfirmationModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Lesson Details</Text>
            <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>

              <View style={styles.row}>
                <Icon name="calendar-today" size={20} color="green" />
                <Text style={styles.text}>
                  {dayjs(lesson.time).format('MMM DD, YYYY HH:mm')}
                </Text>
              </View>

              {lesson.location && (
                <View style={styles.row}>
                  <Icon name="location-on" size={20} color="gray" />
                  <Text style={styles.text}>
                    {lesson.location.address || `${lesson.location.city}, ${lesson.location.country}`}
                  </Text>
                </View>
              )}

              <View style={styles.row}>
                <Icon name="access-time" size={20} color="gray" />
                <Text style={styles.text}>{lesson.duration} min</Text>
              </View>

              <View style={styles.row}>
                <Icon name="attach-money" size={20} color="green" />
                <Text style={styles.text}>{formatPrice(lesson.price)}</Text>
              </View>

              <View style={styles.row}>
                <Icon name="people-alt" size={20} color="#1976d2" />
                <Text style={styles.text}>
                  {lesson.registeredCount ?? '–'}/{lesson.capacityLimit ?? '–'} Registered
                </Text>
              </View>

              {coach && (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => {
                    onClose();
                    navigation.navigate('MainDrawer', {
                      screen: 'CoachProfilePage',
                      params: { coachId: lesson.coachId }
                    });
                  }}
                >
                  <Icon name="person" size={20} color="#1976d2" />
                  <Text style={[styles.text, styles.coachLink]}>Coach: {coach.name}</Text>
                </TouchableOpacity>
              )}

              <Text style={[styles.text, { marginTop: 10, color: '#777' }]}>
                You are registered for this lesson. If you can't attend, you may unregister below.
              </Text>
            </ScrollView>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.unregisterButton}
                onPress={handleUnregisterPress}
              >
                <Text style={styles.unregisterText}>Unregister</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <UnregisterConfirmationModal
        lesson={lesson}
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmUnregister}
        coachInfo={coach}
      />
    </>
  );
};

export default UnregisterLessonModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '85%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8
  },
  text: {
    fontSize: 16,
    marginLeft: 8
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 6
  },
  cancelText: {
    fontSize: 16,
    color: '#333'
  },
  unregisterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#d32f2f',
    borderRadius: 6
  },
  unregisterText: {
    fontSize: 16,
    color: '#fff'
  },
  content: {
    paddingBottom: 16
  },
  coachLink: {
    color: '#1976d2',
  },
});
