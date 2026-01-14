import apiClient from '../client';
import { SingleResponse, PaginatedResponse } from '../types';

// =============================
// CONTRACT ENDPOINTS
// =============================

const CONTRACT_ENDPOINTS = {
  // Deposit Contract Endpoints
  DEPOSIT_CONTRACTS: '/contracts/deposit',
  DEPOSIT_CONTRACT_DETAIL: (id: string) => `/contracts/deposit/${id}`,
  DEPOSIT_APPROVE: (id: string) => `/contracts/deposit/${id}/approve`,
  DEPOSIT_CREATE_PAYMENT: (id: string) => `/contracts/deposit/${id}/create-payment`,
  DEPOSIT_COMPLETE_PAPERWORK: (id: string) => `/contracts/deposit/${id}/complete-paperwork`,
  DEPOSIT_CANCEL: (id: string) => `/contracts/deposit/${id}/cancel`,
  DEPOSIT_VOID: (id: string) => `/contracts/deposit/${id}/void`,

  // Purchase Contract Endpoints
  PURCHASE_CONTRACTS: '/contracts/purchase',
  PURCHASE_CONTRACT_DETAIL: (id: string) => `/contracts/purchase/${id}`,
  PURCHASE_APPROVE: (id: string) => `/contracts/purchase/${id}/approve`,
  PURCHASE_COMPLETE_PAPERWORK: (id: string) => `/contracts/purchase/${id}/complete-paperwork`,
  PURCHASE_CANCEL: (id: string) => `/contracts/purchase/${id}/cancel`,
  PURCHASE_VOID: (id: string) => `/contracts/purchase/${id}/void`,
};

// =============================
// ENUMS
// =============================

export type ContractStatus =
  | 'DRAFT'
  | 'WAITING_OFFICIAL'
  | 'PENDING_PAYMENT'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'

export type MainContractType = 'RENTAL' | 'PURCHASE' | 'DEPOSIT';

export type RoleEnum = 'CUSTOMER' | 'PROPERTY_OWNER' | 'SALESAGENT' | 'ADMIN';

export type SortDirection = 'ASC' | 'DESC';

// =============================
// DEPOSIT CONTRACT TYPES
// =============================

export interface CreateDepositContractRequest {
  propertyId: string;
  agentId?: string; // Required when user is Admin, otherwise defaults to current sales agent
  customerId: string;
  mainContractType: MainContractType; // RENTAL or PURCHASE
  depositAmount: number;
  agreedPrice: number; // Monthly rent for RENTAL, property value for PURCHASE
  endDate?: string; // ISO format: "2026-02-26"
  specialTerms?: string;
  cancellationPenalty?: number; // Defaults to deposit amount if not provided
}

export interface UpdateDepositContractRequest {
  agentId?: string;
  customerId?: string;
  mainContractType?: MainContractType;
  depositAmount?: number;
  agreedPrice?: number;
  startDate?: string;
  endDate?: string;
  specialTerms?: string;
  cancellationPenalty?: number;
}

export interface CancelDepositContractRequest {
  cancellationReason: string;
}

export interface PropertySummary {
  id: string;
  title: string;
  fullAddress: string;
  priceAmount: number;
}

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PaymentSummary {
  id: string;
  paymentType: string;
  amount: number;
  dueDate: string; // LocalDate
  paidTime?: string; // LocalDateTime
  status: string;
  checkoutUrl?: string;
}

export interface DepositContractDetailResponse {
  id: string;
  status: ContractStatus;
  contractNumber: string;
  mainContractType: MainContractType;
  depositAmount: number;
  agreedPrice: number;
  startDate: string; // LocalDate
  endDate: string; // LocalDate
  signedAt?: string; // LocalDateTime
  specialTerms?: string;
  cancellationPenalty?: number;
  cancellationReason?: string;
  cancelledBy?: RoleEnum;
  property: PropertySummary;
  customer: UserSummary;
  owner: UserSummary;
  agent: UserSummary;
  payments: PaymentSummary[];
  linkedToMainContract: boolean;
  linkedRentalContractId?: string;
  linkedPurchaseContractId?: string;
  createdAt: string; // LocalDateTime
  updatedAt: string; // LocalDateTime
}

export interface DepositContractListItem {
  id: string;
  status: ContractStatus;
  contractNumber: string;
  mainContractType: MainContractType;
  depositAmount: number;
  agreedPrice: number;
  startDate: string;
  endDate: string;
  propertyId: string;
  propertyTitle: string;
  customerId: string;
  customerName: string;
  agentId: string;
  agentName: string;
  linkedToMainContract: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepositContractFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
  statuses?: ContractStatus[];
  customerId?: string;
  agentId?: string;
  propertyId?: string;
  ownerId?: string;
  startDateFrom?: string; // ISO date format
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  search?: string;
}

// =============================
// PURCHASE CONTRACT TYPES
// =============================

