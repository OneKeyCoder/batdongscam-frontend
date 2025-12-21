// API Response Types
export interface SingleResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface ListResponse<T> {
  statusCode: number;
  message: string;
  data: T[];
}

export interface PaginatedResponse<T> {
  statusCode: number;
  message: string;
  data: T[];
  paging: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  zaloContact?: string;
  dayOfBirth: string; // ISO date format
  gender: string;
  nation: string;
  wardId: string;
  identificationNumber: string;
  issueDate: string; // ISO date format
  issuingAuthority: string;
  frontIdPicture: File;
  backIdPicture: File;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  userId: string;
  role: UserRole;
}

export type UserRole = 'ADMIN' | 'SALESAGENT' | 'GUEST' | 'PROPERTY_OWNER' | 'CUSTOMER' | 'ACCOUNTANT';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MeResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  email: string;
  tier: string;
  phoneNumber: string;
  zaloContact: string;
  wardId: string;
  wardName: string;
  districtId: string;
  districtName: string;
  cityId: string;
  cityName: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  status: string;
  identificationNumber: string;
  dayOfBirth: string;
  gender: string;
  nation: string;
  issueDate: string;
  issuingAuthority: string;
  frontIdPicturePath: string;
  backIdPicturePath: string;
  lastLoginAt: string;
  profile?: {
    totalListings: number;
    totalBought: number;
    totalRented: number;
    totalInvested: number;
  };
  statisticMonth?: any;
  statisticAll?: any;
}

export interface DecodedToken {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'PROPERTY_OWNER' | 'SALESAGENT' | 'ADMIN';
  exp: number;
}

// Property Types
export interface PropertyCard {
  id: string;
  createdAt: string;
  updatedAt: string;
  transactionType: 'SALE' | 'RENT' | null;
  title: string;
  thumbnailUrl: string;
  favorite: boolean;
  numberOfImages: number;
  location: string; // Combined location string from API
  status: 'AVAILABLE' | 'SOLD' | 'RENTED' | 'PENDING' | 'APPROVED';
  price: number;
  totalArea: number;
  ownerId: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerTier: string;
  agentId?: string;
  agentFirstName?: string;
  agentLastName?: string;
  agentTier?: string;
}

export interface PropertyDetails {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  fullAddress: string;
  priceAmount: number;
  area: number;
  transactionType: 'SALE' | 'RENT';
  status: string;
  rooms?: number;
  bathrooms?: number;
  bedrooms?: number;
  floors?: number;
  houseOrientation?: string;
  balconyOrientation?: string;
  mediaList: Array<{
    id: string;
    filePath: string;
    mediaType: string;
  }>;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  ward: {
    id: string;
    wardName: string;
    district: {
      id: string;
      districtName: string;
      city: {
        id: string;
        cityName: string;
      };
    };
  };
  propertyType: {
    id: string;
    typeName: string;
  };
}

export interface PropertyFilters {
  page?: number;
  limit?: number;
  sortType?: 'asc' | 'desc';
  sortBy?: string;
  cityIds?: string[];
  districtIds?: string[];
  wardIds?: string[];
  propertyTypeIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  rooms?: number;
  bathrooms?: number;
  bedrooms?: number;
  floors?: number;
  houseOrientation?: string;
  balconyOrientation?: string;
  transactionType?: ('SALE' | 'RENT')[];
  statuses?: string[];
  topK?: boolean;
  ownerId?: string;
  agentId?: string;
}
