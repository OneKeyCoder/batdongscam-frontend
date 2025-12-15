// app/admin/dashboard/page.tsx
import React from 'react';
import {
  Building2,
  FileText,
  Wallet,
  Users,
  ThumbsUp,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  ChevronDown,
  Star
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* --- STATS ROW (5 COLUMNS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Properties"
          value="72.5M"
          trend="+12.5%"
          isPositive={true}
          icon={Building2}
        />
        <StatCard
          title="Active Contracts"
          value="2,817"
          trend="+8.2%"
          isPositive={true}
          icon={FileText}
        />
        <StatCard
          title="Monthly Revenue"
          value="57.015B VNĐ"
          trend="-2.1%"
          isPositive={false}
          icon={Wallet}
        />
        <StatCard
          title="Total Users"
          value="1,354"
          trend="+0.5%"
          isPositive={true}
          icon={Users}
        />
        <StatCard
          title="Customer Satisfaction"
          value="76.8%"
          trend="-2.1%"
          isPositive={false}
          icon={ThumbsUp}
        />
      </div>

      {/* --- REVENUE & CONTRACTS (LARGE CHART) --- */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Revenue & Contracts</h3>
          </div>
          <FilterDropdown label="2025" />
        </div>
        {/* Placeholder Chart */}
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
          [Chart Placeholder area]
        </div>
      </div>

      {/* --- MIDDLE ROW (PROPERTIES & DISTRIBUTION) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Properties Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-800 text-sm">Total Properties</h3>
            </div>
            <FilterDropdown label="2025" />
          </div>
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            [Bar Chart Placeholder]
          </div>
        </div>

        {/* Property Distribution */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-gray-500"></div>
              <h3 className="font-semibold text-gray-800 text-sm">Property Distribution</h3>
            </div>
            <FilterDropdown label="2025" />
          </div>
          <div className="flex flex-col items-center justify-center h-64">
             {/* Circle Placeholder */}
             <div className="w-40 h-40 rounded-full bg-gray-200 mb-6"></div>
             {/* Legend */}
             <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                <LegendItem color="bg-pink-500" label="House" />
                <LegendItem color="bg-blue-500" label="Apartment" />
                <LegendItem color="bg-yellow-500" label="Commercial" />
                <LegendItem color="bg-red-500" label="Villa" />
                <LegendItem color="bg-gray-300" label="Other" />
             </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM ROW (TOP AGENTS & CUSTOMERS) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Agents */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" /> Top Agents
                </h3>
                <div className="flex gap-2">
                    <FilterDropdown label="April" />
                    <FilterDropdown label="2024" />
                </div>
            </div>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((rank) => (
                    <TopListItem
                        key={rank}
                        rank={rank}
                        title="Agent's Name"
                        subtitle="60 appointments & 48 contracts"
                        badge={rank <= 2 ? "PLATINUM" : "GOLD"}
                        rating="4.6"
                        isAgent={true}
                    />
                ))}
            </div>
        </div>

        {/* Top Customers */}
         <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" /> Top Customer
                </h3>
                <div className="flex gap-2">
                    <FilterDropdown label="April" />
                    <FilterDropdown label="2024" />
                </div>
            </div>
            <div className="space-y-4">
                 {[1, 2, 3, 4, 5].map((rank) => (
                    <TopListItem
                        key={rank}
                        rank={rank}
                        title="Customer's name"
                        subtitle="10,000.00 $"
                        badge={rank <= 2 ? "PLATINUM" : "GOLD"}
                        isAgent={false}
                    />
                ))}
            </div>
        </div>
      </div>

       {/* --- RECENT ACTIVITIES --- */}
       <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-4 h-4 border border-gray-500 rounded-full flex items-center justify-center">
                 <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Recent Activities</h3>
          </div>
          
          <div className="space-y-6 relative pl-2">
            {/* Vertical Line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-gray-100 -z-10"></div>

            <ActivityItem 
                color="bg-blue-500" 
                title="New customer registed" 
                desc="Nguyen Thi Mai" 
                time="5 minutes ago" 
            />
             <ActivityItem 
                color="bg-yellow-500" 
                title="Appointment Requested" 
                desc="Tran Van Nam" 
                time="12 minutes ago" 
            />
             <ActivityItem 
                color="bg-green-500" 
                title="Payment Received" 
                desc="Minh Tue -> Thi Hoa" 
                time="20 minutes ago" 
            />
             <ActivityItem 
                color="bg-green-500" 
                title="Payment Received" 
                desc="250,000 VND - Me may" 
                time="1 hour ago" 
            />
          </div>
       </div>
    </div>
  );
}

/* --- SUB COMPONENTS --- */

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

function FilterDropdown({ label }: { label: string }) {
    return (
        <button className="flex items-center gap-1 text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 text-gray-600 bg-white">
            {label}
            <ChevronDown className="w-3 h-3" />
        </button>
    )
}

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`}></div>
            <span className="text-gray-600 font-medium">{label}</span>
        </div>
    )
}

function TopListItem({ rank, title, subtitle, badge, rating, isAgent }: any) {
    const badgeColor = badge === 'PLATINUM' 
        ? 'bg-pink-100 text-pink-500' 
        : 'bg-yellow-100 text-yellow-600';

    return (
        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
                {/* Rank Circle */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 
                    ${rank === 1 ? 'bg-red-600 text-white' 
                    : rank === 2 ? 'bg-red-500 text-white' 
                    : rank === 3 ? 'bg-red-500 text-white' 
                    : 'bg-white border border-gray-200 text-gray-500'
                    }`}>
                    {rank}
                </div>
                
                {/* Info */}
                <div>
                    <p className="text-xs font-bold text-gray-800">{title}</p>
                    <p className="text-[10px] text-gray-500">{subtitle}</p>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-col items-end gap-1">
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${badgeColor}`}>
                    {badge}
                </span>
                {isAgent && rating && (
                     <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold">
                        <Star className="w-3 h-3 fill-yellow-500" />
                        {rating}
                     </div>
                )}
            </div>
        </div>
    )
}

function ActivityItem({ color, title, desc, time }: any) {
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