// src/services/coachService.ts
import API_BASE_URL from '../../shared/config';

export interface CoachGlobalInfo {
  name: string;
  email: string;
}

export const fetchCoachGlobalInfo = async (
  coachId: number,
  token: string
): Promise<CoachGlobalInfo> => {
  try {
    const response = await fetch(`${API_BASE_URL}/coach-global-info/${coachId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch coach info for coachId ${coachId}`);
    }

    const data: CoachGlobalInfo = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching coach info for coachId ${coachId}:`, error);
    throw error;
  }
};
