import apiClient from '../client';
import { SingleResponse } from '../types';

const ACCOUNT_ENDPOINTS = {
  ME: '/account/me',
  UPDATE_PROFILE: '/account/me',
  UPDATE_AVATAR: '/account/me/avatar',
  CHANGE_PASSWORD: '/account/me/password',
  UPDATE_BANK: '/account/me/bank',
  UPDATE_IDENTIFICATION: '/account/me/identification',
  GET_USER: (id: string) => `/account/${id}`,
};

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: string;
  status: string;
  createdAt: string;
  tier?: string;
  zaloContact?: string;
  wardId?: string;
  wardName?: string;
  districtId?: string;
  districtName?: string;
  cityId?: string;
  cityName?: string;
  identificationNumber?: string;
  dayOfBirth?: string;
  gender?: string;
  nation?: string;
  issueDate?: string;
  issuingAuthority?: string;
  frontIdPicturePath?: string;
  backIdPicturePath?: string;
  lastLoginAt?: string;
  profile?: any;
  statisticMonth?: any;
  statisticAll?: any;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dayOfBirth?: string;
  gender?: string;
  wardId?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateBankRequest {
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBin?: string;
}

export const accountService = {
  /**
   * Get current user profile
   */
  async getMe(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<SingleResponse<UserProfile>>(
        ACCOUNT_ENDPOINTS.ME
      );
      console.log('getMe response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('getMe error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await apiClient.put<SingleResponse<UserProfile>>(
      ACCOUNT_ENDPOINTS.UPDATE_PROFILE,
      data
    );
    return response.data.data;
  },

  /**
   * Update avatar
   */
  async updateAvatar(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.put<SingleResponse<UserProfile>>(
      ACCOUNT_ENDPOINTS.UPDATE_AVATAR,
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
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<boolean> {
    const response = await apiClient.put<SingleResponse<boolean>>(
      ACCOUNT_ENDPOINTS.CHANGE_PASSWORD,
      data
    );
    return response.data.data;
  },

  /**
   * Update bank information
   */
  async updateBank(data: UpdateBankRequest): Promise<UserProfile> {
    const response = await apiClient.put<SingleResponse<UserProfile>>(
      ACCOUNT_ENDPOINTS.UPDATE_BANK,
      data
    );
    return response.data.data;
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserProfile> {
    const response = await apiClient.get<SingleResponse<UserProfile>>(
      ACCOUNT_ENDPOINTS.GET_USER(id)
    );
    return response.data.data;
  },
};
