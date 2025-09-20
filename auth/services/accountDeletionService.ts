import API_BASE_URL from "../../shared/config";
import SecureStorage from "./SecureStorage";

export const deleteAccount = async (password: string): Promise<void> => {
    const token = await SecureStorage.getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/account`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 400) {
            throw new Error('Invalid password');
        }
        throw new Error(errorText || 'Failed to delete account');
    }
}; 