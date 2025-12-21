import apiClient from '../client';
import { SingleResponse } from '../types';

const FAVORITE_ENDPOINTS = {
  LIKE: '/favorites/like',
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
   * Backend only supports POST /favorites/like - no GET endpoints for favorites lists
   */
  async toggleLike(id: string, likeType: LikeType): Promise<boolean> {
    const response = await apiClient.post<SingleResponse<boolean>>(
      `${FAVORITE_ENDPOINTS.LIKE}?id=${id}&likeType=${likeType}`
    );
    return response.data.data;
  },
};
