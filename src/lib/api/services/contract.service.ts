import apiClient from '../client';
import { SingleResponse, PaginatedResponse } from '../types';

// =====================================
// ENDPOINTS
// =====================================

const CONTRACT_ENDPOINTS = {
  // Deposit Contract Endpoints
  DEPOSIT_CONTRACTS: '/contracts/deposit',
  DEPOSIT_CONTRACT_DETAIL: (id: string) => `/contracts/deposit/${id}`,
  DEPOSIT_APPROVE: (id: string) => `/contracts/deposit/${id}/approve`,
  DEPOSIT_CREATE_PAYMENT: (id: string) => `/contracts/deposit/${id}/create-payment`,
  DEPOSIT_COMPLETE_PAPERWORK: (id: string) => `/contracts/deposit/${id}/complete-paperwork`,
  DEPOSIT_CANCEL: (id: string) => `/contracts/deposit/${id}/cancel`,
  DEPOSIT_VOID: (id: string) => `/contracts/deposit/${id}/void`,
  DEPOSIT_RATE: (id: string) => `/contracts/deposit/${id}/rate`,

  // Purchase Contract Endpoints
  PURCHASE_CONTRACTS: '/contracts/purchase',
  PURCHASE_CONTRACT_DETAIL: (id: string) => `/contracts/purchase/${id}`,
  PURCHASE_APPROVE: (id: string) => `/contracts/purchase/${id}/approve`,
  PURCHASE_COMPLETE_PAPERWORK: (id: string) => `/contracts/purchase/${id}/complete-paperwork`,
  PURCHASE_CANCEL: (id: string) => `/contracts/purchase/${id}/cancel`,
  PURCHASE_VOID: (id: string) => `/contracts/purchase/${id}/void`,
  PURCHASE_RATE: (id: string) => `/contracts/purchase/${id}/rate`,

  // Rental Contract Endpoints
  RENTAL_CONTRACTS: '/contracts/rental',
  RENTAL_CONTRACT_DETAIL: (id: string) => `/contracts/rental/${id}`,
  RENTAL_APPROVE: (id: string) => `/contracts/rental/${id}/approve`,
  RENTAL_COMPLETE_PAPERWORK: (id: string) => `/contracts/rental/${id}/complete-paperwork`,
  RENTAL_CANCEL: (id: string) => `/contracts/rental/${id}/cancel`,
  RENTAL_VOID: (id: string) => `/contracts/rental/${id}/void`,
  RENTAL_RATE: (id: string) => `/contracts/rental/${id}/rate`,
  RENTAL_END: (id: string) => `/contracts/rental/${id}/end`,

  // Role-specific endpoints (for non-admin users)
  MY_DEPOSIT_CONTRACTS: '/contracts/my/deposit',           // Customer's contracts
  MY_PURCHASE_CONTRACTS: '/contracts/my/purchase',         // Customer's contracts
  MY_RENTAL_CONTRACTS: '/contracts/my/rental',             // Customer's rental contracts
  MY_PROPERTIES_DEPOSIT: '/contracts/my-properties/deposit', // Owner's property contracts
  MY_PROPERTIES_PURCHASE: '/contracts/my-properties/purchase', // Owner's property contracts
  MY_PROPERTIES_RENTAL: '/contracts/my-properties/rental', // Owner's rental contracts
  MY_ASSIGNED_DEPOSIT: '/contracts/my-assigned/deposit',   // Agent's assigned contracts
  MY_ASSIGNED_PURCHASE: '/contracts/my-assigned/purchase', // Agent's assigned contracts
  MY_ASSIGNED_RENTAL: '/contracts/my-assigned/rental',     // Agent's assigned rental contracts
};

// =====================================
// COMMON TYPES
// =====================================

export type ContractStatusEnum =
  | 'DRAFT'
  | 'WAITING_OFFICIAL'
  | 'PENDING_PAYMENT'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export type ContractType = 'DEPOSIT' | 'PURCHASE' | 'RENTAL';

export type MainContractTypeEnum = 'RENTAL' | 'PURCHASE';

export type RoleEnum = 'CUSTOMER' | 'PROPERTY_OWNER' | 'SALESAGENT' | 'ADMIN';

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PropertySummary {
  id: string;
  title: string;
  fullAddress: string;
  priceAmount: number;
}

export interface PaymentSummary {
  id: string;
  paymentType: string;
  amount: number;
  dueDate: string;
  paidTime?: string;
  paidDate?: string; // Alias for paidTime
  status: string;
  checkoutUrl?: string;
  installmentNumber?: number;
}

export interface UnifiedContractListItem {
  id: string;
  contractType: ContractType;
  status: ContractStatusEnum;
  contractNumber?: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress?: string;
  customerId: string;
  customerName: string;
  agentId?: string;
  agentName?: string;
  startDate: string;
  endDate?: string;
  totalAmount: number;
  mainContractType?: MainContractTypeEnum;
  hasDepositContract?: boolean;
  createdAt: string;
}

