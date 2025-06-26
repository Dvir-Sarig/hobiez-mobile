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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { fetchCoachProfile, updateCoachProfile } from '../../utils/profileService';
import { CoachProfile } from '../../types/profile';
import CoachProfileView from '../view/CoachProfileView';
import CoachProfileEditForm from './CoachProfileEditForm';
import DeleteAccountModal from '../modals/DeleteAccountModal';
import { useAuth } from '../../../auth/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CoachProfileDashboard() {
  const navigation = useNavigation<NavigationProp>();
  const { userId, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [editData, setEditData] = useState<Partial<CoachProfile>>({});
  const [editMode, setEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleAccountDeleted = () => {
    // Sign out and let the App.tsx handle navigation based on auth state
    signOut();
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
        <>
          <CoachProfileView
            profileData={profile}
            onEditClick={() => {
              setEditData(profile);
              setEditMode(true);
            }}
          />
          
          {/* Delete Account Button */}
          <View style={styles.deleteButtonContainer}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setShowDeleteModal(true)}
            >
              <Ionicons name="trash" size={20} color="#dc3545" />
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isVisible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onAccountDeleted={handleAccountDeleted}
        userType="coach"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  noProfileContainer: {
    backgroundColor: '#1565c0',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    maxWidth: 400,
    marginHorizontal: 20,
  },
  noProfileTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  noProfileDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  createProfileButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createProfileButtonText: {
    color: '#1565c0',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#dc3545',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  deleteButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
