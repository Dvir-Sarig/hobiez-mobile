import * as Notifications from 'expo-notifications';
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import SecureStorage from '../../auth/services/SecureStorage';
import { registerDeviceIfNeeded } from '../../auth/services/deviceApiService';
import { UserType } from '../../auth/services/authService';

// Types coming from backend (all string values)
export interface NotificationData {
  type: string; // e.g. LESSON_UPDATED, CLIENT_REGISTERED ...
  route?: string; // backend-provided target logical route key
  userType?: 'CLIENT' | 'COACH';
  lessonId?: string; // numeric string
  clientId?: string;
  openModal?: string; // 'true' | 'false'
  focus?: string; // e.g. 'registered'
  highlightLessonId?: string; // same as lessonId sometimes
  role?: string; // lowercase convenience
}

let navigationRef: NavigationContainerRef<RootStackParamList> | null = null;
export function setNavigationRef(ref: NavigationContainerRef<RootStackParamList>) {
  navigationRef = ref;
}

// Pending notification stored if arrives before auth or navigation ready
let pendingNotification: NotificationData | null = null;
let isNavigationReady = false;
export function markNavigationReady() { isNavigationReady = true; tryProcessPending(); }

function tryProcessPending() { if (pendingNotification) { processNotificationData(pendingNotification); pendingNotification = null; } }

function parseData(raw: any): NotificationData | null {
  if (!raw || typeof raw !== 'object') return null;
  return {
    type: String(raw.type || ''),
    route: raw.route ? String(raw.route) : undefined,
    userType: raw.userType === 'CLIENT' || raw.userType === 'COACH' ? raw.userType : undefined,
    lessonId: raw.lessonId ? String(raw.lessonId) : undefined,
    clientId: raw.clientId ? String(raw.clientId) : undefined,
    openModal: raw.openModal ? String(raw.openModal) : undefined,
    focus: raw.focus ? String(raw.focus) : undefined,
    highlightLessonId: raw.highlightLessonId ? String(raw.highlightLessonId) : undefined,
    role: raw.role ? String(raw.role) : undefined,
  };
}

// Auth snapshot provider (injected to avoid circular imports)
export type AuthSnapshotFn = () => { userId: string | null; userType: string | null };
let authSnapshot: AuthSnapshotFn = () => ({ userId: null, userType: null });
export function setAuthSnapshotProvider(fn: AuthSnapshotFn) { authSnapshot = fn; tryProcessPending(); }

export async function handleNotificationResponse(response: Notifications.NotificationResponse) {
  const data = parseData(response.notification.request.content.data);
  if (!data) return;
  processNotificationData(data);
}

export async function handleColdStartNotification() {
  const last = await Notifications.getLastNotificationResponseAsync();
  if (last) {
    const data = parseData(last.notification.request.content.data);
    if (data) processNotificationData(data);
  }
}

function processNotificationData(data: NotificationData) {
  const auth = authSnapshot();
  if (!auth.userId || !auth.userType || !isNavigationReady || !navigationRef) {
    pendingNotification = data;
    return;
  }
  if (data.userType && data.userType.toLowerCase() !== auth.userType) {
    return;
  }

  const lessonIdNum = data.lessonId ? parseInt(data.lessonId, 10) : undefined;
  const baseParams: any = {};

  switch (data.type) {
    case 'LESSON_DELETED': {
      // Client: go to registered tab only (no modal)
      if (auth.userType === 'client') {
        if (lessonIdNum) baseParams.scrollToLessonId = lessonIdNum; // attempt to scroll where it was
        baseParams.focusRegistered = true;
        navigationRef.navigate('MainDrawer', { screen: 'SearchLessons', params: baseParams });
      }
      break;
    }
    case 'LESSON_UPDATED': {
      // Client: registered tab, scroll to lesson, no modal
      if (auth.userType === 'client') {
        if (lessonIdNum) baseParams.scrollToLessonId = lessonIdNum;
        baseParams.focusRegistered = true;
        navigationRef.navigate('MainDrawer', { screen: 'SearchLessons', params: baseParams });
      }
      break;
    }
    case 'CLIENT_REGISTERED':
    case 'CLIENT_UNREGISTERED': {
      if (auth.userType === 'coach') {
        if (lessonIdNum) baseParams.openCoachLessonModal = true, baseParams.lessonId = lessonIdNum; // open modal for coach
        navigationRef.navigate('MainDrawer', { screen: 'CoachLessons', params: baseParams });
      }
      break;
    }
    default: {
      if (data.route) {
        navigationRef.navigate('MainDrawer', { screen: data.route });
      }
    }
  }
}

export function getPendingNotificationForTests() { return pendingNotification; }
