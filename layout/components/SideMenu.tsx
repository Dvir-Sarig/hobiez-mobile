import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuth } from '../../auth/AuthContext';
import { logout } from '../../auth/services/authService';
import { SafeAreaView } from 'react-native-safe-area-context';

type DrawerParamList = {
  Home: undefined;
  SearchLessons: undefined;
  CoachLessons: undefined;
  Profile: undefined;
  Analytics: undefined;
  About: undefined;
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
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>

            {userType === 'client' ? (
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('SearchLessons')}>
                <Text style={styles.menuText}>Search Lessons</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('CoachLessons')}>
                <Text style={styles.menuText}>My Lessons</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Profile')}>
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Analytics')}>
              <Text style={styles.menuText}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('About')}>
              <Text style={styles.menuText}>About</Text>
            </TouchableOpacity>
          </View>
        </View>
      </DrawerContentScrollView>

      {/* כפתור התנתקות בתחתית ממש */}
      <View style={styles.signOutContainer}>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
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
  },
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
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
