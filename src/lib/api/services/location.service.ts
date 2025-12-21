import apiClient from '../client';
import { SingleResponse, PaginatedResponse } from '../types';

const LOCATION_ENDPOINTS = {
  CHILDREN: '/public/locations/children',
  PROPERTY_TYPES: '/public/locations/property-types',
};

export interface City {
  cityId: string;
  cityName: string;
  cityDescription?: string;
  cityImageUrl?: string;
}

export interface District {
  districtId: string;
  districtName: string;
  districtDescription?: string;
  districtImageUrl?: string;
  cityId: string;
}

export interface Ward {
  wardId: string;
  wardName: string;
  wardDescription?: string;
  wardImageUrl?: string;
  districtId: string;
}

export interface PropertyType {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
}

export const locationService = {
  /**
   * Get all cities
   */
  async getCities(): Promise<Map<string, string>> {
    const response = await apiClient.get<SingleResponse<Record<string, string>>>(
      `${LOCATION_ENDPOINTS.CHILDREN}?searchType=CITY`
    );
    return new Map(Object.entries(response.data.data));
  },

  /**
   * Get districts by city ID
   */
  async getDistricts(cityId: string): Promise<Map<string, string>> {
    const response = await apiClient.get<SingleResponse<Record<string, string>>>(
      `${LOCATION_ENDPOINTS.CHILDREN}?searchType=DISTRICT&parentId=${cityId}`
    );
    return new Map(Object.entries(response.data.data));
  },

  /**
   * Get wards by district ID
   */
  async getWards(districtId: string): Promise<Map<string, string>> {
    const response = await apiClient.get<SingleResponse<Record<string, string>>>(
      `${LOCATION_ENDPOINTS.CHILDREN}?searchType=WARD&parentId=${districtId}`
    );
    return new Map(Object.entries(response.data.data));
  },

  /**
   * Get all property types
   */
  async getPropertyTypes(): Promise<PropertyType[]> {
    const response = await apiClient.get<PaginatedResponse<PropertyType>>(
      `${LOCATION_ENDPOINTS.PROPERTY_TYPES}?page=1&limit=100`
    );
    return response.data.data;
  },
};
