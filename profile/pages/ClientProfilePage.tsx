import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchPublicClientProfile } from '../utils/profileService';
import { ClientProfile } from '../types/profile';
import ClientProfileView from '../components/view/ClientProfileView';
import NoProfileModal from '../components/modals/NoProfileModal';
import { DrawerActions } from '@react-navigation/native';

export default function ClientProfilePage() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const clientId = route.params?.clientId;
  const fromRegisteredClientsModal = route.params?.fromRegisteredClientsModal;
  const lessonId = route.params?.lessonId;
  const originScreen = route.params?.originScreen; // optionally provided

  const [profileData, setProfileData] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNoProfileModal, setShowNoProfileModal] = useState(false);

  const handleNoProfileClose = () => {
    setShowNoProfileModal(false);
    if (fromRegisteredClientsModal && lessonId) {
      // Decide destination based on originScreen (calendar vs lessons)
      if (originScreen === 'CoachCalendar') {
        navigation.navigate('CoachCalendar', { openCoachCalendarLessonModal: true, lessonId });
      } else {
        navigation.navigate('CoachLessons', { openCoachLessonModal: true, lessonId });
      }
      return;
    }
    if (originScreen) {
      navigation.navigate(originScreen);
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (!clientId) throw new Error('No client ID provided');
        const profile = await fetchPublicClientProfile(clientId);
        const invalid = !profile || (profile && Object.keys(profile).length === 0); // removed id property requirement
        if (invalid) {
          setProfileData(null);
          setShowNoProfileModal(true);
        } else {
          setProfileData(profile as ClientProfile);
          setShowNoProfileModal(false);
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        if (error?.message?.toLowerCase().includes('not found')) {
          setProfileData(null);
            setShowNoProfileModal(true);
            setError(null);
        } else {
          setError(error.message || 'An error occurred while fetching profile data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [clientId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!profileData && !isLoading) {
        setShowNoProfileModal(true);
      }
    });
    return unsubscribe;
  }, [navigation, profileData, isLoading]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Client Profile',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.headerButton}
        >
          <MaterialIcons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: '#0d47a1',
      },
      headerTintColor: '#fff',
    });
  }, [navigation, profileData]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {fromRegisteredClientsModal && lessonId && (
        <TouchableOpacity
          style={styles.returnIconButton}
          onPress={() => {
            if (originScreen === 'CoachCalendar') {
              navigation.navigate('CoachCalendar', { openCoachCalendarLessonModal: true, lessonId });
            } else {
              navigation.navigate('CoachLessons', { openCoachLessonModal: true, lessonId });
            }
          }}
          accessibilityLabel="Return to registered clients"
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={26} color="#1976d2" />
        </TouchableOpacity>
      )}
      {profileData ? (
        <ClientProfileView profileData={profileData} />
      ) : (
        <NoProfileModal
          isOpen={showNoProfileModal}
          onClose={handleNoProfileClose}
          userType='client'
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: '500',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 4,
  },
  returnIconButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 18,
    padding: 4,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
});
