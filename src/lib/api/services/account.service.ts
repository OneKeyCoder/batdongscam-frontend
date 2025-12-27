import apiClient from '../client';
import { PaginatedResponse, SingleResponse } from '../types';

const ACCOUNT_ENDPOINTS = {
  ME: '/account/me',
  UPDATE_PROFILE: '/account/me',
  UPDATE_AVATAR: '/account/me/avatar',
  CHANGE_PASSWORD: '/account/me/password',
  UPDATE_BANK: '/account/me/bank',
  UPDATE_IDENTIFICATION: '/account/me/identification',
  GET_USER: (id: string) => `/account/${id}`,
  UPDATE_USER: (id: string) => `/account/${id}`,
  DELETE_USER: (id: string) => `/account/${id}`,
  APPROVE_ACCOUNT: (propOwnerId: string, approve: boolean) => `/account/${propOwnerId}/${approve}/approve`,
  SALE_AGENTS: '/account/sale-agents',
  CUSTOMERS: '/account/customers',
  PROPERTY_OWNERS: '/account/property-owners',
  PUBLIC_PROFILE: (id: string) => `/public/account/${id}/other-profile`,
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
  propertyProfile?: {
    totalListings: number;
    totalSolds: number;
    totalRentals: number;
  };
}

export interface SaleAgentListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  ranking?: number;
  employeeCode?: string;
  point?: number;
  tier?: string;
  totalAssignments?: number;
  propertiesAssigned?: number;
  appointmentsAssigned?: number;
  totalContracts?: number;
  rating?: number;
  totalRates?: number;
  hiredDate?: string;
  location?: string;
}

export interface CustomerListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  ranking?: number;
  point?: number;
  tier?: string;
  totalSpending?: number;
  totalViewings?: number;
  totalContracts?: number;
  location?: string;
}

export interface PropertyOwnerListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  ranking?: number;
  point?: number;
  tier?: string;
  totalValue?: number;
  totalProperties?: number;
  location?: string;
}

// REQUEST
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

export interface UpdateAccountRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  zaloContract?: string;
  wardId?: string;
  identificationNumber?: string;
  dayOfBirth?: string;
  gender?: string;
  nation?: string;
  issuedDate?: string;
  issuingAuthority?: string;
  avatar?: File;
  frontIdPicture?: string;
  backIdPicture?: string;
}

export interface SaleAgentFilters {
  page?: number;
  limit?: number;
  sortType?: 'asc' | 'desc';
  sortBy?: string;
  name?: string;
  month?: number;
  year?: number;
  agentTiers?: string[];
  maxProperties?: number;
  minPerformancePoint?: number;
  maxPerformancePoint?: number;
  minRanking?: number;
  maxRanking?: number;
  minAssignments?: number;
  maxAssignments?: number;
  minAssignedProperties?: number;
  maxAssignedProperties?: number;
  minAssignedAppointments?: number;
  maxAssignedAppointments?: number;
  minContracts?: number;
  maxContracts?: number;
  minAvgRating?: number;
  maxAvgRating?: number;
  hiredDateFrom?: string;
  hiredDateTo?: string;
  cityIds?: string[];
  districtIds?: string[];
  wardIds?: string[];
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  sortType?: 'asc' | 'desc';
  sortBy?: string;
  name?: string;
  month?: number;
  year?: number;
  customerTiers?: string[];
  minLeadingScore?: number;
  maxLeadingScore?: number;
  minViewings?: number;
  maxViewings?: number;
  minSpending?: number;
  maxSpending?: number;
  minContracts?: number;
  maxContracts?: number;
  minPropertiesBought?: number;
  maxPropertiesBought?: number;
  minPropertiesRented?: number;
  maxPropertiesRented?: number;
  minPropertiesInvested?: number;
  maxPropertiesInvested?: number;
  minRanking?: number;
  maxRanking?: number;
  joinedDateFrom?: string;
  joinedDateTo?: string;
  cityIds?: string[];
  districtIds?: string[];
  wardIds?: string[];
}

export interface PropertyOwnerFilters {
  page?: number;
  limit?: number;
  sortType?: 'asc' | 'desc';
  sortBy?: string;
  name?: string;
  month?: number;
  year?: number;
  ownerTiers?: string[];
  minContributionPoint?: number;
  maxContributionPoint?: number;
  minProperties?: number;
  maxProperties?: number;
  minPropertiesForSale?: number;
  maxPropertiesForSale?: number;
  minPropertiesForRents?: number;
  maxPropertiesForRents?: number;
  minProjects?: number;
  maxProjects?: number;
  minRanking?: number;
  maxRanking?: number;
  joinedDateFrom?: string;
  joinedDateTo?: string;
  cityIds?: string[];
  districtIds?: string[];
  wardIds?: string[];
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

