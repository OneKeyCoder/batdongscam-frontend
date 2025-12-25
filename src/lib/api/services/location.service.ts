import apiClient from '../client';
import { SingleResponse, PaginatedResponse } from '../types';

const LOCATION_ENDPOINTS = {
  CHILDREN: '/public/locations/children',
  PROPERTY_TYPES: '/public/locations/property-types',
  LOCATIONS: '/locations',
  DELETE_LOCATION: (locationId: string) => `/locations/${locationId}`,
  TOP_CITIES: '/public/locations/cities/top',
  LOCATION_CARDS: '/public/locations/cards',
  LOCATION_DETAILS: (locationId: string) => `/public/locations/${locationId}/details`,
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
  typeName: string;
  description?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface CreateLocationRequest {
  parentId?: string;
  locationTypeEnum: 'CITY' | 'DISTRICT' | 'WARD';
  name: string;
  description?: string;
  image?: File;
  totalArea?: number;
  avg_land_price?: number;
  population?: number;
  isActive?: boolean;
}

export interface UpdateLocationRequest {
  id: string;
  locationTypeEnum: 'CITY' | 'DISTRICT' | 'WARD';
  parentId?: string;
  name?: string;
  description?: string;
  image?: File;
  totalArea?: number;
  avg_land_price?: number;
  population?: number;
  isActive?: boolean;
}

export interface LocationCardsFilters {
  page?: number;
  limit?: number;
  sortType?: 'asc' | 'desc';
  sortBy?: string;
  keyWord?: string;
  cityIds?: string[];
  districtIds?: string[];
  locationTypeEnum: 'CITY' | 'DISTRICT' | 'WARD';
  isActive?: boolean;
  minAvgLandPrice?: number;
  maxAvgLandPrice?: number;
  minArea?: number;
  maxArea?: number;
  minPopulation?: number;
  maxPopulation?: number;
}

// RESPONSE

export interface LocationDetailsResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  locationTypeEnum: 'CITY' | 'DISTRICT' | 'WARD';
  description?: string;
  imgUrl?: string;
  totalArea?: number;
  avgLandPrice?: number;
  population?: number;
  isActive?: boolean;
  isFavorite?: boolean;
  districtCount?: number;
  wardCount?: number;
  activeProperties?: number;
}

export interface LocationCardResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  locationTypeEnum: 'CITY' | 'DISTRICT' | 'WARD';
  imgUrl?: string;
  totalArea?: number;
  avgLandPrice?: number;
  population?: number;
  isActive?: boolean;
  isFavorite?: boolean;
}


export const locationService = {

  /**
   * Get all property types
   */
  async getPropertyTypes(): Promise<PropertyType[]> {
    const response = await apiClient.get<PaginatedResponse<PropertyType>>(
      `${LOCATION_ENDPOINTS.PROPERTY_TYPES}?page=1&limit=100`
    );
    return response.data.data;
  },

  /**
   * Get top K most searched/popular cities
   */
  async getTopCities(page: number = 1, limit: number = 10): Promise<PaginatedResponse<LocationCardResponse>> {
    const response = await apiClient.get<PaginatedResponse<LocationCardResponse>>(
      LOCATION_ENDPOINTS.TOP_CITIES,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  /**
   * Get child locations by parent ID
   * @param searchType - CITY (get all cities), DISTRICT (get districts of city), WARD (get wards of district)
   * @param parentId - Parent location ID (null to get all cities)
   */
  async getChildLocations(
    searchType: 'CITY' | 'DISTRICT' | 'WARD',
    parentId?: string
  ): Promise<Map<string, string>> {
    const response = await apiClient.get<SingleResponse<Record<string, string>>>(
      LOCATION_ENDPOINTS.CHILDREN,
      {
        params: { searchType, parentId },
      }
    );
    return new Map(Object.entries(response.data.data));
  },

  /**
   * Get all location cards with filters
   */
  async getLocationCards(filters: LocationCardsFilters): Promise<PaginatedResponse<LocationCardResponse>> {
    const response = await apiClient.get<PaginatedResponse<LocationCardResponse>>(
      LOCATION_ENDPOINTS.LOCATION_CARDS,
      {
        params: filters,
      }
    );
    return response.data;
  },

  /**
   * Get location details by ID and type
   */
  async getLocationDetails(
    locationId: string,
    locationTypeEnum: 'CITY' | 'DISTRICT' | 'WARD'
  ): Promise<LocationDetailsResponse> {
    const response = await apiClient.get<SingleResponse<LocationDetailsResponse>>(
      LOCATION_ENDPOINTS.LOCATION_DETAILS(locationId),
      {
        params: { locationTypeEnum },
      }
    );
    return response.data.data;
  },

  /**
 * Create a new location (Admin only)
 */
  async createLocation(data: CreateLocationRequest): Promise<LocationDetailsResponse> {
    const formData = new FormData();

    if (data.parentId) formData.append('parentId', data.parentId);
    formData.append('locationTypeEnum', data.locationTypeEnum);
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.image) formData.append('image', data.image);
    if (data.totalArea !== undefined) formData.append('totalArea', data.totalArea.toString());
    if (data.avg_land_price !== undefined) formData.append('avg_land_price', data.avg_land_price.toString());
    if (data.population !== undefined) formData.append('population', data.population.toString());
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());

    const response = await apiClient.post<SingleResponse<LocationDetailsResponse>>(
      LOCATION_ENDPOINTS.LOCATIONS,
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
   * Update an existing location (Admin only)
   */
  async updateLocation(data: UpdateLocationRequest): Promise<LocationDetailsResponse> {
    const formData = new FormData();

    formData.append('id', data.id);
    formData.append('locationTypeEnum', data.locationTypeEnum);
    if (data.parentId) formData.append('parentId', data.parentId);
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.image) formData.append('image', data.image);
    if (data.totalArea !== undefined) formData.append('totalArea', data.totalArea.toString());
    if (data.avg_land_price !== undefined) formData.append('avg_land_price', data.avg_land_price.toString());
    if (data.population !== undefined) formData.append('population', data.population.toString());
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());

    const response = await apiClient.patch<SingleResponse<LocationDetailsResponse>>(
      LOCATION_ENDPOINTS.LOCATIONS,
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
   * Delete a location by ID (Admin only)
   */
  async deleteLocation(locationId: string, locationTypeEnum: 'CITY' | 'DISTRICT' | 'WARD'): Promise<boolean> {
    const response = await apiClient.delete<SingleResponse<any>>(
      LOCATION_ENDPOINTS.DELETE_LOCATION(locationId),
      {
        params: { locationTypeEnum },
      }
    );
    return response.data.data !== null;
  },
};
