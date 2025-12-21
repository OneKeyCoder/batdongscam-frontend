import apiClient from '../client';
import { SingleResponse } from '../types';

const PAYOS_ENDPOINTS = {
  CONTRACT_CHECKOUT: (contractId: string) => `/payos/contracts/${contractId}/checkout`,
  PROPERTY_SERVICE_FEE: (propertyId: string) => `/payos/properties/${propertyId}/service-fee`,
  PROPERTY_LISTING_FEE: '/payos/properties',
  CANCELLATION_REFUND: (contractId: string) => `/payos/contracts/${contractId}/cancellation-refund`,
};

export interface CheckoutResponse {
  checkoutUrl: string;
  orderId: string;
  amount: number;
}

export const payosService = {
  /**
   * Create checkout for contract payment
   */
  async createContractCheckout(contractId: string): Promise<CheckoutResponse> {
    const response = await apiClient.post<SingleResponse<CheckoutResponse>>(
      PAYOS_ENDPOINTS.CONTRACT_CHECKOUT(contractId)
    );
    return response.data.data;
  },

  /**
   * Pay property service fee
   */
  async payPropertyServiceFee(propertyId: string): Promise<CheckoutResponse> {
    const response = await apiClient.post<SingleResponse<CheckoutResponse>>(
      PAYOS_ENDPOINTS.PROPERTY_SERVICE_FEE(propertyId)
    );
    return response.data.data;
  },

  /**
   * Pay property listing fee
   */
  async payPropertyListingFee(propertyId: string): Promise<CheckoutResponse> {
    const response = await apiClient.post<SingleResponse<CheckoutResponse>>(
      PAYOS_ENDPOINTS.PROPERTY_LISTING_FEE,
      { propertyId }
    );
    return response.data.data;
  },

  /**
   * Request cancellation refund
   */
  async requestCancellationRefund(contractId: string): Promise<CheckoutResponse> {
    const response = await apiClient.post<SingleResponse<CheckoutResponse>>(
      PAYOS_ENDPOINTS.CANCELLATION_REFUND(contractId)
    );
    return response.data.data;
  },
};
