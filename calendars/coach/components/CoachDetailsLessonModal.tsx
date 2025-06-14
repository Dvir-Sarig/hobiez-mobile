import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import { Lesson } from '../../../lesson/types/Lesson';
import { formatPrice } from '../../../shared/services/formatService';

interface Props {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lessonId: number) => void;
}

const CoachDetailsLessonModal: React.FC<Props> = ({
  lesson,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!lesson) return null;

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Lesson Details</Text>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>

            <DetailRow icon="calendar-month" color="green" text={dayjs(lesson.time).format('MMM DD, YYYY HH:mm')} />

            {lesson.location && (
              <DetailRow
                icon="location-on"
                color="#1976d2"
                text={lesson.location.address || `${lesson.location.city}, ${lesson.location.country}`}
              />
            )}

            <DetailRow icon="access-time" color="gray" text={`${lesson.duration} min`} />
            <DetailRow icon="attach-money" color="green" text={formatPrice(lesson.price)} />
            <DetailRow
              icon="people-alt"
              color="#1976d2"
              text={`${lesson.registeredCount ?? '–'} / ${lesson.capacityLimit ?? '–'} Registered`}
            />
            <DetailRow icon="info" color="#0288d1" text={lesson.description} />
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.editButton} onPress={() => onEdit(lesson)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(lesson.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DetailRow = ({
  icon,
  color,
  text
}: {
  icon: string;
  color: string;
  text: string | undefined;
}) => (
  <View style={styles.row}>
    <Icon name={icon} size={20} color={color} style={{ marginRight: 8 }} />
    <Text style={styles.text}>{text}</Text>
  </View>
);

export default CoachDetailsLessonModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '85%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1976d2'
  },
  content: {
    paddingBottom: 16
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  text: {
    fontSize: 16,
    flex: 1,
    color: '#333'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
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
  actionRow: {
    flexDirection: 'row',
    gap: 8
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderColor: '#1976d2',
    borderWidth: 1,
    marginRight: 8
  },
  editText: {
    color: '#1976d2',
    fontSize: 16,
    fontWeight: '600'
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#d32f2f',
    borderRadius: 6
  },
  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
