// src/services/coachService.ts
import API_BASE_URL from '../../shared/config';
import SecureStorage from '../../auth/services/SecureStorage';

const getAuthHeaders = async () => {
    const token = await SecureStorage.getToken();
    if (!token) throw new Error('No authentication token found');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

export const fetchCoachGlobalInfo = async (coachId: number) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/coach-global-info/${coachId}`, {
        headers,
    });
    if (!response.ok) throw new Error('Failed to fetch coach info');
    return await response.json();
};