// =====================================
// DEPOSIT CONTRACT TYPES
// =====================================

export interface CreateDepositContractRequest {
  propertyId: string;
  agentId?: string; // Required when user is Admin, otherwise defaults to current sales agent
  customerId: string;
  mainContractType: MainContractTypeEnum;
  depositAmount: number;
  agreedPrice: number;
  endDate: string; // ISO format
  specialTerms?: string;
  cancellationPenalty?: number;
}

export interface UpdateDepositContractRequest {
  agentId?: string;
  customerId?: string;
  mainContractType?: MainContractTypeEnum;
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

export interface DepositContractDetailResponse {
  id: string;
  status: ContractStatusEnum;
  contractNumber?: string;
  mainContractType: MainContractTypeEnum;
  depositAmount: number;
  agreedPrice: number;
  startDate: string;
  endDate: string;
  signedAt?: string;
  specialTerms?: string;
  cancellationPenalty?: number;
  cancellationReason?: string;
  cancelledBy?: RoleEnum;
  rating?: number;
  comment?: string;
  property: PropertySummary;
  customer: UserSummary;
  owner: UserSummary;
  agent?: UserSummary;
  payments: PaymentSummary[];
  linkedToMainContract: boolean;
  linkedRentalContractId?: string;
  linkedPurchaseContractId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepositContractListItem {
  id: string;
  status: ContractStatusEnum;
  contractNumber?: string;
  mainContractType: MainContractTypeEnum;
  depositAmount: number;
  agreedPrice: number;
  startDate: string;
  endDate: string;
  propertyId: string;
  propertyTitle: string;
  customerId: string;
  customerName: string;
  agentId?: string;
  agentName?: string;
  linkedToMainContract: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepositContractFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  statuses?: ContractStatusEnum[];
  customerId?: string;
  agentId?: string;
  propertyId?: string;
  ownerId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  search?: string;
}

// =====================================
// PURCHASE CONTRACT TYPES
// =====================================

export interface CreatePurchaseContractRequest {
  propertyId: string;
  customerId: string;
  agentId?: string; // Required when admin creates
  depositContractId?: string; // Optional link to deposit contract
  propertyValue: number;
  advancePaymentAmount?: number;
  commissionAmount: number;
  startDate: string;
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
  status: ContractStatusEnum;
  contractNumber?: string;
  propertyValue: number;
  advancePaymentAmount?: number;
  commissionAmount: number;
  startDate: string;
  signedAt?: string;
  specialTerms?: string;
  cancellationReason?: string;
  cancelledBy?: RoleEnum;
  rating?: number;
  comment?: string;
  property: PropertySummary;
  customer: UserSummary;
  owner: UserSummary;
  agent?: UserSummary;
  depositContractId?: string;
  depositContractStatus?: ContractStatusEnum;
  payments: PaymentSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseContractListItem {
  id: string;
  status: ContractStatusEnum;
  contractNumber?: string;
  propertyValue: number;
  advancePaymentAmount?: number;
  commissionAmount: number;
  startDate: string;
  propertyId: string;
  propertyTitle: string;
  customerId: string;
  customerName: string;
  agentId?: string;
  agentName?: string;
  hasDepositContract: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseContractFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  statuses?: ContractStatusEnum[];
  customerId?: string;
  agentId?: string;
  propertyId?: string;
  ownerId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  search?: string;
}

// =====================================
// RENTAL CONTRACT TYPES
// =====================================

export type SecurityDepositStatusEnum = 'NOT_PAID' | 'HELD' | 'RETURNED_TO_CUSTOMER' | 'TRANSFERRED_TO_OWNER';

export interface CreateRentalContractRequest {
  propertyId: string;
  customerId: string;
  agentId?: string; // Required when admin creates
  depositContractId?: string; // Optional link to deposit contract
  monthCount: number;
  monthlyRentAmount: number;
  commissionAmount: number;
  securityDepositAmount?: number;
  latePaymentPenaltyRate: number; // e.g., 0.05 for 5%
  startDate: string;
  specialTerms?: string;
}

export interface UpdateRentalContractRequest {
  agentId?: string;
  customerId?: string;
  monthCount?: number;
  monthlyRentAmount?: number;
  commissionAmount?: number;
  securityDepositAmount?: number;
  latePaymentPenaltyRate?: number;
  startDate?: string;
  specialTerms?: string;
}

export interface CancelRentalContractRequest {
  cancellationReason: string;
}

export interface RentalContractDetailResponse {
  id: string;
  status: ContractStatusEnum;
  contractNumber?: string;
  monthCount: number;
  monthlyRentAmount: number;
  commissionAmount: number;
  securityDepositAmount?: number;
  securityDepositStatus?: SecurityDepositStatusEnum;
  securityDepositDecisionAt?: string;
  securityDepositDecisionReason?: string;
  latePaymentPenaltyRate: number;
  accumulatedUnpaidPenalty: number;
  unpaidMonthsCount: number;
  startDate: string;
  endDate?: string;
  signedAt?: string;
  specialTerms?: string;
  cancellationReason?: string;
  cancelledBy?: RoleEnum;
  rating?: number;
  comment?: string;
  property: PropertySummary;
  customer: UserSummary;
  owner: UserSummary;
  agent?: UserSummary;
  depositContractId?: string;
  depositContractStatus?: ContractStatusEnum;
  payments: PaymentSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface RentalContractListItem {
  id: string;
  status: ContractStatusEnum;
  contractNumber?: string;
  monthCount: number;
  monthlyRentAmount: number;
  commissionAmount: number;
  securityDepositAmount?: number;
  securityDepositStatus?: SecurityDepositStatusEnum;
  startDate: string;
  endDate?: string;
  propertyId: string;
  propertyTitle: string;
  customerId: string;
  customerName: string;
  agentId?: string;
  agentName?: string;
  hasDepositContract: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RentalContractFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  statuses?: ContractStatusEnum[];
  customerId?: string;
  agentId?: string;
  propertyId?: string;
  ownerId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  search?: string;
}

// =====================================
// CONTRACT SERVICE
// =====================================

export const contractService = {
  // =====================================
  // DEPOSIT CONTRACT METHODS
  // =====================================

  /**
   * Create a new deposit contract (Admin/Agent only)
   */
  async createDepositContract(data: CreateDepositContractRequest): Promise<DepositContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_CONTRACTS,
      data
    );
    return response.data.data;
  },

