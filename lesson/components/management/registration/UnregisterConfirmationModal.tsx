import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Lesson } from '../../../../lesson/types/Lesson';
import { formatLessonTimeReadable } from '../../../../shared/services/formatService';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import { Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

interface Props {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  coachInfo?: { name: string };
}

const UnregisterConfirmationModal: React.FC<Props> = ({
  lesson,
  isOpen,
  onClose,
  onConfirm,
  coachInfo,
}) => {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);

  if (!lesson) return null;

  const handleCoachPress = () => {
    onClose();
    navigation.navigate('CoachProfilePage', { coachId: lesson.coachId, fromUnregisterModal: true, lessonId: lesson.id });
  };

  const handleUnregister = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Avatar.Icon 
              icon="alert" 
              size={50} 
              style={styles.avatar}
              color="#fff"
            />
            <Text style={styles.title}>Confirm Unregistration</Text>
            <Text style={styles.subtitle}>Are you sure you want to leave this lesson?</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              
              <View style={styles.infoRow}>
                <MaterialIcons name="access-time" size={20} color="#666" />
                <Text style={styles.infoText}>
                  {formatLessonTimeReadable(lesson.time)}
                </Text>
              </View>

              {coachInfo?.name && (
                <TouchableOpacity 
                  style={styles.coachRow} 
                  onPress={handleCoachPress} 
                  disabled={isLoading}
                >
                  <MaterialIcons name="person" size={20} color="#666" />
                  <Text style={styles.infoText}>
                    Coach: <Text style={styles.coachName}>{coachInfo.name}</Text>
                  </Text>
                </TouchableOpacity>
              )}

              {lesson.location && (
                <View style={styles.infoRow}>
                  <Entypo name="location-pin" size={20} color="#666" />
                  <Text style={styles.infoText}>
                    {lesson.location.address || `${lesson.location.city}, ${lesson.location.country}`}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton, isLoading && styles.disabledButton]} 
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.unregisterButton, isLoading && styles.unregisterButtonDisabled]} 
                onPress={handleUnregister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={[styles.buttonText, styles.loadingText]}>Unregistering...</Text>
                  </View>
                ) : (
                  <>
                    <MaterialIcons name="exit-to-app" size={20} color="#fff" />
                    <Text style={[styles.buttonText, styles.unregisterText]}> Unregister</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    backgroundColor: '#fff3e0',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe0b2',
  },
  avatar: {
    backgroundColor: '#ff9800',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e65100',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  lessonInfo: {
    marginBottom: 24,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 8,
  },
  coachName: {
    color: '#1976d2',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  unregisterButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    color: '#666',
  },
  unregisterText: {
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  unregisterButtonDisabled: {
    backgroundColor: '#ef9a9a',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: '#fff',
  },
});

export default UnregisterConfirmationModal;
