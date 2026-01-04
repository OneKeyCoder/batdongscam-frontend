'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '@/lib/api/services/auth.service';
import { accountService } from '@/lib/api/services/account.service';
import { DecodedToken, RegisterRequest, UserRole } from '@/lib/api/types';

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
      if (isRefreshing) return;

      try {
        const accessToken = authService.getAccessToken();
        const refreshToken = authService.getRefreshToken();
        const storedRole = localStorage.getItem('userRole') as UserRole | null;

        if (!accessToken || !refreshToken) {
          setIsLoading(false);
          return;
        }

        try {
          const profile = await accountService.getMe();

          // --- DEBUGGING LOG ---
          console.log("🔍 [AuthContext] Profile received from API:", profile);

          if (profile && profile.id) {
            setUser({
              ...profile,
              role: profile.role as UserRole,
            });
          } else {
            // Instead of throwing an error, we log a warning and let it fall through to token decoding
            console.warn("⚠️ [AuthContext] Invalid profile data (missing id). Falling back to token.");
            throw new Error('Invalid profile data'); // Throw to trigger the catch block below for fallback logic
          }
        } catch (profileError: any) {
          console.error('Failed to fetch profile on init:', profileError);

          // 1. Handle Token Expiration (401)
          if (profileError?.response?.status === 401) {
            setIsRefreshing(true);
            try {
              const newTokens = await authService.refresh(refreshToken);
              authService.setTokens(newTokens.accessToken, newTokens.refreshToken);

              // Retry fetching profile
              const profile = await accountService.getMe();
              if (profile && profile.id) {
                setUser({
                  ...profile,
                  role: profile.role as UserRole,
                });
              } else {
                // Fallback to token if profile still fails after refresh
                const decoded = decodeToken(newTokens.accessToken);
                if (decoded) setUser({ ...decoded, role: storedRole || decoded.role });
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              authService.logout();
              localStorage.removeItem('userRole');
              setUser(null);
            } finally {
              setIsRefreshing(false);
            }
          }
          // 2. Handle Server Error or Invalid Data (500 or Manual Error)
          else {
            console.warn('Using token fallback due to profile fetch error');
            const decoded = decodeToken(accessToken);
            if (decoded && storedRole) {
              setUser({
                ...decoded,
                role: storedRole,
              });
            } else {
              // Only logout if token is truly invalid/un-decodable
              // Don't logout just because the /me endpoint failed (allow offline access if needed)
              if (!decoded) {
                authService.logout();
                localStorage.removeItem('userRole');
                setUser(null);
              }
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
        localStorage.removeItem('userRole');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ... (keep login, register, logout functions as is)
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      authService.setTokens(response.token, response.refreshToken);
      localStorage.setItem('userRole', response.role);

      try {
        const profile = await accountService.getMe();
        if (profile && profile.id) {
          setUser({ ...profile, role: profile.role as UserRole });
        } else {
          // Fallback if login profile fetch fails
          const decoded = decodeToken(response.token);
          if (decoded) setUser({ ...decoded, role: response.role });
        }

        if (profile?.role === 'ADMIN' || response.role === 'ADMIN') {
          window.location.href = '/admin/dashboard';
        }
      } catch (profileError) {
        console.error('Failed to fetch profile after login:', profileError);
        const decoded = decodeToken(response.token);
        if (decoded) {
          setUser({ ...decoded, role: response.role });
          if (response.role === 'ADMIN') window.location.href = '/admin/dashboard';
        }
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    const response = await authService.register(data);
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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, setUser }}>
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