// Converted React Native version of Coach Profile Dashboard
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { fetchCoachProfile, updateCoachProfile } from '../../utils/profileService';
import { CoachProfile } from '../../types/profile';
import CoachProfileView from '../view/CoachProfileView';
import CoachProfileEditForm from './CoachProfileEditForm';
import { useAuth } from '../../../auth/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CoachProfileDashboard() {
  const navigation = useNavigation<NavigationProp>();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [editData, setEditData] = useState<Partial<CoachProfile>>({});
  const [editMode, setEditMode] = useState(false);

  const fetchProfile = async () => {
    try {
      if (!userId) {
        throw new Error('Missing user ID');
      }

      const profileData = await fetchCoachProfile(userId);
      setProfile(profileData);
      if (profileData) {
        setEditData(profileData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load profile when component mounts
  useEffect(() => {
    fetchProfile();
  }, []);

  // Reload profile when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!userId) {
        throw new Error('Missing user ID');
      }

      await updateCoachProfile(userId, editData as CoachProfile);
      
      // Fetch the updated profile
      const updatedProfile = await fetchCoachProfile(userId);
      if (updatedProfile) {
        setProfile(updatedProfile);
        setEditMode(false);
      } else {
        throw new Error('Failed to fetch updated profile');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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

  if (!profile) {
    return (
      <View style={styles.centered}>
        <View style={styles.noProfileContainer}>
          <Text style={styles.noProfileTitle}>Ready to Coach?</Text>
          <Text style={styles.noProfileDescription}>
            Create your professional coach profile to showcase your expertise
            and start connecting with new clients today.
          </Text>
          <TouchableOpacity 
            style={styles.createProfileButton}
            onPress={() => navigation.navigate('CreateCoachProfile')}
          >
            <Text style={styles.createProfileButtonText}>Create Your Coach Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {editData && profile && editMode ? (
        <CoachProfileEditForm
          editData={editData as CoachProfile}
          onChange={(updated) => setEditData(updated)}
          onSave={handleSave}
          onCancel={() => setEditMode(false)}
          loading={saving}
        />
      ) : (
        <CoachProfileView
          profileData={profile}
          onEditClick={() => {
            setEditData(profile);
            setEditMode(true);
          }}
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
  label: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    backgroundColor: 'white',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: '500',
  },
  noProfileContainer: {
    backgroundColor: '#1565c0',
    padding: 20,
    borderRadius: 16,
    width: '90%',
    maxWidth: 600,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  noProfileTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  noProfileDescription: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  createProfileButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createProfileButtonText: {
    color: '#1565c0',
    fontSize: 16,
    fontWeight: '600',
  },
});
