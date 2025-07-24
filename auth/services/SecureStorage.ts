import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const USER_ID_KEY = 'user_id';
const USER_TYPE_KEY = 'user_type';
const USER_INFO_KEY = 'user_info';

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

    async storeUserInfo(userInfo: any): Promise<void> {
        try {
            await storage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
        } catch (error) {
            console.error('Error storing user info:', error);
            throw error;
        }
    },

    async getUserInfo(): Promise<any | null> {
        try {
            const userInfo = await storage.getItem(USER_INFO_KEY);
            return userInfo ? JSON.parse(userInfo) : null;
        } catch (error) {
            console.error('Error getting user info:', error);
            return null;
        }
    },

    async clearAll(): Promise<void> {
        try {
            await storage.deleteItem(TOKEN_KEY);
            await storage.deleteItem(USER_ID_KEY);
            await storage.deleteItem(USER_TYPE_KEY);
            await storage.deleteItem(USER_INFO_KEY);
        } catch (error) {
            console.error('Error clearing secure storage:', error);
            throw error;
        }
    }
};