  /**
   * Get deposit contract by ID
   */
  async getDepositContractById(id: string): Promise<DepositContractDetailResponse> {
    const response = await apiClient.get<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_CONTRACT_DETAIL(id)
    );
    return response.data.data;
  },

  /**
   * Get paginated list of deposit contracts (Admin/Agent only)
   */
  async getDepositContracts(filters?: DepositContractFilters): Promise<PaginatedResponse<DepositContractListItem>> {
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
   * Update a DRAFT deposit contract (Admin/Agent only)
   */
  async updateDepositContract(id: string, data: UpdateDepositContractRequest): Promise<DepositContractDetailResponse> {
    const response = await apiClient.put<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_CONTRACT_DETAIL(id),
      data
    );
    return response.data.data;
  },

  /**
   * Delete a DRAFT deposit contract (Admin/Agent only)
   */
  async deleteDepositContract(id: string): Promise<void> {
    await apiClient.delete(CONTRACT_ENDPOINTS.DEPOSIT_CONTRACT_DETAIL(id));
  },

  /**
   * Approve a deposit contract (DRAFT -> WAITING_OFFICIAL)
   */
  async approveDepositContract(id: string): Promise<DepositContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_APPROVE(id)
    );
    return response.data.data;
  },

  /**
   * Create payment for a deposit contract
   */
  async createDepositPayment(id: string): Promise<DepositContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_CREATE_PAYMENT(id)
    );
    return response.data.data;
  },

  /**
   * Mark deposit contract paperwork complete
   */
  async completeDepositPaperwork(id: string): Promise<DepositContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_COMPLETE_PAPERWORK(id)
    );
    return response.data.data;
  },

  /**
   * Cancel a deposit contract
   */
  async cancelDepositContract(id: string, data: CancelDepositContractRequest): Promise<DepositContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_CANCEL(id),
      data
    );
    return response.data.data;
  },

  /**
   * Void a deposit contract (Admin only)
   */
  async voidDepositContract(id: string): Promise<DepositContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_VOID(id)
    );
    return response.data.data;
  },

  /**
   * Rate a completed deposit contract (Customer only)
   */
  async rateDepositContract(id: string, rating: number, comment?: string): Promise<DepositContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<DepositContractDetailResponse>>(
      CONTRACT_ENDPOINTS.DEPOSIT_RATE(id),
      null,
      { params: { rating, comment } }
    );
    return response.data.data;
  },

  // =====================================
  // PURCHASE CONTRACT METHODS
  // =====================================

  /**
   * Create a new purchase contract (Admin/Agent only)
   */
  async createPurchaseContract(data: CreatePurchaseContractRequest): Promise<PurchaseContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<PurchaseContractDetailResponse>>(
      CONTRACT_ENDPOINTS.PURCHASE_CONTRACTS,
      data
    );
    return response.data.data;
  },

  /**
   * Get purchase contract by ID
   */
  async getPurchaseContractById(id: string): Promise<PurchaseContractDetailResponse> {
    const response = await apiClient.get<SingleResponse<PurchaseContractDetailResponse>>(
      CONTRACT_ENDPOINTS.PURCHASE_CONTRACT_DETAIL(id)
    );
    return response.data.data;
  },

  /**
   * Get paginated list of purchase contracts (Admin/Agent only)
   */
  async getPurchaseContracts(filters?: PurchaseContractFilters): Promise<PaginatedResponse<PurchaseContractListItem>> {
    const params = { ...filters };
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
   * Update a DRAFT purchase contract (Admin/Agent only)
   */
  async updatePurchaseContract(id: string, data: UpdatePurchaseContractRequest): Promise<PurchaseContractDetailResponse> {
    const response = await apiClient.put<SingleResponse<PurchaseContractDetailResponse>>(
      CONTRACT_ENDPOINTS.PURCHASE_CONTRACT_DETAIL(id),
      data
    );
    return response.data.data;
  },

  /**
   * Delete a DRAFT purchase contract (Admin/Agent only)
   */
  async deletePurchaseContract(id: string): Promise<void> {
    await apiClient.delete(CONTRACT_ENDPOINTS.PURCHASE_CONTRACT_DETAIL(id));
  },

  /**
   * Approve a purchase contract (DRAFT -> WAITING_OFFICIAL)
   */
  async approvePurchaseContract(id: string): Promise<PurchaseContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<PurchaseContractDetailResponse>>(
      CONTRACT_ENDPOINTS.PURCHASE_APPROVE(id)
    );
    return response.data.data;
  },

  /**
   * Mark purchase contract paperwork complete
   */
  async completePurchasePaperwork(id: string): Promise<PurchaseContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<PurchaseContractDetailResponse>>(
      CONTRACT_ENDPOINTS.PURCHASE_COMPLETE_PAPERWORK(id)
    );
    return response.data.data;
  },

  /**
   * Cancel a purchase contract
   */
  async cancelPurchaseContract(id: string, data: CancelPurchaseContractRequest): Promise<PurchaseContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<PurchaseContractDetailResponse>>(
      CONTRACT_ENDPOINTS.PURCHASE_CANCEL(id),
      data
    );
    return response.data.data;
  },

  /**
   * Void a purchase contract (Admin only)
   */
  async voidPurchaseContract(id: string): Promise<PurchaseContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<PurchaseContractDetailResponse>>(
      CONTRACT_ENDPOINTS.PURCHASE_VOID(id)
    );
    return response.data.data;
  },

  /**
   * Rate a completed purchase contract (Customer only)
   */
  async ratePurchaseContract(id: string, rating: number, comment?: string): Promise<PurchaseContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<PurchaseContractDetailResponse>>(
      CONTRACT_ENDPOINTS.PURCHASE_RATE(id),
      null,
      { params: { rating, comment } }
    );
    return response.data.data;
  },

  // =====================================
  // ROLE-SPECIFIC METHODS
  // =====================================

  /**
   * Get customer's own deposit contracts
   */
  async getMyDepositContracts(filters?: { page?: number; size?: number; statuses?: ContractStatusEnum[] }): Promise<PaginatedResponse<DepositContractListItem>> {
    const response = await apiClient.get<PaginatedResponse<DepositContractListItem>>(
      CONTRACT_ENDPOINTS.MY_DEPOSIT_CONTRACTS,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get customer's own purchase contracts
   */
  async getMyPurchaseContracts(filters?: { page?: number; size?: number; statuses?: ContractStatusEnum[] }): Promise<PaginatedResponse<PurchaseContractListItem>> {
    const response = await apiClient.get<PaginatedResponse<PurchaseContractListItem>>(
      CONTRACT_ENDPOINTS.MY_PURCHASE_CONTRACTS,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get owner's property deposit contracts
   */
  async getMyPropertiesDepositContracts(filters?: { page?: number; size?: number; statuses?: ContractStatusEnum[] }): Promise<PaginatedResponse<DepositContractListItem>> {
    const response = await apiClient.get<PaginatedResponse<DepositContractListItem>>(
      CONTRACT_ENDPOINTS.MY_PROPERTIES_DEPOSIT,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get owner's property purchase contracts
   */
  async getMyPropertiesPurchaseContracts(filters?: { page?: number; size?: number; statuses?: ContractStatusEnum[] }): Promise<PaginatedResponse<PurchaseContractListItem>> {
    const response = await apiClient.get<PaginatedResponse<PurchaseContractListItem>>(
      CONTRACT_ENDPOINTS.MY_PROPERTIES_PURCHASE,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get agent's assigned deposit contracts
   */
  async getMyAssignedDepositContracts(filters?: { page?: number; size?: number; statuses?: ContractStatusEnum[] }): Promise<PaginatedResponse<DepositContractListItem>> {
    const response = await apiClient.get<PaginatedResponse<DepositContractListItem>>(
      CONTRACT_ENDPOINTS.MY_ASSIGNED_DEPOSIT,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get agent's assigned purchase contracts
   */
  async getMyAssignedPurchaseContracts(filters?: { page?: number; size?: number; statuses?: ContractStatusEnum[] }): Promise<PaginatedResponse<PurchaseContractListItem>> {
    const response = await apiClient.get<PaginatedResponse<PurchaseContractListItem>>(
      CONTRACT_ENDPOINTS.MY_ASSIGNED_PURCHASE,
      { params: filters }
    );
    return response.data;
  },

  // =====================================
  // RENTAL CONTRACT METHODS
  // =====================================

  /**
   * Create a new rental contract (Admin/Agent only)
   */
  async createRentalContract(data: CreateRentalContractRequest): Promise<RentalContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<RentalContractDetailResponse>>(
      CONTRACT_ENDPOINTS.RENTAL_CONTRACTS,
      data
    );
    return response.data.data;
  },

  /**
   * Get rental contract by ID
   */
  async getRentalContractById(id: string): Promise<RentalContractDetailResponse> {
    const response = await apiClient.get<SingleResponse<RentalContractDetailResponse>>(
      CONTRACT_ENDPOINTS.RENTAL_CONTRACT_DETAIL(id)
    );
    return response.data.data;
  },

  /**
   * Get paginated list of rental contracts (Admin/Agent only)
   */
  async getRentalContracts(filters?: RentalContractFilters): Promise<PaginatedResponse<RentalContractListItem>> {
    const params = new URLSearchParams();
    
    const page = filters?.page && filters.page > 0 ? filters.page : 1;
    params.append('page', (page - 1).toString());
    if (filters?.size) params.append('size', filters.size.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortDirection) params.append('sortDirection', filters.sortDirection);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.agentId) params.append('agentId', filters.agentId);
    if (filters?.propertyId) params.append('propertyId', filters.propertyId);
    if (filters?.ownerId) params.append('ownerId', filters.ownerId);
    if (filters?.startDateFrom) params.append('startDateFrom', filters.startDateFrom);
    if (filters?.startDateTo) params.append('startDateTo', filters.startDateTo);
    if (filters?.endDateFrom) params.append('endDateFrom', filters.endDateFrom);
    if (filters?.endDateTo) params.append('endDateTo', filters.endDateTo);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.statuses && filters.statuses.length > 0) {
      filters.statuses.forEach(s => params.append('statuses', s));
    }

    const response = await apiClient.get<PaginatedResponse<RentalContractListItem>>(
      `${CONTRACT_ENDPOINTS.RENTAL_CONTRACTS}?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Update a rental contract (Admin/Agent only)
   */
  async updateRentalContract(id: string, data: UpdateRentalContractRequest): Promise<RentalContractDetailResponse> {
    const response = await apiClient.put<SingleResponse<RentalContractDetailResponse>>(
      CONTRACT_ENDPOINTS.RENTAL_CONTRACT_DETAIL(id),
      data
    );
    return response.data.data;
  },

  /**
   * Delete a DRAFT rental contract (Admin/Agent only)
   */
  async deleteRentalContract(id: string): Promise<void> {
    await apiClient.delete(CONTRACT_ENDPOINTS.RENTAL_CONTRACT_DETAIL(id));
  },

  /**
   * Approve rental contract to WAITING_OFFICIAL status (Admin/Agent only)
   */
  async approveRentalContract(id: string): Promise<RentalContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<RentalContractDetailResponse>>(
      CONTRACT_ENDPOINTS.RENTAL_APPROVE(id)
    );
    return response.data.data;
  },

  /**
   * Complete paperwork for rental contract (Admin/Agent only)
   */
  async completePaperworkRentalContract(id: string): Promise<RentalContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<RentalContractDetailResponse>>(
      CONTRACT_ENDPOINTS.RENTAL_COMPLETE_PAPERWORK(id)
    );
    return response.data.data;
  },

  /**
   * Cancel rental contract (Admin/Agent only)
   */
  async cancelRentalContract(id: string, data: CancelRentalContractRequest): Promise<RentalContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<RentalContractDetailResponse>>(
      CONTRACT_ENDPOINTS.RENTAL_CANCEL(id),
      data
    );
    return response.data.data;
  },

  /**
   * Void rental contract (Admin only)
   */
  async voidRentalContract(id: string): Promise<RentalContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<RentalContractDetailResponse>>(
      CONTRACT_ENDPOINTS.RENTAL_VOID(id)
    );
    return response.data.data;
  },

  /**
   * End rental contract early or mark as completed (Admin/Agent only)  
   */
  async endRentalContract(id: string): Promise<RentalContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<RentalContractDetailResponse>>(
      CONTRACT_ENDPOINTS.RENTAL_END(id)
    );
    return response.data.data;
  },

  /**
   * Rate a completed rental contract (Customer only)
   */
  async rateRentalContract(id: string, rating: number, comment?: string): Promise<RentalContractDetailResponse> {
    const response = await apiClient.post<SingleResponse<RentalContractDetailResponse>>(
      CONTRACT_ENDPOINTS.RENTAL_RATE(id),
      null,
      { params: { rating, comment } }
    );
    return response.data.data;
  },

  /**
   * Get customer's rental contracts
   */
  async getMyRentalContracts(filters?: { page?: number; size?: number; statuses?: ContractStatusEnum[] }): Promise<PaginatedResponse<RentalContractListItem>> {
    const response = await apiClient.get<PaginatedResponse<RentalContractListItem>>(
      CONTRACT_ENDPOINTS.MY_RENTAL_CONTRACTS,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get owner's property rental contracts
   */
  async getMyPropertiesRentalContracts(filters?: { page?: number; size?: number; statuses?: ContractStatusEnum[] }): Promise<PaginatedResponse<RentalContractListItem>> {
    const response = await apiClient.get<PaginatedResponse<RentalContractListItem>>(
      CONTRACT_ENDPOINTS.MY_PROPERTIES_RENTAL,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get agent's assigned rental contracts
   */
  async getMyAssignedRentalContracts(filters?: { page?: number; size?: number; statuses?: ContractStatusEnum[] }): Promise<PaginatedResponse<RentalContractListItem>> {
    const response = await apiClient.get<PaginatedResponse<RentalContractListItem>>(
      CONTRACT_ENDPOINTS.MY_ASSIGNED_RENTAL,
      { params: filters }
    );
    return response.data;
  },

  // =====================================
  // LEGACY/BACKWARD COMPATIBILITY METHODS
  // These methods maintain compatibility with admin routes
  // =====================================

  /**
   * Aggregate both deposit and purchase contracts for admin screens.
   * This is a frontend-side merge because backend splits endpoints by type.
   */
  async getContracts(filters?: ContractFilters): Promise<PaginatedResponse<ContractListItem>> {
    const wantsDeposit = !filters?.contractTypes || filters.contractTypes.includes('DEPOSIT');
    const wantsPurchase = !filters?.contractTypes || filters.contractTypes.includes('PURCHASE');

    const page = filters?.page && filters.page > 0 ? filters.page : 1;
    const size = filters?.size || 10;

    const commonParams = {
      page,
      size: Math.max(size, 20),
      sortBy: filters?.sortBy || 'createdAt',
      sortDirection: filters?.sortDirection || 'DESC',
      customerId: filters?.customerId,
      agentId: filters?.agentId,
      propertyId: filters?.propertyId,
      ownerId: filters?.ownerId,
      startDateFrom: filters?.startDateFrom,
      startDateTo: filters?.startDateTo,
      endDateFrom: filters?.endDateFrom,
      endDateTo: filters?.endDateTo,
      statuses: filters?.statuses,
      search: filters?.search,
    } as DepositContractFilters & PurchaseContractFilters;

    const [depositResponse, purchaseResponse] = await Promise.all([
      wantsDeposit ? this.getDepositContracts(commonParams) : Promise.resolve(null),
      wantsPurchase ? this.getPurchaseContracts(commonParams) : Promise.resolve(null),
    ]);

    const mappedDeposits: ContractListItem[] = depositResponse?.data.map((d): ContractListItem => ({
      id: d.id,
      contractType: 'DEPOSIT',
      status: d.status,
      contractNumber: d.contractNumber,
      propertyId: d.propertyId,
      propertyTitle: d.propertyTitle,
      customerId: d.customerId,
      customerName: d.customerName,
      agentId: d.agentId,
      agentName: d.agentName,
      startDate: d.startDate,
      endDate: d.endDate,
      totalContractAmount: d.depositAmount,
      mainContractType: d.mainContractType,
      createdAt: d.createdAt,
    })) || [];

    const mappedPurchases: ContractListItem[] = purchaseResponse?.data.map((p): ContractListItem => ({
      id: p.id,
      contractType: 'PURCHASE',
      status: p.status,
      contractNumber: p.contractNumber,
      propertyId: p.propertyId,
      propertyTitle: p.propertyTitle,
      customerId: p.customerId,
      customerName: p.customerName,
      agentId: p.agentId,
      agentName: p.agentName,
      startDate: p.startDate,
      totalContractAmount: p.propertyValue,
      createdAt: p.createdAt,
    })) || [];

    const combined = [...mappedDeposits, ...mappedPurchases].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = (depositResponse?.paging?.total || 0) + (purchaseResponse?.paging?.total || 0);
    const start = (page - 1) * size;
    const pagedData = combined.slice(start, start + size);
    const totalRecords = total || combined.length;
    const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / size) : 0;

    return {
      statusCode: 200,
      message: 'Contracts merged',
      data: pagedData,
      paging: {
        page,
        limit: size,
        total: totalRecords,
        totalPages,
      },
    };
  },

  /**
   * @deprecated Use getDepositContractById or getPurchaseContractById instead
   * Get contract by ID (tries deposit first, then purchase)
   */
  async getContractById(id: string): Promise<ContractDetailResponse> {
    try {
      const deposit = await this.getDepositContractById(id);
      return {
        ...deposit,
        contractType: 'DEPOSIT',
        totalContractAmount: deposit.depositAmount,
        depositAmount: deposit.depositAmount,
        remainingAmount: deposit.agreedPrice - deposit.depositAmount,
        propertyTitle: deposit.property.title,
        propertyAddress: deposit.property.fullAddress,
        propertyId: deposit.property.id,
        propertyPrice: deposit.property.priceAmount,
        customerId: deposit.customer.id,
        customerFirstName: deposit.customer.firstName,
        customerLastName: deposit.customer.lastName,
        customerPhone: deposit.customer.phone,
        customerEmail: deposit.customer.email,
        ownerId: deposit.owner.id,
        ownerFirstName: deposit.owner.firstName,
        ownerLastName: deposit.owner.lastName,
        ownerPhone: deposit.owner.phone,
        agentId: deposit.agent?.id,
        agentFirstName: deposit.agent?.firstName,
        agentLastName: deposit.agent?.lastName,
        agentPhone: deposit.agent?.phone,
        latePaymentPenaltyRate: 0,
        specialConditions: deposit.specialTerms,
        // Pass through linked contract IDs
        linkedPurchaseContractId: deposit.linkedPurchaseContractId,
        linkedRentalContractId: deposit.linkedRentalContractId,
        linkedToMainContract: deposit.linkedToMainContract,
      } as ContractDetailResponse;
    } catch {
      const purchase = await this.getPurchaseContractById(id);
      return {
        ...purchase,
        contractType: 'PURCHASE',
        totalContractAmount: purchase.propertyValue,
        depositAmount: purchase.advancePaymentAmount || 0,
        remainingAmount: purchase.propertyValue - (purchase.advancePaymentAmount || 0),
        propertyTitle: purchase.property.title,
        propertyAddress: purchase.property.fullAddress,
        propertyId: purchase.property.id,
        propertyPrice: purchase.property.priceAmount,
        customerId: purchase.customer.id,
        customerFirstName: purchase.customer.firstName,
        customerLastName: purchase.customer.lastName,
        customerPhone: purchase.customer.phone,
        customerEmail: purchase.customer.email,
        ownerId: purchase.owner.id,
        ownerFirstName: purchase.owner.firstName,
        ownerLastName: purchase.owner.lastName,
        ownerPhone: purchase.owner.phone,
        agentId: purchase.agent?.id,
        agentFirstName: purchase.agent?.firstName,
        agentLastName: purchase.agent?.lastName,
        agentPhone: purchase.agent?.phone,
        latePaymentPenaltyRate: 0,
        specialConditions: purchase.specialTerms,
        // Pass through linked deposit contract ID
        depositContractId: purchase.depositContractId,
        depositContractStatus: purchase.depositContractStatus,
      } as ContractDetailResponse;
    }
  },

  /**
   * @deprecated Use updateDepositContract or updatePurchaseContract instead
   */
  async updateContract(id: string, data: UpdateContractRequest): Promise<ContractDetailResponse> {
    // Try deposit first
    try {
      const result = await this.updateDepositContract(id, {
        specialTerms: data.specialTerms,
        endDate: data.endDate,
      });
      return this.getContractById(id);
    } catch {
      // Try purchase
      const result = await this.updatePurchaseContract(id, {
        specialTerms: data.specialTerms,
      });
      return this.getContractById(id);
    }
  },

  /**
   * @deprecated Use cancelDepositContract or cancelPurchaseContract instead
   */
  async cancelContract(id: string, data: { reason: string }): Promise<ContractDetailResponse> {
    try {
      await this.cancelDepositContract(id, { cancellationReason: data.reason });
    } catch {
      await this.cancelPurchaseContract(id, { cancellationReason: data.reason });
    }
    return this.getContractById(id);
  },

  /**
   * @deprecated Use createDepositContract or createPurchaseContract instead
   */
  async createContract(data: CreateContractRequest): Promise<ContractDetailResponse> {
    if (data.contractType === 'DEPOSIT') {
      const result = await this.createDepositContract({
        propertyId: data.propertyId,
        customerId: data.customerId,
        agentId: data.agentId,
        mainContractType: data.mainContractType || 'PURCHASE',
        depositAmount: data.depositAmount || 0,
        agreedPrice: data.totalContractAmount || data.totalAmount || 0,
        endDate: data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 30 days
        specialTerms: data.specialTerms,
        cancellationPenalty: data.cancellationPenalty,
      });
      return this.getContractById(result.id);
    }

    if (data.contractType === 'PURCHASE') {
      const result = await this.createPurchaseContract({
        propertyId: data.propertyId,
        customerId: data.customerId,
        agentId: data.agentId,
        propertyValue: data.totalContractAmount || data.totalAmount || 0,
        advancePaymentAmount: data.advancePaymentAmount,
        commissionAmount: data.commissionAmount || 0,
        startDate: data.startDate,
        specialTerms: data.specialTerms,
        depositContractId: data.depositContractId,
      });
      return this.getContractById(result.id);
    }

    throw new Error('Unsupported contract type. Only DEPOSIT and PURCHASE are supported.');
  },
};

// =====================================
// BACKWARD COMPATIBILITY TYPE EXPORTS
// These maintain compatibility with admin routes
// =====================================

/**
 * @deprecated Use DepositContractFilters or PurchaseContractFilters instead
 */
export interface ContractFilters {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  statuses?: ContractStatusEnum[];
  contractTypes?: ContractType[];
  customerId?: string;
  agentId?: string;
  propertyId?: string;
  ownerId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
}

/**
 * @deprecated Use DepositContractListItem or PurchaseContractListItem instead
 */
export interface ContractListItem {
  id: string;
  contractNumber?: string;
  contractType: ContractType;
  status: ContractStatusEnum;
  propertyId: string;
  propertyTitle: string;
  propertyAddress?: string;
  customerId?: string;
  customerName?: string;
  agentId?: string;
  agentName?: string;
  ownerId?: string;
  totalContractAmount?: number;
  mainContractType?: MainContractTypeEnum; // For deposit contracts
  startDate: string;
  endDate?: string;
  signedAt?: string;
  createdAt: string;
}

/**
 * @deprecated Use DepositContractDetailResponse or PurchaseContractDetailResponse instead
 */
export interface ContractDetailResponse {
  id: string;
  contractNumber?: string;
  contractType: ContractType;
  status: ContractStatusEnum;
  startDate: string;
  endDate?: string;
  totalContractAmount: number;
  depositAmount: number;
  remainingAmount: number;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyTransactionType?: string; // For backward compatibility
  propertyType?: string; // For backward compatibility
  propertyPrice?: number; // For backward compatibility
  customerId: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerEmail?: string; // For backward compatibility
  ownerId: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerPhone: string;
  agentId?: string;
  agentFirstName?: string;
  agentLastName?: string;
  agentPhone?: string;
  agentEmployeeCode?: string; // For backward compatibility
  specialTerms?: string;
  specialConditions?: string;
  latePaymentPenaltyRate?: number;
  rating?: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  signedAt?: string;
  payments?: PaymentSummary[];
  totalPaymentsMade?: number; // For backward compatibility
  // Additional fields for PaymentDetailsTab
  contractPaymentType?: string;
  finalPaymentAmount?: number;
  progressMilestone?: number;
  cancellationPenalty?: number;
  advancePaymentAmount?: number;
  installmentAmount?: number;
  // Additional fields for TimelineTab
  completedAt?: string;
  // Linked contracts
  linkedPurchaseContractId?: string;
  linkedRentalContractId?: string;
  linkedToMainContract?: boolean;
  depositContractId?: string;
  depositContractStatus?: ContractStatusEnum;
}

/**
 * @deprecated Use UpdateDepositContractRequest or UpdatePurchaseContractRequest instead
 */
export interface UpdateContractRequest {
  endDate?: string;
  specialTerms?: string;
  status?: ContractStatusEnum;
  latePaymentPenaltyRate?: number;
  specialConditions?: string;
}

/**
 * @deprecated Use CreateDepositContractRequest or CreatePurchaseContractRequest instead
 */
export interface CreateContractRequest {
  propertyId: string;
  customerId: string;
  agentId: string; // Required for admin form
  contractType: ContractType;
  mainContractType?: MainContractTypeEnum;
  startDate: string;
  endDate?: string;
  totalAmount?: number;
  depositAmount?: number;
  depositContractId?: string;
  cancellationPenalty?: number;
  specialTerms?: string;
  // Additional fields for backward compatibility with admin form
  contractPaymentType?: 'MORTGAGE' | 'MONTHLY_RENT' | 'PAID_IN_FULL';
  totalContractAmount?: number;
  advancePaymentAmount?: number;
  installmentAmount?: number;
  commissionAmount?: number;
  progressMilestone?: number;
  latePaymentPenaltyRate?: number;
  specialConditions?: string;
}
