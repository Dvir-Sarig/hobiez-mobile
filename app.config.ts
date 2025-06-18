import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

// Check if we're running in a development environment
const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.EXPO_PUBLIC_URL;

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Hobiez',
    slug: 'hobiez-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
        '**/*'
    ],
    ios: {
        ...config.ios,
        bundleIdentifier: 'com.dvirs.hobiez',
        supportsTablet: true
    },
    android: {
        ...config.android,
        package: 'com.dvirs.hobiez',
        edgeToEdgeEnabled: true,
        adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#ffffff'
        }
    },
    web: {
        favicon: './assets/favicon.png'
    },
    extra: {
        apiBaseUrl: 'https://hobiez-backend.onrender.com',
        googleMapsApiKey: 'AIzaSyCJhO6Aret0kyO_YPhtgbb6E-Jn24CvVe8',
        eas: {
            projectId: '8a9bc157-d1de-499a-a3bd-54b3545170e2'
        }
    },
    plugins: [
        'expo-secure-store'
    ]
});

