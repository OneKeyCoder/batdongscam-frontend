import apiClient from '../client';
import { SingleResponse, ListResponse } from '../types';

const PAYMENT_ENDPOINTS = {
  CONTRACT_CHECKOUT: '/payos/contracts',
  SERVICE_FEE: '/payos/properties',
  PAYMENTS: '/payments',
};

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  paymentMethod: string;
  description: string;
  createdAt: string;
  completedAt?: string;
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
   * Get payment history
   */
  async getPayments(): Promise<Payment[]> {
    const response = await apiClient.get<ListResponse<Payment>>(
      PAYMENT_ENDPOINTS.PAYMENTS
    );
    return response.data.data;
  },
};
