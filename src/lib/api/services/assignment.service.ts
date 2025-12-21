import apiClient from '../client';
import { PaginatedResponse } from '../types';

const ASSIGNMENT_ENDPOINTS = {
  MY_VIEWING_LIST: '/assignments/my-viewing-list',
  MY_ASSIGNED_PROPERTIES: '/assignments/my-assigned-properties',
};

export interface ViewingListItem {
  id: string;
  customerName: string;
  propertyTitle: string;
  appointmentDate: string;
  status: string;
  // Add other fields as needed
}

export interface SimplePropertyCard {
  id: string;
  title: string;
  price: number;
  area: number;
  address: string;
  city: string;
  district: string;
  images: string[];
  status: string;
  transactionType: string;
  // Add other fields as needed
}

export const assignmentService = {
  /**
   * Get agent's viewing appointments list
   * Endpoint: GET /assignments/my-viewing-list
   * Role: SALESAGENT only
   */
  async getMyViewingList(params?: {
    page?: number;
    limit?: number;
    customerName?: string;
    day?: number;
    month?: number;
    year?: number;
    statusEnums?: string[];
  }): Promise<PaginatedResponse<ViewingListItem>> {
    const response = await apiClient.get<PaginatedResponse<ViewingListItem>>(
      ASSIGNMENT_ENDPOINTS.MY_VIEWING_LIST,
      { params }
    );
    return response.data;
  },

  /**
   * Get agent's assigned properties
   * Endpoint: GET /assignments/my-assigned-properties
   * Role: SALESAGENT only
   */
  async getMyAssignedProperties(params?: {
    page?: number;
    limit?: number;
    propertyOwnerName?: string;
  }): Promise<PaginatedResponse<SimplePropertyCard>> {
    const response = await apiClient.get<PaginatedResponse<SimplePropertyCard>>(
      ASSIGNMENT_ENDPOINTS.MY_ASSIGNED_PROPERTIES,
      { params }
    );
    return response.data;
  },
};
