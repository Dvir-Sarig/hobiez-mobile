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
import ImagePickerComponent from '../../../shared/compenents/ImagePicker';
import { RootStackParamList } from '../../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingModal from '../modals/LoadingModal';
import { validateClientProfile, firstError } from '../../utils/validation';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';

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
  const [errors, setErrors] = useState<Record<string,string>>({});

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
    const validation = validateClientProfile(formData);
    setErrors(validation.errors);
    if (!validation.valid) {
      Alert.alert('שגיאה', firstError(validation.errors) || 'אנא תקן את השגיאות');
      return;
    }
    setLoading(true);
    try {
      const userInfo = await fetchUserInfo(userId, 'client');
      await createClientProfile(userInfo.id, formData);
      navigation.navigate('MainDrawer', { screen: 'Profile' });
    } catch (err) {
      Alert.alert('שגיאה', (err as Error).message || 'יצירת הפרופיל נכשלה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0d47a1','#1976d2','#42a5f5']} style={{flex:1}} start={{x:0,y:0}} end={{x:1,y:1}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.avatarWrapper}>
            <MaterialIcons name="emoji-people" size={40} color="#1976d2" />
          </View>
          <Text style={styles.title}>צור את פרופיל הלקוח שלך</Text>
          <Text style={styles.subtitle}>
            ספר לנו על עצמך וגלה מאמנים מדהימים שיעזרו לך להשיג את היעדים שלך
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>מידע בסיסי</Text>
          <Text style={styles.label}>תמונת פרופיל</Text>
          <ImagePickerComponent
            currentImageUrl={formData.genericProfile.profilePictureUrl}
            onImageChange={(imageUrl) =>
              setFormData((prev) => ({
                ...prev,
                genericProfile: { ...prev.genericProfile, profilePictureUrl: imageUrl },
              }))
            }
            size={120}
          />

          <View style={styles.fieldGroupReadonly}>  
            <Text style={styles.smallLabel}>שם</Text>
            <View style={styles.readonlyPill}><Text style={styles.readonlyText}>{formData.genericProfile.name || 'טוען...'}</Text></View>
          </View>

          <View style={styles.fieldGroupReadonly}>  
            <Text style={styles.smallLabel}>אימייל</Text>
            <View style={styles.readonlyPill}><Text style={styles.readonlyText}>{formData.genericProfile.email || 'טוען...'}</Text></View>
          </View>

          <Text style={styles.label}>מספר טלפון</Text>
          <TextInput
            style={[styles.input, errors['genericProfile.phoneNumber'] && styles.inputError]}
            placeholder="לדוגמה +1234567890"
            placeholderTextColor="#90a4ae"
            value={formData.genericProfile.phoneNumber || ''}
            onChangeText={(value) =>
              setFormData((prev) => ({
                ...prev,
                genericProfile: { ...prev.genericProfile, phoneNumber: value },
              }))
            }
          />
          {errors['genericProfile.phoneNumber'] && <Text style={styles.errorText}>{errors['genericProfile.phoneNumber']}</Text>}

          <Text style={styles.label}>אודותיי</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors['genericProfile.userDescription'] && styles.inputError]}
            multiline
            numberOfLines={4}
            placeholder="כתוב הצגה קצרה... (לפחות 10 תווים)"
            placeholderTextColor="#90a4ae"
            value={formData.genericProfile.userDescription}
            onChangeText={(value) =>
              setFormData((prev) => ({
                ...prev,
                genericProfile: { ...prev.genericProfile, userDescription: value },
              }))
            }
          />
          {errors['genericProfile.userDescription'] && <Text style={styles.errorText}>{errors['genericProfile.userDescription']}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>מיקום</Text>
          <LocationField
            location={formData.genericProfile.location}
            onLocationSelect={(location) =>
              setFormData((prev) => ({
                ...prev,
                genericProfile: { ...prev.genericProfile, location },
              }))
            }
            hideLabel
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>תחביבים ושפות</Text>
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
          {errors['hobbies'] && <Text style={styles.errorText}>{errors['hobbies']}</Text>}

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
          {errors['genericProfile.languages'] && <Text style={styles.errorText}>{errors['genericProfile.languages']}</Text>}
        </View>

        <View style={{height:80}} />
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.primaryFab} disabled={loading} onPress={handleSubmit}>
          <Text style={styles.fabText}>{loading ? 'יוצר...' : 'צור פרופיל'}</Text>
        </TouchableOpacity>
      </View>

      <LoadingModal visible={loading} message="יוצר את הפרופיל שלך..." />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 0,
  },
  headerContainer: {
    alignItems: 'flex-start',
    marginBottom: 28,
    paddingTop: 16,
  },
  avatarWrapper:{
    backgroundColor:'#e3f2fd',
    padding:16,
    borderRadius:24,
    shadowColor:'#000',shadowOpacity:0.15,shadowRadius:6,shadowOffset:{width:0,height:2},
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    lineHeight: 20,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#0d47a1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth:1,
    borderColor:'rgba(255,255,255,0.6)'
  },
  sectionHeader:{
    fontSize:13,
    fontWeight:'700',
    color:'#1976d2',
    letterSpacing:1,
    textTransform:'uppercase',
    marginBottom:10,
    textAlign:'left',
    writingDirection:'rtl',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
    marginTop: 4,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  smallLabel:{
    fontSize:12,
    fontWeight:'600',
    color:'#546e7a',
    marginBottom:4,
    textTransform:'uppercase',
    letterSpacing:0.5,
    textAlign:'left',
    writingDirection:'rtl',
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    color:'#0f172a'
  },
  textArea:{
    minHeight:120,
    textAlignVertical:'top'
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    marginTop: -8,
    marginBottom: 12,
    fontSize: 12,
    fontWeight:'600',
    textAlign:'left',
    writingDirection:'rtl',
  },
  readonlyPill:{
    backgroundColor:'#e3f2fd',
    paddingVertical:10,
    paddingHorizontal:14,
    borderRadius:14,
    marginBottom:12,
  },
  readonlyText:{
    color:'#0d47a1',
    fontSize:15,
    fontWeight:'600',
    textAlign:'left',
    writingDirection:'rtl',
  },
  fieldGroupReadonly:{
    marginBottom:4,
  },
  primaryFab:{
    backgroundColor:'#ffffff',
    paddingVertical:18,
    paddingHorizontal:28,
    borderRadius:18,
    shadowColor:'#000',shadowOpacity:0.25,shadowRadius:10,shadowOffset:{width:0,height:4},
    minWidth:'60%',
    alignItems:'center'
  },
  fabText:{
    color:'#1976d2',
    fontSize:16,
    fontWeight:'700',
    writingDirection:'rtl',
  },
  fabContainer:{
    position:'absolute',
    bottom:24,
    left:0,
    right:0,
    alignItems:'center'
  },
  submitButton: { // kept for reference if needed elsewhere
    backgroundColor: '#1976d2',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
});
