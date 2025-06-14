import API_BASE_URL from "../../shared/config";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, userType })
        });

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            // If we can't parse the response as JSON, it's likely an authentication error
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

        return data;
    } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('Network request failed')) {
            throw new Error('Network error. Please check your connection');
        }

        // Only log unexpected errors, not authentication failures
        if (!(error instanceof Error && error.message === 'Invalid email or password')) {
            console.error('Login error details:', {
                error,
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
        }

        // Always return a user-friendly error message
        if (error instanceof Error && error.message === 'Invalid email or password') {
            throw error;
        }
        throw new Error('Login failed. Please try again');
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
            id: null
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

export const signOut = async (): Promise<void> => {
    try {
        await AsyncStorage.clear();
    } catch (error) {
        console.error('Sign out error:', error);
        throw new Error('Failed to sign out. Please try again.');
    }
};

