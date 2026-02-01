import Constants from 'expo-constants';

const {
	apiBaseUrl,
	googleMapsApiKey,
	googleAndroidClientId,
	googleIosClientId,
	googleWebClientId,
	googleExpoClientId,
} = Constants.expoConfig?.extra || {};

let resolved = apiBaseUrl as string | undefined;
if (resolved && resolved.endsWith('/')) resolved = resolved.slice(0, -1);

if (__DEV__) {
	console.log('[config] API Base URL:', resolved);
}

export const API_BASE_URL = apiBaseUrl;
export const GOOGLE_MAPS_API_KEY = googleMapsApiKey;
export const GOOGLE_ANDROID_CLIENT_ID = googleAndroidClientId;
export const GOOGLE_IOS_CLIENT_ID = googleIosClientId;
export const GOOGLE_WEB_CLIENT_ID = googleWebClientId;
export const GOOGLE_EXPO_CLIENT_ID = googleExpoClientId;
export default API_BASE_URL;