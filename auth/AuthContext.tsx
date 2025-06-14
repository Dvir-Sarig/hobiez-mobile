import React, { createContext, useContext, useState } from 'react';
import SecureStorage from './services/SecureStorage';

export interface AuthContextType {
  token: string | null;
  userId: string | null;
  userType: string | null;
  setAuthState: (state: { token: string | null; userId: string | null; userType: string | null }) => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  userId: null,
  userType: null,
  setAuthState: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Helper function to load auth state from secure storage
export const loadAuthState = async () => {
  try {
    const [token, userId, userType] = await Promise.all([
      SecureStorage.getToken(),
      SecureStorage.getUserId(),
      SecureStorage.getUserType()
    ]);

    return { token, userId, userType };
  } catch (error) {
    console.error('Error loading auth state:', error);
    return { token: null, userId: null, userType: null };
  }
};
