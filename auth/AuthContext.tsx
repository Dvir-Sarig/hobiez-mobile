import React, { createContext, useContext, useState } from 'react';

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
