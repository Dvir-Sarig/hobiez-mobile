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
import { fetchPublicCoachProfile } from '../utils/profileService';
import { CoachProfile } from '../types/profile';
import ProfileView from '../components/view/CoachProfileView';
import NoProfileModal from '../components/modals/NoProfileModal';
import { DrawerActions } from '@react-navigation/native';

export default function CoachProfilePage() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const coachId = route.params?.coachId;

  const [profileData, setProfileData] = useState<CoachProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNoProfileModal, setShowNoProfileModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (!coachId) throw new Error('No coach ID provided');
        const profile = await fetchPublicCoachProfile(coachId);
        if (!profile) {
          setShowNoProfileModal(true);
        } else {
          setProfileData(profile as CoachProfile);
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        setError(error.message || 'An error occurred while fetching profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [coachId]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Coach Profile',
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
      {profileData ? (
        <ProfileView profileData={profileData} />
      ) : (
        <NoProfileModal
          isOpen={showNoProfileModal}
          onClose={() => navigation.goBack()}
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
});