export interface CreatePurchaseContractRequest {
  propertyId: string;
  agentId?: string; // Required when user is Admin, otherwise defaults to current sales agent
  customerId: string;
  depositContractId?: string; // Optional link to deposit contract
  propertyValue: number; // Must match deposit's agreedPrice if deposit exists
  advancePaymentAmount: number; // Can be zero
  commissionAmount: number;
  startDate: string; // ISO format: "2025-01-01"
  specialTerms?: string;
}

export interface UpdatePurchaseContractRequest {
  agentId?: string;
  customerId?: string;
  propertyValue?: number;
  advancePaymentAmount?: number;
  commissionAmount?: number;
  startDate?: string;
  specialTerms?: string;
}

export interface CancelPurchaseContractRequest {
  cancellationReason: string;
}

export interface PurchaseContractDetailResponse {
  id: string;
  status: ContractStatus;
  contractNumber: string;
  propertyValue: number;
  advancePaymentAmount: number;
  commissionAmount: number;
  startDate: string; // LocalDate
  signedAt?: string; // LocalDateTime
  specialTerms?: string;
  cancellationReason?: string;
  cancelledBy?: RoleEnum;
  property: PropertySummary;
  customer: UserSummary;
  owner: UserSummary;
  agent: UserSummary;
  depositContractId?: string;
  depositContractStatus?: ContractStatus;
  payments: PaymentSummary[];
  createdAt: string; // LocalDateTime
  updatedAt: string; // LocalDateTime
}

export interface PurchaseContractListItem {
  id: string;
  status: ContractStatus;
  contractNumber: string;
  propertyValue: number;
  advancePaymentAmount: number;
  commissionAmount: number;
  startDate: string;
  propertyId: string;
  propertyTitle: string;
  customerId: string;
  customerName: string;
  agentId: string;
  agentName: string;
  hasDepositContract: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseContractFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
  statuses?: ContractStatus[];
  customerId?: string;
  agentId?: string;
  propertyId?: string;
  ownerId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  search?: string;
}

// =============================
// CONTRACT SERVICE
// =============================

