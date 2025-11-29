import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CoachProfile,SupportedLanguage } from '../../types/profile';
import LocationField from '../../../integrations/google_location/LocationField';
import LanguageSelector from '../LanguageSelector';
import SkillSelector from '../SkillSelector';
import EducationEditor from '../EducationEditor';
import ImagePickerComponent from '../../../shared/compenents/ImagePicker';
import LoadingModal from '../modals/LoadingModal';
import { validateCoachProfile } from '../../utils/validation';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  editData: CoachProfile;
  onChange: (updated: CoachProfile) => void;
  onSave: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function CoachProfileEditForm({
  editData,
  onChange,
  onSave,
  onCancel,
  loading = false,
}: Props) {
  const updateField = (field: Partial<CoachProfile>) => {
    onChange({ ...editData, ...field });
  };
  const errors = validateCoachProfile(editData).errors;

  return (
    <LinearGradient colors={['#0d47a1','#1976d2','#42a5f5']} style={{flex:1}} start={{x:0,y:0}} end={{x:1,y:1}}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.avatarWrapper}>
            <MaterialIcons name="edit" size={40} color="#1976d2" />
          </View>
          <Text style={styles.title}>Edit Coach Profile</Text>
          <Text style={styles.subtitle}>Refine your details to better highlight your expertise</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Basic Info</Text>
          <Text style={styles.label}>Profile Picture</Text>
          <ImagePickerComponent
            currentImageUrl={editData.genericProfile.profilePictureUrl}
            onImageChange={(imageUrl) =>
              updateField({
                genericProfile: {
                  ...editData.genericProfile,
                  profilePictureUrl: imageUrl,
                },
              })
            }
            size={120}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, errors['genericProfile.phoneNumber'] && styles.inputError]}
            value={editData.genericProfile.phoneNumber || ''}
            onChangeText={(val) =>
              updateField({
                genericProfile: {
                  ...editData.genericProfile,
                  phoneNumber: val,
                },
              })
            }
            placeholder="+123456789"
            placeholderTextColor="#90a4ae"
          />
          {errors['genericProfile.phoneNumber'] && <Text style={styles.errorText}>{errors['genericProfile.phoneNumber']}</Text>}

          <Text style={styles.label}>About You</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors['genericProfile.userDescription'] && styles.inputError]}
            value={editData.genericProfile.userDescription || ''}
            onChangeText={(val) =>
              updateField({
                genericProfile: {
                  ...editData.genericProfile,
                  userDescription: val,
                },
              })
            }
            placeholder="Describe your coaching style... (min 20 chars)"
            placeholderTextColor="#90a4ae"
            multiline
            numberOfLines={4}
          />
          {errors['genericProfile.userDescription'] && <Text style={styles.errorText}>{errors['genericProfile.userDescription']}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Location</Text>
          <LocationField
            location={editData.genericProfile.location}
            onLocationSelect={(location) => {
              updateField({
                genericProfile: {
                  ...editData.genericProfile,
                  location,
                },
              });
            }}
            hideLabel
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Languages</Text>
          <LanguageSelector
            selectedLanguages={editData.genericProfile.languages as SupportedLanguage[]}
            onAdd={(lang) =>
              updateField({
                genericProfile: {
                  ...editData.genericProfile,
                  languages: [...editData.genericProfile.languages, lang],
                },
              })
            }
            onRemove={(lang) =>
              updateField({
                genericProfile: {
                  ...editData.genericProfile,
                  languages: editData.genericProfile.languages.filter((l) => l !== lang),
                },
              })
            }
            editable
            hideHeader
          />
          {errors['genericProfile.languages'] && <Text style={styles.errorText}>{errors['genericProfile.languages']}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Experience & Skills</Text>
          <Text style={styles.label}>Experience</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors['experience'] && styles.inputError]}
            value={editData.experience || ''}
            onChangeText={(val) => updateField({ experience: val })}
            placeholder="Share your professional experience... (min 30 chars)"
            placeholderTextColor="#90a4ae"
            multiline
            numberOfLines={4}
          />
          {errors['experience'] && <Text style={styles.errorText}>{errors['experience']}</Text>}

          <SkillSelector
            selectedSkills={editData.skills || []}
            onAdd={(skill) => updateField({ skills: [...(editData.skills || []), skill] })}
            onRemove={(skill) => updateField({ skills: editData.skills.filter((s) => s.name !== skill.name) })}
            hideLabel
          />
          {errors['skills'] && <Text style={styles.errorText}>{errors['skills']}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Education</Text>
          <EducationEditor
            educationList={editData.education || []}
            onChange={(newList) => updateField({ education: newList })}
            hideTitle
          />
          {Object.keys(errors).some(k => k.startsWith('education.')) && (
            <Text style={styles.errorText}>Please complete required education fields</Text>
          )}
        </View>

        <View style={{height:100}} />
      </ScrollView>

      <View style={styles.fabRow}>
        <TouchableOpacity style={[styles.secondaryFab, loading && styles.disabledFab]} onPress={onCancel} disabled={loading}>
          <Text style={styles.secondaryFabText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.primaryFab, loading && styles.disabledFab]} onPress={onSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#1976d2" /> : <Text style={styles.primaryFabText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>

      <LoadingModal visible={loading} message="Saving your changes..." />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:{ padding:20, paddingBottom:0 },
  headerContainer:{ alignItems:'flex-start', marginBottom:28, paddingTop:16 },
  avatarWrapper:{ backgroundColor:'#e3f2fd', padding:16, borderRadius:24, shadowColor:'#000', shadowOpacity:0.15, shadowRadius:6, shadowOffset:{width:0,height:2} },
  title:{ fontSize:30, fontWeight:'700', color:'#fff', marginTop:16 },
  subtitle:{ fontSize:14, color:'rgba(255,255,255,0.85)', marginTop:8, lineHeight:20 },
  section:{ backgroundColor:'rgba(255,255,255,0.96)', borderRadius:20, padding:18, marginBottom:18, shadowColor:'#0d47a1', shadowOffset:{width:0,height:4}, shadowOpacity:0.12, shadowRadius:12, elevation:5, borderWidth:1, borderColor:'rgba(255,255,255,0.6)' },
  sectionHeader:{ fontSize:13, fontWeight:'700', color:'#1976d2', letterSpacing:1, textTransform:'uppercase', marginBottom:10 },
  label:{ fontSize:14, fontWeight:'600', color:'#1976d2', marginBottom:8, marginTop:4 },
  input:{ backgroundColor:'#f1f5f9', borderRadius:14, paddingHorizontal:14, paddingVertical:12, fontSize:15, borderWidth:1.5, borderColor:'#e2e8f0', marginBottom:16, color:'#0f172a' },
  textArea:{ minHeight:120, textAlignVertical:'top' },
  inputError:{ borderColor:'#dc3545' },
  errorText:{ color:'#dc3545', marginTop:-8, marginBottom:12, fontSize:12, fontWeight:'600' },
  fabRow:{ position:'absolute', bottom:24, left:0, right:0, flexDirection:'row', justifyContent:'center', gap:16, paddingHorizontal:24 },
  primaryFab:{ backgroundColor:'#ffffff', paddingVertical:18, paddingHorizontal:28, borderRadius:18, shadowColor:'#000', shadowOpacity:0.25, shadowRadius:10, shadowOffset:{width:0,height:4}, flex:1, alignItems:'center' },
  primaryFabText:{ color:'#1976d2', fontSize:16, fontWeight:'700' },
  secondaryFab:{ backgroundColor:'rgba(255,255,255,0.35)', paddingVertical:18, paddingHorizontal:28, borderRadius:18, flex:1, alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.6)' },
  secondaryFabText:{ color:'#fff', fontSize:16, fontWeight:'700' },
  disabledFab:{ opacity:0.6 }
});
