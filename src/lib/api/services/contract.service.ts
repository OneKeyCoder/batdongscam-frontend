import apiClient from '../client';
import { SingleResponse, ListResponse } from '../types';

const CONTRACT_ENDPOINTS = {
  MY_CONTRACTS: '/contract/my-contracts',
  AGENT_CONTRACTS: '/contract/my-agent-contracts',
  CONTRACT_DETAILS: '/contract',
  CREATE: '/contract',
  SIGN: '/contract',
  CANCEL: '/contract',
  RATE: '/contract',
};

export interface Contract {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  contractType: 'SALE' | 'RENT';
  price: number;
  startDate: string;
  endDate?: string;
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  customerName: string;
  agentName?: string;
  createdAt: string;
}

export interface ContractDetails extends Contract {
  terms: string;
  propertyDetails: any;
  customerDetails: any;
  agentDetails?: any;
  documents: any[];
  signatures: any[];
}

export interface CreateContractRequest {
  propertyId: string;
  contractType: 'SALE' | 'RENT';
  price: number;
  startDate: string;
  endDate?: string;
  terms: string;
}

export interface RateContractRequest {
  rating: number;
  comment?: string;
}

export interface CreateContractRequest {
  propertyId: string;
  customerId: string;
  contractType: 'SALE' | 'RENT';
  price: number;
  startDate: string;
  endDate?: string;
  terms?: string;
}

export const contractService = {
  /**
   * Get my contracts (customer view)
   */
  async getMyContracts(): Promise<Contract[]> {
    const response = await apiClient.get<ListResponse<Contract>>(
      CONTRACT_ENDPOINTS.MY_CONTRACTS
    );
    return response.data.data;
  },

  /**
   * Get agent contracts (agent view)
   */
  async getAgentContracts(): Promise<Contract[]> {
    const response = await apiClient.get<ListResponse<Contract>>(
      CONTRACT_ENDPOINTS.AGENT_CONTRACTS
    );
    return response.data.data;
    return response.data.data;
  },

  /**
   * Get contract details by ID
   */
  async getContractDetails(id: string): Promise<ContractDetails> {
    const response = await apiClient.get<SingleResponse<ContractDetails>>(
      `${CONTRACT_ENDPOINTS.CONTRACT_DETAILS}/${id}`
    );
    return response.data.data;
  },

  /**
   * Create a new contract
   */
  async createContract(data: CreateContractRequest): Promise<Contract> {
    const response = await apiClient.post<SingleResponse<Contract>>(
      CONTRACT_ENDPOINTS.CREATE,
      data
    );
    return response.data.data;
  },

  /**
   * Sign a contract
   * Backend: PUT /contracts/{id}/sign
   */
  async signContract(id: string): Promise<void> {
    await apiClient.put<SingleResponse<void>>(
      `${CONTRACT_ENDPOINTS.SIGN}/${id}/sign`
    );
  },

  /**
   * Cancel a contract
   */
  async cancelContract(id: string, reason?: string): Promise<void> {
    await apiClient.post<SingleResponse<void>>(
      `${CONTRACT_ENDPOINTS.CANCEL}/${id}/cancel`,
      { reason }
    );
  },

  /**
   * Rate a contract
   * Backend: POST /contracts/{id}/rate with query params (rating, comment)
   */
  async rateContract(id: string, data: RateContractRequest): Promise<void> {
    await apiClient.post<SingleResponse<void>>(
      `${CONTRACT_ENDPOINTS.RATE}/${id}/rate`,
      null,
      { params: data }
    );
  },
};
