import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { Lesson } from '../../../types/Lesson';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

interface DeleteConfirmationModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  isDeleting?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting = false
}) => {
  if (!lesson) return null;

  const formatLessonTimeReadable = (time: string) => {
    try {
      return format(new Date(time), 'MMMM dd, yyyy - HH:mm');
    } catch {
      return time;
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="trash-outline" size={32} color="#fff" />
            </View>
            <Text style={styles.title}>Delete Lesson</Text>
            <Text style={styles.subtitle}>
              Are you sure you want to delete this lesson? This action cannot be undone.
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  {formatLessonTimeReadable(lesson.time)}
                </Text>
              </View>

              {lesson.description && (
                <View style={styles.detailRow}>
                  <Ionicons name="document-text-outline" size={20} color="#666" />
                  <Text style={styles.detailText} numberOfLines={2}>
                    {lesson.description}
                  </Text>
                </View>
              )}

              {lesson.location && (
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <Text style={styles.detailText}>
                    {lesson.location.address || `${lesson.location.city}, ${lesson.location.country}`}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              disabled={isDeleting}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.buttonPressed
              ]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            
            <Pressable
              onPress={onConfirmDelete}
              disabled={isDeleting}
              style={({ pressed }) => [
                styles.button,
                styles.deleteButton,
                pressed && styles.buttonPressed
              ]}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.deleteButtonText}>Delete Lesson</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    backgroundColor: '#d32f2f',
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  lessonInfo: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default DeleteConfirmationModal;