export const contractService = {
  // =============================
  // DEPOSIT CONTRACT METHODS
  // =============================

  /**
   * Create a new deposit contract (Admin/Agent only)
   * Status: DRAFT
   */
  async createDepositContract(
    data: CreateDepositContractRequest
  ): Promise<DepositContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_CONTRACTS,
      data
    );
    return response.data.data;
  },

  /**
   * Get deposit contract details by ID
   * Access: Admin, Agent, Customer, Property Owner
   */
  async getDepositContractById(id: string): Promise<DepositContractDetailResponse> {
    const response = await apiClient.get<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_CONTRACT_DETAIL(id)
    );
    return response.data.data;
  },

  /**
   * Get paginated list of deposit contracts (Admin/Agent only)
   * Agents only see their assigned contracts
   */
  async getDepositContracts(
    filters?: DepositContractFilters
  ): Promise<PaginatedResponse<DepositContractListItem>> {
    const params = { ...filters };
    if (params.page && params.page > 0) {
      params.page = params.page - 1;
    } else {
      params.page = 0;
    }

    const response = await apiClient.get<PaginatedResponse<DepositContractListItem>>(
      CONTRACT_ENDPOINTS.DEPOSIT_CONTRACTS,
      { params }
    );
    return response.data;
  },

  /**
   * Update deposit contract (Admin/Agent only)
   * Only allowed for DRAFT status
   */
  async updateDepositContract(
    id: string,
    data: UpdateDepositContractRequest
  ): Promise<DepositContractDetailResponse> {
    const response = await apiClient.put<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_CONTRACT_DETAIL(id),
      data
    );
    return response.data.data;
  },

  /**
   * Delete deposit contract (Admin/Agent only)
   * Only allowed for DRAFT status (hard delete)
   */
  async deleteDepositContract(id: string): Promise<void> {
    await apiClient.delete(CONTRACT_ENDPOINTS.DEPOSIT_CONTRACT_DETAIL(id));
  },

  /**
   * Approve deposit contract (Admin/Agent only)
   * Transitions: DRAFT -> WAITING_OFFICIAL
   */
  async approveDepositContract(id: string): Promise<DepositContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_APPROVE(id)
    );
    return response.data.data;
  },

  /**
   * Create deposit payment (Admin/Agent only)
   * Only allowed when contract is in WAITING_OFFICIAL state
   * Creates payment and notifies customer
   */
  async createDepositPayment(id: string): Promise<DepositContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_CREATE_PAYMENT(id)
    );
    return response.data.data;
  },

  /**
   * Mark paperwork complete (Admin/Agent only)
   * Auto-creates payment if not exists
   * Transitions: WAITING_OFFICIAL -> PENDING_PAYMENT
   */
  async markDepositPaperworkComplete(id: string): Promise<DepositContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_COMPLETE_PAPERWORK(id)
    );
    return response.data.data;
  },

  /**
   * Cancel deposit contract (Customer/Owner only)
   * Customer cancels: deposit goes to owner
   * Owner cancels: deposit returns to customer, owner pays penalty
   */
  async cancelDepositContract(
    id: string,
    data: CancelDepositContractRequest
  ): Promise<DepositContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_CANCEL(id),
      data
    );
    return response.data.data;
  },

  /**
   * Void deposit contract (Admin only)
   * No side effects, no money transfers
   */
  async voidDepositContract(id: string): Promise<DepositContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_VOID(id)
    );
    return response.data.data;
  },

  // =============================
  // PURCHASE CONTRACT METHODS
  // =============================

  /**
   * Create a new purchase contract (Admin/Agent only)
   * Status: DRAFT
   * If depositContractId provided, validates deposit is ACTIVE and not expired
   */
  async createPurchaseContract(
    data: CreatePurchaseContractRequest
  ): Promise<PurchaseContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<PurchaseContractDetailResponse>>(
      CONTRACT_ENDPOINTS.PURCHASE_CONTRACTS,
      data
    );
    return response.data.data;
  },

  /**
   * Get purchase contract details by ID
   * Access: Admin, Agent, Customer, Property Owner
   */
  async getPurchaseContractById(id: string): Promise<PurchaseContractDetailResponse> {
    const response = await apiClient.get<SingleResponse<PurchaseContractDetailResponse>>(
      CONTRACT_ENDPOINTS.PURCHASE_CONTRACT_DETAIL(id)
    );
    return response.data.data;
  },

  /**
   * Get paginated list of purchase contracts (Admin/Agent only)
   * Agents only see their assigned contracts
   */
  async getPurchaseContracts(
    filters?: PurchaseContractFilters
  ): Promise<PaginatedResponse<PurchaseContractListItem>> {
    const params = { ...filters };
    // Convert page to 0-based index for backend
    if (params.page && params.page > 0) {
      params.page = params.page - 1;
    } else {
      params.page = 0;
    }

    const response = await apiClient.get<PaginatedResponse<PurchaseContractListItem>>(
      CONTRACT_ENDPOINTS.PURCHASE_CONTRACTS,
      { params }
    );
    return response.data;
  },

  /**
   * Update purchase contract (Admin/Agent only)
   * Only allowed for DRAFT status
   */
  async updatePurchaseContract(
    id: string,
    data: UpdatePurchaseContractRequest
  ): Promise<PurchaseContractDetailResponse> {
    const response = await apiClient.put<SingleResponse<PurchaseContractDetailResponse>>(
      CONTRACT_ENDPOINTS.PURCHASE_CONTRACT_DETAIL(id),
      data
    );
    return response.data.data;
  },

  /**
   * Delete purchase contract (Admin/Agent only)
   * Only allowed for DRAFT status (hard delete)
   */
  async deletePurchaseContract(id: string): Promise<void> {
    await apiClient.delete(CONTRACT_ENDPOINTS.PURCHASE_CONTRACT_DETAIL(id));
  },

  /**
   * Approve purchase contract (Admin/Agent only)
   * Transitions: DRAFT -> WAITING_OFFICIAL
   * If advancePaymentAmount > 0, auto-creates advance payment
   */
  async approvePurchaseContract(id: string): Promise<PurchaseContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<PurchaseContractDetailResponse>>(
      CONTRACT_ENDPOINTS.PURCHASE_APPROVE(id)
    );
    return response.data.data;
  },

  /**
   * Mark paperwork complete (Admin/Agent only)
   * Advance payment must be completed first
   * Creates final payment if remaining amount > 0
   * Transitions: WAITING_OFFICIAL -> PENDING_PAYMENT or COMPLETED
   */
  async markPurchasePaperworkComplete(id: string): Promise<PurchaseContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<PurchaseContractDetailResponse>>(
      CONTRACT_ENDPOINTS.PURCHASE_COMPLETE_PAPERWORK(id)
    );
    return response.data.data;
  },

  /**
   * Cancel purchase contract (Customer/Owner only)
   * Before payment: nothing happens
   * After advance payment: refund to customer
   * After final payment: not allowed (use void instead)
   */
  async cancelPurchaseContract(
    id: string,
    data: CancelPurchaseContractRequest
  ): Promise<PurchaseContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<PurchaseContractDetailResponse>>(
      CONTRACT_ENDPOINTS.PURCHASE_CANCEL(id),
      data
    );
    return response.data.data;
  },

  /**
   * Void purchase contract (Admin only)
   * No side effects, no money transfers
   */
  async voidPurchaseContract(id: string): Promise<PurchaseContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<PurchaseContractDetailResponse>>(
      CONTRACT_ENDPOINTS.PURCHASE_VOID(id)
    );
    return response.data.data;
  },
};