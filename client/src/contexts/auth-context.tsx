import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      // Verify token and get user info
      verifyToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('auth_token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getCSRFToken = async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/csrf-token", {
        credentials: "include",
        headers: {
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.csrfToken;
      }
      return null;
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de la connexion');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('auth_token', data.token);
  };

  const register = async (username: string, email: string, password: string, confirmPassword: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password, confirmPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de l\'inscription');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('auth_token', data.token);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    
    // Only call logout endpoint if we have a token
    if (token) {
      try {
        const csrfToken = await getCSRFToken();
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
          },
        });
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}