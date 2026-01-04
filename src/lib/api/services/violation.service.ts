import apiClient from '../client';
import { SingleResponse, PaginatedResponse } from '../types';

const VIOLATION_ENDPOINTS = {
    VIOLATIONS: '/violations',
    ADMIN_VIOLATIONS: '/violations/admin',
    ADMIN_VIOLATION_DETAIL: (id: string) => `/violations/admin/${id}`,
    MY_VIOLATIONS: '/violations/my-violations',
    MY_VIOLATION_DETAIL: (id: string) => `/violations/my-violations/${id}`,
};

// ==================== REQUEST INTERFACES ====================

export interface ViolationCreateRequest {
    violationType: 'FRAUDULENT_LISTING' | 'MISREPRESENTATION_OF_PROPERTY' | 'SPAM_OR_DUPLICATE_LISTING' |
    'INAPPROPRIATE_CONTENT' | 'NON_COMPLIANCE_WITH_TERMS' | 'FAILURE_TO_DISCLOSE_INFORMATION' |
    'HARASSMENT' | 'SCAM_ATTEMPT';
    description: string;
    violationReportedType: 'CUSTOMER' | 'PROPERTY' | 'SALES_AGENT' | 'PROPERTY_OWNER';
    reportedId: string;
}

export interface UpdateViolationRequest {
    status: 'PENDING' | 'REPORTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
    resolutionNotes?: string;
    penaltyApplied?: 'WARNING' | 'REMOVED_POST' | 'SUSPENDED_ACCOUNT';
}

// ==================== RESPONSE INTERFACES ====================

export interface ViolationUserDetails {
    id: string;
    createdAt: string;
    updatedAt: string;
    violationType: string;
    status: string;
    reportedAt: string;
    targetName: string;
    description: string;
    resolvedAt?: string;
    evidenceUrls: string[];
    penaltyApplied?: string;
    resolutionNotes?: string;
}

export interface ViolationAdminItem {
    id: string;
    createdAt: string;
    updatedAt: string;
    reporterName: string;
    reporterAvatarUrl?: string;
    reportedName: string;
    reportedAvatarUrl?: string;
    violationType: string;
    status: string;
    description: string;
    reportedAt: string;
}

export interface ViolationUser {
    id: string;
    fullName: string;
    role: string;
    userTier?: string;
    email: string;
    phoneNumber?: string;
}

export interface ViolationProperty {
    id: string;
    title: string;
    propertyTypeName: string;
    thumbnailUrl?: string;
    transactionType: 'SALE' | 'RENTAL';
    location: string;
    price: number;
    totalArea: number;
}

export interface ViolationAdminDetails {
    id: string;
    createdAt: string;
    updatedAt: string;
    violationType: string;
    reportedAt: string;
    description: string;
    reporter: ViolationUser;
    reportedUser?: ViolationUser;
    reportedProperty?: ViolationProperty;
    imageUrls: string[];
    documentUrls: string[];
    violationStatus: string;
    resolutionNotes?: string;
}

export interface ViolationUserItem {
    id: string;
    createdAt: string;
    updatedAt: string;
    violationType: string;
    description: string;
    status: string;
    targetName: string;
    resolvedAt?: string;
    reportedAt: string;
}

export interface AdminViolationFilters {
    page?: number;
    limit?: number;
    sortType?: 'asc' | 'desc';
    sortBy?: string;
    violationTypes?: string[];
    statuses?: string[];
    name?: string;
}

export interface MyViolationFilters {
    page?: number;
    limit?: number;
    sortType?: 'asc' | 'desc';
    sortBy?: string;
}

// ==================== SERVICE ====================

