import API_BASE_URL from '../../shared/config';
import { CoachProfile, ClientProfile } from '../types/profile';
import SecureStorage from '../../auth/services/SecureStorage';
import { profileCacheService } from '../services/profileCacheService';

const getAuthHeaders = async () => {
    const token = await SecureStorage.getToken();
    if (!token) throw new Error('No authentication token found');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

// --------- Coach Profile ---------

export const createCoachProfile = async (
  coachId: string,
  profileData: CoachProfile
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/coach-profile?coachId=${coachId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    if (errorData.includes('Unique index or primary key violation')) {
      if (errorData.includes('EMAIL')) {
        throw new Error('A profile with this email already exists. Please use a different email address.');
      }
      throw new Error('A profile already exists for this user.');
    }
    throw new Error(errorData || 'Failed to create profile');
  }
};

export const fetchCoachProfile = async (
  coachId: string
): Promise<CoachProfile | null> => {
  try {
    
    // Try to get from cache first
    const cachedProfile = await profileCacheService.getUserProfile(coachId);
    if (cachedProfile) {
      return cachedProfile as CoachProfile;
    }

    // If not in cache, fetch from API
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/coach-profile/${coachId}`, {
      headers,
    });

    if (!response.ok) {
      return null;
    }
    
    const profile = await response.json();
    
    // Cache the profile
    await profileCacheService.setUserProfile(coachId, profile);
    
    return profile;
  } catch (error) {
    console.error('Error fetching coach profile:', error);
    return null;
  }
};

export const fetchPublicCoachProfile = async (
  coachId: string
): Promise<CoachProfile | null> => {
  try {
    // Validate UUID format
    if (!isValidUUID(coachId)) {
      throw new Error('Invalid coach ID format');
    }

    const response = await fetch(`${API_BASE_URL}/public/coach-profile/${coachId}`);
    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error('Error in fetchPublicCoachProfile:', error);
    return null;
  }
};

// Helper function to validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const updateCoachProfile = async (
  coachId: string,
  profileData: CoachProfile
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/coach-profile/${coachId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || 'Failed to update profile');
  }

  // Update cache with new profile data
  await profileCacheService.setUserProfile(coachId, profileData);
};

// --------- Client Profile ---------

export const createClientProfile = async (
  clientId: string,
  profileData: ClientProfile
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/client-profile?clientId=${clientId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    if (errorData.includes('Unique index or primary key violation')) {
      if (errorData.includes('EMAIL')) {
        throw new Error('A profile with this email already exists. Please use a different email address.');
      }
      throw new Error('A profile already exists for this user.');
    }
    throw new Error(errorData || 'Failed to create profile');
  }
};

export const fetchClientProfile = async (
  clientId: string
): Promise<ClientProfile | null> => {
  try {
    
    // Try to get from cache first
    const cachedProfile = await profileCacheService.getUserProfile(clientId);
    if (cachedProfile) {
      return cachedProfile as ClientProfile;
    }

    // If not in cache, fetch from API
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/client-profile/${clientId}`, {
      headers,
    });

    if (!response.ok) {
      return null;
    }
    
    const profile = await response.json();
    
    // Cache the profile
    await profileCacheService.setUserProfile(clientId, profile);
    
    return profile;
  } catch (error) {
    console.error('Error fetching client profile:', error);
    return null;
  }
};

export const updateClientProfile = async (
  clientId: string,
  profileData: ClientProfile
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/client-profile/${clientId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || 'Failed to update profile');
  }

  // Update cache with new profile data
  await profileCacheService.setUserProfile(clientId, profileData);
};

export const fetchPublicClientProfile = async (
  clientId: string
): Promise<ClientProfile | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/client-profile/${clientId}`);
    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error('Error in fetchPublicClientProfile:', error);
    return null;
  }
};
