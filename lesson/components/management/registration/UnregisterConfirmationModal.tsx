import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
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
    navigation.navigate('CoachProfilePage', { coachId: lesson.coachId });
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
            <Avatar.Icon icon="alert" size={60} style={styles.avatar} />

            <Text style={styles.title}>Confirm Unregistration</Text>
            <Text style={styles.subtitle}>Your coach already noticed 👀</Text>

            <View style={styles.content}>
              <Text style={styles.mainText}>
                You're about to leave the lesson{' '}
                <Text style={styles.bold}>{lesson.title}</Text>
              </Text>

              {coachInfo?.name && (
                  <TouchableOpacity onPress={handleCoachPress} disabled={isLoading}>
                    <Text style={[styles.secondaryText, isLoading && styles.disabledText]}>
                      Coach:{' '}
                      <Text style={[styles.link, isLoading && styles.disabledText]}>
                        {coachInfo.name}
                      </Text>
                    </Text>
                  </TouchableOpacity>
              )}

              <Text style={styles.secondaryText}>
                Scheduled on{' '}
                <Text style={styles.bold}>{formatLessonTimeReadable(lesson.time)}</Text>
              </Text>

              {lesson.location && (
                  <View style={styles.locationRow}>
                    <Entypo name="location-pin" size={16} color="#666" />
                    <Text style={styles.secondaryText}>
                      {lesson.location.address ||
                          `${lesson.location.city}, ${lesson.location.country}`}
                    </Text>
                  </View>
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.cancelButton, isLoading && styles.disabledButton]} 
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={[styles.cancelText, isLoading && styles.disabledText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.unregisterButton, isLoading && styles.unregisterButtonDisabled]} 
                onPress={handleUnregister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={[styles.unregisterText, styles.loadingText]}>Unregistering...</Text>
                  </View>
                ) : (
                  <>
                    <MaterialIcons name="warning-amber" size={18} color="#fff" />
                    <Text style={styles.unregisterText}> Unregister</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
  );
};

export default UnregisterConfirmationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#ffe082',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#d32f2f',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  content: {
    width: '100%',
    marginBottom: 24,
  },
  mainText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  secondaryText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#444',
    marginTop: 4,
  },
  bold: {
    fontWeight: '600',
  },
  link: {
    color: '#1976d2',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1565c0',
    alignItems: 'center',
  },
  cancelText: {
    color: '#1565c0',
    fontWeight: '600',
  },
  unregisterButton: {
    flex: 1,
    padding: 12,
    marginLeft: 8,
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unregisterText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
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
  },
});
