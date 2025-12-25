import apiClient from '../client';
import { SingleResponse, ListResponse } from '../types';

const DOCUMENT_TYPE_ENDPOINTS = {
    DOCUMENT_TYPES: '/documents',
    DOCUMENT_TYPE_DETAIL: (id: string) => `/documents/${id}`,
};

// ==================== REQUEST ====================

export interface DocumentTypeCreateRequest {
    name: string;
    description: string;
    isCompulsory: boolean;
}

export interface DocumentTypeUpdateRequest {
    id: string;
    name: string;
    description: string;
    isCompulsory: boolean;
}

// ==================== RESPONSE ====================

export interface DocumentTypeDetailsResponse {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    description: string;
    isCompulsory: boolean;
}

export const documentTypeService = {
    /**
     * Create a new document type (Admin only)
     */
    async createDocumentType(
        data: DocumentTypeCreateRequest
    ): Promise<DocumentTypeDetailsResponse> {
        const response = await apiClient.post<SingleResponse<DocumentTypeDetailsResponse>>(
            DOCUMENT_TYPE_ENDPOINTS.DOCUMENT_TYPES,
            data
        );
        return response.data.data;
    },

    /**
     * Update an existing document type (Admin only)
     */
    async updateDocumentType(
        data: DocumentTypeUpdateRequest
    ): Promise<DocumentTypeDetailsResponse> {
        const response = await apiClient.patch<SingleResponse<DocumentTypeDetailsResponse>>(
            DOCUMENT_TYPE_ENDPOINTS.DOCUMENT_TYPES,
            data
        );
        return response.data.data;
    },

    /**
     * Delete a document type (Admin only)
     * This will also delete all associated documents
     */
    async deleteDocumentType(id: string): Promise<void> {
        await apiClient.delete<SingleResponse<null>>(
            DOCUMENT_TYPE_ENDPOINTS.DOCUMENT_TYPE_DETAIL(id)
        );
    },
};