import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { RootStackParamList } from './types';
import DrawerNavigator from './layout/DrawerNavigator';
import { AuthContext, loadAuthState, signOut } from './auth/AuthContext';
import SignIn from './auth/signin/SignIn';
import SignUp from './auth/signup/SignUp';
import LandingPage from './auth/landing/LandingPage';
import CoachProfilePage from './profile/pages/CoachProfilePage';
import ClientProfilePage from './profile/pages/ClientProfilePage';
import CreateCoachProfile from './profile/components/creation/CreateCoachProfile';
import CreateClientProfile from './profile/components/creation/CreateClientProfile';
import CoachProfileManager from './profile/components/manager/CoachProfileManager';
import ClientProfileManager from './profile/components/manager/ClientProfileManager';
import {GestureHandlerRootView} from "react-native-gesture-handler";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [authState, setAuthState] = useState({
    token: null as string | null,
    userId: null as string | null,
    userType: null as string | null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { token, userId, userType } = await loadAuthState();
        setAuthState({ token, userId, userType });
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setAuthState({ token: null, userId: null, userType: null });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthContext.Provider value={{
          ...authState,
          setAuthState: (state) => setAuthState(state),
          signOut: handleSignOut
        }}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {!authState.userId || !authState.token ? (
                // Auth Stack
                <>
                  <Stack.Screen name="LandingPage" component={LandingPage} />
                  <Stack.Screen name="SignIn" component={SignIn} />
                  <Stack.Screen name="SignUp" component={SignUp} />
                </>
              ) : (
                // Main App Stack
                <>
                  <Stack.Screen name="MainDrawer">
                    {() => <DrawerNavigator userType={authState.userType} />}
                  </Stack.Screen>

                  <Stack.Screen name="CoachProfile" component={CoachProfileManager} />
                  <Stack.Screen name="CoachProfilePage" component={CoachProfilePage} />
                  <Stack.Screen name="ClientProfile" component={ClientProfileManager} />
                  <Stack.Screen name="ClientProfilePage" component={ClientProfilePage} />
                  <Stack.Screen name="CreateCoachProfile" component={CreateCoachProfile} />
                  <Stack.Screen name="CreateClientProfile" component={CreateClientProfile} />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </AuthContext.Provider>
      </GestureHandlerRootView>
  );
}
