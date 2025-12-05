import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeDashboard from '../home/HomeDashboard';
import ClientDashboard from '../lesson/pages/ClientLessonSearchPage';
import CoachDashboard from '../lesson/pages/CoachLessonManagementPage';
import CoachProfileDashboard from '../profile/components/manager/CoachProfileManager';
import ClientProfileDashboard from '../profile/components/manager/ClientProfileManager';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';
import AboutDashboard from '../about/AboutDashboard';
import SideMenu from './components/SideMenu';
import CoachProfilePage from '../profile/pages/CoachProfilePage';
import ClientProfilePage from '../profile/pages/ClientProfilePage';
import ClientCalendarView from '../calendars/client/ClientCalendarView';
import CoachCalendarView from '../calendars/coach/CoachCalendarView';
import PublicCoachCalendarView from '../calendars/coach/PublicCoachCalendarView';
import CreateCoachProfile from '../profile/components/creation/CreateCoachProfile';
import CreateClientProfile from '../profile/components/creation/CreateClientProfile';
import { DrawerActions } from '@react-navigation/native';
import SettingsScreen from '../settings/SettingsScreen';

const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ userType, initialScreen }: { userType: string | null; initialScreen?: string }) => {
  return (
    <Drawer.Navigator
      initialRouteName={initialScreen || "Home"}
      screenOptions={({navigation}) => ({
        headerShown: true,
        drawerStyle: {
          backgroundColor: '#0d47a1',
          width: 280,
        },
        headerStyle: {
          backgroundColor: '#0d47a1',
        },
        headerTintColor: '#fff',
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            style={{ paddingHorizontal: 16 }}
          >
            <MaterialCommunityIcons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
        ),
        headerTitle: () => (
          <View style={styles.headerTitle}>
            <MaterialCommunityIcons name="karate" size={24} color="#fff" />
            <Text style={styles.headerText}>HOBINET</Text>
          </View>
        ),
      })}
      drawerContent={(props) => (
        <SideMenu {...props} />
      )}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeDashboard}
      />
      {userType === 'client' ? (
        <>
          <Drawer.Screen 
            name="SearchLessons" 
            component={ClientDashboard} 
          />
          <Drawer.Screen 
            name="ClientCalendar" 
            component={ClientCalendarView}
          />
        </>
      ) : (
        <>
          <Drawer.Screen 
            name="CoachLessons" 
            component={CoachDashboard} 
          />
          <Drawer.Screen 
            name="CoachCalendar" 
            component={CoachCalendarView}
          />
          <Drawer.Screen 
            name="PublicCoachCalendar"
            component={PublicCoachCalendarView}
          />
        </>
      )}
      <Drawer.Screen
        name="Profile"
        component={userType === 'client' ? ClientProfileDashboard : CoachProfileDashboard}
      />
      <Drawer.Screen 
        name="Analytics" 
        component={AnalyticsDashboard}
      />
      <Drawer.Screen 
        name="About" 
        component={AboutDashboard}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
      />
      <Drawer.Screen 
        name="CoachProfilePage" 
        component={CoachProfilePage}
      />
      <Drawer.Screen 
        name="ClientProfilePage" 
        component={ClientProfilePage}
      />
      <Drawer.Screen 
        name="CreateCoachProfile" 
        component={CreateCoachProfile}
      />
      <Drawer.Screen 
        name="CreateClientProfile" 
        component={CreateClientProfile}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default DrawerNavigator;
