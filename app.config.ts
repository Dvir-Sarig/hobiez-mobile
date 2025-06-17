import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

const isDevServer = process.env.APP_ENV === 'development';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Hobiez',
    slug: 'hobiez',
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
        bundleIdentifier: 'com.hobiez.app',
        supportsTablet: true
    },
    android: {
        ...config.android,
        package: 'com.hobiez.app',
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
        apiBaseUrl: process.env.APP_ENV === 'development'
            ? 'http://10.0.0.3:8080'
            : 'https://hobiez-backend.onrender.com',
        googleMapsApiKey: 'AIzaSyCJhO6Aret0kyO_YPhtgbb6E-Jn24CvVe8',
        eas: {
          projectId: '8a9bc157-d1de-499a-a3bd-54b3545170e2'
        }
    },   
    plugins: [
        'expo-secure-store'
    ]
});

