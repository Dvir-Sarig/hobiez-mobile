import Constants from 'expo-constants';

const { apiBaseUrl, googleMapsApiKey } = Constants.expoConfig?.extra || {};

export const API_BASE_URL = apiBaseUrl;
export const GOOGLE_MAPS_API_KEY = googleMapsApiKey;
export default API_BASE_URL;