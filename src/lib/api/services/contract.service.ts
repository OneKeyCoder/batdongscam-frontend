import apiClient from '../client';
import { SingleResponse, ListResponse, PaginatedResponse } from '../types';

const CONTRACT_ENDPOINTS = {
  CONTRACTS: '/contracts',
  MY_CONTRACTS: '/contracts/my',
  AGENT_CONTRACTS: '/contracts/agent/my',
  CONTRACT_DETAIL: (id: string) => `/contracts/${id}`,
  CREATE: '/contracts',
  SIGN: (id: string) => `/contracts/${id}/sign`,
  CANCEL: (id: string) => `/contracts/${id}/cancel`,
  RATE: (id: string) => `/contracts/${id}/rate`,
};

export interface CreateContractRequest {
  propertyId: string;
  customerId: string;
  agentId: string;
  contractType: 'PURCHASE' | 'RENTAL';
  startDate: string; // ISO format: "2025-01-01"
  endDate: string;
  specialTerms?: string;
  contractPaymentType: 'MORTGAGE' | 'MONTHLY_RENT' | 'PAID_IN_FULL';
  totalContractAmount: number;
  depositAmount: number;
  advancePaymentAmount?: number;
  installmentAmount?: number;
  progressMilestone?: number;
  latePaymentPenaltyRate: number; // Decimal: 0.05 for 5%
  specialConditions?: string;
}

export interface UpdateContractRequest {
  endDate?: string;
  specialTerms?: string;
  status?: 'DRAFT' | 'PENDING_SIGNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  latePaymentPenaltyRate?: number;
  specialConditions?: string;
}

export interface CancelContractRequest {
  reason: string;
  waivePenalty?: boolean;
}

export interface ContractDetailResponse {
  id: string;
  contractNumber: string;
  contractType: string;
  status: string;
  contractPaymentType: string;
  totalContractAmount: number;
  depositAmount: number;
  remainingAmount: number;
  advancePaymentAmount?: number;
  installmentAmount?: number;
  progressMilestone?: number;
  finalPaymentAmount?: number;
  latePaymentPenaltyRate: number;
  startDate: string;
  endDate: string;
  signedAt?: string;
  completedAt?: string;
  specialTerms?: string;
  specialConditions?: string;
  cancellationReason?: string;
  cancellationPenalty?: number;
  cancelledBy?: string;
  rating?: number;
  comment?: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyPrice: number;
  propertyType: string;
  propertyTransactionType: string;
  customerId: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerEmail: string;
  ownerId: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerPhone: string;
  agentId: string;
  agentFirstName: string;
  agentLastName: string;
  agentEmployeeCode: string;
  agentPhone: string;
  totalPaymentsMade: number;
  paymentCount: number;
  payments: PaymentSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  id: string;
  paymentType: string;
  status: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  installmentNumber?: number;
}

export interface ContractListItem {
  id: string;
  contractNumber: string;
  contractType: string;
  status: string;
  totalContractAmount: number;
  startDate: string;
  endDate: string;
  signedAt?: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  customerId: string;
  customerFirstName: string;
  customerLastName: string;
  agentId: string;
  agentFirstName: string;
  agentLastName: string;
  agentEmployeeCode: string;
  createdAt: string;
}

export interface ContractFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  contractTypes?: ('PURCHASE' | 'RENTAL')[];
  statuses?: ('DRAFT' | 'PENDING_SIGNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED')[];
  customerId?: string;
  agentId?: string;
  propertyId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  search?: string;
}

export interface MyContractsFilters {
  page?: number;
  size?: number;
  statuses?: ('DRAFT' | 'PENDING_SIGNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED')[];
}

export const contractService = {
  /**
    * Create a new contract (Admin/Agent only)
    */
  async createContract(data: CreateContractRequest): Promise<ContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<ContractDetailResponse>>(
      CONTRACT_ENDPOINTS.CONTRACTS,
      data
    );
    return response.data.data;
  },

  /**
   * Get contract details by ID
   */
  async getContractById(id: string): Promise<ContractDetailResponse> {
    const response = await apiClient.get<SingleResponse<ContractDetailResponse>>(
      CONTRACT_ENDPOINTS.CONTRACT_DETAIL(id)
    );
    return response.data.data;
  },

  /**
   * Get paginated list of contracts (Admin/Agent only)
   */
  async getContracts(filters?: ContractFilters): Promise<PaginatedResponse<ContractListItem>> {
    const params = { ...filters };
    if (params.page && params.page > 0) {
        params.page = params.page - 1;
    } else {
        params.page = 0; 
    }
    const response = await apiClient.get<PaginatedResponse<ContractListItem>>(
      CONTRACT_ENDPOINTS.CONTRACTS,
      { params }
    );  
    return response.data;
  },

  /**
   * Update contract (Admin/Agent only)
   */
  async updateContract(id: string, data: UpdateContractRequest): Promise<ContractDetailResponse> {
    const response = await apiClient.put<SingleResponse<ContractDetailResponse>>(
      CONTRACT_ENDPOINTS.CONTRACT_DETAIL(id),
      data
    );
    return response.data.data;
  },

  /**
   * Sign a contract (Admin/Agent only)
   */
  async signContract(id: string): Promise<ContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<ContractDetailResponse>>(
      CONTRACT_ENDPOINTS.SIGN(id)
    );
    return response.data.data;
  },

  /**
   * Cancel a contract
   */
  async cancelContract(id: string, data: CancelContractRequest): Promise<ContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<ContractDetailResponse>>(
      CONTRACT_ENDPOINTS.CANCEL(id),
      data
    );
    return response.data.data;
  },

  /**
   * Get my contracts (Customer only)
   */
  async getMyContracts(filters?: MyContractsFilters): Promise<PaginatedResponse<ContractListItem>> {
    const response = await apiClient.get<PaginatedResponse<ContractListItem>>(
      CONTRACT_ENDPOINTS.MY_CONTRACTS,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get my agent contracts (Agent only)
   */
  async getMyAgentContracts(filters?: MyContractsFilters): Promise<PaginatedResponse<ContractListItem>> {
    const response = await apiClient.get<PaginatedResponse<ContractListItem>>(
      CONTRACT_ENDPOINTS.AGENT_CONTRACTS,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Rate a completed contract (Customer only)
   */
  async rateContract(id: string, rating: number, comment?: string): Promise<ContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<ContractDetailResponse>>(
      CONTRACT_ENDPOINTS.RATE(id),
      null,
      {
        params: { rating, comment },
      }
    );
    return response.data.data;
  },
};
