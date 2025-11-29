import API_BASE_URL from "../../shared/config";
import SecureStorage from "./SecureStorage";

export const deleteAccount = async (password: string): Promise<void> => {
    const token = await SecureStorage.getToken();
    if (!token) throw new Error('No authentication token found');

    const body = { password };

    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}/account`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });
    } catch (e) {
        console.error('[deleteAccount] network error', e);
        throw new Error('Network error');
    }

    const raw = await response.text();

    if (!response.ok) {
        if (response.status === 400) throw new Error('Invalid password');
        if (response.status === 401) throw new Error('Unauthorized');
        if (response.status === 404) throw new Error('Account not found');
        throw new Error(raw || 'Server error deleting account');
    }
};