import API_BASE_URL from "../../shared/config";
import SecureStorage from "./SecureStorage";
import { profileCacheService } from '../../profile/services/profileCacheService';
import { fetchClientProfile, fetchCoachProfile } from '../../profile/utils/profileService';

export enum UserType {
    CLIENT = "CLIENT",
    COACH = "COACH"
}

export const signIn = async (
    email: string,
    password: string,
    userType: UserType
): Promise<any> => {
    try {
        const payload: any = { email, password, userType };
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            if (response.status === 401) {
                throw new Error('Invalid email or password');
            }
            throw new Error('Login failed. Please try again');
        }

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid email or password');
            }
            if (response.status === 400) {
                throw new Error(data.message || 'Please check your input');
            }
            throw new Error(data.message || 'Login failed. Please try again');
        }

        
        // Store data securely
        await SecureStorage.storeToken(data.token);
        await SecureStorage.storeUserId(data.userId.toString());
        await SecureStorage.storeUserType(userType.toLowerCase());

        // Fetch and cache user profile based on user type
        if (userType === UserType.CLIENT) {
            const profile = await fetchClientProfile(data.userId);
            if (profile) {
                await profileCacheService.setUserProfile(data.userId, profile);
            }
        } else if (userType === UserType.COACH) {
            const profile = await fetchCoachProfile(data.userId);
            if (profile) {
                await profileCacheService.setUserProfile(data.userId, profile);
            }
        }

        return data;
    } catch (error) {
        throw error;
    }
};

export const signUp = async (
    formData: { name: string; email: string; password: string },
    role: UserType
): Promise<any> => {
    const url = `${API_BASE_URL}/create-${role.toLowerCase()}`;
    try {
        const requestData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        let data;
        try {
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                // Check if the text contains information about duplicate email
                if (text.includes('duplicate key value') || text.includes('already exists')) {
                    throw new Error('Email already exists');
                }
                // Log the raw response for debugging
                console.error('Signup parse error. Raw response:', text);
                throw new Error('Signup failed. Please try again');
            }
        } catch (textError) {
            // If we can't get the response text, check the status code
            if (response.status === 409) {
                throw new Error('Email already exists');
            }
            throw new Error('Signup failed. Please try again');
        }

        if (!response.ok) {
            // Handle specific error cases
            if (response.status === 409) {
                throw new Error('Email already exists');
            }
            if (response.status === 400) {
                throw new Error(data.message || 'Please check your input');
            }
            // Log the error response for debugging
            console.error('Signup error response:', {
                status: response.status,
                data: data
            });
            throw new Error(data.message || `Failed to create ${role}`);
        }

        return data;
    } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('Network request failed')) {
            throw new Error('Network error. Please check your connection');
        }

        // Only log unexpected errors, not expected validation errors
        if (!(error instanceof Error && 
            (error.message === 'Email already exists' || 
             error.message === 'Please check your input'))) {
            console.error('Signup error:', {
                error,
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
        }

        // Always return a user-friendly error message
        if (error instanceof Error && 
            (error.message === 'Email already exists' || 
             error.message === 'Please check your input')) {
            throw error;
        }
        throw new Error('Signup failed. Please try again');
    }
};

export const logout = async () => {
    try {
        const token = await SecureStorage.getToken();
        if (token) {
            await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        await SecureStorage.clearAuthState();
    }
};

export const signOut = async () => {
    try {
        const userId = await SecureStorage.getUserId();
        if (userId) {
            await profileCacheService.clearUserProfile(userId);
        }
        await SecureStorage.clearAuthState();
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

// ---------------- Password Reset Flow -----------------
// Backend endpoints:
// POST /auth/password/forgot { email }
//   -> Always returns 200 OK with generic message (never reveals if email exists)
//   -> DOES NOT currently return tokenId. User receives email containing reset code and (ideally) tokenId.
// POST /auth/password/verify { tokenId, code }
//   -> 200 OK if valid, 400 otherwise.
// POST /auth/password/reset { tokenId, code, newPassword, confirmPassword }
//   -> 200 OK if success, 400 otherwise.
// NOTE: Since /forgot does not return tokenId, the app must ask user to paste tokenId (UUID) from email.
// If backend is later changed to return tokenId, we can store & forward automatically.
// UX Flow (current implementation):
// 1. ForgotPassword screen: user enters email -> requestPasswordReset() -> navigate to VerifyResetCode.
// 2. VerifyResetCode screen: user pastes tokenId (from email link) + 6-digit code -> verifyPasswordResetCode().
//    If valid navigate to ResetPassword.
// 3. ResetPassword screen: user sets new password -> resetPassword(). On success returns to SignIn.
// Security considerations: Always generic responses, rate limiting handled server-side. We do not store tokenId or code locally beyond navigation params.

export interface PasswordResetGenericResponse { message: string }

const parseJsonSafe = async (response: Response) => {
    try { return await response.json(); } catch { return {}; }
};

export const requestPasswordReset = async (email: string): Promise<PasswordResetGenericResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    const data = await parseJsonSafe(res) as PasswordResetGenericResponse;
    if (!res.ok) {
        // Still surface generic message
        throw new Error(data.message || 'Unable to request reset');
    }
    return data;
};

export const verifyPasswordResetCode = async (tokenId: string, code: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE_URL}/auth/password/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, code })
    });
    if (res.ok) return true;
    return false;
};

export const resetPassword = async (tokenId: string, code: string, newPassword: string, confirmPassword: string): Promise<PasswordResetGenericResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, code, newPassword, confirmPassword })
    });
    const data = await parseJsonSafe(res) as PasswordResetGenericResponse;
    if (!res.ok) {
        throw new Error(data.message || 'Reset failed');
    }
    return data;
};