export const violationService = {
    /**
     * Create a new violation report (Customer/Owner/Agent)
     * Supports multipart/form-data with evidence files
     */
    async createViolationReport(
        data: ViolationCreateRequest,
        evidenceFiles?: File[]
    ): Promise<ViolationUserDetails> {
        const formData = new FormData();
        formData.append('payload', JSON.stringify(data));

        if (evidenceFiles && evidenceFiles.length > 0) {
            evidenceFiles.forEach(file => {
                formData.append('evidenceFiles', file);
            });
        }

        const response = await apiClient.post<SingleResponse<ViolationUserDetails>>(
            VIOLATION_ENDPOINTS.VIOLATIONS,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data.data;
    },

    /**
     * Get all violation reports with filters (Admin only)
     */
    async getAdminViolations(filters?: AdminViolationFilters): Promise<PaginatedResponse<ViolationAdminItem>> {
        const params = new URLSearchParams();

        if (!filters) {
            params.append('page', '1');
            params.append('limit', '10');
            params.append('sortType', 'desc');
            params.append('sortBy', 'createdAt');
        } else {
            const backendPage = (filters.page && filters.page > 0) ? filters.page  : 1;
            params.append('page', backendPage.toString());

            // Limit
            if (filters.limit) params.append('limit', filters.limit.toString());
            else params.append('limit', '10');

            // Sorting
            if (filters.sortType) params.append('sortType', filters.sortType);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);

            if (filters.violationTypes && filters.violationTypes.length > 0) {
                filters.violationTypes.forEach(type => {
                    params.append('violationTypes', type);
                });
            }

            if (filters.statuses && filters.statuses.length > 0) {
                filters.statuses.forEach(status => {
                    params.append('statuses', status);
                });
            }

            if (filters.name) params.append('name', filters.name);
        }

        const url = `${VIOLATION_ENDPOINTS.ADMIN_VIOLATIONS}?${params.toString()}`;
        console.log('🚀 Violation API Request:', url);

        const response = await apiClient.get<PaginatedResponse<ViolationAdminItem>>(url);

        console.log('✅ Violation API Response:', {
            total: response.data.paging?.total || (response.data as any).meta?.total,
            items: response.data.data?.length
        });

        return response.data;
    },

    /**
     * Get violation report details (Admin only)
     */
    async getViolationAdminDetails(id: string): Promise<ViolationAdminDetails> {
        const response = await apiClient.get<SingleResponse<ViolationAdminDetails>>(
            VIOLATION_ENDPOINTS.ADMIN_VIOLATION_DETAIL(id)
        );
        return response.data.data;
    },

    /**
     * Update violation report (Admin only)
     */
    async updateViolationReport(
        id: string,
        data: UpdateViolationRequest
    ): Promise<ViolationAdminDetails> {
        const response = await apiClient.put<SingleResponse<ViolationAdminDetails>>(
            VIOLATION_ENDPOINTS.ADMIN_VIOLATION_DETAIL(id),
            data
        );
        return response.data.data;
    },

    /**
     * Get my violation reports (Customer/Owner/Agent)
     */
    async getMyViolations(filters?: MyViolationFilters): Promise<PaginatedResponse<ViolationUserItem>> {
        const params = new URLSearchParams();

        if (!filters) {
            params.append('page', '0');
            params.append('limit', '10');
        } else {
            const backendPage = (filters.page && filters.page > 0) ? filters.page : 0;
            params.append('page', backendPage.toString());

            if (filters.limit) params.append('limit', filters.limit.toString());
            if (filters.sortType) params.append('sortType', filters.sortType);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
        }

        const url = `${VIOLATION_ENDPOINTS.MY_VIOLATIONS}?${params.toString()}`;
        const response = await apiClient.get<PaginatedResponse<ViolationUserItem>>(url);
        return response.data;
    },

    /**
     * Get my violation report details (Customer/Owner/Agent)
     */
    async getMyViolationDetails(id: string): Promise<ViolationUserDetails> {
        const response = await apiClient.get<SingleResponse<ViolationUserDetails>>(
            VIOLATION_ENDPOINTS.MY_VIOLATION_DETAIL(id)
        );
        return response.data.data;
    },
};