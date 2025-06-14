import API_BASE_URL from '../../shared/config';

export interface ClientGlobalInfo {
  name: string;
  email: string;
  profilePictureUrl?: string | null;
}

export const fetchClientGlobalInfo = async (
  clientId: number
): Promise<ClientGlobalInfo> => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/client-global-info/${clientId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch client global info for client with ID ${clientId}`);
    }

    const data: ClientGlobalInfo = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching client global info for client ${clientId}:`, error);
    throw error;
  }
};
