import apiClient from '../client';
import { SingleResponse, ListResponse, PaginatedResponse } from '../types';

const APPOINTMENT_ENDPOINTS = {
  CREATE: '/appointment',
  VIEWING_CARDS: '/appointment/viewing-cards',
  VIEWING_DETAILS: (id: string) => `/appointment/viewing-details/${id}`,
  CANCEL: (id: string) => `/appointment/${id}/cancel`,
  COMPLETE: (id: string) => `/appointment/${id}/complete`,
  RATE: (id: string) => `/appointment/${id}/rate`,
  UPDATE_DETAILS: (id: string) => `/appointment/${id}`,
  ADMIN_VIEWING_LIST: '/appointment/admin/viewing-list',
  ADMIN_VIEWING_DETAILS: (id: string) => `/appointment/admin-agent/viewing-details/${id}`,
  AGENT_MY_VIEWING_LIST: '/assignments/my-viewing-list',
};

// --- REQUEST INTERFACES ---

export interface CreateAppointmentRequest {
  propertyId: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
  requestedDate: string;
  customerRequirements?: string; 
  customerId?: string;
  agentId?: string;
}

export interface RateAppointmentRequest {
  rating: number;
  comment?: string;
}

export interface CancelAppointmentRequest {
  reason?: string;
}
export interface UpdateAppointmentDetailsParams {
  agentNotes?: string;
  viewingOutcome?: string;
  customerInterestLevel?: string; 
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  cancelledReason?: string;
}

// --- RESPONSE INTERFACES (Giữ nguyên) ---

export interface ViewingCard {
  id: string;
  title: string;
  thumbnailUrl?: string;
  priceAmount?: number;
  area?: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  districtName?: string;
  cityName?: string;
  requestedDate: string;
  rating?: number;
  comment?: string;
  agentName?: string;
}

export interface ViewingDetailsCustomer extends ViewingCard {
  fullAddress?: string;
  images?: number;
  imagesList?: string[];
  description?: string;
  rooms?: number;
  bathRooms?: number;
  bedRooms?: number;
  floors?: number;
  houseOrientation?: string;
  balconyOrientation?: string;
  confirmedDate?: string;
  rating?: number;
  comment?: string;
  customerRequirements?: string;
  propertyOwner?: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    tier?: string;
    phoneNumber?: string;
    email?: string;
  };
  salesAgent?: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    tier?: string;
    rating?: number;
    totalRates?: number;
    phoneNumber?: string;
    email?: string;
  };
  attachedDocuments?: string[];
  notes?: string;
}

export interface BookAppointmentResponse {
  appointmentId: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  requestedDate: string;
  status: string;
  customerRequirements?: string;
  agentId?: string;
  agentName?: string;
  createdAt: string;
  message?: string;
}

export interface ViewingDetailsAdmin {
  id: string;
  createdAt: string;
  updatedAt: string;
  requestedDate: string;
  confirmedDate?: string;
  rating?: number;
  comment?: string;
  customerRequirements?: string;
  agentNotes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  viewingOutcome?: string;
  customerInterestLevel?: string;
  propertyCard?: {
    id: string;
    title: string;
    thumbnailUrl?: string;
    transactionType?: 'SALE' | 'RENT';
    type?: string;
    fullAddress?: string;
    price?: number;
    area?: number;
  };
  customer?: {
    id: string;
    fullName?: string;
    tier?: string;
    phoneNumber?: string;
    email?: string;
  };
  propertyOwner?: {
    id: string;
    fullName?: string;
    tier?: string;
    phoneNumber?: string;
    email?: string;
  };
  salesAgent?: {
    id: string;
    fullName?: string;
    tier?: string;
    phoneNumber?: string;
    email?: string;
    rating?: number;
    totalRates?: number;
  };
}

export interface ViewingListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  propertyName: string;
  price?: number;
  area?: number;
  thumbnailUrl?: string;
  requestedDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  cityName?: string;
  districtName?: string;
  wardName?: string;
  customerName?: string;
  customerTier?: string;
  salesAgentName?: string;
  salesAgentTier?: string;
  rating?: number;
  comment?: string;
}

export interface ViewingCardsFilters {
  page?: number;
  limit?: number;
  sortType?: 'asc' | 'desc';
  sortBy?: string;
  statusEnum?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  day?: number;
  month?: number;
  year?: number;
}

