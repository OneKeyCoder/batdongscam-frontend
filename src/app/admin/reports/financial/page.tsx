'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LogOut, ChevronDown, DollarSign, FileText, PieChart, TrendingUp, Loader2 } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { reportService, FinancialStats } from '@/lib/api/services/statistic-report.service';

// --- HELPER FUNCTIONS ---

const formatCurrency = (val: number | string | undefined | any) => {
    if (val === undefined || val === null) return '0';
    const num = Number(val);
    if (isNaN(num)) return '0';
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    return num.toLocaleString();
};

// --- HELPER COMPONENTS ---

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-200 p-3 rounded shadow-lg text-xs z-50">
                <p className="font-bold mb-1 text-gray-700">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.fill || entry.color }} className="font-medium">
                        {entry.name}: {formatCurrency(entry.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

function StatCard({ title, value, icon: Icon, trend, color }: any) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-600">{title}</span>
                <Icon className={`w-5 h-5 text-gray-400`} />
            </div>
            <div className="flex flex-col">
                <span className={`text-2xl font-bold ${color}`}>{value}</span>
                {trend && (
                    <span className="text-xs font-medium text-gray-400 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {trend}
                    </span>
                )}
            </div>
        </div>
    )
}

// --- MAIN COMPONENT ---

export default function FinancialReportPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [stats, setStats] = useState<FinancialStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch API
    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await reportService.getFinancialStats(year);
                setStats(res);
            } catch (error) {
                console.error("Failed to fetch financial stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [year]);

    // --- DATA PROCESSING ---

    // 1. Monthly Chart Data (Có Mock Data nếu API trả về 0)
    const chartData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Kiểm tra xem dữ liệu thật có trống không
        const hasData = stats && Object.values(stats.totalRevenueChart || {}).some(v => v > 0);

        return months.map((monthName, index) => {
            const m = index + 1;

            let revenue = stats?.totalRevenueChart?.[m] || 0;
            let contracts = stats?.totalContractsChart?.[m] || 0;
            let salary = stats?.agentSalaryChart?.[m] || 0;

            // [MOCK DATA] Nếu không có dữ liệu thật, tự sinh số để demo UI đẹp
            if (!hasData) {
                revenue = Math.floor(Math.random() * 5000000000) + 1000000000;
                contracts = Math.floor(Math.random() * 20) + 5;
                salary = Math.floor(Math.random() * 500000000) + 50000000;
            }

            return {
                name: monthName,
                revenue,
                contracts,
                salary
            };
        });
    }, [stats]);

    // 2. Revenue Targets (Có Mock Data và Fix tên dài)
    const targetData = useMemo(() => {
        let targets: any[] = [];

        if (stats?.targetRevenueChart) {
            targets = Object.keys(stats.targetRevenueChart).map(key => {
                const monthCounts = stats.targetRevenueChart[key];
                const totalAmount = Object.values(monthCounts).reduce((a, b) => a + b, 0);

                // Format tên cho đẹp
                const formattedName = key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
                return { name: formattedName, value: totalAmount };
            });
        }

        // Lọc bỏ các mục có giá trị 0
        targets = targets.filter(t => t.value > 0);

        // [MOCK DATA] Nếu list trống trơn, fake data mẫu
        if (targets.length === 0) {
            targets = [
                { name: "Phường Bến Nghé, Quận 1", value: 8500000000 },
                { name: "Phường Thảo Điền, TP Thủ Đức", value: 6200000000 },
                { name: "Phường 22, Quận Bình Thạnh", value: 4800000000 },
                { name: "Phường Tân Phong, Quận 7", value: 3100000000 },
                { name: "Căn hộ cao cấp (Luxury)", value: 2500000000 },
            ];
        }

        return targets.sort((a, b) => b.value - a.value).slice(0, 5);
    }, [stats]);

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

    if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-300">

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Financial Report</h2>
                    <p className="text-sm text-gray-500">Get a clear picture of your business finances.</p>
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

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats?.totalRevenue || 0)}
                    icon={DollarSign}
                    trend="+0%"
                    color="text-emerald-600"
                />
                <StatCard
                    title="Tax"
                    value={formatCurrency(stats?.tax || 0)}
                    icon={FileText}
                    trend="+0%"
                    color="text-blue-600"
                />
                <StatCard
                    title="Net Profit"
                    value={formatCurrency(stats?.netProfit || 0)}
                    icon={PieChart}
                    trend="+0%"
                    color="text-purple-600"
                />
                <StatCard
                    title="Avg Rating"
                    value={`${stats?.avgRating?.toFixed(1) || 0} (${stats?.totalRates || 0})`}
                    icon={TrendingUp}
                    trend="+0%"
                    color="text-orange-600"
                />
            </div>

            {/* Charts Grid */}
            <div className="space-y-6">

                {/* Row 1: Total Revenue */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Total Revenue
                    </h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => formatCurrency(val)} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Row 2: Contracts & Salary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span> Total Contracts
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} interval={1} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="contracts" fill="#2563eb" radius={[4, 4, 0, 0]} name="Contracts" barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full bg-purple-600 inline-block"></span> Agent Salary Payout
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} interval={1} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => formatCurrency(val)} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="salary" fill="#9333ea" radius={[4, 4, 0, 0]} name="Salary" barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Row 3: Revenue Targets */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> Revenue Sources (Targets)
                    </h3>

                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        {/* Pie Chart */}
                        <div className="w-full md:w-1/2 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
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
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    {/* [FIX] Bỏ Legend mặc định của Recharts để tránh đè chữ */}
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Custom List UI bên phải */}
                        <div className="w-full md:w-1/2 flex flex-col gap-3">
                            {targetData.map((target, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                        {/* [FIX] Thêm truncate để cắt bớt tên dài */}
                                        <span className="text-sm font-medium text-gray-700 truncate" title={target.name}>
                                            {target.name}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 shrink-0 ml-2">
                                        {formatCurrency(target.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}