import apiClient from '../client';
import { PaginatedResponse, SingleResponse } from '../types';

const ASSIGNMENT_ENDPOINTS = {
  MY_VIEWING_LIST: '/assignments/my-viewing-list',
  MY_ASSIGNED_PROPERTIES: '/assignments/my-assigned-properties',
  ADMIN_FREE_AGENTS: '/assignments/admin/free-agents',
  ADMIN_ASSIGN: '/assignments/admin/assign',
  ADMIN_ASSIGN_VIEWING: (appointmentId: string) => `/assignments/admin/viewings/${appointmentId}/agent`,
  UPDATE_APPOINTMENT_DETAILS: (appointmentId: string) => `/assignments/update-appointment-details/${appointmentId}`,
};

export interface ViewingListItem {
  id: string;
  customerName: string;
  propertyTitle: string;
  appointmentDate: string;
  status: string;
  // Add other fields as needed
}

export interface FreeAgentListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  ranking?: number;
  employeeCode?: string;
  avatarUrl?: string;
  tier?: string;
  assignedAppointments?: number;
  assignedProperties?: number;
  currentlyHandling?: number;
  maxProperties?: number;
}

export interface SimplePropertyCard {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  thumbnailUrl?: string;
  transactionType?: 'SALE' | 'RENT';
  isFavorite: boolean;
  numberOfImages: number;
  location?: string;
  status?: string;
  price?: number;
  totalArea?: number;
  ownerId?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  ownerTier?: string;
  agentId?: string;
  agentFirstName?: string;
  agentLastName?: string;
  agentTier?: string;
}

//REQUEST INTERFACES
export interface FreeAgentFilters {
  page?: number;
  limit?: number;
  sortType?: 'asc' | 'desc';
  sortBy?: string;
  agentNameOrCode?: string;
  agentTiers?: string[];
  minAssignedAppointments?: number;
  maxAssignedAppointments?: number;
  minAssignedProperties?: number;
  maxAssignedProperties?: number;
  minCurrentlyHandle?: number;
  maxCurrentlyHandle?: number;
}

export interface AssignAgentRequest {
  agentId?: string | null; // null to remove agent
  targetId: string;
  targetType: 'PROPERTY' | 'APPOINTMENT';
}

export interface UpdateAppointmentDetailsRequest {
  agentNotes?: string;
  viewingOutcome?: string;
  customerInterestLevel?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  cancelledReason?: string;
}

export interface MyViewingListFilters {
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

export interface MyAssignedPropertiesFilters {
  page?: number;
  limit?: number;
  sortType?: 'asc' | 'desc';
  sortBy?: string;
  propertyOwnerName?: string;
}

export const assignmentService = {
  /**
   * Get agent's viewing appointments list
   * Endpoint: GET /assignments/my-viewing-list
   * Role: SALESAGENT only
   */
  async getMyViewingList(filters?: MyViewingListFilters): Promise<PaginatedResponse<ViewingListItem>> {
    const response = await apiClient.get<PaginatedResponse<ViewingListItem>>(
      ASSIGNMENT_ENDPOINTS.MY_VIEWING_LIST,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get agent's assigned properties
   * Endpoint: GET /assignments/my-assigned-properties
   * Role: SALESAGENT only
   */
  async getMyAssignedProperties(filters?: MyAssignedPropertiesFilters): Promise<PaginatedResponse<SimplePropertyCard>> {
    const response = await apiClient.get<PaginatedResponse<SimplePropertyCard>>(
      ASSIGNMENT_ENDPOINTS.MY_ASSIGNED_PROPERTIES,
      { params: filters }
    );
    return response.data;
  },

  /**
 * Get free agents list with filters (Admin only)
 */
  async getFreeAgents(filters?: FreeAgentFilters): Promise<PaginatedResponse<FreeAgentListItem>> {
    const response = await apiClient.get<PaginatedResponse<FreeAgentListItem>>(
      ASSIGNMENT_ENDPOINTS.ADMIN_FREE_AGENTS,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Assign or remove agent from property or appointment (Admin only)
   * @param agentId - Agent ID (null to remove current agent)
   * @param targetId - Property or Appointment ID
   * @param targetType - 'PROPERTY' or 'APPOINTMENT'
   */
  async assignAgent(agentId: string | null, targetId: string, targetType: 'PROPERTY' | 'APPOINTMENT'): Promise<boolean> {
    const response = await apiClient.post<SingleResponse<boolean>>(
      ASSIGNMENT_ENDPOINTS.ADMIN_ASSIGN,
      null,
      {
        params: {
          agentId,
          targetId,
          targetType,
        },
      }
    );
    return response.data.data;
  },

  /**
   * Assign or remove agent on a viewing (Admin only)
   * Convenience endpoint specifically for appointments
   */
  async assignAgentToViewing(appointmentId: string, agentId?: string | null): Promise<boolean> {
    const response = await apiClient.patch<SingleResponse<boolean>>(
      ASSIGNMENT_ENDPOINTS.ADMIN_ASSIGN_VIEWING(appointmentId),
      null,
      {
        params: { agentId },
      }
    );
    return response.data.data;
  },

  /**
   * Update appointment details (Agent only)
   * Only non-null fields will be updated
   */
  async updateAppointmentDetails(appointmentId: string, data: UpdateAppointmentDetailsRequest): Promise<boolean> {
    const response = await apiClient.patch<SingleResponse<boolean>>(
      ASSIGNMENT_ENDPOINTS.UPDATE_APPOINTMENT_DETAILS(appointmentId),
      null,
      {
        params: data, 
      }
    );
    return response.data.data;
  },
};
