import Constants from 'expo-constants';

const { apiBaseUrl, googleMapsApiKey } = Constants.expoConfig?.extra || {};


export const API_BASE_URL = 'http://10.0.0.5:8080';
export const GOOGLE_MAPS_API_KEY = googleMapsApiKey;
export default API_BASE_URL;