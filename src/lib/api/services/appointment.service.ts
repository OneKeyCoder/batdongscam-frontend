import apiClient from '../client';
import { SingleResponse, ListResponse } from '../types';

const APPOINTMENT_ENDPOINTS = {
  CREATE: '/appointment',
  VIEWING_CARDS: '/appointment/viewing-cards',
  VIEWING_DETAILS: (id: string) => `/appointment/viewing-details/${id}`,
  CANCEL: (id: string) => `/appointment/${id}/cancel`,
  COMPLETE: (id: string) => `/appointment/${id}/complete`,
  RATE: (id: string) => `/appointment/${id}/rate`,
};

export interface CreateAppointmentRequest {
  propertyId: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
}

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
}

export interface ViewingDetails extends ViewingCard {
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

export interface RateAppointmentRequest {
  rating: number;
  comment?: string;
}

export const appointmentService = {
  /**
   * Create a new viewing appointment
   */
  async createAppointment(data: CreateAppointmentRequest): Promise<ViewingCard> {
    const response = await apiClient.post<SingleResponse<ViewingCard>>(
      APPOINTMENT_ENDPOINTS.CREATE,
      data
    );
    return response.data.data;
  },

  /**
   * Get all viewing cards for current user
   */
  async getViewingCards(): Promise<ViewingCard[]> {
    const response = await apiClient.get<ListResponse<ViewingCard>>(
      APPOINTMENT_ENDPOINTS.VIEWING_CARDS
    );
    return response.data.data;
  },

  /**
   * Get viewing details by ID
   */
  async getViewingDetails(id: string): Promise<ViewingDetails> {
    const response = await apiClient.get<SingleResponse<ViewingDetails>>(
      APPOINTMENT_ENDPOINTS.VIEWING_DETAILS(id)
    );
    return response.data.data;
  },

  /**
   * Cancel a viewing appointment
   * Backend: PATCH /appointment/{id}/cancel
   */
  async cancelAppointment(id: string, reason?: string): Promise<void> {
    await apiClient.patch<SingleResponse<void>>(
      APPOINTMENT_ENDPOINTS.CANCEL(id),
      { reason }
    );
  },

  /**
   * Mark appointment as complete
   */
  async completeAppointment(id: string): Promise<void> {
    await apiClient.patch<SingleResponse<void>>(
      APPOINTMENT_ENDPOINTS.COMPLETE(id)
    );
  },

  /**
   * Rate a completed appointment
   * Backend: PUT /appointments/{id}/rate with body { rating, comment }
   */
  async rateAppointment(id: string, data: RateAppointmentRequest): Promise<void> {
    await apiClient.put<SingleResponse<void>>(
      APPOINTMENT_ENDPOINTS.RATE(id),
      data
    );
  },
};
