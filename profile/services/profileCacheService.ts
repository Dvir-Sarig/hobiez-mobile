import AsyncStorage from '@react-native-async-storage/async-storage';
import { CoachProfile, ClientProfile } from '../types/profile';

const CACHE_KEYS = {
    USER_PROFILE: (userId: string) => `user_profile_${userId}`,
    CACHE_TIMESTAMP: 'profile_cache_timestamp'
};

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds

export const profileCacheService = {
    setUserProfile: async (userId: string, profile: CoachProfile | ClientProfile) => {
        try {
            await AsyncStorage.setItem(CACHE_KEYS.USER_PROFILE(userId), JSON.stringify(profile));
            await AsyncStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
        } catch (error) {
            console.error('Error caching user profile:', error);
        }
    },

    getUserProfile: async (userId: string): Promise<CoachProfile | ClientProfile | null> => {
        try {
            const timestamp = await AsyncStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
            if (!timestamp) {
                return null;
            }

            const now = Date.now();
            const cacheAge = now - parseInt(timestamp);
            
            if (cacheAge > CACHE_DURATION) {
                await profileCacheService.clearUserProfile(userId);
                return null;
            }

            const profile = await AsyncStorage.getItem(CACHE_KEYS.USER_PROFILE(userId));
            if (profile) {
            }
            return profile ? JSON.parse(profile) : null;
        } catch (error) {
            console.error('Error getting cached user profile:', error);
            return null;
        }
    },

    clearUserProfile: async (userId: string) => {
        try {
            await AsyncStorage.removeItem(CACHE_KEYS.USER_PROFILE(userId));
            await AsyncStorage.removeItem(CACHE_KEYS.CACHE_TIMESTAMP);
        } catch (error) {
            console.error('Error clearing user profile cache:', error);
        }
    }
}; 