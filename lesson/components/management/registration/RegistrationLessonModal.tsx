import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Lesson } from '../../../types/Lesson';
import { formatPrice } from '../../../../shared/services/formatService';
import { MaterialIcons, FontAwesome5, Ionicons, Entypo } from '@expo/vector-icons';
import { RootStackParamList } from '../../../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  lesson: Lesson | null;
  coachInfo?: { name: string };
  isOpen: boolean;
  onClose: () => void;
  onRegister: (lessonId: number) => void;
  onOpenCoachModal: (coachId: number) => void;
}

const getCapacityColor = (registered: number, limit: number): string => {
  const ratio = registered / limit;
  if (ratio >= 0.9) return '#d32f2f'; // red
  if (ratio >= 0.5) return '#ed6c02'; // orange
  return '#2e7d32'; // green
};

const RegistrationLessonModal: React.FC<Props> = ({
  lesson,
  coachInfo,
  isOpen,
  onClose,
  onRegister,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const [isLoading, setIsLoading] = useState(false);

  if (!lesson) return null;

  const handleCoachPress = () => {
    onClose();
    navigation.navigate('CoachProfilePage', { coachId: lesson.coachId });
  };

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      await onRegister(lesson.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#555" />
          </TouchableOpacity>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>{lesson.title}</Text>

            <View style={styles.infoContainer}>
              <InfoRow icon={<MaterialIcons name="description" size={20} color="#1976d2" />} label="Description" value={lesson.description} />
              <InfoRow icon={<MaterialIcons name="access-time" size={20} color="#1976d2" />} label="Time" value={new Date(lesson.time).toLocaleString()} />
              {lesson.location && (
                <InfoRow
                  icon={<Entypo name="location-pin" size={20} color="#1976d2" />}
                  label="Location"
                  value={lesson.location.address || `${lesson.location.city}, ${lesson.location.country}`}
                />
              )}
              <InfoRow icon={<Ionicons name="timer-outline" size={20} color="#1976d2" />} label="Duration" value={`${lesson.duration} minutes`} />
              <InfoRow icon={<MaterialIcons name="attach-money" size={20} color="#1976d2" />} label="Price" value={formatPrice(lesson.price)} />
              <InfoRow
                icon={<MaterialIcons name="person" size={20} color="#1976d2" />}
                label="Coach"
                value={
                  <TouchableOpacity onPress={handleCoachPress}>
                    <Text style={styles.link}>{coachInfo?.name || 'Loading...'}</Text>
                  </TouchableOpacity>
                }
              />
              <InfoRow
                icon={<FontAwesome5 name="users" size={18} color="#1976d2" />}
                label="Participants"
                value={
                  <Text style={{ color: getCapacityColor(lesson.registeredCount ?? 0, lesson.capacityLimit ?? 0), fontWeight: '500' }}>
                    {lesson.registeredCount ?? 0} / {lesson.capacityLimit ?? 0} registered
                  </Text>
                }
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.registerBtn, isLoading && styles.registerBtnDisabled]} 
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={[styles.registerText, styles.loadingText]}>Registering...</Text>
                  </View>
                ) : (
                  <Text style={styles.registerText}>Register for Lesson</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={onClose} 
                disabled={isLoading}
              >
                <Text style={[styles.cancelText, isLoading && styles.cancelTextDisabled]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode | string;
}) => (
  <View style={styles.infoRow}>
    <View style={styles.iconWrapper}>{icon}</View>
    <View style={styles.infoContent}>
      <Text style={styles.label}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={styles.value}>{value}</Text>
      ) : (
        value
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '92%',
    maxHeight: '90%',
    backgroundColor: '#f0f7ff',
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  scrollContent: {
    paddingBottom: 32,
  },
  closeIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1565c0',
    textAlign: 'center',
    marginBottom: 28,
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    marginRight: 14,
    marginTop: 2,
    backgroundColor: '#e3f2fd',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    color: '#1976d2',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  link: {
    fontSize: 16,
    color: '#1976d2',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 8,
  },
  registerBtn: {
    backgroundColor: '#1565c0',
    paddingVertical: 16,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#1565c0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  registerText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  cancelText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
    fontWeight: '500',
  },
  registerBtnDisabled: {
    backgroundColor: '#90caf9',
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
  cancelTextDisabled: {
    opacity: 0.5,
  },
});

export default RegistrationLessonModal;
