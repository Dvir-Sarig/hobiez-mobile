import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';
import { ExpoConfig, ConfigContext } from 'expo/config';

const APP_ENV = process.env.APP_ENV ?? 'development';
const envFile = path.resolve(process.cwd(), `.env.${APP_ENV}`);

if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile, override: true });
    console.log(`[config] Loaded ${envFile}`);
} else {
    dotenv.config();
    console.warn(`[config] ⚠️ .env.${APP_ENV} not found – using default .env`);
}

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Hobinet',
    slug: 'hobinet-mobile',
    owner: 'dvirs',
    version: '1.1.7',
    // Required for expo-dev-client to determine deep link scheme
    scheme: 'hobinet',

    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',

    splash: {
        image: './assets/adaptive-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
    },

    assetBundlePatterns: ['**/*'],

    ios: {
        ...config.ios,
        bundleIdentifier: 'com.dvirs.hobinet',
        supportsTablet: true,
        buildNumber: '1.1.7',
        infoPlist: {
            ...config.ios?.infoPlist,
            NSCameraUsageDescription:
                'This app needs access to your camera to let you take profile pictures.',
            NSPhotoLibraryUsageDescription:
                'This app needs access to your photo library to let you choose profile pictures.',
            NSPhotoLibraryAddUsageDescription:
                'This app saves images you take to your photo library.',
            ITSAppUsesNonExemptEncryption: false,
            CFBundleURLTypes: [
                { CFBundleURLSchemes: ['hobinet'] },
                { CFBundleURLSchemes: ['com.googleusercontent.apps.428494796773-r03cdal0aqpun0euu8g2m1ivqd6k8gq5'] },
            ],
        },
    },

    android: {
        ...config.android,
        package: 'com.dvirs.hobinet',
        edgeToEdgeEnabled: true,
        permissions: ['CAMERA', 'POST_NOTIFICATIONS', 'READ_MEDIA_IMAGES'],
        adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#ffffff',
        },
    },

    web: {
        favicon: './assets/favicon.png',
    },

    runtimeVersion: { policy: 'appVersion' },
    updates: {
        url: 'https://u.expo.dev/608daaa3-e056-4641-80da-2e6b047dc45c',
    },

    extra: {
        apiBaseUrl:
            process.env.EXPO_PUBLIC_API_BASE_URL ||
            'https://hobinet-backend.onrender.com',
        googleMapsApiKey:
            process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'REPLACE_ME_IN_.env',
        googleAndroidClientId:
            "428494796773-d8kk8lkb7485mq91evpf0atir73jet0b.apps.googleusercontent.com",
        googleIosClientId:
            "428494796773-r03cdal0aqpun0euu8g2m1ivqd6k8gq5.apps.googleusercontent.com",
        googleWebClientId:
            "428494796773-ped969msbm5oon25a5t119p6pb6mii30.apps.googleusercontent.com",
        googleExpoClientId:
            "428494796773-9u6opvespvpb403punmct8acugtij4l5.apps.googleusercontent.com",
        eas: {
            projectId: '608daaa3-e056-4641-80da-2e6b047dc45c',
        },
        appEnv: APP_ENV,
    },

    notification: {
        icon: './assets/notification-icon.png',
        color: '#1976D2',
        iosDisplayInForeground: true,
    },

    plugins: [
        'expo-secure-store',
        'expo-notifications',
    ],
});
