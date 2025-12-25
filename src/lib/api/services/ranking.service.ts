import apiClient from '../client';
import { SingleResponse } from '../types';

const RANKING_ENDPOINTS = {
  // Agent endpoints (Admin)
  AGENT_MONTH: (agentId: string) => `/ranking/agent/${agentId}/month`,
  AGENT_CAREER: (agentId: string) => `/ranking/agent/${agentId}/career`,
  // Agent endpoints (Self)
  AGENT_ME_MONTH: '/ranking/agent/me/month',
  AGENT_ME_CAREER: '/ranking/agent/me/career',

  // Customer endpoints (Admin)
  CUSTOMER_MONTH: (customerId: string) => `/ranking/customer/${customerId}/month`,
  CUSTOMER_ALL: (customerId: string) => `/ranking/customer/${customerId}/all`,
  // Customer endpoints (Self)
  CUSTOMER_ME_MONTH: '/ranking/customer/me/month',
  CUSTOMER_ME_ALL: '/ranking/customer/me/all',

  // Property Owner endpoints (Admin)
  OWNER_MONTH: (ownerId: string) => `/ranking/property-owner/${ownerId}/month`,
  OWNER_ALL: (ownerId: string) => `/ranking/property-owner/${ownerId}/all`,
  // Property Owner endpoints (Self)
  OWNER_ME_MONTH: '/ranking/property-owner/me/month',
  OWNER_ME_ALL: '/ranking/property-owner/me/all',
};

export interface IndividualSalesAgentPerformanceMonth {
  id: string;
  createdAt: string;
  updatedAt: string;
  agentId: string;
  month: number;
  year: number;
  performancePoint: number;
  performanceTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  rankingPosition: number;
  handlingProperties: number;
  monthPropertiesAssigned: number;
  monthAppointmentsAssigned: number;
  monthAppointmentsCompleted: number;
  monthContracts: number;
  monthRates: number;
  avgRating: number;
  monthCustomerSatisfactionAvg: number;
}

export interface IndividualSalesAgentPerformanceCareer {
  id: string;
  createdAt: string;
  updatedAt: string;
  agentId: string;
  performancePoint: number;
  careerRanking: number;
  propertiesAssigned: number;
  appointmentAssigned: number;
  appointmentCompleted: number;
  totalContracts: number;
  customerSatisfactionAvg: number;
  totalRates: number;
  avgRating: number;
}

export interface IndividualCustomerPotentialMonth {
  id: string;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  month: number;
  year: number;
  leadScore: number;
  customerTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  leadPosition: number;
  monthViewingsRequested: number;
  monthViewingAttended: number;
  monthSpending: number;
  monthPurchases: number;
  monthRentals: number;
  monthContractsSigned: number;
}

export interface IndividualCustomerPotentialAll {
  id: string;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  leadScore: number;
  leadPosition: number;
  viewingsRequested: number;
  viewingsAttended: number;
  spending: number;
  totalPurchases: number;
  totalRentals: number;
  totalContractsSigned: number;
}

export interface IndividualPropertyOwnerContributionMonth {
  id: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  month: number;
  year: number;
  contributionPoint: number;
  contributionTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  rankingPosition: number;
  monthContributionValue: number;
  monthTotalProperties: number;
  monthTotalForSales: number;
  monthTotalForRents: number;
  monthTotalPropertiesSold: number;
  monthTotalPropertiesRented: number;
}

export interface IndividualPropertyOwnerContributionAll {
  id: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  contributionPoint: number;
  rankingPosition: number;
  contributionValue: number;
  totalProperties: number;
  totalPropertiesSold: number;
  totalPropertiesRented: number;
}

