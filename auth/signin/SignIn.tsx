import React, { useState, useContext, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Animated,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';

import { signIn, signInWithGoogle, UserType } from '../services/authService';
import { RootStackParamList } from '../../types';
import { AuthContext } from '../AuthContext';
import SecureStorage from '../services/SecureStorage';
import { tokens, surfaces, utils } from '../../shared/design/tokens';
import AuthLayout from '../components/AuthLayout';
import {
  askPermissionOnceAfterSignIn,
  getOrFetchDeviceToken,
  refreshAndMaybeRegister,
} from '../../shared/services/deviceTokenService';
import { registerDeviceIfNeeded } from '../services/deviceApiService';

// ===== Client IDs =====
const IOS_CLIENT_ID =
  '428494796773-r03cdal0aqpun0euu8g2m1ivqd6k8gq5.apps.googleusercontent.com';
const ANDROID_CLIENT_ID =
  '428494796773-d8kk8lkb7485mq91evpf0atir73jet0b.apps.googleusercontent.com';
const WEB_CLIENT_ID =
  '428494796773-ped969msbm5oon25a5t119p6pb6mii30.apps.googleusercontent.com';
const EXPO_CLIENT_ID =
  '428494796773-9u6opvespvpb403punmct8acugtij4l5.apps.googleusercontent.com';

WebBrowser.maybeCompleteAuthSession();

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

// ✅ Keep alerts only for useful debug points
const OAUTH_DEBUG_ALERTS = true;

function safeJson(obj: any) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

function clientIdPrefix(clientId: string) {
  return clientId.replace('.apps.googleusercontent.com', '').trim();
}

function googleIosUrlSchemeFromClientId(clientId: string) {
  return `com.googleusercontent.apps.${clientIdPrefix(clientId)}`;
}

export default function SignInScreen() {
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const { setAuthState } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>(UserType.CLIENT);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [shakeAnimation] = useState(new Animated.Value(0));

  const isExpoGo = Constants.appOwnership === 'expo';
  const useProxy = isExpoGo;

  const showDebug = (title: string, payload: any) => {
    if (!OAUTH_DEBUG_ALERTS) return;
    Alert.alert(title, safeJson(payload).slice(0, 3500));
  };

  const validateClientIdsOrAlert = () => {
    const ids = {
      iosClientId: IOS_CLIENT_ID,
      androidClientId: ANDROID_CLIENT_ID,
      webClientId: WEB_CLIENT_ID,
      expoClientId: EXPO_CLIENT_ID,
    };
    const bad = Object.entries(ids).filter(([_, v]) => !v || v.includes('REPLACE_ME'));
    if (bad.length > 0) {
      showDebug('❌ OAuth config invalid', {
        reason: 'One or more client IDs are missing / REPLACE_ME',
        bad,
      });
      return false;
    }
    return true;
  };

  const redirectUri = useMemo(() => {
    if (useProxy) {
      return AuthSession.makeRedirectUri();
    }

    if (Platform.OS === 'ios') {
      const googleScheme = googleIosUrlSchemeFromClientId(IOS_CLIENT_ID);
      return AuthSession.makeRedirectUri({ scheme: googleScheme });
    }

    return AuthSession.makeRedirectUri({ scheme: 'hobinet' });
  }, [useProxy]);

  const googleConfig = useMemo(() => {
    const base: any = {
      iosClientId: IOS_CLIENT_ID,
      androidClientId: ANDROID_CLIENT_ID,
      webClientId: WEB_CLIENT_ID,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    };

    if (useProxy) base.expoClientId = EXPO_CLIENT_ID;

    return base;
  }, [redirectUri, useProxy]);

  const [googleRequest, googleResponse, promptGoogleSignIn] = Google.useAuthRequest(googleConfig);

  useEffect(() => {
    // ✅ minimal init debug
    showDebug('OAuth init', {
      isExpoGo,
      useProxy,
      platform: Platform.OS,
      redirectUri,
      iosUrlSchemeExpected:
        Platform.OS === 'ios' ? googleIosUrlSchemeFromClientId(IOS_CLIENT_ID) : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // ✅ only show key request fields, never tokens
    if (googleRequest?.url && OAUTH_DEBUG_ALERTS) {
      showDebug('OAuth request built', {
        requestRedirectUri: googleRequest.redirectUri,
        redirectUri,
        hasCodeVerifier: !!googleRequest.codeVerifier,
      });
    }
  }, [googleRequest?.url]);

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 90, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 90, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 6, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start();
  };

  const finalizeLogin = async (data: any, selectedUserType: UserType) => {
    const platformValue = Platform.OS?.toUpperCase?.() || undefined;

    await SecureStorage.storeToken(data.token);
    await SecureStorage.storeUserId(data.userId.toString());
    await SecureStorage.storeUserType(selectedUserType.toLowerCase());
    setAuthState({
      userId: data.userId.toString(),
      userType: selectedUserType.toLowerCase(),
      token: data.token,
    });

    await askPermissionOnceAfterSignIn();

    const token = await getOrFetchDeviceToken();
    if (token) {
      await registerDeviceIfNeeded({ token, userType: selectedUserType, platform: platformValue });
    }

    await refreshAndMaybeRegister(
      async (freshToken) => {
        await registerDeviceIfNeeded({
          token: freshToken,
          userType: selectedUserType,
          platform: platformValue,
        });
      },
      data.userId.toString()
    );
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      shakeError();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await signIn(email, password, userType);
      await finalizeLogin(data, userType);
    } catch (error: any) {
      let errorMessage = 'Invalid email or password';
      if (error.message?.includes('Network')) errorMessage = 'Network issue. Try again';
      setError(errorMessage);
      shakeError();
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ no loading here (controlled by the flow)
  const handleGoogleLogin = async (idToken: string) => {
    setError('');
    const data = await signInWithGoogle(idToken, userType);
    await finalizeLogin(data, userType);
  };

  const handleGooglePress = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setError('');

    if (!validateClientIdsOrAlert()) {
      setIsGoogleLoading(false);
      return;
    }

    try {
      await promptGoogleSignIn();
      // loading stays true until we finish processing googleResponse
    } catch (e: any) {
      setIsGoogleLoading(false);
      setError('Google sign-in failed. Prompt error');
      shakeError();
      showDebug('❌ prompt error', { message: e?.message || String(e) });
    }
  };

  useEffect(() => {
    if (!googleResponse) return;

    // ✅ minimal response debug (no tokens)
    if (OAUTH_DEBUG_ALERTS) {
      showDebug('OAuth response', {
        type: googleResponse.type,
        hasAuthentication: !!(googleResponse as any).authentication,
        hasIdToken:
          !!(googleResponse as any).authentication?.idToken ||
          !!(googleResponse as any).authentication?.id_token,
      });
    }

    if (googleResponse.type !== 'success') {
      setIsGoogleLoading(false);
      return;
    }

    const idToken =
      (googleResponse as any).authentication?.idToken ||
      (googleResponse as any).authentication?.id_token;

    if (!idToken) {
      setIsGoogleLoading(false);
      setError('Google sign-in failed. Missing id_token');
      shakeError();
      return;
    }

    (async () => {
      try {
        await handleGoogleLogin(idToken as string);
      } catch (e: any) {
        setError('Google sign-in failed. Try again');
        shakeError();
        showDebug('❌ backend login error', { message: e?.message || String(e) });
      } finally {
        setIsGoogleLoading(false);
      }
    })();
  }, [googleResponse]);

  const roleButton = (type: UserType, label: string, icon: any, color: string) => {
    const selected = userType === type;
    return (
      <Pressable
        onPress={() => setUserType(type)}
        style={({ pressed }) => [
          styles.roleBtn,
          selected && { backgroundColor: color, borderColor: color, ...styles.roleBtnSelected },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={selected ? tokens.colors.textOnDark : color}
          style={styles.roleIcon}
        />
        <Text style={[styles.roleText, { color: selected ? tokens.colors.textOnDark : color }]}>
          {label}
        </Text>
        {selected && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={tokens.colors.textOnDark}
            style={styles.checkIcon}
          />
        )}
      </Pressable>
    );
  };

  return (
    <AuthLayout>
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Ionicons name="log-in-outline" size={40} color={tokens.colors.textOnDark} />
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionLabel}>ACCOUNT</Text>

        <View style={styles.inputGroup}>
          <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#94a3b8"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            returnKeyType="done"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.toggleSecure}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>
        </View>

        {error ? (
          <Animated.View style={[styles.errorContainer, { transform: [{ translateX: shakeAnimation }] }]}>
            <Ionicons name="alert-circle-outline" size={18} color={tokens.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        ) : null}

        <View style={styles.roleRow}>
          {roleButton(UserType.CLIENT, 'Client', 'person-outline', '#64B5F6')}
          {roleButton(UserType.COACH, 'Coach', 'school-outline', '#42A5F5')}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={tokens.colors.primaryDark} />
          ) : (
            <Text style={styles.primaryButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, (isGoogleLoading || !googleRequest) && styles.buttonDisabled]}
          onPress={handleGooglePress}
          disabled={isGoogleLoading || !googleRequest}
        >
          {isGoogleLoading ? (
            <ActivityIndicator color={tokens.colors.textDark} />
          ) : (
            <>
              <Ionicons name="logo-google" size={18} color="#DB4437" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotBtnText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryGhostBtn}
          onPress={() => navigation.navigate('SignUp', { role: userType.toLowerCase() as 'client' | 'coach' })}
        >
          <Text style={styles.secondaryGhostBtnText}>Need an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: tokens.space.xl },
  headerIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: tokens.colors.borderGlass,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.space.md,
  },
  title: {
    fontSize: 30,
    color: tokens.colors.textOnDark,
    fontWeight: tokens.fontWeight.heavy as any,
    textAlign: 'center',
    letterSpacing: 0.6,
    marginBottom: tokens.space.sm,
  },
  subtitle: { fontSize: 15, lineHeight: 22, color: tokens.colors.textSubtle, textAlign: 'center' },

  formCard: {
    ...surfaces.glassCard,
    borderRadius: tokens.radius.xl,
    padding: tokens.space.xl,
    ...utils.shadowSoft,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: tokens.fontWeight.bold as any,
    letterSpacing: 0.8,
    color: tokens.colors.textOnDark,
    marginBottom: tokens.space.md,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.input,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.space.md,
    marginBottom: tokens.space.sm,
    borderWidth: 1.5,
    borderColor: tokens.colors.inputBorder,
  },
  inputIcon: { marginRight: tokens.space.sm },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: tokens.fontWeight.medium as any,
    color: tokens.colors.textDark,
  },
  toggleSecure: { padding: 4, marginLeft: 4 },

  roleRow: {
    flexDirection: 'row',
    gap: tokens.space.md,
    marginTop: tokens.space.md,
    marginBottom: tokens.space.md,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: tokens.radius.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: tokens.colors.light,
  },
  roleBtnSelected: { transform: [{ scale: 1.02 }] },
  roleIcon: { marginRight: 8 },
  roleText: { fontSize: 15, fontWeight: tokens.fontWeight.semibold as any },
  checkIcon: { marginLeft: 6 },

  primaryButton: {
    backgroundColor: tokens.colors.primary,
    paddingVertical: tokens.space.lg,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    marginTop: tokens.space.sm,
  },
  buttonDisabled: { opacity: 0.7 },
  primaryButtonText: {
    color: tokens.colors.textOnDark,
    fontSize: 16,
    fontWeight: tokens.fontWeight.bold as any,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    marginTop: tokens.space.lg,
    marginBottom: tokens.space.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.35)' },
  dividerText: {
    color: tokens.colors.textOnDark,
    fontSize: 12,
    fontWeight: tokens.fontWeight.medium as any,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.space.sm,
    backgroundColor: tokens.colors.light,
    paddingVertical: tokens.space.md,
    borderRadius: tokens.radius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  googleButtonText: {
    color: tokens.colors.textDark,
    fontSize: 15,
    fontWeight: tokens.fontWeight.semibold as any,
  },
  googleIcon: { marginRight: 2 },

  secondaryGhostBtn: { marginTop: tokens.space.md, paddingVertical: tokens.space.sm, alignItems: 'center' },
  secondaryGhostBtnText: {
    color: tokens.colors.textOnDark,
    fontSize: 14,
    fontWeight: tokens.fontWeight.semibold as any,
    textDecorationLine: 'underline',
  },

  forgotBtn: { marginTop: tokens.space.sm, alignItems: 'center' },
  forgotBtnText: {
    color: tokens.colors.textOnDark,
    fontSize: 13,
    fontWeight: tokens.fontWeight.medium as any,
    textDecorationLine: 'underline',
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220,53,69,0.10)',
    padding: tokens.space.sm,
    borderRadius: tokens.radius.sm,
    marginBottom: tokens.space.md,
  },
  errorText: { color: tokens.colors.error, marginLeft: 6, fontSize: 13, fontWeight: tokens.fontWeight.medium as any },
});
