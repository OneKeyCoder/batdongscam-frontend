import apiClient from '../client';
import { SingleResponse } from '../types';

const REPORT_ENDPOINTS = {
    // Statistic Reports
    AGENT_PERFORMANCE: (year: number) => `/statistic-report/agent-performance/${year}`,
    CUSTOMER: (year: number) => `/statistic-report/customer/${year}`,
    PROPERTY_OWNER: (year: number) => `/statistic-report/property-owner/${year}`,
    FINANCIAL: (year: number) => `/statistic-report/financial/${year}`,
    PROPERTY: (year: number) => `/statistic-report/property/${year}`,
    VIOLATION: (year: number) => `/statistic-report/violation/${year}`,

    // Admin Dashboard
    DASHBOARD_TOP_STATS: '/statistic-report/admin-dashboard/top-stats',
    DASHBOARD_REVENUE_CONTRACTS: (year: number) => `/statistic-report/admin-dashboard/revenue-contracts/${year}`,
    DASHBOARD_TOTAL_PROPERTIES: (year: number) => `/statistic-report/admin-dashboard/total-properties/${year}`,
    DASHBOARD_PROPERTY_DISTRIBUTION: (year: number) => `/statistic-report/admin-dashboard/property-distribution/${year}`,
    DASHBOARD_AGENT_RANKING: (month: number, year: number) => `/statistic-report/admin-dashboard/agent-ranking/${month}/${year}`,
    DASHBOARD_CUSTOMER_RANKING: (month: number, year: number) => `/statistic-report/admin-dashboard/customer-ranking/${month}/${year}`,
};

// ==================== STATISTIC REPORT ====================

export interface AgentPerformanceStats {
    totalAgents: Record<number, number>; // month -> count
    totalRates: Record<number, number>;
    avgRating: Record<number, number>;
    customerSatisfaction: Record<number, number>;
    tierDistribution: Record<'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM', Record<number, number>>;
}

export interface CustomerStats {
    totalCustomers: Record<number, number>;
    totalSpending: Record<number, number>;
    avgSpendingPerCustomer: Record<number, number>;
    tierDistribution: Record<'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM', Record<number, number>>;
}

export interface PropertyOwnerStats {
    totalOwners: Record<number, number>;
    totalContributionValue: Record<number, number>;
    avgContributionPerOwner: Record<number, number>;
    tierDistribution: Record<'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM', Record<number, number>>;
}

export interface FinancialStats {
    totalRevenue: number;
    tax: number;
    netProfit: number;
    avgRating: number;
    totalRates: number;
    totalRevenueChart: Record<number, number>;
    totalContractsChart: Record<number, number>;
    agentSalaryChart: Record<number, number>;
    targetRevenueChart: Record<string, Record<number, number>>;
}

export interface PropertyStats {
    activeProperties: number;
    newProperties: number;
    totalSold: number;
    totalRented: number;
    totalProperties: Record<number, number>;
    totalSoldProperties: Record<number, number>;
    totalRentedProperties: Record<number, number>;
    searchedTargets: Record<string, Record<number, number>>;
    favoriteTargets: Record<string, Record<number, number>>;
}

export interface ViolationReportStats {
    totalViolationReports: number;
    newThisMonth: number;
    unsolved: number;
    avgResolutionTimeHours: number;
    totalViolationReportChart: Record<number, number>;
    violationTrends: Record<string, Record<number, number>>;
    accountsSuspendedChart: Record<number, number>;
    propertiesRemovedChart: Record<number, number>;
}

// ==================== ADMIN DASHBOARD ====================

export interface DashboardTopStats {
    totalProperties: number;
    totalContracts: number;
    monthRevenue: number;
    totalUsers: number;
    customerStatisfaction: number; 
}

export interface DashboardRevenueAndContracts {
    revenue: Record<number, number>; // month -> revenue
    contracts: Record<number, number>; // month -> count
}

export interface DashboardTotalProperties {
    totalProperties: Record<number, number>; 
}

export interface PropertyTypeDistribution {
    typeName: string;
    count: number;
    percentage: number;
}

export interface DashboardPropertyDistribution {
    propertyTypes: PropertyTypeDistribution[];
}

export interface AgentRankingItem {
    firstName: string;
    lastName: string;
    rank: number;
    tier: string;
    rating: number;
    totalAppointmentsCompleted: number;
    totalContractsSigned: number;
}

export interface DashboardAgentRanking {
    agents: AgentRankingItem[];
}

export interface CustomerRankingItem {
    firstName: string;
    lastName: string;
    rank: number;
    tier: string;
}

