'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LogOut, ChevronDown, ShieldAlert, FileText, AlertTriangle, Clock, X, Loader2, TrendingUp } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { reportService, ViolationReportStats } from '@/lib/api/services/statistic-report.service';

// --- HELPER COMPONENTS ---

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-200 p-3 rounded shadow-lg text-xs z-50">
                <p className="font-bold mb-1 text-gray-700">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.fill || entry.color }} className="font-medium">
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Sub-component for Cards
function StatCard({ title, value, icon: Icon, trend, color }: any) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-600">{title}</span>
                <Icon className={`w-5 h-5 text-gray-400`} />
            </div>
            <div className="flex flex-col">
                <span className={`text-2xl font-bold ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
                {trend && (
                    <span className="text-xs font-medium text-gray-400 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {trend}
                    </span>
                )}
            </div>
        </div>
    )
}

export default function ViolationReportPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [stats, setStats] = useState<ViolationReportStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch API
    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await reportService.getViolationStats(year);
                console.log("API Violation Stats:", res);
                setStats(res);
            } catch (error) {
                console.error("Failed to fetch violation stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [year]);

    // --- DATA PROCESSING ---

    // 1. Chart Data per Month (Total, Suspended, Removed)
    const chartData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.map((monthName, index) => {
            const m = index + 1;

            let total = stats?.totalViolationReportChart?.[m] || 0;
            let suspended = stats?.accountsSuspendedChart?.[m] || 0;
            let removed = stats?.propertiesRemovedChart?.[m] || 0;

            return {
                name: monthName,
                total,
                suspended,
                removed
            };
        });
    }, [stats]);

    // 2. Trend Data (Violation Types)
    const trendData = useMemo(() => {
        if (!stats?.violationTrends) return [];

        const trends = Object.keys(stats.violationTrends).map(key => {
            const monthCounts = stats.violationTrends[key];
            const totalCount = Object.values(monthCounts).reduce((a, b) => a + b, 0);

            // Format Key Label nicer (e.g., FRAUDULENT_LISTING -> Fraudulent Listing)
            const formattedLabel = key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

            return { name: formattedLabel, value: totalCount };
        });

        // Mock Data if empty
        if (trends.length === 0) {
            return [
                { name: "Fraudulent Listing", value: 45 },
                { name: "Misrepresentation", value: 30 },
                { name: "Spam / Duplicate", value: 25 },
                { name: "Scam Attempt", value: 15 },
                { name: "Inappropriate Content", value: 10 },
            ];
        }

        return trends.sort((a, b) => b.value - a.value).slice(0, 5); // Top 5
    }, [stats]);

    const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

    if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-300">

            {/* 1. Header Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Violation Report</h2>
                    <p className="text-sm text-gray-500">Stay ahead of compliance risks — review property violations, track resolution progress, and maintain a trustworthy ecosystem.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer shadow-sm"
                        >
                            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 transition-colors shadow-sm">
                        <LogOut className="w-4 h-4" /> Export
                    </button>
                </div>
            </div>

            {/* 2. Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Reports"
                    value={stats?.totalViolationReports || 0}
                    icon={ShieldAlert}
                    trend="+0%"
                    color="text-red-600"
                />
                <StatCard
                    title="New This Month"
                    value={stats?.newThisMonth || 0}
                    icon={FileText}
                    trend="+0%"
                    color="text-blue-600"
                />
                <StatCard
                    title="Unsolved"
                    value={stats?.unsolved || 0}
                    icon={AlertTriangle}
                    trend="+0%"
                    color="text-orange-600"
                />
                <StatCard
                    title="Avg Resolution Time"
                    value={`${stats?.avgResolutionTimeHours || 0}h`}
                    icon={Clock}
                    trend="-0%"
                    color="text-green-600"
                />
            </div>

            {/* 3. Charts Grid */}
            <div className="space-y-6">

                {/* Row 1: Total Violation Reports (Area Chart) */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Total violation reports
                    </h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorViolation" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorViolation)" name="Reports" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Row 2: Violation Trends (Pie Chart) */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> Violation trends
                    </h3>

                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-full md:w-1/2 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={trendData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {trendData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="w-full md:w-1/2 flex flex-col gap-3">
                            {trendData.map((trend, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                        <span className="text-sm font-medium text-gray-700">{trend.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{trend.value} cases</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 3: Suspended & Removed (Bar Charts) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Suspended Accounts - Changed color to Purple */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full bg-purple-800 inline-block"></span> Total accounts suspended
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} interval={1} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="suspended" fill="#6b21a8" radius={[4, 4, 0, 0]} name="Suspended" barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Removed Properties - Changed color to Dark Orange */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full bg-orange-700 inline-block"></span> Total properties removed
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} interval={1} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="removed" fill="#c2410c" radius={[4, 4, 0, 0]} name="Removed" barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}