export interface ViewingListFilters {
  page?: number;
  limit?: number;
  sortType?: 'asc' | 'desc';
  sortBy?: string;
  propertyName?: string;
  propertyTypeIds?: string[];
  transactionTypeEnums?: ('SALE' | 'RENTAL')[];
  agentName?: string;
  agentTiers?: string[];
  customerName?: string;
  customerTiers?: string[];
  requestDateFrom?: string; // ISO format
  requestDateTo?: string;
  minRating?: number;
  maxRating?: number;
  cityIds?: string[];
  districtIds?: string[];
  wardIds?: string[];
  statusEnums?: ('PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED')[];
}

export interface AgentViewingListFilters {
  page?: number;
  limit?: number;
  sortType?: 'asc' | 'desc';
  sortBy?: string;
  customerName?: string;
  day?: number;
  month?: number;
  year?: number;
  statusEnums?: ('PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED')[];
}

export const appointmentService = {
  /**
   * Create a new viewing appointment
   */
  async createAppointment(data: CreateAppointmentRequest): Promise<BookAppointmentResponse> {
    const response = await apiClient.post<SingleResponse<BookAppointmentResponse>>(
      APPOINTMENT_ENDPOINTS.CREATE,
      data
    );
    return response.data.data;
  },

  /**
   * Get viewing cards with filters (paginated)
   */
  async getViewingCards(filters?: ViewingCardsFilters): Promise<PaginatedResponse<ViewingCard>> {
    const response = await apiClient.get<PaginatedResponse<ViewingCard>>(
      APPOINTMENT_ENDPOINTS.VIEWING_CARDS,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get viewing details by ID (Customer view)
   */
  async getViewingDetails(id: string): Promise<ViewingDetailsCustomer> {
    const response = await apiClient.get<SingleResponse<ViewingDetailsCustomer>>(
      APPOINTMENT_ENDPOINTS.VIEWING_DETAILS(id)
    );
    return response.data.data;
  },

  /**
   * Cancel a viewing appointment
   */
  async cancelAppointment(id: string, reason?: string): Promise<boolean> {
    const response = await apiClient.patch<SingleResponse<boolean>>(
      APPOINTMENT_ENDPOINTS.CANCEL(id),
      reason ? { reason } : undefined
    );
    return response.data.data;
  },

  /**
   * Mark appointment as completed
   */
  async completeAppointment(id: string): Promise<boolean> {
    const response = await apiClient.patch<SingleResponse<boolean>>(
      APPOINTMENT_ENDPOINTS.COMPLETE(id)
    );
    return response.data.data;
  },

  /**
   * Rate a completed appointment
   */
  async rateAppointment(id: string, data: RateAppointmentRequest): Promise<boolean> {
    const response = await apiClient.patch<SingleResponse<boolean>>(
      APPOINTMENT_ENDPOINTS.RATE(id),
      data
    );
    return response.data.data;
  },

  /**
   * Update appointment details (Agent Notes, Outcome, Status...)
   * Backend dùng @RequestParam nên data phải nằm trong `params`
   */
  async updateAppointmentDetails(id: string, params: UpdateAppointmentDetailsParams): Promise<boolean> {
    const response = await apiClient.patch<SingleResponse<boolean>>(
      APPOINTMENT_ENDPOINTS.UPDATE_DETAILS(id),
      null, 
      { params: params } 
    );
    return response.data.data;
  },

  /**
   * Get viewing list with filters (Admin only)
   */
  async getViewingList(filters?: ViewingListFilters): Promise<PaginatedResponse<ViewingListItem>> {
    const response = await apiClient.get<PaginatedResponse<ViewingListItem>>(
      APPOINTMENT_ENDPOINTS.ADMIN_VIEWING_LIST,
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
   * Get my viewing list with filters (Agent only)
   * (Endpoint này có thể chưa khớp backend nhưng giữ lại theo yêu cầu)
   */
  async getMyViewingList(filters?: AgentViewingListFilters): Promise<PaginatedResponse<ViewingListItem>> {
    const response = await apiClient.get<PaginatedResponse<ViewingListItem>>(
      APPOINTMENT_ENDPOINTS.AGENT_MY_VIEWING_LIST,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get viewing details (Admin/Agent view)
   */
  async getViewingDetailsAdmin(id: string): Promise<ViewingDetailsAdmin> {
    const response = await apiClient.get<SingleResponse<ViewingDetailsAdmin>>(
      APPOINTMENT_ENDPOINTS.ADMIN_VIEWING_DETAILS(id)
    );
    return response.data.data;
  },
};