import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lesson } from '../types/Lesson';

const CACHE_KEYS = {
    AVAILABLE_LESSONS: 'available_lessons',
    REGISTERED_LESSONS: (userId: string) => `registered_lessons_${userId}`,
    CACHE_TIMESTAMP: 'cache_timestamp'
};

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds

export const lessonCacheService = {
    setAvailableLessons: async (lessons: Lesson[]) => {
        try {
            await AsyncStorage.setItem(CACHE_KEYS.AVAILABLE_LESSONS, JSON.stringify(lessons));
            await AsyncStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
        } catch (error) {
            console.error('Error caching available lessons:', error);
        }
    },

    getAvailableLessons: async (): Promise<Lesson[] | null> => {
        try {
            const timestamp = await AsyncStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
            if (!timestamp) {
                return null;
            }

            const now = Date.now();
            const cacheAge = now - parseInt(timestamp);
            
            if (cacheAge > CACHE_DURATION) {
                await lessonCacheService.clearAvailableLessons();
                return null;
            }

            const lessons = await AsyncStorage.getItem(CACHE_KEYS.AVAILABLE_LESSONS);
            return lessons ? JSON.parse(lessons) : null;
        } catch (error) {
            console.error('Error getting cached lessons:', error);
            return null;
        }
    },

    setRegisteredLessons: async (userId: string, lessons: Lesson[]) => {
        try {
            await AsyncStorage.setItem(CACHE_KEYS.REGISTERED_LESSONS(userId), JSON.stringify(lessons));
            await AsyncStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
        } catch (error) {
            console.error('Error caching registered lessons:', error);
        }
    },

    getRegisteredLessons: async (userId: string): Promise<Lesson[] | null> => {
        try {
            const timestamp = await AsyncStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
            if (!timestamp) {
                return null;
            }

            const now = Date.now();
            const cacheAge = now - parseInt(timestamp);
            
            if (cacheAge > CACHE_DURATION) {
                await lessonCacheService.clearRegisteredLessons(userId);
                return null;
            }

            const lessons = await AsyncStorage.getItem(CACHE_KEYS.REGISTERED_LESSONS(userId));
            return lessons ? JSON.parse(lessons) : null;
        } catch (error) {
            console.error('Error getting cached registered lessons:', error);
            return null;
        }
    },

    // Clear cache when user registers/unregisters
    clearAllCache: async (userId: string) => {
        try {
            await lessonCacheService.clearAvailableLessons();
            await lessonCacheService.clearRegisteredLessons(userId);
        } catch (error) {
            console.error('Error clearing all cache:', error);
        }
    },

    clearAvailableLessons: async () => {
        try {
            await AsyncStorage.removeItem(CACHE_KEYS.AVAILABLE_LESSONS);
            await AsyncStorage.removeItem(CACHE_KEYS.CACHE_TIMESTAMP);
        } catch (error) {
            console.error('Error clearing available lessons cache:', error);
        }
    },

    clearRegisteredLessons: async (userId: string) => {
        try {
            await AsyncStorage.removeItem(CACHE_KEYS.REGISTERED_LESSONS(userId));
            await AsyncStorage.removeItem(CACHE_KEYS.CACHE_TIMESTAMP);
        } catch (error) {
            console.error('Error clearing registered lessons cache:', error);
        }
    }
}; 