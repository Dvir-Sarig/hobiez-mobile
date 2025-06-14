import API_BASE_URL from '../../shared/config';
import { CoachProfile, ClientProfile } from '../types/profile';

// --------- Coach Profile ---------

export const createCoachProfile = async (
  coachId: number,
  profileData: CoachProfile,
  token: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/coach-profile?coachId=${coachId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
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
  coachId: number,
  token: string
): Promise<CoachProfile | null> => {
  const response = await fetch(`${API_BASE_URL}/coach-profile/${coachId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) return null;
  return response.json();
};

export const fetchPublicCoachProfile = async (
  coachId: string
): Promise<CoachProfile | null> => {
  try {
    const numericCoachId = parseInt(coachId, 10);
    if (isNaN(numericCoachId)) throw new Error('Invalid coach ID format');

    const response = await fetch(`${API_BASE_URL}/public/coach-profile/${numericCoachId}`);
    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error('Error in fetchPublicCoachProfile:', error);
    return null;
  }
};

export const updateCoachProfile = async (
  coachId: number,
  profileData: CoachProfile,
  token: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/coach-profile/${coachId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || 'Failed to update profile');
  }
};

// --------- Client Profile ---------

export const createClientProfile = async (
  clientId: number,
  profileData: ClientProfile,
  token: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/client-profile?clientId=${clientId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
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
  clientId: number,
  token: string
): Promise<ClientProfile | null> => {
  const response = await fetch(`${API_BASE_URL}/client-profile/${clientId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) return null;
  return response.json();
};

export const updateClientProfile = async (
  clientId: number,
  profileData: ClientProfile,
  token: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/client-profile/${clientId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || 'Failed to update profile');
  }
};

export const fetchPublicClientProfile = async (
  clientId: number
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
