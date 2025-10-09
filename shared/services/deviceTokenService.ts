import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import SecureStorage from '../../auth/services/SecureStorage';

type DeviceTokenListener = (token: string) => void;
const listeners: DeviceTokenListener[] = [];

export function onDeviceTokenReady(cb: DeviceTokenListener) {
  listeners.push(cb);
}

function notifyListeners(token: string) {
  while (listeners.length) {
    const fn = listeners.shift();
    try { fn && fn(token); } catch (e) { console.warn('[deviceTokenService] listener error', e); }
  }
}

// Minimal handler (no alert/sound/badge until explicit UX added)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Fetch (or request) a push token; prompts at most once; returns null if denied/unsupported/error.
export async function getOrFetchDeviceToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return null; // not supported

    const stored = await SecureStorage.getDeviceToken();
  if (stored) { return stored; }

    const settings = await Notifications.getPermissionsAsync();
    let finalStatus = settings.status;

    // Only show permission prompt once; if already asked and not granted, skip.
    if (finalStatus !== 'granted') {
      const alreadyAsked = await SecureStorage.wasNotificationPermissionRequested();
      if (alreadyAsked) {
        return null; // Don't pester user again.
      }
      const req = await Notifications.requestPermissionsAsync();
      await SecureStorage.setNotificationPermissionRequested();
      finalStatus = req.status;
    }
    if (finalStatus !== 'granted') return null;

    // Derive projectId (Expo SDK 54+ often needs this when outside classic managed context)
    const projectId = (Constants as any)?.expoConfig?.extra?.eas?.projectId || (Constants as any)?.easConfig?.projectId;

    const fetchTokenWithTimeout = async (ms: number) => {
      return await Promise.race([
        (async () => {
          const tokenResponse = projectId
            ? await Notifications.getExpoPushTokenAsync({ projectId })
            : await Notifications.getExpoPushTokenAsync();
          return tokenResponse.data as string;
        })(),
        new Promise<string | null>((resolve) => setTimeout(() => resolve(null), ms))
      ]);
    };

    const token = await fetchTokenWithTimeout(3500);
    if (token) {
      await SecureStorage.storeDeviceToken(token);
      notifyListeners(token);
      return token;
    }
    return null;
  } catch (e) {
    // silent fail
    return null;
  }
}
