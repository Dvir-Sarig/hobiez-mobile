import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GenericProfileInfo } from '../../types/profile';

interface BaseProfileViewProps {
  profileData: { genericProfile: GenericProfileInfo };
  children?: React.ReactNode;
  onEditClick?: () => void;
  onViewCalendarClick?: () => void;
  onWhatsAppPress?: () => void;
}

export default function BaseProfileView({
  profileData,
  children,
  onEditClick,
  onViewCalendarClick,
  onWhatsAppPress,
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

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const headerAnim = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 180],
      [0, -120],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [0, 180],
      [1, 0.92],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY }, { scale }],
      opacity: interpolate(
        scrollY.value,
        [0, 180],
        [1, 0.4],
        Extrapolate.CLAMP
      ),
    };
  });

  return (
    <Animated.ScrollView
      contentContainerStyle={styles.container}
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        entering={FadeIn.duration(500)}
        style={[styles.heroWrapper, headerAnim]}
      >
        <LinearGradient
          colors={['#0d47a1', '#1976d2', '#42a5f5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          {/* Decorative blobs */}
          <View style={[styles.blob, { top: -40, left: -30 }]} />
          <View
            style={[
              styles.blob,
              {
                bottom: -50,
                right: -40,
                backgroundColor: 'rgba(255,255,255,0.08)',
              },
            ]}
          />

          <View
            style={[
              styles.header,
              { flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 20 : 28 },
            ]}
          >
            <View
              style={[
                styles.leftSide,
                { flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center' },
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
                    <TouchableOpacity onPress={onEditClick} style={styles.editIcon} activeOpacity={0.7}>
                      <MaterialIcons name="edit" size={20} color="#1976d2" />
                    </TouchableOpacity>
                  )}
                </View>
                {!!userDescription && <Text style={styles.description}>{userDescription}</Text>}
              </View>
            </View>

            <View style={[styles.rightSide, isMobile && styles.rightSideMobile]}>
              <InfoRow icon="email" value={email} />
              {!!phoneNumber && <InfoRow icon="phone" value={phoneNumber} />}
              <InfoRow icon="location-on" value={`${location?.city}, ${location?.country}`} />
              <View style={styles.actionButtonsContainer}>
                {onViewCalendarClick && (
                  <TouchableOpacity style={styles.actionButton} onPress={onViewCalendarClick}>
                    <MaterialIcons name="calendar-today" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Calendar</Text>
                  </TouchableOpacity>
                )}
                {onWhatsAppPress && (
                  <TouchableOpacity style={styles.actionButton} onPress={onWhatsAppPress}>
                    <MaterialCommunityIcons name="whatsapp" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>WhatsApp</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.content}>{children}</View>
    </Animated.ScrollView>
  );
}

function InfoRow({ icon, value }: { icon: any; value: string }) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon} size={16} color="rgba(255,255,255,0.85)" />
      <Text style={styles.infoText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    backgroundColor: '#e3f2fd',
    flexGrow: 1,
  },
  heroWrapper: {},
  heroGradient: {
    paddingVertical: 36,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  blob: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  header: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  leftSide: {
    marginBottom: 12,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    marginRight: 20,
    marginBottom: 12,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 12,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarText: {
    fontSize: 42,
    color: '#1976d2',
    fontWeight: '800',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  editIcon: {
    marginLeft: 10,
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  description: {
    color: 'rgba(255,255,255,0.92)',
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 380,
  },
  rightSide: {
    width: '100%',
    maxWidth: 680,
    marginTop: 16,
  },
  rightSideMobile: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    color: 'rgba(255,255,255,0.85)',
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  progressBarWrapper: {
    display:'none'
  },
  progressTrack: {
    display:'none'
  },
  progressFill: {
    display:'none'
  },
  progressLabel: {
    display:'none'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});