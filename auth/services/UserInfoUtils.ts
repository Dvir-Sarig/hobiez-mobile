import API_BASE_URL from "../../shared/config";
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = "client" | "coach";

export const fetchUserInfo = async (userId: string, role: UserRole) => {
    try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            throw new Error("User not authenticated");
        }

        const endpoint = `${API_BASE_URL}/${role}-info/${userId}`;
        const response = await fetch(endpoint, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch ${role} info: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${role} info:`, error);
        throw error;
    }
};
