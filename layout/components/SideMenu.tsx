import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
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

  return (
    <SafeAreaView style={styles.fullContainer} edges={['bottom']}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Menu</Text>
          </View>

          <View style={styles.menuItems}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Home')}>
              <MaterialCommunityIcons name="home" size={20} color="#fff" style={styles.menuIcon} />
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>

            {userType === 'client' ? (
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('SearchLessons')}>
                <MaterialCommunityIcons name="magnify" size={20} color="#fff" style={styles.menuIcon} />
                <Text style={styles.menuText}>Search Lessons</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('CoachLessons')}>
                <MaterialCommunityIcons name="clipboard-list-outline" size={20} color="#fff" style={styles.menuIcon} />
                <Text style={styles.menuText}>My Lessons</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Profile')}>
              <MaterialCommunityIcons name="account-circle" size={20} color="#fff" style={styles.menuIcon} />
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Analytics')}>
              <MaterialCommunityIcons name="chart-line" size={20} color="#fff" style={styles.menuIcon} />
              <Text style={styles.menuText}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('About')}>
              <MaterialCommunityIcons name="information-outline" size={20} color="#fff" style={styles.menuIcon} />
              <Text style={styles.menuText}>About</Text>
            </TouchableOpacity>
          </View>
        </View>
      </DrawerContentScrollView>

      {/* buttons in the footer */}
      <View style={styles.signOutContainer}>
        <TouchableOpacity style={styles.bottomItem} onPress={() => handleNavigation('Settings')}>
          <MaterialCommunityIcons name="cog-outline" size={22} color="#fff" style={styles.menuIcon} />
          <Text style={styles.bottomItemText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignOut} style={styles.bottomItem}>
          <MaterialCommunityIcons name="logout" size={22} color="#fff" style={styles.menuIcon} />
          <Text style={[styles.bottomItemText, styles.signOutText]}>Sign Out</Text>
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
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    padding: 16,
  },
  header: {
    paddingVertical: 16,
    marginBottom: 12,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: { marginRight: 12 },
  menuText: {
    fontSize: 16,
    color: 'white',
  },
  signOutContainer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  signOutText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '700',
  },
  bottomItem: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  bottomItemText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '700',
  },
});
