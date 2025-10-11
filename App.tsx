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
import * as Notifications from 'expo-notifications';
import { useNavigationContainerRef } from '@react-navigation/native';
import { setNavigationRef, markNavigationReady, setAuthSnapshotProvider, handleNotificationResponse, handleColdStartNotification } from './shared/services/notificationNavigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Development fetch logger: logs all fetch requests/responses to help debug "Network request failed" issues.
if (__DEV__ && !(global as any).__FETCH_LOGGER_INSTALLED) {
  (global as any).__FETCH_LOGGER_INSTALLED = true;
  const originalFetch = global.fetch;
  global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = init?.method || 'GET';
    const started = Date.now();
    const url = typeof input === 'string' ? input : (input as any).url || String(input);
    try {
      if (init?.body && typeof init.body === 'string') {
        console.log(`[fetch->] ${method} ${url} body:${init.body.slice(0,200)}`);
      } else {
        console.log(`[fetch->] ${method} ${url}`);
      }
      const response = await originalFetch(input, init);
      const ms = Date.now() - started;
      let preview = '';
      try {
        const clone = response.clone();
        preview = await clone.text();
        if (preview.length > 300) preview = preview.slice(0, 300) + '…';
      } catch {}
      console.log(`[fetch<-] ${method} ${url} ${response.status} (${ms}ms) ${preview ? 'bodyPreview:' + preview : ''}`);
      return response;
    } catch (err) {
      const ms = Date.now() - started;
      console.log(`[fetchERR] ${method} ${url} (${ms}ms)`, err);
      throw err;
    }
  };
}

export default function App() {
  const [authState, setAuthState] = useState({
    token: null as string | null,
    userId: null as string | null,
    userType: null as string | null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

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

  // Provide auth snapshot to notification handler
  useEffect(() => {
    setAuthSnapshotProvider(() => ({ userId: authState.userId, userType: authState.userType }));
  }, [authState.userId, authState.userType]);

  // Set up notification listeners
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    handleColdStartNotification();
    return () => { sub.remove(); };
  }, []);

  // Navigation ref ready handling
  useEffect(() => {
    if (navigationRef.isReady()) {
      setNavigationRef(navigationRef);
      markNavigationReady();
    } else {
      const timeout = setTimeout(() => {
        if (navigationRef.isReady()) { setNavigationRef(navigationRef); markNavigationReady(); }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [navigationRef]);

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
          <NavigationContainer ref={navigationRef}>
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
