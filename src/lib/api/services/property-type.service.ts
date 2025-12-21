import apiClient from '../client';
import { SingleResponse } from '../types';

const PROPERTY_TYPE_ENDPOINTS = {
  LIST: '/public/property-types',
};

export interface PropertyType {
  propertyTypeId: string;
  typeName: string;
  description?: string;
}

export const propertyTypeService = {
  /**
   * Get all property types
   */
  async getPropertyTypes(): Promise<PropertyType[]> {
    const response = await apiClient.get<SingleResponse<PropertyType[]>>(
      PROPERTY_TYPE_ENDPOINTS.LIST
    );
    return response.data.data;
  },
};
