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
import ImagePickerComponent from '../../../shared/compenents/ImagePicker';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import LoadingModal from '../modals/LoadingModal';
import { validateCoachProfile, firstError } from '../../utils/validation';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [errors, setErrors] = useState<Record<string,string>>({});

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
    const validation = validateCoachProfile(formData);
    setErrors(validation.errors);
    if (!validation.valid) {
      Alert.alert('Validation', firstError(validation.errors) || 'Please fix errors');
      return;
    }
    setLoading(true);
    try {
      const userInfo = await fetchUserInfo(userId, 'coach');
      await createCoachProfile(userInfo.id, formData);
      navigation.navigate('MainDrawer', { screen: 'Profile' });
    } catch (err) {
      Alert.alert('Error', (err as Error).message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0d47a1','#1976d2','#42a5f5']} style={{flex:1}} start={{x:0,y:0}} end={{x:1,y:1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex:1}}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <View style={styles.avatarWrapper}>
              <MaterialIcons name="fitness-center" size={40} color="#1976d2" />
            </View>
            <Text style={styles.title}>Create Your Coach Profile</Text>
            <Text style={styles.subtitle}>
              Share your expertise and start inspiring others on their journey
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Basic Info</Text>
            <Text style={styles.label}>Profile Picture</Text>
            <ImagePickerComponent
              currentImageUrl={formData.genericProfile.profilePictureUrl}
              onImageChange={(imageUrl) => updateGeneric({ profilePictureUrl: imageUrl })}
              size={120}
            />

            <View style={styles.readonlyGroup}>  
              <Text style={styles.smallLabel}>Name</Text>
              <View style={styles.readonlyPill}><Text style={styles.readonlyText}>{formData.genericProfile.name || 'Loading...'}</Text></View>
            </View>
            <View style={styles.readonlyGroup}>  
              <Text style={styles.smallLabel}>Email</Text>
              <View style={styles.readonlyPill}><Text style={styles.readonlyText}>{formData.genericProfile.email || 'Loading...'}</Text></View>
            </View>

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, errors['genericProfile.phoneNumber'] && styles.inputError]}
              placeholder="e.g. +1234567890"
              placeholderTextColor="#90a4ae"
              keyboardType="phone-pad"
              value={formData.genericProfile.phoneNumber || ''}
              onChangeText={(value) => updateGeneric({ phoneNumber: value })}
            />
            {errors['genericProfile.phoneNumber'] && <Text style={styles.errorText}>{errors['genericProfile.phoneNumber']}</Text>}

            <Text style={styles.label}>About Me</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors['genericProfile.userDescription'] && styles.inputError]}
              multiline
              numberOfLines={4}
              placeholder="Describe your coaching style and background..."
              placeholderTextColor="#90a4ae"
              value={formData.genericProfile.userDescription}
              onChangeText={(value) => updateGeneric({ userDescription: value })}
            />
            {errors['genericProfile.userDescription'] && <Text style={styles.errorText}>{errors['genericProfile.userDescription']}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Location</Text>
            <LocationField
              location={formData.genericProfile.location}
              onLocationSelect={(location) => updateGeneric({ location })}
              hideLabel
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Skills</Text>
            <SkillSelector
              selectedSkills={formData.skills || []}
              onAdd={(skill) => updateField({ skills: [...(formData.skills || []), skill] })}
              onRemove={(skill) => updateField({ skills: (formData.skills || []).filter((s) => s !== skill) })}
              hideLabel
            />
            {errors['skills'] && <Text style={styles.errorText}>{errors['skills']}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Experience</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors['experience'] && styles.inputError]}
              multiline
              numberOfLines={4}
              placeholder="Share relevant coaching experience..."
              placeholderTextColor="#90a4ae"
              value={formData.experience}
              onChangeText={(value) => updateField({ experience: value })}
            />
            {errors['experience'] && <Text style={styles.errorText}>{errors['experience']}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Education</Text>
            <EducationEditor
              educationList={formData.education || []}
              onChange={(newList) => updateField({ education: newList })}
              hideTitle
            />
            {Object.keys(errors).some(k => k.startsWith('education.')) && (
              <Text style={styles.errorText}>Please complete required education fields</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Languages</Text>
            <LanguageSelector
              selectedLanguages={formData.genericProfile.languages as SupportedLanguage[]}
              onAdd={(lang) => updateGeneric({ languages: [...formData.genericProfile.languages, lang] })}
              onRemove={(lang) => updateGeneric({ languages: formData.genericProfile.languages.filter((l) => l !== lang) })}
              editable
              hideHeader
            />
            {errors['genericProfile.languages'] && <Text style={styles.errorText}>{errors['genericProfile.languages']}</Text>}
          </View>

          <View style={{height:90}} />
        </ScrollView>

        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.primaryFab} disabled={loading} onPress={handleSubmit}>
            <Text style={styles.fabText}>{loading ? 'Creating...' : 'Create Profile'}</Text>
          </TouchableOpacity>
        </View>

        <LoadingModal visible={loading} message="Creating your profile..." />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex:1 },
  scrollContainer:{ padding:20, paddingBottom:0 },
  headerContainer: { alignItems:'flex-start', marginBottom:28, paddingTop:16 },
  avatarWrapper:{ backgroundColor:'#e3f2fd', padding:16, borderRadius:24, shadowColor:'#000', shadowOpacity:0.15, shadowRadius:6, shadowOffset:{width:0,height:2} },
  title:{ fontSize:30, fontWeight:'700', color:'#fff', marginTop:16 },
  subtitle:{ fontSize:14, color:'rgba(255,255,255,0.85)', marginTop:8, lineHeight:20 },
  section:{ backgroundColor:'rgba(255,255,255,0.96)', borderRadius:20, padding:18, marginBottom:18, shadowColor:'#0d47a1', shadowOffset:{width:0,height:4}, shadowOpacity:0.12, shadowRadius:12, elevation:5, borderWidth:1, borderColor:'rgba(255,255,255,0.6)' },
  sectionHeader:{ fontSize:13, fontWeight:'700', color:'#1976d2', letterSpacing:1, textTransform:'uppercase', marginBottom:10 },
  label:{ fontSize:14, fontWeight:'600', color:'#1976d2', marginBottom:8, marginTop:4 },
  smallLabel:{ fontSize:12, fontWeight:'600', color:'#546e7a', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 },
  input:{ backgroundColor:'#f1f5f9', borderRadius:14, paddingHorizontal:14, paddingVertical:12, fontSize:15, borderWidth:1.5, borderColor:'#e2e8f0', marginBottom:16, color:'#0f172a' },
  textArea:{ minHeight:120, textAlignVertical:'top' },
  inputError:{ borderColor:'#dc3545' },
  errorText:{ color:'#dc3545', marginTop:-8, marginBottom:12, fontSize:12, fontWeight:'600' },
  readonlyPill:{ backgroundColor:'#e3f2fd', paddingVertical:10, paddingHorizontal:14, borderRadius:14, marginBottom:12 },
  readonlyText:{ color:'#0d47a1', fontSize:15, fontWeight:'600' },
  readonlyGroup:{ marginBottom:4 },
  primaryFab:{ backgroundColor:'#ffffff', paddingVertical:18, paddingHorizontal:28, borderRadius:18, shadowColor:'#000', shadowOpacity:0.25, shadowRadius:10, shadowOffset:{width:0,height:4}, minWidth:'60%', alignItems:'center' },
  fabText:{ color:'#1976d2', fontSize:16, fontWeight:'700' },
  fabContainer:{ position:'absolute', bottom:24, left:0, right:0, alignItems:'center' }
});