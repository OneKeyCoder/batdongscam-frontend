'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2, FileText, Wallet, Users, ThumbsUp, TrendingUp, TrendingDown,
  Activity as ActivityIcon, Star, ChevronDown
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

import { reportService } from '@/lib/api/services/statistic-report.service';
import { paymentService } from '@/lib/api/services/payment.service';
import { violationService } from '@/lib/api/services/violation.service';
import { accountService } from '@/lib/api/services/account.service';

import type {
  DashboardTopStats,
  AgentRankingItem,
  CustomerRankingItem
} from '@/lib/api/services/statistic-report.service';

const COLORS = ['#EC4899', '#3B82F6', '#EAB308', '#EF4444', '#9CA3AF'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  // --- STATE DATA  ---
  const [topStats, setTopStats] = useState<DashboardTopStats | null>(null);
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [propertiesChartData, setPropertiesChartData] = useState<any[]>([]);
  const [distributionChartData, setDistributionChartData] = useState<any[]>([]);
  const [topAgents, setTopAgents] = useState<AgentRankingItem[]>([]);
  const [topCustomers, setTopCustomers] = useState<CustomerRankingItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          statsRes,
          revContRes,
          propsRes,
          distRes,
          agentRankRes,
          cusRankRes,
          paymentsRes,
          violationsRes,
          newCustomersRes
        ] = await Promise.all([
          reportService.getDashboardTopStats(),
          reportService.getDashboardRevenueAndContracts(currentYear),
          reportService.getDashboardTotalProperties(currentYear),
          reportService.getDashboardPropertyDistribution(currentYear),
          reportService.getDashboardAgentRanking(currentMonth, currentYear),
          reportService.getDashboardCustomerRanking(currentMonth, currentYear),
          // Recent Activities Sources
          paymentService.getPayments({ size: 5, sortDirection: 'DESC', sortBy: 'createdAt' }),
          violationService.getAdminViolations({ limit: 5, sortType: 'desc', sortBy: 'createdAt' }),
          accountService.getAllCustomers({ limit: 5, sortType: 'desc', sortBy: 'createdAt' })
        ]);

        setTopStats(statsRes);

        // 2. Revenue & Contracts Chart (Map Record<number, number> -> Array)
        const mappedRevenue = MONTHS.map((month, index) => ({
          name: month,
          revenue: revContRes.revenue?.[index + 1] || 0,
          contracts: revContRes.contracts?.[index + 1] || 0,
        }));
        setRevenueChartData(mappedRevenue);

        // 3. Total Properties Chart
        const mappedProperties = MONTHS.map((month, index) => ({
          name: month,
          value: propsRes.totalProperties?.[index + 1] || 0,
        }));
        setPropertiesChartData(mappedProperties);

        // 4. Distribution Chart
        const mappedDist = distRes.propertyTypes.map(item => ({
          name: item.typeName,
          value: item.count,
        }));
        setDistributionChartData(mappedDist);

        // 5. Rankings
        setTopAgents(agentRankRes.agents);
        setTopCustomers(cusRankRes.customers);

        // 6. Recent Activities
        const activities = [
          ...(paymentsRes.data || []).map((p: any) => ({
            id: `pay-${p.id}`,
            type: 'success',
            title: 'Payment Received',
            desc: `${p.amount.toLocaleString()} VND from ${p.payerName || 'Unknown'}`,
            time: p.createdAt,
            timestamp: new Date(p.createdAt).getTime()
          })),
          ...(violationsRes.data || []).map((v: any) => ({
            id: `vio-${v.id}`,
            type: 'warning',
            title: 'Violation Reported',
            desc: `${v.violationType} reported by ${v.reporterName}`,
            time: v.createdAt,
            timestamp: new Date(v.createdAt).getTime()
          })),
          ...(newCustomersRes.data || []).map((c: any) => ({
            id: `cus-${c.id}`,
            type: 'info',
            title: 'New Customer Joined',
            desc: `${c.firstName} ${c.lastName}`,
            time: c.createdAt,
            timestamp: new Date(c.createdAt).getTime()
          }))
        ]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 6);

        setRecentActivities(activities);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentYear, currentMonth]);

  if (loading) {
    return <div className="p-10 text-center text-gray-500 animate-pulse">Loading dashboard data...</div>;
  }

  // --- RENDER UI ---
  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* TOP STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Properties"
          value={topStats?.totalProperties ?? 0}
          trend="+12.5%" isPositive={true} icon={Building2}
        />
        <StatCard
          title="Active Contracts"
          value={topStats?.totalContracts ?? 0}
          trend="+8.2%" isPositive={true} icon={FileText}
        />
        <StatCard
          title="Monthly Revenue"
          value={`${(topStats?.monthRevenue || 0).toLocaleString()} ₫`}
          trend="-2.1%" isPositive={false} icon={Wallet}
        />
        <StatCard
          title="Total Users"
          value={topStats?.totalUsers ?? 0}
          trend="+0.5%" isPositive={true} icon={Users}
        />
        <StatCard
          title="Satisfaction"
          value={`${topStats?.customerStatisfaction ?? 0}`}
          trend="+1.2%" isPositive={true} icon={ThumbsUp}
        />
      </div>

      {/* REVENUE & CONTRACTS CHART */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Revenue & Contracts</h3>
          </div>
          <span className="text-xs font-bold text-gray-500 border px-2 py-1 rounded">{currentYear}</span>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#DC2626" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
              <Area yAxisId="right" type="monotone" dataKey="contracts" stroke="#3B82F6" strokeWidth={2} fillOpacity={0} strokeDasharray="5 5" name="Contracts" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MIDDLE ROW: Properties Chart & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Total Properties Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-800 text-sm">Total Properties</h3>
            </div>
            <span className="text-xs font-bold text-gray-500 border px-2 py-1 rounded">{currentYear}</span>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertiesChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#DC2626" radius={[4, 4, 0, 0]} barSize={40} name="Properties" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Property Distribution */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-gray-500"></div>
              <h3 className="font-semibold text-gray-800 text-sm">Property Distribution</h3>
            </div>
            <span className="text-xs font-bold text-gray-500 border px-2 py-1 rounded">{currentYear}</span>
          </div>
          <div className="w-full h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distributionChartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {distributionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Agents */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <Users className="w-4 h-4" /> Top Agents
            </h3>
          </div>
          <div className="space-y-4">
            {topAgents.map((agent, index) => (
              <TopListItem
                key={`agent-${agent.rank}-${index}`}
                rank={agent.rank}
                title={`${agent.firstName} ${agent.lastName}`}
                subtitle={`${agent.totalContractsSigned} signed contracts`}
                badge={agent.tier}
                rating={agent.rating}
                isAgent={true}
              />
            ))}
            {topAgents.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No data available</p>}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <Users className="w-4 h-4" /> Top Customers
            </h3>
          </div>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <TopListItem
                key={`customer-${customer.rank}-${index}`}
                rank={customer.rank}
                title={`${customer.firstName} ${customer.lastName}`}
                subtitle={`Rank: #${customer.rank}`}
                badge={customer.tier}
                isAgent={false}
              />
            ))}
            {topCustomers.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No data available</p>}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITIES */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <ActivityIcon className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-800 text-sm">Recent Activities</h3>
        </div>
        <div className="space-y-6 relative pl-2">
          <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-gray-100 -z-10"></div>
          {recentActivities.map((act) => (
            <ActivityItem
              key={act.id}
              type={act.type}
              title={act.title}
              desc={act.desc}
              time={new Date(act.time).toLocaleDateString()}
            />
          ))}
          {recentActivities.length === 0 && <p className="text-sm text-gray-500 pl-4">No recent activities</p>}
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function StatCard({ title, value, trend, isPositive, icon: Icon }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <span className="text-gray-500 text-xs font-medium">{title}</span>
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div className="mt-2">
        <h4 className="text-xl font-bold text-gray-900">{value}</h4>
        <div className={`flex items-center text-xs mt-1 font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {trend}
        </div>
      </div>
    </div>
  )
}

function TopListItem({ rank, title, subtitle, badge, rating, isAgent }: any) {
  const badgeColor = badge === 'PLATINUM' ? 'bg-pink-100 text-pink-500' : 'bg-yellow-100 text-yellow-600';
  return (
    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 
                    ${rank === 1 ? 'bg-red-600 text-white' : rank === 2 ? 'bg-red-500 text-white' : rank === 3 ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
          {rank}
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">{title}</p>
          <p className="text-[10px] text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${badgeColor}`}>{badge || 'MEMBER'}</span>
        {isAgent && rating && (
          <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold">
            <Star className="w-3 h-3 fill-yellow-500" />{rating}
          </div>
        )}
      </div>
    </div>
  )
}

function ActivityItem({ type, title, desc, time }: any) {
  const color = type === 'info' ? 'bg-blue-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="flex items-start gap-3">
      <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${color} ring-4 ring-white`}></div>
      <div className="flex-1">
        <p className="text-xs font-bold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <span className="text-[10px] text-gray-400 whitespace-nowrap">{time}</span>
    </div>
  )
}