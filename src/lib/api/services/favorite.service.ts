import apiClient from '../client';
import { SingleResponse, PaginatedResponse } from '../types';
import { PropertyCard } from '../types';

const FAVORITE_ENDPOINTS = {
  LIKE: '/favorites/like',
  FAVORITE_PROPERTIES: '/favorites/properties/cards',
};

export enum LikeType {
  PROPERTY = 'PROPERTY',
  CITY = 'CITY',
  DISTRICT = 'DISTRICT',
  WARD = 'WARD',
  PROPERTY_TYPE = 'PROPERTY_TYPE',
}

export const favoriteService = {
  /**
   * Toggle like/unlike for an item
   */
  async toggleLike(id: string, likeType: LikeType): Promise<boolean> {
    const response = await apiClient.post<SingleResponse<boolean>>(
      FAVORITE_ENDPOINTS.LIKE,
      null,
      {
        params: { id, likeType },
      }
    );
    return response.data.data;
  },

  async getFavoriteProperties(page: number = 1, limit: number = 15): Promise<PaginatedResponse<PropertyCard>> {
    const response = await apiClient.get<PaginatedResponse<PropertyCard>>(
      FAVORITE_ENDPOINTS.FAVORITE_PROPERTIES,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },
};
