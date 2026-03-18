import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import DeleteAccountModal from '../profile/components/modals/DeleteAccountModal';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

type ActionRowProps = {
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap | keyof typeof MaterialIcons.glyphMap;
  iconType: 'ion' | 'material';
  iconColor: string;
  onPress: () => void;
  destructive?: boolean;
};

function ActionRow({
  title,
  subtitle,
  iconName,
  iconType,
  iconColor,
  onPress,
  destructive = false,
}: ActionRowProps) {
  return (
    <TouchableOpacity
      style={[styles.actionRow, destructive && styles.actionRowDestructive]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={[styles.actionIconWrap, { backgroundColor: destructive ? 'rgba(220,53,69,0.14)' : 'rgba(25,118,210,0.14)' }]}>
        {iconType === 'ion' ? (
          <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={20} color={iconColor} />
        ) : (
          <MaterialIcons name={iconName as keyof typeof MaterialIcons.glyphMap} size={20} color={iconColor} />
        )}
      </View>

      <View style={styles.actionTextCol}>
        <Text style={[styles.actionTitle, destructive && styles.actionTitleDestructive]}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>

      <MaterialIcons name="chevron-left" size={20} color={destructive ? '#dc3545' : '#1976d2'} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { userType, signOut } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const confirmSignOut = () => {
    Alert.alert(
      'התנתקות',
      'האם אתה בטוח שברצונך להתנתק מהחשבון?',
      [
        { text: 'ביטול', style: 'cancel' },
        { text: 'התנתקות', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <LinearGradient colors={['#0d47a1', '#1565c0', '#1e88e5']} style={styles.container}>
      <View pointerEvents="none" style={styles.decorBubbleOne} />
      <View pointerEvents="none" style={styles.decorBubbleTwo} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="settings-outline" size={26} color="#ffffff" />
          </View>
          <View style={styles.heroTextCol}>
            <Text style={styles.title}>הגדרות</Text>
            <Text style={styles.subtitle}>נהל את החשבון והעדפות האפליקציה שלך</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>חשבון</Text>

          <ActionRow
            title="התנתקות"
            subtitle="יציאה בטוחה מהחשבון במכשיר זה"
            iconName="logout"
            iconType="material"
            iconColor="#1976d2"
            onPress={confirmSignOut}
          />

          <ActionRow
            title="מחיקת חשבון"
            subtitle="פעולה בלתי הפיכה הכוללת מחיקת הנתונים"
            iconName="trash"
            iconType="ion"
            iconColor="#dc3545"
            onPress={() => setShowDeleteModal(true)}
            destructive
          />
        </View>

        <View style={styles.infoCard}>
          <MaterialIcons name="info-outline" size={18} color="#1565c0" />
          <Text style={styles.infoText}>הפעולות הרגישות בחשבון דורשות אישור נוסף לשמירה על אבטחת המשתמש.</Text>
        </View>
      </ScrollView>

      <DeleteAccountModal
        isVisible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onAccountDeleted={signOut}
        userType={userType as 'client' | 'coach'}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 58 : 36,
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  decorBubbleOne: {
    position: 'absolute',
    top: -70,
    left: -48,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorBubbleTwo: {
    position: 'absolute',
    top: 160,
    right: -56,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.34)',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
  },
  heroTextCol: { flex: 1 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.86)',
    textAlign: 'left',
    writingDirection: 'rtl',
  },

  section: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0d47a1',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'left',
    writingDirection: 'rtl',
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(13,71,161,0.10)',
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  actionRowDestructive: {
    borderColor: 'rgba(220,53,69,0.20)',
    backgroundColor: '#fff8f8',
    marginBottom: 0,
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextCol: { flex: 1 },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0d47a1',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  actionTitleDestructive: { color: '#b71c1c' },
  actionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
    color: '#607d8b',
    textAlign: 'left',
    writingDirection: 'rtl',
  },

  infoCard: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#e3f2fd',
    lineHeight: 17,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
});
