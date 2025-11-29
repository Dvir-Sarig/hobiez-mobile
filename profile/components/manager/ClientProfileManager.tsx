import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchClientProfile, updateClientProfile } from '../../utils/profileService';
import { ClientProfile } from '../../types/profile';
import { useAuth } from '../../../auth/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import ClientProfileView from '../view/ClientProfileView';
import ClientProfileEditForm from './ClientProfileEditForm';
import DeleteAccountModal from '../modals/DeleteAccountModal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  button: {
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
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#1976d2',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: 'red',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeCard: {
    width: '100%',
    maxWidth: 600,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardBackground: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#1976d2',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ClientProfileDashboardScreen() {
  const { userId, signOut } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [editData, setEditData] = useState<ClientProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchProfile = async () => {
    try {
      if (!userId) {
        throw new Error('Missing user ID');
      }

      const profileData = await fetchClientProfile(userId);
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
      if (!userId || !editData) {
        throw new Error('Missing user ID or profile data');
      }

      await updateClientProfile(userId, editData);
      
      // Fetch the updated profile
      const updatedProfile = await fetchClientProfile(userId);
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

  if (loading) return <ActivityIndicator style={styles.centered} size="large" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  if (!profile) {
    return (
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeCard}>
          <View style={styles.cardBackground}>
            <Text style={styles.welcomeText}>Welcome!</Text>
            <Text style={styles.welcomeSubtext}>
              You haven't created your profile yet. Set up your details to start discovering new training opportunities and connect with coaches.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('CreateClientProfile')}
            >
              <Text style={styles.buttonText}>Create Your Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Delete Account Modal */}
        <DeleteAccountModal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onAccountDeleted={handleAccountDeleted}
          userType="client"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {editData && profile && editMode ? (
        <ClientProfileEditForm
          editData={editData}
          onChange={(updated) => setEditData(updated)}
          onSave={handleSave}
          onCancel={() => setEditMode(false)}
          loading={saving}
        />
      ) : (
        <>
          <ClientProfileView
            profileData={profile}
            onEditClick={() => {
              setEditData(profile);
              setEditMode(true);
            }}
          />
        </>
      )}

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isVisible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onAccountDeleted={handleAccountDeleted}
        userType="client"
      />
    </View>
  );
}