export interface DashboardCustomerRanking {
    customers: CustomerRankingItem[];
}

export const reportService = {
    // ==================== STATISTIC REPORTS ====================

    /**
     * Get agent performance stats for a year (Admin only)
     */
    async getAgentPerformanceStats(year: number): Promise<AgentPerformanceStats> {
        const response = await apiClient.get<SingleResponse<AgentPerformanceStats>>(
            REPORT_ENDPOINTS.AGENT_PERFORMANCE(year)
        );
        return response.data.data;
    },

    /**
     * Get customer stats for a year (Admin only)
     */
    async getCustomerStats(year: number): Promise<CustomerStats> {
        const response = await apiClient.get<SingleResponse<CustomerStats>>(
            REPORT_ENDPOINTS.CUSTOMER(year)
        );
        return response.data.data;
    },

    /**
     * Get property owner stats for a year (Admin only)
     */
    async getPropertyOwnerStats(year: number): Promise<PropertyOwnerStats> {
        const response = await apiClient.get<SingleResponse<PropertyOwnerStats>>(
            REPORT_ENDPOINTS.PROPERTY_OWNER(year)
        );
        return response.data.data;
    },

    /**
     * Get financial stats for a year (Admin only)
     */
    async getFinancialStats(year: number): Promise<FinancialStats> {
        const response = await apiClient.get<SingleResponse<FinancialStats>>(
            REPORT_ENDPOINTS.FINANCIAL(year)
        );
        return response.data.data;
    },

    /**
     * Get property stats for a year (Admin only)
     */
    async getPropertyStats(year: number): Promise<PropertyStats> {
        const response = await apiClient.get<SingleResponse<PropertyStats>>(
            REPORT_ENDPOINTS.PROPERTY(year)
        );
        return response.data.data;
    },

    /**
     * Get violation stats for a year (Admin only)
     */
    async getViolationStats(year: number): Promise<ViolationReportStats> {
        const response = await apiClient.get<SingleResponse<ViolationReportStats>>(
            REPORT_ENDPOINTS.VIOLATION(year)
        );
        return response.data.data;
    },

    // ==================== ADMIN DASHBOARD ====================

    /**
     * Get dashboard top stats (Admin only)
     */
    async getDashboardTopStats(): Promise<DashboardTopStats> {
        const response = await apiClient.get<SingleResponse<DashboardTopStats>>(
            REPORT_ENDPOINTS.DASHBOARD_TOP_STATS
        );
        return response.data.data;
    },

    /**
     * Get dashboard revenue and contracts for a year (Admin only)
     */
    async getDashboardRevenueAndContracts(year: number): Promise<DashboardRevenueAndContracts> {
        const response = await apiClient.get<SingleResponse<DashboardRevenueAndContracts>>(
            REPORT_ENDPOINTS.DASHBOARD_REVENUE_CONTRACTS(year)
        );
        return response.data.data;
    },

    /**
     * Get dashboard total properties for a year (Admin only)
     */
    async getDashboardTotalProperties(year: number): Promise<DashboardTotalProperties> {
        const response = await apiClient.get<SingleResponse<DashboardTotalProperties>>(
            REPORT_ENDPOINTS.DASHBOARD_TOTAL_PROPERTIES(year)
        );
        return response.data.data;
    },

    /**
     * Get dashboard property distribution for a year (Admin only)
     */
    async getDashboardPropertyDistribution(year: number): Promise<DashboardPropertyDistribution> {
        const response = await apiClient.get<SingleResponse<DashboardPropertyDistribution>>(
            REPORT_ENDPOINTS.DASHBOARD_PROPERTY_DISTRIBUTION(year)
        );
        return response.data.data;
    },

    /**
     * Get dashboard agent ranking (top 5) for a month (Admin only)
     */
    async getDashboardAgentRanking(month: number, year: number): Promise<DashboardAgentRanking> {
        const response = await apiClient.get<SingleResponse<DashboardAgentRanking>>(
            REPORT_ENDPOINTS.DASHBOARD_AGENT_RANKING(month, year)
        );
        return response.data.data;
    },

    /**
     * Get dashboard customer ranking (top 5) for a month (Admin only)
     */
    async getDashboardCustomerRanking(month: number, year: number): Promise<DashboardCustomerRanking> {
        const response = await apiClient.get<SingleResponse<DashboardCustomerRanking>>(
            REPORT_ENDPOINTS.DASHBOARD_CUSTOMER_RANKING(month, year)
        );
        return response.data.data;
    },
};