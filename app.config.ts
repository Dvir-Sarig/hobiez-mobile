import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

// Check if we're running in a development environment
const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.EXPO_PUBLIC_URL;

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Hobinet',
    slug: 'hobinet-mobile',
    version: '1.0.1',
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
        bundleIdentifier: 'com.dvirs.hobinet',
        supportsTablet: true
    },
    android: {
        ...config.android,
        package: 'com.dvirs.hobinet',
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
        apiBaseUrl: 'https://hobinet-backend.onrender.com',
        googleMapsApiKey: 'AIzaSyCJhO6Aret0kyO_YPhtgbb6E-Jn24CvVe8',
        eas: {
            projectId: '608daaa3-e056-4641-80da-2e6b047dc45c'
        }
    },
    plugins: [
        'expo-secure-store'
    ]
});

