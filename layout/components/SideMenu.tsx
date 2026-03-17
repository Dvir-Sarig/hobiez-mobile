import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuth } from '../../auth/AuthContext';
import { logout } from '../../auth/services/authService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type DrawerParamList = {
  Home: undefined;
  SearchLessons: undefined;
  CoachLessons: undefined;
  Profile: undefined;
  Analytics: undefined;
  About: undefined;
  Settings: undefined;
};

export default function SideMenu(props: DrawerContentComponentProps) {
  const { userType, setAuthState } = useAuth();

  const handleNavigation = (screenName: keyof DrawerParamList) => {
    props.navigation.navigate(screenName);
    props.navigation.closeDrawer();
  };

  const handleSignOut = async () => {
    try {
      await logout();
      props.navigation.closeDrawer();
      setAuthState({ token: null, userId: null, userType: null });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const MenuItem = ({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuText}>{label}</Text>
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons name={icon as any} size={20} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.fullContainer} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContainer}>
        <MenuItem icon="home" label="בית" onPress={() => handleNavigation('Home')} />
        {userType === 'client' ? (
          <MenuItem icon="magnify" label="חיפוש שיעורים" onPress={() => handleNavigation('SearchLessons')} />
        ) : (
          <MenuItem icon="clipboard-list-outline" label="השיעורים שלי" onPress={() => handleNavigation('CoachLessons')} />
        )}
        <MenuItem icon="account-circle" label="פרופיל" onPress={() => handleNavigation('Profile')} />
        <MenuItem icon="chart-line" label="אנליטיקות" onPress={() => handleNavigation('Analytics')} />
        <MenuItem icon="information-outline" label="אודות" onPress={() => handleNavigation('About')} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Settings')}>
          <View style={styles.menuItemContent}>
            <Text style={styles.footerText}>הגדרות</Text>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="cog-outline" size={22} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <View style={styles.menuItemContent}>
            <Text style={styles.footerText}>התנתקות</Text>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="logout" size={22} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#0d47a1',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: 12,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    minHeight: 56,
  },
  menuItemContent: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    minHeight: 28,
  },
  iconWrapper: {
    position: 'absolute',
    right: 0,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuText: {
    width: '100%',
    fontSize: 16,
    color: 'white',
    textAlign: 'right',
    writingDirection: 'rtl',
    paddingRight: 40,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingBottom: 16,
  },
  footerText: {
    width: '100%',
    fontSize: 18,
    color: 'white',
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
    paddingRight: 40,
  },

});
