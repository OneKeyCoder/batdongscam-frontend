'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '@/lib/api/services/auth.service';
import { accountService } from '@/lib/api/services/account.service';
import { DecodedToken, RegisterRequest, UserRole, MeResponse } from '@/lib/api/types';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: UserRole;
  phoneNumber?: string;
  address?: string;
  createdAt?: string;
  tier?: string;
  profile?: any;
  statisticMonth?: any;
  statisticAll?: any;
  wardName?: string;
  districtName?: string;
  cityName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest, roleEnum: 'CUSTOMER' | 'PROPERTY_OWNER') => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Decode JWT and extract user info
  const decodeToken = (token: string): User | null => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      // Prevent multiple simultaneous refresh attempts
      if (isRefreshing) return;
      
      try {
        const accessToken = authService.getAccessToken();
        const refreshToken = authService.getRefreshToken();
        const storedRole = localStorage.getItem('userRole') as UserRole | null;

        // If no tokens, user is not logged in - don't try to fetch profile
        if (!accessToken || !refreshToken) {
          setIsLoading(false);
          return;
        }

        // Fetch full user profile if we have a token
        try {
          const profile = await accountService.getMe();
          
          // Check if profile data is valid
          if (profile && profile.id) {
            setUser({
              ...profile,
              role: profile.role as UserRole,
            });
          } else {
            throw new Error('Invalid profile data received');
          }
        } catch (profileError: any) {
          console.error('Failed to fetch profile on init:', profileError);
          
          // If it's a 401 (unauthorized), try refresh
          if (profileError?.response?.status === 401) {
            setIsRefreshing(true);
            try {
              const newTokens = await authService.refresh(refreshToken);
              authService.setTokens(newTokens.accessToken, newTokens.refreshToken);
              
              // Try fetching profile again with new token
              const profile = await accountService.getMe();
              
              if (profile && profile.id) {
                setUser({
                  ...profile,
                  role: profile.role as UserRole,
                });
              } else {
                throw new Error('Invalid profile data after refresh');
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              authService.logout();
              localStorage.removeItem('userRole');
              setUser(null);
            } finally {
              setIsRefreshing(false);
            }
          } else if (profileError?.response?.status === 500) {
            // If it's a 500 error (backend issue), use token fallback
            console.warn('Backend error (500), using token fallback');
            const decoded = decodeToken(accessToken);
            if (decoded && storedRole) {
              setUser({
                ...decoded,
                role: storedRole,
              });
            }
          } else {
            // For other errors, try token fallback
            const decoded = decodeToken(accessToken);
            if (decoded && storedRole) {
              setUser({
                ...decoded,
                role: storedRole,
              });
            } else {
              // Invalid token, clear everything
              authService.logout();
              localStorage.removeItem('userRole');
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear any invalid tokens
        authService.logout();
        localStorage.removeItem('userRole');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []); // Empty dependency array - only run once on mount

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      // Store tokens
      authService.setTokens(response.token, response.refreshToken);
      
      // Store role in localStorage for persistence
      localStorage.setItem('userRole', response.role);
      
      // Fetch full user profile
      try {
        const profile = await accountService.getMe();
        setUser({
          ...profile,
          role: profile.role as UserRole,
        });
        
        // Redirect admin users to admin dashboard
        if (profile.role === 'ADMIN') {
          window.location.href = '/admin/dashboard';
        }
      } catch (profileError) {
        console.error('Failed to fetch profile:', profileError);
        // Fallback to basic user info from token
        const decoded = decodeToken(response.token);
        if (decoded) {
          setUser({
            ...decoded,
            role: response.role,
          });
          
          // Redirect admin users to admin dashboard (fallback)
          if (response.role === 'ADMIN') {
            window.location.href = '/admin/dashboard';
          }
        }
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    const response = await authService.register(data);
    // Auto-login after successful registration
    authService.setTokens(response.token, response.refreshToken);
    localStorage.setItem('userRole', response.role);
    setUser({
      id: response.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: response.role,
    });
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('userRole');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
