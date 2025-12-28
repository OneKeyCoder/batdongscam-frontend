import apiClient from '../client';
import { SingleResponse, ListResponse, PaginatedResponse } from '../types';

const PAYMENT_ENDPOINTS = {
  CONTRACT_CHECKOUT: '/payos/contracts',
  SERVICE_FEE: '/payos/properties',
  PAYMENTS: '/payments',
  PAYMENT_DETAIL: (id: string) => `/payments/${id}`,
  UPDATE_STATUS: (id: string) => `/payments/${id}/status`,
  CREATE_SALARY: '/payments/salary',
  CREATE_BONUS: '/payments/bonus',
};

export interface CreateSalaryPaymentRequest {
  agentId: string;
  amount: number;
  dueDate?: string;
  notes?: string;
}

export interface CreateBonusPaymentRequest {
  agentId: string;
  amount: number;
  notes?: string;
}

export interface UpdatePaymentStatusRequest {
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'OVERDUE';
  notes?: string;
  transactionReference?: string;
}

export interface PaymentDetailResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  paymentType: string;
  status: string;
  amount: number;
  penaltyAmount?: number;
  dueDate?: string;
  paidDate?: string;
  installmentNumber?: number;
  paymentMethod?: string;
  transactionReference?: string;
  notes?: string;
  overdueDays?: number;
  penaltyApplied?: boolean;
  payerId?: string;
  payerFirstName?: string;
  payerLastName?: string;
  payerRole?: string;
  payerPhone?: string;
  payeeId?: string;
  payeeFirstName?: string;
  payeeLastName?: string;
  payeeRole?: string;
  payeePhone?: string;
  contractId?: string;
  contractNumber?: string;
  contractType?: string;
  contractStatus?: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyAddress?: string;
  agentId?: string;
  agentFirstName?: string;
  agentLastName?: string;
  agentEmployeeCode?: string;
}

export interface PaymentListItem {
  id: string;
  createdAt: string;
  paymentType: string;
  status: string;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  payerId?: string;
  payerName?: string;
  payerRole?: string;
  payeeId?: string;
  payeeName?: string;
  payeeRole?: string;
  contractId?: string;
  contractNumber?: string;
  propertyId?: string;
  propertyTitle?: string;
}

export interface PaymentFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  paymentTypes?: string | string[];
  statuses?: string | string[];
  payerId?: string;
  payeeId?: string;
  contractId?: string;
  propertyId?: string;
  agentId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  paidDateFrom?: string;
  paidDateTo?: string;
  overdue?: boolean;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  orderId: string;
  qrCode?: string;
}

export const paymentService = {
  /**
   * Create contract payment checkout
   */
  async createContractCheckout(contractId: string): Promise<CheckoutResponse> {
    const response = await apiClient.post<SingleResponse<CheckoutResponse>>(
      `${PAYMENT_ENDPOINTS.CONTRACT_CHECKOUT}/${contractId}/checkout`
    );
    return response.data.data;
  },

  /**
   * Create service fee payment
   */
  async createServiceFeePayment(propertyId: string): Promise<CheckoutResponse> {
    const response = await apiClient.post<SingleResponse<CheckoutResponse>>(
      `${PAYMENT_ENDPOINTS.SERVICE_FEE}/${propertyId}/service-fee`
    );
    return response.data.data;
  },

  /**
   * Get paginated list of payments with filters (Admin/Accountant only)
   */
  async getPayments(filters?: PaymentFilters): Promise<PaginatedResponse<PaymentListItem>> {
    console.log('📤 Original filters:', filters);

    // Build query string manually to ensure Spring Boot compatibility
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            // Add multiple params with same key: ?statuses=PENDING&statuses=SUCCESS
            value.forEach(item => {
              // Ensure enum values are uppercase
              const paramValue = typeof item === 'string' ? item.toUpperCase() : item.toString();
              params.append(key, paramValue);
            });
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    console.log('📡 Query string:', queryString);

    const response = await apiClient.get<PaginatedResponse<PaymentListItem>>(
      `${PAYMENT_ENDPOINTS.PAYMENTS}?${queryString}`
    );

    console.log('📥 Response:', response.data.data?.length, 'items');
    return response.data;
  },

  /**
   * Get payment details by ID (Admin/Accountant only)
   */
  async getPaymentById(paymentId: string): Promise<PaymentDetailResponse> {
    const response = await apiClient.get<SingleResponse<PaymentDetailResponse>>(
      PAYMENT_ENDPOINTS.PAYMENT_DETAIL(paymentId)
    );
    return response.data.data;
  },

  /**
   * Update payment status (Admin/Accountant only)
   */
  async updatePaymentStatus(
    paymentId: string,
    data: UpdatePaymentStatusRequest
  ): Promise<PaymentDetailResponse> {
    const response = await apiClient.patch<SingleResponse<PaymentDetailResponse>>(
      PAYMENT_ENDPOINTS.UPDATE_STATUS(paymentId),
      data
    );
    return response.data.data;
  },

  /**
   * Create salary payment for agent (Admin/Accountant only)
   */
  async createSalaryPayment(data: CreateSalaryPaymentRequest): Promise<PaymentDetailResponse> {
    const response = await apiClient.post<SingleResponse<PaymentDetailResponse>>(
      PAYMENT_ENDPOINTS.CREATE_SALARY,
      data
    );
    return response.data.data;
  },

  /**
   * Create bonus payment for agent (Admin/Accountant only)
   */
  async createBonusPayment(data: CreateBonusPaymentRequest): Promise<PaymentDetailResponse> {
    const response = await apiClient.post<SingleResponse<PaymentDetailResponse>>(
      PAYMENT_ENDPOINTS.CREATE_BONUS,
      data
    );
    return response.data.data;
  },
};