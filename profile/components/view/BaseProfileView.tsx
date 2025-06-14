import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { GenericProfileInfo } from '../../types/profile';

interface BaseProfileViewProps {
  profileData: {
    genericProfile: GenericProfileInfo;
  };
  children?: React.ReactNode;
  onEditClick?: () => void;
}

export default function BaseProfileView({
  profileData,
  children,
  onEditClick,
}: BaseProfileViewProps) {
  const {
    name,
    email,
    phoneNumber,
    userDescription,
    location,
    profilePictureUrl,
  } = profileData.genericProfile;

  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View entering={FadeIn.duration(500)}>
        <LinearGradient colors={['#2196f3', '#1976d2']} style={styles.paper}>
          <View
            style={[
              styles.header,
              { flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 16 : 24 },
            ]}
          >
            {/* Left Side */}
            <View
              style={[
                styles.leftSide,
                {
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                },
              ]}
            >
              {profilePictureUrl ? (
                <Image source={{ uri: profilePictureUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{name.charAt(0)}</Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{name}</Text>
                  {onEditClick && (
                    <TouchableOpacity onPress={onEditClick} style={styles.editIcon}>
                      <MaterialIcons name="edit" size={20} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
                {!!userDescription && (
                  <Text style={styles.description}>{userDescription}</Text>
                )}
              </View>
            </View>

            {/* Right Side */}
            <View style={[styles.rightSide, isMobile && styles.rightSideMobile]}>
              <View style={styles.infoRow}>
                <MaterialIcons name="email" size={16} color="white" />
                <Text style={styles.infoText}>{email}</Text>
              </View>

              {!!phoneNumber && (
                <View style={styles.infoRow}>
                  <MaterialIcons name="phone" size={16} color="white" />
                  <Text style={styles.infoText}>{phoneNumber}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <MaterialIcons name="location-on" size={16} color="white" />
                <Text style={styles.infoText}>
                  {location?.city}, {location?.country}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Children content */}
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    backgroundColor: '#e3f2fd',
    flexGrow: 1,
  },
  paper: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    width: '100%',
    maxWidth: 600,
  },
  leftSide: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  editIcon: {
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 20,
  },
  description: {
    color: 'white',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 300,
  },
  rightSide: {
    width: '100%',
    maxWidth: 600,
    marginTop: 12,
  },
  rightSideMobile: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.85)',
    marginLeft: 8,
    fontSize: 15,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});