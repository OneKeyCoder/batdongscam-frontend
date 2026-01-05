import apiClient from '../client';
import { SingleResponse, ListResponse, PaginatedResponse } from '../types';

const PAYMENT_ENDPOINTS = {
  CONTRACT_CHECKOUT: '/payos/contracts',
  SERVICE_FEE: '/payos/properties',
  PAYMENTS: '/payments',
  PAYMENTS_MY: '/payments/my',
  PAYMENTS_MY_PAYOUTS: '/payments/my-payouts',
  PAYMENTS_OF_PROPERTY: (propertyId: string) => `/payments/property/${propertyId}`,
  PAYMENT_DETAIL: (id: string) => `/payments/${id}`,
  PAYMENT_LINK: (id: string) => `/payments/${id}/link`,
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
  paidTime?: string; // Backend returns paidTime, not paidDate
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
  paidTime?: string; // Backend returns paidTime, not paidDate
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
    const params = { ...filters };
    if (params.page && params.page > 0) {
      params.page = params.page - 1;
    } else {
      params.page = 0;
    }

    const response = await apiClient.get<PaginatedResponse<PaymentListItem>>(
      PAYMENT_ENDPOINTS.PAYMENTS, {params}
    );

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

  /**
   * Get payments for a specific property (Property Owner)
   */
  async getPaymentsOfProperty(propertyId: string, filters?: { page?: number; size?: number }): Promise<PaginatedResponse<PaymentListItem>> {
    const params = new URLSearchParams();
    if (filters?.page !== undefined) params.append('page', filters.page.toString());
    if (filters?.size !== undefined) params.append('size', filters.size.toString());

    const queryString = params.toString();
    const url = queryString 
      ? `${PAYMENT_ENDPOINTS.PAYMENTS_OF_PROPERTY(propertyId)}?${queryString}`
      : PAYMENT_ENDPOINTS.PAYMENTS_OF_PROPERTY(propertyId);

    const response = await apiClient.get<PaginatedResponse<PaymentListItem>>(url);
    return response.data;
  },

  /**
   * Get payment checkout link (Customer/Property Owner)
   * Returns checkout URL for redirecting to payment gateway
   */
  async getPaymentLink(paymentId: string): Promise<string> {
    const response = await apiClient.post<SingleResponse<string>>(
      PAYMENT_ENDPOINTS.PAYMENT_LINK(paymentId)
    );
    return response.data.data;
  },

  /**
   * Get my payments (for authenticated users - customer/owner)
   * Backend automatically filters by current user as payer
   */
  async getMyPayments(filters?: { page?: number; size?: number; statuses?: string[] }): Promise<PaginatedResponse<PaymentListItem>> {
    const params = new URLSearchParams();
    if (filters?.page !== undefined) params.append('page', filters.page.toString());
    if (filters?.size !== undefined) params.append('size', filters.size.toString());
    if (filters?.statuses) {
      filters.statuses.forEach(status => params.append('statuses', status));
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${PAYMENT_ENDPOINTS.PAYMENTS_MY}?${queryString}`
      : PAYMENT_ENDPOINTS.PAYMENTS_MY;

    const response = await apiClient.get<PaginatedResponse<PaymentListItem>>(url);
    return response.data;
  },

  /**
   * Get my payouts (for agents - salary, bonus, commission)
   * Backend automatically filters by current user as payee
   */
  async getMyPayouts(filters?: { page?: number; size?: number; statuses?: string[] }): Promise<PaginatedResponse<PaymentListItem>> {
    const params = new URLSearchParams();
    if (filters?.page !== undefined) params.append('page', filters.page.toString());
    if (filters?.size !== undefined) params.append('size', filters.size.toString());
    if (filters?.statuses) {
      filters.statuses.forEach(status => params.append('statuses', status));
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${PAYMENT_ENDPOINTS.PAYMENTS_MY_PAYOUTS}?${queryString}`
      : PAYMENT_ENDPOINTS.PAYMENTS_MY_PAYOUTS;

    const response = await apiClient.get<PaginatedResponse<PaymentListItem>>(url);
    return response.data;
  },
};