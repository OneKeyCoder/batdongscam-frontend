import apiClient from '../client';
import { PropertyCard, PropertyFilters, PaginatedResponse, SingleResponse } from '../types';

const PROPERTY_ENDPOINTS = {
  CARDS: '/public/properties/cards',
  DETAILS: (id: string) => `/public/properties/${id}`,
  PROPERTIES: '/properties',
  PROPERTY_DETAIL: (id: string) => `/properties/${id}`,
  PROPERTY_STATUS: (id: string) => `/properties/${id}/status`,
  ASSIGN_AGENT: (propertyId: string, agentId: string) => `/properties/${propertyId}/assign-agent/${agentId}`,
  PROPERTY_TYPES: '/properties/types',
  PROPERTY_TYPE_DETAIL: (id: string) => `/properties/types/${id}`,
};

export interface CreatePropertyRequest {
  ownerId?: string;
  propertyTypeId: string;
  wardId: string;
  title: string;
  description: string;
  transactionType: 'SALE' | 'RENTAL';
  fullAddress?: string;
  area: number;
  rooms?: number;
  bathrooms?: number;
  floors?: number;
  bedrooms?: number;
  houseOrientation?: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'NORTH_EAST' | 'NORTH_WEST' | 'SOUTH_EAST' | 'SOUTH_WEST' | 'UNKNOWN';
  balconyOrientation?: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'NORTH_EAST' | 'NORTH_WEST' | 'SOUTH_EAST' | 'SOUTH_WEST' | 'UNKNOWN';
  yearBuilt?: number;
  priceAmount: number;
  amenities?: string;
}

export interface UpdatePropertyRequest extends CreatePropertyRequest {
  mediaIdsToRemove?: string[];
}

export interface UpdatePropertyStatusRequest {
  status: 'PENDING' | 'REJECTED' | 'APPROVED' | 'SOLD' | 'RENTED' | 'AVAILABLE' | 'UNAVAILABLE' | 'REMOVED' | 'DELETED';
}

export interface CreatePropertyTypeRequest {
  typeName: string;
  avatar?: File;
  description?: string;
  isActive?: boolean;
}

export interface UpdatePropertyTypeRequest {
  id: string;
  typeName?: string;
  avatar?: File;
  description?: string;
  isActive?: boolean;
}

//RESPONSE INTERFACES
export interface MediaResponse {
  id: string;
  filePath: string;
  mediaType: string;
}

export interface DocumentResponse {
  id: string;
  filePath: string;
  documentTypeId: string;
  documentTypeName?: string;
  documentName?: string;
  verificationStatus?: string;
}

export interface SimpleUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  tier?: string;
}

export interface PropertyTypeResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  typeName: string;
  avatarUrl?: string;
  description?: string;
  isActive?: boolean;
}

export interface PropertyDetails {
  id: string;
  createdAt: string;
  updatedAt: string;
  owner: SimpleUserResponse;
  assignedAgent?: SimpleUserResponse;
  serviceFeeAmount?: number;
  serviceFeeCollectedAmount?: number;
  propertyTypeId: string;
  propertyTypeName: string;
  wardId: string;
  wardName: string;
  districtId: string;
  districtName: string;
  cityId: string;
  cityName: string;
  title: string;
  description: string;
  transactionType: string;
  fullAddress?: string;
  area: number;
  rooms?: number;
  bathrooms?: number;
  floors?: number;
  bedrooms?: number;
  houseOrientation?: string;
  balconyOrientation?: string;
  yearBuilt?: number;
  priceAmount: number;
  pricePerSquareMeter?: number;
  commissionRate?: number;
  amenities?: string;
  status: string;
  viewCount?: number;
  approvedAt?: string;
  isFavorite?: boolean;
  mediaList: MediaResponse[];
  documentList: DocumentResponse[];
}

