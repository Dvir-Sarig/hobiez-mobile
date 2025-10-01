import Constants from 'expo-constants';

const { apiBaseUrl, googleMapsApiKey } = Constants.expoConfig?.extra || {};

let resolved = apiBaseUrl as string | undefined;
if (resolved && resolved.endsWith('/')) resolved = resolved.slice(0, -1);

if (__DEV__) {
	console.log('[config] API Base URL:', resolved);
}

export const API_BASE_URL = resolved as string;
export const GOOGLE_MAPS_API_KEY = googleMapsApiKey;
export default API_BASE_URL;