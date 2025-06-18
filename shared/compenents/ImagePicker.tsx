import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { uploadProfileImage, deleteProfileImage, getFullImageUrl } from '../services/imageUploadService';
import { useAuth } from '../../auth/AuthContext';

interface ImagePickerProps {
  currentImageUrl?: string | null;
  onImageChange: (imageUrl: string | null) => void;
  size?: number;
  disabled?: boolean;
}

const ImagePickerComponent: React.FC<ImagePickerProps> = ({
  currentImageUrl,
  onImageChange,
  size = 100,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const { token } = useAuth();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (disabled || uploading) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    if (disabled || uploading) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to take photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    setUploading(true);

    try {
      const response = await uploadProfileImage(imageAsset, token);
      onImageChange(response.imageUrl);
    } catch (error) {
      Alert.alert('Upload Failed', (error as Error).message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async () => {
    if (!currentImageUrl || !token) return;

    Alert.alert(
      'Delete Profile Picture',
      'Are you sure you want to delete your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setUploading(true);
            try {
              await deleteProfileImage(currentImageUrl, token);
              onImageChange(null);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete image');
            } finally {
              setUploading(false);
            }
          },
        },
      ]
    );
  };

  const showImageOptions = () => {
    if (disabled || uploading) return;

    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        ...(currentImageUrl ? [{ text: 'Delete Current', style: 'destructive' as const, onPress: deleteImage }] : []),
      ]
    );
  };

  const fullImageUrl = currentImageUrl ? getFullImageUrl(currentImageUrl) : '';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.imageContainer, { width: size, height: size }]}
        onPress={showImageOptions}
        disabled={disabled || uploading}
      >
        {fullImageUrl ? (
          <Image source={{ uri: fullImageUrl }} style={[styles.image, { width: size, height: size }]} />
        ) : (
          <View style={[styles.placeholder, { width: size, height: size }]}>
            <MaterialIcons name="person" size={size * 0.4} color="#666" />
          </View>
        )}

        {uploading && (
          <View style={[styles.overlay, { width: size, height: size }]}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {!disabled && !uploading && (
          <View style={styles.editButton}>
            <MaterialIcons name="camera-alt" size={20} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      {!disabled && (
        <Text style={styles.helpText}>Tap to change photo</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    borderRadius: 50,
  },
  placeholder: {
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1976d2',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
});

export default ImagePickerComponent; 