import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const USER_ID_KEY = 'user_id';
const USER_TYPE_KEY = 'user_type';
const DEVICE_TOKEN_KEY = 'device_token';
const NOTIFICATION_PERMISSION_REQUESTED_KEY = 'notification_permission_requested';
const DEVICE_REGISTRATION_INFO_KEY = 'device_registration_info'; // caches last sent { userId, token }

// Web storage fallback for debugging
const webStorage = {
    async setItem(key: string, value: string): Promise<void> {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    },
    
    async getItem(key: string): Promise<string | null> {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(key);
        }
        return null;
    },
    
    async deleteItem(key: string): Promise<void> {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    }
};

// Mobile storage with unified interface
const mobileStorage = {
    async setItem(key: string, value: string): Promise<void> {
        await SecureStore.setItemAsync(key, value);
    },
    
    async getItem(key: string): Promise<string | null> {
        return await SecureStore.getItemAsync(key);
    },
    
    async deleteItem(key: string): Promise<void> {
        await SecureStore.deleteItemAsync(key);
    }
};

// Platform-aware storage
const storage = Platform.OS === 'web' ? webStorage : mobileStorage;

export default {
    async storeToken(token: string): Promise<void> {
        try {
            await storage.setItem(TOKEN_KEY, token);
        } catch (error) {
            console.error('Error storing token:', error);
            throw error;
        }
    },

    async getToken(): Promise<string | null> {
        try {
            return await storage.getItem(TOKEN_KEY);
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    async storeUserId(userId: string): Promise<void> {
        try {
            await storage.setItem(USER_ID_KEY, userId);
        } catch (error) {
            console.error('Error storing user ID:', error);
            throw error;
        }
    },

    async getUserId(): Promise<string | null> {
        try {
            return await storage.getItem(USER_ID_KEY);
        } catch (error) {
            console.error('Error getting user ID:', error);
            return null;
        }
    },

    async storeUserType(userType: string): Promise<void> {
        try {
            await storage.setItem(USER_TYPE_KEY, userType);
        } catch (error) {
            console.error('Error storing user type:', error);
            throw error;
        }
    },

    async getUserType(): Promise<string | null> {
        try {
            return await storage.getItem(USER_TYPE_KEY);
        } catch (error) {
            console.error('Error getting user type:', error);
            return null;
        }
    },


    async clearAll(): Promise<void> {
        try {
            await storage.deleteItem(TOKEN_KEY);
            await storage.deleteItem(USER_ID_KEY);
            await storage.deleteItem(USER_TYPE_KEY);
            await storage.deleteItem(DEVICE_TOKEN_KEY);
            await storage.deleteItem(NOTIFICATION_PERMISSION_REQUESTED_KEY);
            await storage.deleteItem(DEVICE_REGISTRATION_INFO_KEY);
        } catch (error) {
            console.error('Error clearing secure storage:', error);
            throw error;
        }
    }
    ,
    async clearAuthState(): Promise<void> {
        // Intentionally keep device token & notification permission & registration info
        try {
            await storage.deleteItem(TOKEN_KEY);
            await storage.deleteItem(USER_ID_KEY);
            await storage.deleteItem(USER_TYPE_KEY);
            // Keep DEVICE_TOKEN_KEY, NOTIFICATION_PERMISSION_REQUESTED_KEY, DEVICE_REGISTRATION_INFO_KEY
        } catch (error) {
            console.error('Error clearing auth state:', error);
            throw error;
        }
    },
    async storeDeviceToken(deviceToken: string): Promise<void> {
        try {
            await storage.setItem(DEVICE_TOKEN_KEY, deviceToken);
        } catch (error) {
            console.error('Error storing device token:', error);
            throw error;
        }
    },
    async getDeviceToken(): Promise<string | null> {
        try {
            return await storage.getItem(DEVICE_TOKEN_KEY);
        } catch (error) {
            console.error('Error getting device token:', error);
            return null;
        }
    },
    async storeDeviceRegistrationInfo(info: { userId: string; token: string }): Promise<void> {
        try {
            await storage.setItem(DEVICE_REGISTRATION_INFO_KEY, JSON.stringify(info));
        } catch (error) {
            console.error('Error storing device registration info:', error);
        }
    },
    async getDeviceRegistrationInfo(): Promise<{ userId: string; token: string } | null> {
        try {
            const raw = await storage.getItem(DEVICE_REGISTRATION_INFO_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error('Error getting device registration info:', error);
            return null;
        }
    },
    async setNotificationPermissionRequested(): Promise<void> {
        try {
            await storage.setItem(NOTIFICATION_PERMISSION_REQUESTED_KEY, 'true');
        } catch (error) {
            console.error('Error setting notification permission requested flag:', error);
        }
    },
    async wasNotificationPermissionRequested(): Promise<boolean> {
        try {
            const v = await storage.getItem(NOTIFICATION_PERMISSION_REQUESTED_KEY);
            return v === 'true';
        } catch (error) {
            console.error('Error getting notification permission requested flag:', error);
            return false;
        }
    }
};