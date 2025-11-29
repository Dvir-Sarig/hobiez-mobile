import API_BASE_URL from '../../shared/config';
import SecureStorage from './SecureStorage';
import { Platform } from 'react-native';
import { UserType } from './authService';

interface RegisterOptions {
  token: string;
  userType: UserType;
  platform?: string | null;
  force?: boolean; // bypass idempotency cache
}

// Posts device registration to backend with idempotent client-side caching.
export async function registerDeviceIfNeeded(options: RegisterOptions): Promise<boolean> {
  try {
    const authToken = await SecureStorage.getToken();
    if (!authToken) return false;
    const userId = await SecureStorage.getUserId();
    if (!userId) return false;

    const last = await SecureStorage.getDeviceRegistrationInfo();
    if (!options.force && last && last.userId === userId && last.token === options.token) return true;

    const payload = {
      token: options.token,
      platform: options.platform || Platform.OS.toUpperCase(),
      userType: options.userType
    };

    const res = await fetch(`${API_BASE_URL}/devices/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) return false;

    await SecureStorage.storeDeviceRegistrationInfo({ userId, token: options.token });
    return true;
  } catch (e) {
    return false;
  }
}
