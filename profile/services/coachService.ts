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

export const fetchCoachGlobalInfo = async (coachId: string) => {
    // Validate UUID format
    if (!isValidUUID(coachId)) {
        throw new Error('Invalid coach ID format');
    }

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/coach-global-info/${coachId}`, {
        headers: headers,
    });
    if (!response.ok) throw new Error(`Failed to fetch coach global info for coach with ID ${coachId}`);
    return await response.json();
};

// Helper function to validate UUID format
const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};