export const rankingService = {
  /**
   * Get sales agent monthly performance (Admin only)
   */
  async getAgentMonthlyPerformance(
    agentId: string,
    month: number,
    year: number
  ): Promise<IndividualSalesAgentPerformanceMonth> {
    const response = await apiClient.get<SingleResponse<IndividualSalesAgentPerformanceMonth>>(
      RANKING_ENDPOINTS.AGENT_MONTH(agentId),
      { params: { month, year } }
    );
    return response.data.data;
  },

  /**
   * Get sales agent career performance (Admin only)
   */
  async getAgentCareerPerformance(agentId: string): Promise<IndividualSalesAgentPerformanceCareer> {
    const response = await apiClient.get<SingleResponse<IndividualSalesAgentPerformanceCareer>>(
      RANKING_ENDPOINTS.AGENT_CAREER(agentId)
    );
    return response.data.data;
  },

  /**
   * Get my agent monthly performance (Agent only)
   */
  async getMyAgentMonthlyPerformance(
    month: number,
    year: number
  ): Promise<IndividualSalesAgentPerformanceMonth> {
    const response = await apiClient.get<SingleResponse<IndividualSalesAgentPerformanceMonth>>(
      RANKING_ENDPOINTS.AGENT_ME_MONTH,
      { params: { month, year } }
    );
    return response.data.data;
  },

  /**
   * Get my agent career performance (Agent only)
   */
  async getMyAgentCareerPerformance(): Promise<IndividualSalesAgentPerformanceCareer> {
    const response = await apiClient.get<SingleResponse<IndividualSalesAgentPerformanceCareer>>(
      RANKING_ENDPOINTS.AGENT_ME_CAREER
    );
    return response.data.data;
  },

  // ==================== CUSTOMER ENDPOINTS ====================

  /**
   * Get customer monthly potential (Admin only)
   */
  async getCustomerMonthlyPotential(
    customerId: string,
    month: number,
    year: number
  ): Promise<IndividualCustomerPotentialMonth> {
    const response = await apiClient.get<SingleResponse<IndividualCustomerPotentialMonth>>(
      RANKING_ENDPOINTS.CUSTOMER_MONTH(customerId),
      { params: { month, year } }
    );
    return response.data.data;
  },

  /**
   * Get customer all-time potential (Admin only)
   */
  async getCustomerAllTimePotential(customerId: string): Promise<IndividualCustomerPotentialAll> {
    const response = await apiClient.get<SingleResponse<IndividualCustomerPotentialAll>>(
      RANKING_ENDPOINTS.CUSTOMER_ALL(customerId)
    );
    return response.data.data;
  },

  /**
   * Get my customer monthly potential (Customer only)
   */
  async getMyCustomerMonthlyPotential(
    month: number,
    year: number
  ): Promise<IndividualCustomerPotentialMonth> {
    const response = await apiClient.get<SingleResponse<IndividualCustomerPotentialMonth>>(
      RANKING_ENDPOINTS.CUSTOMER_ME_MONTH,
      { params: { month, year } }
    );
    return response.data.data;
  },

  /**
   * Get my customer all-time potential (Customer only)
   */
  async getMyCustomerAllTimePotential(): Promise<IndividualCustomerPotentialAll> {
    const response = await apiClient.get<SingleResponse<IndividualCustomerPotentialAll>>(
      RANKING_ENDPOINTS.CUSTOMER_ME_ALL
    );
    return response.data.data;
  },

  // ==================== PROPERTY OWNER ENDPOINTS ====================

  /**
   * Get property owner monthly contribution (Admin only)
   */
  async getOwnerMonthlyContribution(
    ownerId: string,
    month: number,
    year: number
  ): Promise<IndividualPropertyOwnerContributionMonth> {
    const response = await apiClient.get<SingleResponse<IndividualPropertyOwnerContributionMonth>>(
      RANKING_ENDPOINTS.OWNER_MONTH(ownerId),
      { params: { month, year } }
    );
    return response.data.data;
  },

  /**
   * Get property owner all-time contribution (Admin only)
   */
  async getOwnerAllTimeContribution(ownerId: string): Promise<IndividualPropertyOwnerContributionAll> {
    const response = await apiClient.get<SingleResponse<IndividualPropertyOwnerContributionAll>>(
      RANKING_ENDPOINTS.OWNER_ALL(ownerId)
    );
    return response.data.data;
  },

  /**
   * Get my owner monthly contribution (Owner only)
   */
  async getMyOwnerMonthlyContribution(
    month: number,
    year: number
  ): Promise<IndividualPropertyOwnerContributionMonth> {
    const response = await apiClient.get<SingleResponse<IndividualPropertyOwnerContributionMonth>>(
      RANKING_ENDPOINTS.OWNER_ME_MONTH,
      { params: { month, year } }
    );
    return response.data.data;
  },

  /**
   * Get my owner all-time contribution (Owner only)
   */
  async getMyOwnerAllTimeContribution(): Promise<IndividualPropertyOwnerContributionAll> {
    const response = await apiClient.get<SingleResponse<IndividualPropertyOwnerContributionAll>>(
      RANKING_ENDPOINTS.OWNER_ME_ALL
    );
    return response.data.data;
  },
};
