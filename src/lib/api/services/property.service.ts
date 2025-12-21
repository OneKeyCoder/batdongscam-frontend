import apiClient from '../client';
import { PropertyCard, PropertyDetails, PropertyFilters, PaginatedResponse, SingleResponse } from '../types';

const PROPERTY_ENDPOINTS = {
  CARDS: '/public/properties/cards',
  DETAILS: (id: string) => `/public/properties/${id}`,
  CREATE: '/properties',
  UPDATE: (id: string) => `/properties/${id}`,
  DELETE: (id: string) => `/properties/${id}`,
  ASSIGN_AGENT: (id: string) => `/properties/${id}/assign-agent`,
};

export interface CreatePropertyRequest {
  title: string;
  description: string;
  fullAddress: string;
  wardId: string;
  propertyTypeId: string;
  transactionType: 'SALE' | 'RENT';
  priceAmount: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  rooms?: number;
  orientation?: string;
  amenities?: string;
  yearBuilt?: number;
  documents?: any[];
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
    images?: File[],
    documents?: File[]
  ): Promise<PropertyDetails> {
    const formData = new FormData();
    
    // Add JSON payload as a blob
    formData.append('payload', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    
    // Add images if provided
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    // Add documents if provided
    if (documents && documents.length > 0) {
      documents.forEach(doc => {
        formData.append('documents', doc);
      });
    }
    
    const response = await apiClient.post<SingleResponse<PropertyDetails>>(
      PROPERTY_ENDPOINTS.CREATE,
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
    data: Partial<CreatePropertyRequest>,
    images?: File[],
    documents?: File[]
  ): Promise<PropertyDetails> {
    const formData = new FormData();
    
    // Add JSON payload as a blob
    formData.append('payload', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    
    // Add images if provided
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    // Add documents if provided
    if (documents && documents.length > 0) {
      documents.forEach(doc => {
        formData.append('documents', doc);
      });
    }
    
    const response = await apiClient.put<SingleResponse<PropertyDetails>>(
      PROPERTY_ENDPOINTS.UPDATE(id),
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
   * Delete property (Owner only)
   */
  async deleteProperty(id: string): Promise<void> {
    await apiClient.delete(PROPERTY_ENDPOINTS.DELETE(id));
  },

  /**
   * Assign agent to property (Owner only)
   */
  async assignAgent(propertyId: string, agentId: string): Promise<void> {
    await apiClient.post(PROPERTY_ENDPOINTS.ASSIGN_AGENT(propertyId), { agentId });
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
};

