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
import { ClientProfile, SupportedHobby, SupportedLanguage } from '../../types/profile';
import LocationField from '../../../integrations/google_location/LocationField';
import LanguageSelector from '../LanguageSelector';
import HobbySelector from '../HobbySelector';
import ImagePickerComponent from '../../../shared/compenents/ImagePicker';
import LoadingModal from '../modals/LoadingModal';

interface Props {
  editData: ClientProfile;
  onChange: (updated: ClientProfile) => void;
  onSave: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ClientProfileEditForm({
  editData,
  onChange,
  onSave,
  onCancel,
  loading = false,
}: Props) {
  const updateField = (field: Partial<ClientProfile>) => {
    onChange({ ...editData, ...field });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <MaterialIcons name="edit" size={40} color="#1976d2" />
        <Text style={styles.title}>Edit Your Profile</Text>
        <Text style={styles.subtitle}>
          Update your information to help coaches better understand your needs
        </Text>
      </View>

      <View style={styles.section}>
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
          style={styles.input}
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
        />

        <Text style={styles.label}>About You</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={editData.genericProfile.userDescription || ''}
          onChangeText={(val) =>
            updateField({
              genericProfile: {
                ...editData.genericProfile,
                userDescription: val,
              },
            })
          }
          placeholder="Tell us about yourself..."
          multiline
          numberOfLines={4}
        />

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
        />

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
        />

        <HobbySelector
          selectedHobbies={editData.hobbies as SupportedHobby[]}
          onAdd={(hobby) =>
            updateField({
              hobbies: [...editData.hobbies, hobby],
            })
          }
          onRemove={(hobby) =>
            updateField({
              hobbies: editData.hobbies.filter((h) => h !== hobby),
            })
          }
          editable
        />
      </View>

      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={onSave}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={[styles.saveButtonText, styles.loadingText]}>Saving...</Text>
          </View>
        ) : (
          <>
            <MaterialIcons name="save" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={onCancel}
        disabled={loading}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>

      <LoadingModal visible={loading} message="Saving your changes..." />
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
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#1976d2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
});