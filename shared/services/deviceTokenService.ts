import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import SecureStorage from '../../auth/services/SecureStorage';

// -----------------------------------------
//  Listeners for token ready (optional)
// -----------------------------------------
type DeviceTokenListener = (token: string) => void;
const listeners: DeviceTokenListener[] = [];

export function onDeviceTokenReady(cb: DeviceTokenListener) {
  listeners.push(cb);
}
function notifyListeners(token: string) {
  while (listeners.length) {
    const fn = listeners.shift();
    try { fn?.(token); } catch (e) { console.warn('[deviceTokenService] listener error', e); }
  }
}

// -----------------------------------------
//  Foreground display handler (for dev/prod)
//  בפרודקשן אפשר לשנות shouldShowAlert ל-false אם לא רוצים באנר בקדמה
// -----------------------------------------
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const isExpoGo = (Constants?.appOwnership === 'expo');

// -----------------------------------------
//  Permissions
// -----------------------------------------
async function requestPermissionsIos(): Promise<Notifications.PermissionStatus> {
  const after = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: true },
  });
  return after.status as Notifications.PermissionStatus;
}

async function requestPermissionsAndroid(): Promise<Notifications.PermissionStatus> {
  // ב-Android 13+ זה יבקש POST_NOTIFICATIONS; בגרסאות ישנות יחזור granted כברירת מחדל
  const after = await Notifications.requestPermissionsAsync();
  return after.status as Notifications.PermissionStatus;
}

/**
 * שואל הרשאת התראות **פעם אחת** אחרי ההתחברות הראשונה.
 * אם OS כבר אישר בעבר — לא יופיע פרומפט, ונעדכן את הדגל כדי שלא נבקש שוב.
 * מחזיר את ה-Status בפועל, או null אם החלטנו לא לשאול (כבר נשאל בעבר).
 */
export async function askPermissionOnceAfterSignIn(): Promise<Notifications.PermissionStatus | null> {
  try {
    const alreadyAsked = await SecureStorage.wasNotificationPermissionRequested();
    if (alreadyAsked) return null;

    // אם כבר מאושר ברמת מערכת—אל תשאל שוב; פשוט סמן שנשאל/טופל
    const current = await Notifications.getPermissionsAsync();
    if (current.status === 'granted') {
      await SecureStorage.setNotificationPermissionRequested();
      return current.status as Notifications.PermissionStatus;
    }

    // אחרת—בקש פעם אחת עכשיו (אחרי התחברות)
    const status = Platform.OS === 'ios'
        ? await requestPermissionsIos()
        : await requestPermissionsAndroid();

    // נסמן שניסינו/שאלנו כדי לא "לנדנד"
    await SecureStorage.setNotificationPermissionRequested();
    return status;
  } catch (e) {
    console.log('[notif] askPermissionOnceAfterSignIn error:', e);
    return null;
  }
}

/** בדיקה מהירה: האם יש הרשאה כרגע */
async function hasPermissionGranted(): Promise<boolean> {
  const p = await Notifications.getPermissionsAsync();
  return p.status === 'granted';
}

// -----------------------------------------
//  Token fetch
// -----------------------------------------
async function fetchExpoPushTokenOrNull(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return null;

    // חייבים הרשאה כדי להביא טוקן
    const granted = await hasPermissionGranted();
    if (!granted) {
      console.log('[notif] Permission not granted – skip token fetch.');
      return null;
    }

    // ב-iOS בתוך Expo Go אין טוקן אמיתי
    if (isExpoGo && Platform.OS === 'ios') {
      console.log('[notif] Expo Go on iOS ⇒ no real push token (use local notifications for testing).');
      return null;
    }

    const projectId =
        (Constants as any)?.expoConfig?.extra?.eas?.projectId ||
        (Constants as any)?.easConfig?.projectId;

    const resp = projectId
        ? await Notifications.getExpoPushTokenAsync({ projectId })
        : await Notifications.getExpoPushTokenAsync();

    return resp?.data ?? null;
  } catch (e) {
    console.log('[notif] fetch token error:', e);
    return null;
  }
}

/**
 * מביא טוקן ושומר אותו אם חדש; אם כבר קיים טוקן שמור—מחזיר אותו.
 * מפעיל notifyListeners אם התקבל טוקן חדש.
 */
export async function getOrFetchDeviceToken(): Promise<string | null> {
  try {
    // אם לא Expo Go ויש טוקן שמור—החזר אותו
    if (!isExpoGo) {
      const stored = await SecureStorage.getDeviceToken();
      if (stored) return stored;
    }

    // Timeout עדין למקרי קצה
    const token = await Promise.race<string | null>([
      fetchExpoPushTokenOrNull(),
      new Promise<string | null>((res) => setTimeout(() => res(null), 8000)),
    ]);

    if (token) {
      await SecureStorage.storeDeviceToken(token);
      notifyListeners(token);
    }
    return token;
  } catch (e) {
    console.log('[notif] getOrFetchDeviceToken error:', e);
    return null;
  }
}

/**
 * רענון שקט + רישום לשרת אם צריך:
 * - אם אין הרשאה => לא עושה כלום
 * - אם יש טוקן חדש / משתמש התחלף => קורא ל-registerFn ושומר info כדי למנוע כפילויות
 *
 * @param registerFn פונקציה שרושמת לשרת (מקבלת token בלבד)
 * @param currentUserId userId נוכחי (לזיהוי שינוי משתמש)
 */
export async function refreshAndMaybeRegister(
    registerFn: (token: string) => Promise<void>,
    currentUserId: string
) {
  // אין הרשאה? אין מה לחדש
  const granted = await hasPermissionGranted();
  if (!granted) return;

  const newToken = await fetchExpoPushTokenOrNull();
  if (!newToken) return;

  const storedToken = await SecureStorage.getDeviceToken();
  if (storedToken !== newToken) {
    await SecureStorage.storeDeviceToken(newToken);
    notifyListeners(newToken);
  }

  const last = await SecureStorage.getDeviceRegistrationInfo();
  const needRegister = !last || last.userId !== currentUserId || last.token !== newToken;
  if (needRegister) {
    await registerFn(newToken); // בצד שלך: upsert בשרת
    await SecureStorage.storeDeviceRegistrationInfo({ userId: currentUserId, token: newToken });
  }
}

// -----------------------------------------
//  Local notifications (for tests/dev)
// -----------------------------------------
export async function sendLocalNotificationNow(
    title: string,
    body: string,
    data?: Record<string, any>
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: 'default' },
      trigger: null,
    });
  } catch (e) {
    console.log('[notif] sendLocalNotificationNow error:', e);
  }
}

/**
 * Dev helper ל-Expo Go:
 * - מנסה להביא טוקן (ב-iOS Expo Go יחזור null וזה תקין)
 * - אופציונלי: שולח התראה מקומית "ברוך הבא"
 */
export async function initNotificationsForExpoGoFlow(options?: {
  showWelcomeLocal?: boolean;
  welcomeTitle?: string;
  welcomeBody?: string;
  welcomeData?: Record<string, any>;
}): Promise<string | null> {
  const token = await getOrFetchDeviceToken();
  if (options?.showWelcomeLocal) {
    await sendLocalNotificationNow(
        options.welcomeTitle ?? 'התראות הופעלו',
        options.welcomeBody ?? 'בדיקת התראה מקומית (Expo Go).',
        options.welcomeData
    );
  }
  return token; // ב-iOS Expo Go עשוי להיות null—זה צפוי
}
