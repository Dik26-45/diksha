import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: Role;
    gender?: string;
    bio?: string;
  }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('safar_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Initialize and check health/session
  useEffect(() => {
    async function initAuth() {
      try {
        const health = await api.getHealth();
        setIsDemoMode(health.database?.mode === 'demo');
      } catch (err) {
        console.warn('Backend health check error:', err);
      }

      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
          if (res.isDemoMode !== undefined) {
            setIsDemoMode(res.isDemoMode);
          }
        } catch {
          console.warn('Session expired or invalid, logging out.');
          localStorage.removeItem('safar_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    initAuth();
  }, [token]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.login({ email, password });
    localStorage.setItem('safar_token', res.token);
    setToken(res.token);
    setUser(res.user);
    if (res.isDemoMode !== undefined) {
      setIsDemoMode(res.isDemoMode);
    }
    return res.user;
  };

  const register = async (payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: Role;
    gender?: string;
    bio?: string;
  }): Promise<User> => {
    const res = await api.register(payload);
    localStorage.setItem('safar_token', res.token);
    setToken(res.token);
    setUser(res.user);
    if (res.isDemoMode !== undefined) {
      setIsDemoMode(res.isDemoMode);
    }
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('safar_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.getMe();
      setUser(res.user);
      if (res.isDemoMode !== undefined) {
        setIsDemoMode(res.isDemoMode);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    const res = await api.updateProfile(updates);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isDemoMode,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
