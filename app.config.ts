import 'dotenv/config';

export default ({ config }: any) => {
    const isDevelopment = process.env.APP_ENV === 'development';

    return {
        ...config,
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
        extra: {
            apiBaseUrl: isDevelopment
                ? 'http://10.0.0.14:8080'
                : 'https://hobiez-backend.onrender.com',
            googleMapsApiKey: 'AIzaSyCJhO6Aret0kyO_YPhtgbb6E-Jn24CvVe8',
            eas: {
                projectId: '8a9bc157-d1de-499a-a3bd-54b3545170e2'
            }
        }
    };
};

