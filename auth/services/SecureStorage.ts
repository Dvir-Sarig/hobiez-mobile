import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_ID_KEY = 'user_id';
const USER_TYPE_KEY = 'user_type';
const USER_INFO_KEY = 'user_info';

export default {
    async storeToken(token: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
        } catch (error) {
            console.error('Error storing token:', error);
            throw error;
        }
    },

    async getToken(): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(TOKEN_KEY);
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    async storeUserId(userId: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(USER_ID_KEY, userId);
        } catch (error) {
            console.error('Error storing user ID:', error);
            throw error;
        }
    },

    async getUserId(): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(USER_ID_KEY);
        } catch (error) {
            console.error('Error getting user ID:', error);
            return null;
        }
    },

    async storeUserType(userType: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(USER_TYPE_KEY, userType);
        } catch (error) {
            console.error('Error storing user type:', error);
            throw error;
        }
    },

    async getUserType(): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(USER_TYPE_KEY);
        } catch (error) {
            console.error('Error getting user type:', error);
            return null;
        }
    },

    async storeUserInfo(userInfo: any): Promise<void> {
        try {
            await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(userInfo));
        } catch (error) {
            console.error('Error storing user info:', error);
            throw error;
        }
    },

    async getUserInfo(): Promise<any | null> {
        try {
            const userInfo = await SecureStore.getItemAsync(USER_INFO_KEY);
            return userInfo ? JSON.parse(userInfo) : null;
        } catch (error) {
            console.error('Error getting user info:', error);
            return null;
        }
    },

    async clearAll(): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_ID_KEY);
            await SecureStore.deleteItemAsync(USER_TYPE_KEY);
            await SecureStore.deleteItemAsync(USER_INFO_KEY);
        } catch (error) {
            console.error('Error clearing secure storage:', error);
            throw error;
        }
    }
};