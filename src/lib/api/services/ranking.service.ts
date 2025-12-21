import apiClient from '../client';
import { SingleResponse } from '../types';

const RANKING_ENDPOINTS = {
  AGENT_ME_MONTH: '/ranking/agent/me/month',
  AGENT_ME_CAREER: '/ranking/agent/me/career',
  CUSTOMER_ME_MONTH: '/ranking/customer/me/month',
  CUSTOMER_ME_ALL: '/ranking/customer/me/all',
  OWNER_ME_MONTH: '/ranking/property-owner/me/month',
  OWNER_ME_ALL: '/ranking/property-owner/me/all',
};

export interface AgentMonthlyRanking {
  rank: number;
  totalSales: number;
  totalCommission: number;
  propertiesSold: number;
  appointmentsCompleted: number;
}

export interface AgentCareerRanking {
  totalCareerSales: number;
  totalCareerCommission: number;
  totalPropertiesSold: number;
  yearsOfService: number;
  averageRating: number;
}

export interface CustomerRanking {
  rank: number;
  totalPurchases: number;
  totalSpent: number;
  memberSince: string;
  tier: string;
}

export interface OwnerRanking {
  rank: number;
  totalProperties: number;
  totalRevenue: number;
  propertiesSold: number;
  propertiesRented: number;
}

export const rankingService = {
  /**
   * Get my agent monthly ranking
   */
  async getMyAgentMonthlyRanking(): Promise<AgentMonthlyRanking> {
    const response = await apiClient.get<SingleResponse<AgentMonthlyRanking>>(
      RANKING_ENDPOINTS.AGENT_ME_MONTH
    );
    return response.data.data;
  },

  /**
   * Get my agent career ranking
   */
  async getMyAgentCareerRanking(): Promise<AgentCareerRanking> {
    const response = await apiClient.get<SingleResponse<AgentCareerRanking>>(
      RANKING_ENDPOINTS.AGENT_ME_CAREER
    );
    return response.data.data;
  },

  /**
   * Get my customer monthly ranking
   */
  async getMyCustomerMonthlyRanking(): Promise<CustomerRanking> {
    const response = await apiClient.get<SingleResponse<CustomerRanking>>(
      RANKING_ENDPOINTS.CUSTOMER_ME_MONTH
    );
    return response.data.data;
  },

  /**
   * Get my customer all-time ranking
   */
  async getMyCustomerAllTimeRanking(): Promise<CustomerRanking> {
    const response = await apiClient.get<SingleResponse<CustomerRanking>>(
      RANKING_ENDPOINTS.CUSTOMER_ME_ALL
    );
    return response.data.data;
  },

  /**
   * Get my owner monthly ranking
   */
  async getMyOwnerMonthlyRanking(): Promise<OwnerRanking> {
    const response = await apiClient.get<SingleResponse<OwnerRanking>>(
      RANKING_ENDPOINTS.OWNER_ME_MONTH
    );
    return response.data.data;
  },

  /**
   * Get my owner all-time ranking
   */
  async getMyOwnerAllTimeRanking(): Promise<OwnerRanking> {
    const response = await apiClient.get<SingleResponse<OwnerRanking>>(
      RANKING_ENDPOINTS.OWNER_ME_ALL
    );
    return response.data.data;
  },
};
