import apiClient from '../client';
import { PropertyCard, PropertyFilters, PaginatedResponse, SingleResponse } from '../types';

const PROPERTY_ENDPOINTS = {
  CARDS: '/public/properties/cards',
  DETAILS: (id: string) => `/public/properties/${id}`,
  PROPERTIES: '/properties',
  PROPERTY_DETAIL: (id: string) => `/properties/${id}`,
  CONTRACT_HISTORY: (id: string) => `/properties/${id}/contract-history`,
  PROPERTY_STATUS: (id: string) => `/properties/${id}/status`,
  ASSIGN_AGENT: (propertyId: string, agentId: string) => `/properties/${propertyId}/assign-agent/${agentId}`,
  PROPERTY_TYPES: '/public/locations/property-types',
  PROPERTY_TYPE_DETAIL: (id: string) => `/properties/types/${id}`,
  DOCUMENT_TYPES: '/public/document-types',
  ADMIN_PROPERTIES: '/properties/cards'
};

// Document upload metadata
export interface DocumentUploadInfo {
  documentTypeId: string;
  documentNumber?: string;
  documentName?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  fileIndex: number;
}

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
  documentMetadata?: DocumentUploadInfo[];
}

export interface UpdatePropertyRequest extends CreatePropertyRequest {
  mediaIdsToRemove?: string[];
  documentIdsToRemove?: string[];
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

export interface DocumentTypeResponse {
  id: string;
  name: string;
  description?: string;
  isCompulsory: boolean;
}

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

export interface PropertyContractHistoryDatapoint {
  startDate: string; 
  endDate: string;   
  status: string;    
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
  async getAllProperties(filters: PropertyFilters = {}): Promise<PaginatedResponse<PropertyCard>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortType) params.append('sortType', filters.sortType);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.cityIds?.length) filters.cityIds.forEach(id => params.append('cityIds', id));
    if (filters.districtIds?.length) filters.districtIds.forEach(id => params.append('districtIds', id));

    const response = await apiClient.get<PaginatedResponse<PropertyCard>>(
      `${PROPERTY_ENDPOINTS.PROPERTIES}?${params.toString()}`
    );
    return response.data;
  },

  async getPropertyCards(filters: PropertyFilters = {}): Promise<PaginatedResponse<PropertyCard>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortType) params.append('sortType', filters.sortType);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.cityIds?.length) filters.cityIds.forEach(id => params.append('cityIds', id));
    if (filters.districtIds?.length) filters.districtIds.forEach(id => params.append('districtIds', id));
    if (filters.wardIds?.length) filters.wardIds.forEach(id => params.append('wardIds', id));
    if (filters.propertyTypeIds?.length) filters.propertyTypeIds.forEach(id => params.append('propertyTypeIds', id));
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
    if (filters.transactionType?.length) filters.transactionType.forEach(type => params.append('transactionType', type));
    if (filters.statuses?.length) filters.statuses.forEach(status => params.append('statuses', status));
    if (filters.topK !== undefined) params.append('topK', filters.topK.toString());
    if (filters.ownerId) params.append('ownerId', filters.ownerId);
    if (filters.agentId) params.append('agentId', filters.agentId);
    params.append('hasAgent', (filters.hasAgent ?? false).toString());

    const response = await apiClient.get<PaginatedResponse<PropertyCard>>(
      `${PROPERTY_ENDPOINTS.CARDS}?${params.toString()}`
    );
    return response.data;
  },

  async getPropertyDetails(propertyId: string): Promise<PropertyDetails> {
    const response = await apiClient.get<SingleResponse<PropertyDetails>>(
      PROPERTY_ENDPOINTS.DETAILS(propertyId)
    );
    return response.data.data;
  },

  /**
   * [NEW] Get assigned property's contract history
   */
  async getPropertyContractHistory(
    propertyId: string,
    includePastContracts: boolean = true
  ): Promise<PropertyContractHistoryDatapoint[]> {
    const params = new URLSearchParams();
    params.append('includePastContracts', includePastContracts.toString());

    const response = await apiClient.get<SingleResponse<PropertyContractHistoryDatapoint[]>>(
      `${PROPERTY_ENDPOINTS.CONTRACT_HISTORY(propertyId)}?${params.toString()}`
    );
    return response.data.data;
  },

  async createProperty(data: CreatePropertyRequest, images?: File[], documents?: File[]): Promise<PropertyDetails> {
    const formData = new FormData();
    formData.append('payload', JSON.stringify(data));
    if (images?.length) images.forEach(image => formData.append('images', image));
    if (documents?.length) documents.forEach(doc => formData.append('documents', doc));

    const response = await apiClient.post<SingleResponse<PropertyDetails>>(
      PROPERTY_ENDPOINTS.PROPERTIES,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },

  async updateProperty(id: string, data: UpdatePropertyRequest, images?: File[], documents?: File[]): Promise<PropertyDetails> {
    const formData = new FormData();
    formData.append('payload', JSON.stringify(data));
    if (images?.length) images.forEach(image => formData.append('images', image));
    if (documents?.length) documents.forEach(doc => formData.append('documents', doc));

    const response = await apiClient.put<SingleResponse<PropertyDetails>>(
      PROPERTY_ENDPOINTS.PROPERTY_DETAIL(id),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },

  async getOwnerProperties(ownerId: string): Promise<PaginatedResponse<PropertyCard>> {
    return this.getPropertyCards({ ownerId });
  },

  async searchProperties(keyword?: string, filters: PropertyFilters = {}): Promise<PaginatedResponse<PropertyCard>> {
    return this.getPropertyCards(filters);
  },

  async updatePropertyStatus(id: string, data: UpdatePropertyStatusRequest): Promise<PropertyDetails> {
    const response = await apiClient.patch<SingleResponse<PropertyDetails>>(
      PROPERTY_ENDPOINTS.PROPERTY_STATUS(id),
      data
    );
    return response.data.data;
  },

  async deleteProperty(id: string): Promise<void> {
    await apiClient.delete<SingleResponse<void>>(
      PROPERTY_ENDPOINTS.PROPERTY_DETAIL(id)
    );
  },

  async assignAgentToProperty(propertyId: string, agentId: string): Promise<void> {
    await apiClient.put<SingleResponse<void>>(
      PROPERTY_ENDPOINTS.ASSIGN_AGENT(propertyId, agentId)
    );
  },

  async createPropertyType(data: CreatePropertyTypeRequest): Promise<PropertyTypeResponse> {
    const formData = new FormData();
    formData.append('typeName', data.typeName);
    if (data.avatar) formData.append('avatar', data.avatar);
    if (data.description) formData.append('description', data.description);
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());

    const response = await apiClient.post<SingleResponse<PropertyTypeResponse>>(
      PROPERTY_ENDPOINTS.PROPERTY_TYPES,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },

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
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },

  async deletePropertyType(id: string): Promise<void> {
    await apiClient.delete<SingleResponse<void>>(
      PROPERTY_ENDPOINTS.PROPERTY_TYPE_DETAIL(id)
    );
  },

  async getDocumentTypes(isCompulsory?: boolean): Promise<DocumentTypeResponse[]> {
    const params = new URLSearchParams();
    params.append('page', '1');
    params.append('limit', '100');
    if (isCompulsory !== undefined) params.append('isCompulsory', isCompulsory.toString());

    const response = await apiClient.get<PaginatedResponse<DocumentTypeResponse>>(
      `${PROPERTY_ENDPOINTS.DOCUMENT_TYPES}?${params.toString()}`
    );
    return response.data.data;
  },

  async getPropertyTypes(): Promise<PropertyTypeResponse[]> {
    const response = await apiClient.get<SingleResponse<PropertyTypeResponse[]>>(
      PROPERTY_ENDPOINTS.PROPERTY_TYPES
    );
    return response.data.data;
  },
};