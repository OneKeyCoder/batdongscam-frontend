import apiClient from '../client';
import { LoginRequest, RegisterRequest, LoginResponse, TokenResponse, SingleResponse } from '../types';

const AUTH_ENDPOINTS = {
  LOGIN: '/public/auth/login',
  REGISTER: '/public/auth/register',
  REFRESH: '/public/auth/refresh',
};

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<SingleResponse<LoginResponse>>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );
    return response.data.data;
  },

  /**
   * Register a new user
   */
  async register(data: RegisterRequest, roleEnum: 'CUSTOMER' | 'PROPERTY_OWNER' = 'CUSTOMER'): Promise<LoginResponse> {
    const formData = new FormData();
    
    // Append all text fields
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('phoneNumber', data.phoneNumber);
    if (data.zaloContact) {
      formData.append('zaloContact', data.zaloContact);
    }
    formData.append('dayOfBirth', data.dayOfBirth);
    formData.append('gender', data.gender);
    formData.append('nation', data.nation);
    formData.append('wardId', data.wardId);
    formData.append('identificationNumber', data.identificationNumber);
    formData.append('issueDate', data.issueDate);
    formData.append('issuingAuthority', data.issuingAuthority);
    
    // Append file uploads
    formData.append('frontIdPicture', data.frontIdPicture);
    formData.append('backIdPicture', data.backIdPicture);

    // Backend requires roleEnum as query parameter
    const response = await apiClient.post<SingleResponse<LoginResponse>>(
      `${AUTH_ENDPOINTS.REGISTER}?roleEnum=${roleEnum}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Refresh access token
   */
  async refresh(refreshToken: string): Promise<TokenResponse> {
    const response = await apiClient.get<SingleResponse<TokenResponse>>(
      AUTH_ENDPOINTS.REFRESH,
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    return response.data.data;
  },

  /**
   * Logout - clear tokens
   */
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  /**
   * Store tokens in localStorage
   */
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};
