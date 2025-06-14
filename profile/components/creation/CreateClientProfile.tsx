import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, TextInput,
  Alert, StyleSheet,
} from 'react-native';
import { Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { createClientProfile } from '../../utils/profileService';
import {
  ClientProfile,
  SupportedHobby,
  SupportedLanguage,
} from '../../types/profile';
import LocationField from '../../../integrations/google_location/LocationField';
import { fetchUserInfo } from '../../../auth/services/UserInfoUtils';
import { useAuth } from '../../../auth/AuthContext';
import HobbySelector from '../HobbySelector';
import LanguageSelector from '../LanguageSelector';
import { RootStackParamList } from '../../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingModal from '../modals/LoadingModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateClientProfileScreen({ navigation }: { navigation: NavigationProp }) {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ClientProfile>({
    genericProfile: {
      name: '',
      email: '',
      userDescription: '',
      location: { city: '', country: '' },
      languages: [],
      profilePictureUrl: null,
    },
    hobbies: [],
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      const userInfo = await fetchUserInfo(userId, 'client');
      setFormData((prev) => ({
        ...prev,
        genericProfile: {
          ...prev.genericProfile,
          name: userInfo.name,
          email: userInfo.email,
        },
      }));
    };
    fetchUser();
  }, [userId]);

  const handleSubmit = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please sign in again.');
      }
      const userInfo = await fetchUserInfo(userId, 'client');
      await createClientProfile(userInfo.id, formData, token);
      Alert.alert('Success', 'Profile created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MainDrawer', { screen: 'Profile' }),
        },
      ]);
    } catch (err) {
      Alert.alert('Error', (err as Error).message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <MaterialIcons name="emoji-people" size={40} color="#1976d2" />
        <Text style={styles.title}>Create Your Client Profile</Text>
        <Text style={styles.subtitle}>
          Tell us about yourself and discover amazing coaches to help you achieve your goals
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={formData.genericProfile.name} editable={false} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={formData.genericProfile.email} editable={false} />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="+1234567890"
          value={formData.genericProfile.phoneNumber || ''}
          onChangeText={(value) =>
            setFormData((prev) => ({
              ...prev,
              genericProfile: { ...prev.genericProfile, phoneNumber: value },
            }))
          }
        />

        <Text style={styles.label}>About Me</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          multiline
          numberOfLines={4}
          value={formData.genericProfile.userDescription}
          onChangeText={(value) =>
            setFormData((prev) => ({
              ...prev,
              genericProfile: { ...prev.genericProfile, userDescription: value },
            }))
          }
        />

        <LocationField
          location={formData.genericProfile.location}
          onLocationSelect={(location) =>
            setFormData((prev) => ({
              ...prev,
              genericProfile: { ...prev.genericProfile, location },
            }))
          }
        />

        <HobbySelector
          selectedHobbies={formData.hobbies as SupportedHobby[]}
          onAdd={(hobby) =>
            setFormData((prev) => ({
              ...prev,
              hobbies: [...prev.hobbies, hobby],
            }))
          }
          onRemove={(hobby) =>
            setFormData((prev) => ({
              ...prev,
              hobbies: prev.hobbies.filter((h) => h !== hobby),
            }))
          }
        />

        <LanguageSelector
          selectedLanguages={formData.genericProfile.languages as SupportedLanguage[]}
          onAdd={(lang) =>
            setFormData((prev) => ({
              ...prev,
              genericProfile: {
                ...prev.genericProfile,
                languages: [...prev.genericProfile.languages, lang],
              },
            }))
          }
          onRemove={(lang) =>
            setFormData((prev) => ({
              ...prev,
              genericProfile: {
                ...prev.genericProfile,
                languages: prev.genericProfile.languages.filter((l) => l !== lang),
              },
            }))
          }
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        disabled={loading}
        style={styles.submitButton}
        labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
      >
        Create Profile
      </Button>

      <LoadingModal visible={loading} message="Creating your profile..." />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#eaf2fb',
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1976d2',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#1976d2',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
