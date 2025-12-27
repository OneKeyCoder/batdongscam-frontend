'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LogOut, ChevronDown, Building2, TrendingUp, X, FilePlus, ShoppingCart, Key, Loader2, DollarSign } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { reportService, PropertyStats } from '@/lib/api/services/statistic-report.service';

// --- HELPER CHART COMPONENTS ---

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-200 p-3 rounded shadow-lg text-xs z-50">
                <p className="font-bold mb-1 text-gray-700">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }} className="font-medium">
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function PropertyStatisticsPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [stats, setStats] = useState<PropertyStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch API Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await reportService.getPropertyStats(year);
                setStats(res);
            } catch (error) {
                console.error("Failed to fetch property stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [year]);

    // --- DATA PROCESSING ---
    const chartData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.map((monthName, index) => {
            const m = index + 1;
            return {
                name: monthName,
                total: stats?.totalProperties?.[m] || 0,
                sold: stats?.totalSoldProperties?.[m] || 0,
                rented: stats?.totalRentedProperties?.[m] || 0,
            };
        });
    }, [stats]);

    const targetData = useMemo(() => {
        if (!stats?.searchedTargets) return [];

        const targets = Object.keys(stats.searchedTargets).map(key => {
            const monthCounts = stats.searchedTargets[key];
            const totalCount = Object.values(monthCounts).reduce((a, b) => a + b, 0);
            return { name: key, value: totalCount };
        });

        // Sort & Top 5
        return targets.sort((a, b) => b.value - a.value).slice(0, 5);
    }, [stats]);

    const COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];

    if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-300">

            {/* 1. Header Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Property Statistics Report</h2>
                    <p className="text-sm text-gray-500">Dive deep into property performance — explore occupancy trends, rental yields, and how your listings perform across markets.</p>
                </div>
                <div className="flex gap-3">
                    {/* Year Selector */}
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
                    title="Active Properties"
                    value={stats?.activeProperties || 0}
                    icon={Building2}
                    trend="+0%" 
                    color="text-blue-600"
                />
                <StatCard
                    title="New Properties"
                    value={stats?.newProperties || 0}
                    icon={FilePlus}
                    trend="+0%"
                    color="text-green-600"
                />
                <StatCard
                    title="Total Sold"
                    value={stats?.totalSold || 0}
                    icon={ShoppingCart}
                    trend="+0%"
                    color="text-orange-600"
                />
                <StatCard
                    title="Total Rented"
                    value={stats?.totalRented || 0}
                    icon={Key}
                    trend="+0%"
                    color="text-purple-600"
                />
            </div>

            {/* 3. Charts Grid */}
            <div className="space-y-6">

                {/* Row 1: Total Properties (Area Chart) */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Total properties listed
                    </h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Properties" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Row 2: Two Columns (Sold & Rented) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Total Sold (Bar Chart) */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> Total sold
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} interval={1} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="sold" fill="#f97316" radius={[4, 4, 0, 0]} name="Sold" barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Total Rented (Bar Chart) */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span> Total rented
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} interval={1} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="rented" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Rented" barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Row 3: Specific Searched Target (Pie Chart + List) */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Most Searched Targets
                        </h3>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        {/* Chart Area (Pie) */}
                        <div className="w-full md:w-1/2 h-64">
                            {targetData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={targetData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {targetData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No data available</div>
                            )}
                        </div>

                        {/* List View */}
                        <div className="w-full md:w-1/2 flex flex-col gap-3">
                            {targetData.map((target, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                        <span className="text-sm font-medium text-gray-700">{target.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{target.value} searches</span>
                                </div>
                            ))}
                            {targetData.length === 0 && <p className="text-gray-500 text-sm italic">No search targets recorded yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

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