export const propertyService = {
  /**
   * Get property cards with filters and pagination
   */
  async getPropertyCards(filters: PropertyFilters = {}): Promise<PaginatedResponse<PropertyCard>> {
    const params = new URLSearchParams();

    // Add pagination params
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortType) params.append('sortType', filters.sortType);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    // Add filter params
    if (filters.cityIds?.length) {
      filters.cityIds.forEach(id => params.append('cityIds', id));
    }
    if (filters.districtIds?.length) {
      filters.districtIds.forEach(id => params.append('districtIds', id));
    }
    if (filters.wardIds?.length) {
      filters.wardIds.forEach(id => params.append('wardIds', id));
    }
    if (filters.propertyTypeIds?.length) {
      filters.propertyTypeIds.forEach(id => params.append('propertyTypeIds', id));
    }
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.minArea) params.append('minArea', filters.minArea.toString());
    if (filters.maxArea) params.append('maxArea', filters.maxArea.toString());
    if (filters.rooms) params.append('rooms', filters.rooms.toString());
    if (filters.bathrooms) params.append('bathrooms', filters.bathrooms.toString());
    if (filters.bedrooms) params.append('bedrooms', filters.bedrooms.toString());
    if (filters.floors) params.append('floors', filters.floors.toString());
    if (filters.houseOrientation) params.append('houseOrientation', filters.houseOrientation);
    if (filters.balconyOrientation) params.append('balconyOrientation', filters.balconyOrientation);
    if (filters.transactionType?.length) {
      filters.transactionType.forEach(type => params.append('transactionType', type));
    }
    if (filters.statuses?.length) {
      filters.statuses.forEach(status => params.append('statuses', status));
    }
    if (filters.topK !== undefined) params.append('topK', filters.topK.toString());
    if (filters.ownerId) params.append('ownerId', filters.ownerId);
    if (filters.agentId) params.append('agentId', filters.agentId);

    const response = await apiClient.get<PaginatedResponse<PropertyCard>>(
      `${PROPERTY_ENDPOINTS.CARDS}?${params.toString()}`
    );

    return response.data;
  },

  /**
   * Get property details by ID
   */
  async getPropertyDetails(propertyId: string): Promise<PropertyDetails> {
    const response = await apiClient.get<SingleResponse<PropertyDetails>>(
      PROPERTY_ENDPOINTS.DETAILS(propertyId)
    );
    return response.data.data;
  },

  /**
   * Create new property (Owner only)
   * Supports multipart/form-data with images and documents
   */
  async createProperty(
    data: CreatePropertyRequest,
    images?: File[]
  ): Promise<PropertyDetails> {
    const formData = new FormData();

    // Add JSON payload
    formData.append('payload', JSON.stringify(data));

    // Add images if provided
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.post<SingleResponse<PropertyDetails>>(
      PROPERTY_ENDPOINTS.PROPERTIES,
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
   * Update property (Owner only)
   * Supports multipart/form-data with images and documents
   */
  async updateProperty(
    id: string,
    data: UpdatePropertyRequest,
    images?: File[]
  ): Promise<PropertyDetails> {
    const formData = new FormData();

    // Add JSON payload
    formData.append('payload', JSON.stringify(data));

    // Add images if provided
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.put<SingleResponse<PropertyDetails>>(
      PROPERTY_ENDPOINTS.PROPERTY_DETAIL(id),
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
   * Get owner's properties
   */
  async getOwnerProperties(ownerId: string): Promise<PaginatedResponse<PropertyCard>> {
    return this.getPropertyCards({ ownerId });
  },

  /**
   * Search properties (convenience method)
   */
  async searchProperties(
    keyword?: string,
    filters: PropertyFilters = {}
  ): Promise<PaginatedResponse<PropertyCard>> {
    // Add keyword to filters if provided
    // Note: Backend doesn't have keyword search in current API
    // This is a placeholder for future implementation
    return this.getPropertyCards(filters);
  },

  /**
 * Update property status (Owner/Admin)
 */
  async updatePropertyStatus(
    id: string,
    data: UpdatePropertyStatusRequest
  ): Promise<PropertyDetails> {
    const response = await apiClient.patch<SingleResponse<PropertyDetails>>(
      PROPERTY_ENDPOINTS.PROPERTY_STATUS(id),
      data
    );
    return response.data.data;
  },

  /**
   * Delete property (Admin only)
   */
  async deleteProperty(id: string): Promise<void> {
    await apiClient.delete<SingleResponse<void>>(
      PROPERTY_ENDPOINTS.PROPERTY_DETAIL(id)
    );
  },

  /**
   * Assign agent to property (Admin only)
   */
  async assignAgentToProperty(propertyId: string, agentId: string): Promise<void> {
    await apiClient.put<SingleResponse<void>>(
      PROPERTY_ENDPOINTS.ASSIGN_AGENT(propertyId, agentId)
    );
  },

  /**
   * Create property type (Admin only)
   */
  async createPropertyType(data: CreatePropertyTypeRequest): Promise<PropertyTypeResponse> {
    const formData = new FormData();

    formData.append('typeName', data.typeName);
    if (data.avatar) formData.append('avatar', data.avatar);
    if (data.description) formData.append('description', data.description);
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());

    const response = await apiClient.post<SingleResponse<PropertyTypeResponse>>(
      PROPERTY_ENDPOINTS.PROPERTY_TYPES,
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
   * Update property type (Admin only)
   */
  async updatePropertyType(data: UpdatePropertyTypeRequest): Promise<PropertyTypeResponse> {
    const formData = new FormData();

    formData.append('id', data.id);
    if (data.typeName) formData.append('typeName', data.typeName);
    if (data.avatar) formData.append('avatar', data.avatar);
    if (data.description) formData.append('description', data.description);
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());

    const response = await apiClient.put<SingleResponse<PropertyTypeResponse>>(
      PROPERTY_ENDPOINTS.PROPERTY_TYPES,
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
   * Delete property type (Admin only)
   */
  async deletePropertyType(id: string): Promise<void> {
    await apiClient.delete<SingleResponse<void>>(
      PROPERTY_ENDPOINTS.PROPERTY_TYPE_DETAIL(id)
    );
  },
};