  /**
    Update current user account 
 */
  async updateMe(data: UpdateAccountRequest): Promise<UserProfile> {

    const formData = new FormData();

    if (data.firstName !== undefined) formData.append('firstName', data.firstName);
    if (data.lastName !== undefined) formData.append('lastName', data.lastName);
    if (data.email !== undefined) formData.append('email', data.email);
    if (data.phoneNumber !== undefined) formData.append('phoneNumber', data.phoneNumber);
    if (data.zaloContract !== undefined) formData.append('zaloContract', data.zaloContract);
    if (data.wardId !== undefined) formData.append('wardId', data.wardId);
    if (data.identificationNumber !== undefined) formData.append('identificationNumber', data.identificationNumber);
    if (data.dayOfBirth !== undefined) formData.append('dayOfBirth', data.dayOfBirth);
    if (data.gender !== undefined) formData.append('gender', data.gender);
    if (data.nation !== undefined) formData.append('nation', data.nation);
    if (data.issuedDate !== undefined) formData.append('issuedDate', data.issuedDate);
    if (data.issuingAuthority !== undefined) formData.append('issuingAuthority', data.issuingAuthority);

    if (data.avatar) formData.append('avatar', data.avatar);
    if (data.frontIdPicture) formData.append('frontIdPicture', data.frontIdPicture);
    if (data.backIdPicture) formData.append('backIdPicture', data.backIdPicture);

    const response = await apiClient.patch<SingleResponse<UserProfile>>(
      ACCOUNT_ENDPOINTS.ME,
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
  Delete current user account
 */
  async deleteMyAccount(): Promise<void> {
    await apiClient.delete<SingleResponse<void>>(ACCOUNT_ENDPOINTS.ME);
  },

  /**
 * Update user by ID (Admin only)
 */
  async updateUserById(id: string, data: UpdateAccountRequest): Promise<UserProfile> {
    const formData = new FormData();

    if (data.firstName !== undefined) formData.append('firstName', data.firstName);
    if (data.lastName !== undefined) formData.append('lastName', data.lastName);
    if (data.email !== undefined) formData.append('email', data.email);
    if (data.phoneNumber !== undefined) formData.append('phoneNumber', data.phoneNumber);
    if (data.zaloContract !== undefined) formData.append('zaloContract', data.zaloContract);
    if (data.wardId !== undefined) formData.append('wardId', data.wardId);
    if (data.identificationNumber !== undefined) formData.append('identificationNumber', data.identificationNumber);
    if (data.dayOfBirth !== undefined) formData.append('dayOfBirth', data.dayOfBirth);
    if (data.gender !== undefined) formData.append('gender', data.gender);
    if (data.nation !== undefined) formData.append('nation', data.nation);
    if (data.issuedDate !== undefined) formData.append('issuedDate', data.issuedDate);
    if (data.issuingAuthority !== undefined) formData.append('issuingAuthority', data.issuingAuthority);

    if (data.avatar) formData.append('avatar', data.avatar);
    if (data.frontIdPicture) formData.append('frontIdPicture', data.frontIdPicture);
    if (data.backIdPicture) formData.append('backIdPicture', data.backIdPicture);

    const response = await apiClient.patch<SingleResponse<UserProfile>>(
      ACCOUNT_ENDPOINTS.UPDATE_USER(id),
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
 * Delete user account by ID (Admin only)
 */
  async deleteAccountById(id: string): Promise<void> {
    await apiClient.delete<SingleResponse<void>>(ACCOUNT_ENDPOINTS.DELETE_USER(id));
  },

  /**
 * Approve property owner account (Admin only)
 */
  async approveAccount(propOwnerId: string, approve: boolean): Promise<void> {
    await apiClient.put<SingleResponse<void>>(
      ACCOUNT_ENDPOINTS.APPROVE_ACCOUNT(propOwnerId, approve)
    );
  },

  /**
 * Get all sale agents with filters (Admin only)
 */
  async getAllSaleAgents(filters?: SaleAgentFilters): Promise<PaginatedResponse<SaleAgentListItem>> {
    const response = await apiClient.get<PaginatedResponse<SaleAgentListItem>>(
      ACCOUNT_ENDPOINTS.SALE_AGENTS,
      {
        params: filters,
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          Object.keys(params).forEach(key => {
            const value = params[key];
            if (value === undefined || value === null || value === '') return;

            if (Array.isArray(value)) {
              value.forEach(val => searchParams.append(key, val));
            } else {
              searchParams.append(key, value);
            }
          });
          return searchParams.toString();
        }
      }
    );
    return response.data;
  },

  /**
 * Get all customers with filters (Admin only)
 */
  async getAllCustomers(filters?: CustomerFilters): Promise<PaginatedResponse<CustomerListItem>> {
    const response = await apiClient.get<PaginatedResponse<CustomerListItem>>(
      ACCOUNT_ENDPOINTS.CUSTOMERS,
      { params: filters }
    );
    return response.data;
  },

  /**
 * Get all property owners with filters (Admin only)
 */
  async getAllPropertyOwners(filters?: PropertyOwnerFilters): Promise<PaginatedResponse<PropertyOwnerListItem>> {
    const response = await apiClient.get<PaginatedResponse<PropertyOwnerListItem>>(
      ACCOUNT_ENDPOINTS.PROPERTY_OWNERS,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get public profile by user ID (for viewing other users' profiles)
   */
  async getPublicProfile(id: string): Promise<UserProfile> {
    const response = await apiClient.get<SingleResponse<UserProfile>>(
      ACCOUNT_ENDPOINTS.PUBLIC_PROFILE(id)
    );
    return response.data.data;
  },
};
