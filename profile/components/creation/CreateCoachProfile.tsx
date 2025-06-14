// File: CreateCoachProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useAuth } from '../../../auth/AuthContext';
import { fetchUserInfo } from '../../../auth/services/UserInfoUtils';
import { createCoachProfile } from '../../utils/profileService';
import {
  CoachProfile,
  SupportedLanguage,
} from '../../types/profile';
import LocationField from '../../../integrations/google_location/LocationField';
import LanguageSelector from '../LanguageSelector';
import SkillSelector from '../SkillSelector';
import EducationEditor from '../EducationEditor';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingModal from '../modals/LoadingModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateCoachProfileScreen({ navigation }: { navigation: NavigationProp }) {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CoachProfile>({
    genericProfile: {
      name: '',
      email: '',
      phoneNumber: '',
      userDescription: '',
      location: { city: '', country: '' },
      languages: [],
      profilePictureUrl: null,
    },
    experience: '',
    education: [],
    skills: [],
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      const userInfo = await fetchUserInfo(userId, 'coach');
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

  const updateField = (field: Partial<CoachProfile>) => {
    setFormData((prev) => ({ ...prev, ...field }));
  };

  const updateGeneric = (field: Partial<CoachProfile['genericProfile']>) => {
    setFormData((prev) => ({
      ...prev,
      genericProfile: { ...prev.genericProfile, ...field },
    }));
  };

  const handleSubmit = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const userInfo = await fetchUserInfo(userId, 'coach');
      await createCoachProfile(userInfo.id, formData);
      Alert.alert('Success', 'Coach profile created!', [
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <MaterialIcons name="fitness-center" size={40} color="#1976d2" />
          <Text style={styles.title}>Create Your Coach Profile</Text>
          <Text style={styles.subtitle}>
            Share your expertise and start inspiring others on their journey
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
            keyboardType="phone-pad"
            value={formData.genericProfile.phoneNumber || ''}
            onChangeText={(value) => updateGeneric({ phoneNumber: value })}
          />

          <Text style={styles.label}>About Me</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={4}
            value={formData.genericProfile.userDescription}
            onChangeText={(value) => updateGeneric({ userDescription: value })}
          />

          <Text style={styles.label}>Location</Text>
          <LocationField
            location={formData.genericProfile.location}
            onLocationSelect={(location) => updateGeneric({ location })}
          />

          <Text style={styles.label}>Languages</Text>
          <LanguageSelector
            selectedLanguages={formData.genericProfile.languages as SupportedLanguage[]}
            onAdd={(lang) => updateGeneric({ languages: [...formData.genericProfile.languages, lang] })}
            onRemove={(lang) => updateGeneric({ languages: formData.genericProfile.languages.filter((l) => l !== lang) })}
            editable
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Experience</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={4}
            value={formData.experience}
            onChangeText={(value) => updateField({ experience: value })}
          />

          <Text style={styles.label}>Skills</Text>
          <SkillSelector
            selectedSkills={formData.skills || []}
            onAdd={(skill) => updateField({ skills: [...(formData.skills || []), skill] })}
            onRemove={(skill) => updateField({ skills: formData.skills.filter((s) => s.name !== skill.name) })}
          />

          <Text style={styles.label}>Education</Text>
          <EducationEditor
            educationList={formData.education || []}
            onChange={(newList) => updateField({ education: newList })}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          <MaterialIcons name="check" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>Create Profile</Text>
        </TouchableOpacity>
      </ScrollView>

      <LoadingModal visible={loading} message="Creating your profile..." />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf2fb',
  },
  scrollView: {
    padding: 16,
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
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1976d2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});