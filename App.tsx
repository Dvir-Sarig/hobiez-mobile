import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { RootStackParamList } from './types';
import DrawerNavigator from './layout/DrawerNavigator';
import { AuthContext, loadAuthState } from './auth/AuthContext';
import SecureStorage from './auth/services/SecureStorage';

import SignIn from './auth/signin/SignIn';
import SignUp from './auth/signup/SignUp';
import LandingPage from './auth/landing/LandingPage';

import CoachProfilePage from './profile/pages/CoachProfilePage';
import ClientProfilePage from './profile/pages/ClientProfilePage';
import CreateCoachProfile from './profile/components/creation/CreateCoachProfile';
import CreateClientProfile from './profile/components/creation/CreateClientProfile';
import CoachProfileManager from './profile/components/manager/CoachProfileManager';
import ClientProfileManager from './profile/components/manager/ClientProfileManager';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [authState, setAuthState] = useState<{
    userType: string | null;
    userId: string | null;
    token: string | null;
  }>({ userType: null, userId: null, token: null });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const state = await loadAuthState();
        
        // Validate the loaded state
        if (state.userId && !state.userType) {
          // Invalid state, clear everything
          await SecureStorage.clearAll();
          setAuthState({ userType: null, userId: null, token: null });
        } else {
          setAuthState(state);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        await SecureStorage.clearAll();
        setAuthState({ userType: null, userId: null, token: null });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{
      ...authState,
      setAuthState: (state) => setAuthState(state)
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
  );
}
