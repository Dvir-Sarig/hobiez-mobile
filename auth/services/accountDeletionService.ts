import API_BASE_URL from "../../shared/config";
import SecureStorage from "./SecureStorage";

export const deleteAccount = async (password: string): Promise<void> => {
    const token = await SecureStorage.getToken();
    if (!token) throw new Error('לא נמצא אסימון אימות');

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
        throw new Error('שגיאת רשת');
    }

    const raw = await response.text();

    if (!response.ok) {
        if (response.status === 400) throw new Error('סיסמה שגויה');
        if (response.status === 401) throw new Error('אין הרשאה');
        if (response.status === 404) throw new Error('החשבון לא נמצא');
        throw new Error(raw || 'שגיאת שרת במחיקת החשבון');
    }
};