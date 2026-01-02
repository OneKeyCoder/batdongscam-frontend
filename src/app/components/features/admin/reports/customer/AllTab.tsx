'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown, Loader2 } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import Modal from '@/app/components/ui/Modal';
import LocationPicker from '@/app/components/LocationPicker';
import CustomerTable from './CustomerTable';
import CustomerAdvancedSearch, { LocationSelection } from './CustomerAdvancedSearch';
import { reportService, CustomerStats } from '@/lib/api/services/statistic-report.service';
import { CustomerFilters } from '@/lib/api/services/account.service';

// --- HELPER FUNCTIONS ---
const formatCurrency = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    return val.toLocaleString();
};

const CustomTooltip = ({ active, payload, label, isCurrency }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-200 p-3 rounded shadow-lg text-xs z-50">
                <p className="font-bold mb-1 text-gray-700">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.fill || entry.color }} className="font-medium">
                        {entry.name}: {isCurrency ? formatCurrency(entry.value) : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function AllTab() {
    const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
    const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);

    // State
    const [locations, setLocations] = useState<LocationSelection[]>([]);
    const [tableFilters, setTableFilters] = useState<CustomerFilters>({});
    const [keyword, setKeyword] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());

    // Stats
    const [stats, setStats] = useState<CustomerStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // Fetch Stats
    useEffect(() => {
        const fetchStats = async () => {
            setLoadingStats(true);
            try {
                const res = await reportService.getCustomerStats(year);
                setStats(res);
            } catch (error) { console.error(error); }
            finally { setLoadingStats(false); }
        };
        fetchStats();
    }, [year]);

    // --- DATA PROCESSING FOR CHARTS ---
    const chartData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.map((monthName, index) => {
            const m = index + 1;
            return {
                name: monthName,
                customers: stats?.totalCustomers?.[m] || 0,
                spending: stats?.totalSpending?.[m] || 0,
                avg: stats?.avgSpendingPerCustomer?.[m] || 0,
            };
        });
    }, [stats]);

    const tierData = useMemo(() => {
        if (!stats?.tierDistribution) return [];
        const getTierCount = (tier: string) => {
            const tierRec = stats.tierDistribution[tier as keyof typeof stats.tierDistribution];
            return Object.values(tierRec || {}).reduce((a, b) => a + b, 0);
        };

        return [
            { name: 'Platinum', value: getTierCount('PLATINUM') },
            { name: 'Gold', value: getTierCount('GOLD') },
            { name: 'Silver', value: getTierCount('SILVER') },
            { name: 'Bronze', value: getTierCount('BRONZE') },
        ].filter(i => i.value > 0);
    }, [stats]);

    const TIER_COLORS = ['#ec4899', '#eab308', '#9ca3af', '#b45309'];

    // Filter Handlers
    const handleSearch = () => setTableFilters(prev => ({ ...prev, name: keyword }));
    const handleApplyFilters = (newFilters: CustomerFilters) => {
        setTableFilters(prev => ({ ...prev, ...newFilters }));
        setIsAdvSearchOpen(false);
    };
    const handleReset = () => {
        setLocations([]);
        setTableFilters({});
        setKeyword('');
    };

    const activeFiltersCount = Object.keys(tableFilters).filter(k => tableFilters[k as keyof CustomerFilters] !== undefined && k !== 'name').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            {/* --- CHARTS SECTION --- */}
            <div>
                <div className="flex justify-end mb-4">
                    <div className="relative">
                        <select
                            value={year} onChange={(e) => setYear(Number(e.target.value))}
                            className="appearance-none pl-3 pr-8 py-1.5 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 cursor-pointer shadow-sm focus:outline-none focus:border-red-500"
                        >
                            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                {loadingStats ? (
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300"><Loader2 className="w-8 h-8 text-gray-400 animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Chart 1: Total Customers (Area) */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Total Customers
                            </h3>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCust" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={5} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="customers" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCust)" name="Customers" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Chart 2: Tier Distribution (Pie) */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                                <span className="w-3 h-3 rounded-full bg-pink-500 inline-block"></span> Tier Distribution
                            </h3>
                            <div className="h-48 w-full">
                                {tierData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={tierData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                                {tierData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={TIER_COLORS[index % TIER_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : <div className="flex items-center justify-center h-full text-gray-400 text-xs">No data</div>}
                            </div>
                        </div>

                        {/* Chart 3: Total Spending (Bar) */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Total Spending
                            </h3>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={5} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => `${val / 1000000}M`} />
                                        <Tooltip content={<CustomTooltip isCurrency />} />
                                        <Bar dataKey="spending" fill="#10b981" radius={[4, 4, 0, 0]} name="Spending" barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Chart 4: Average Spending (Line) */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                                <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> Avg Spending per Customer
                            </h3>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorAvgCust" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={5} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => `${val / 1000000}M`} />
                                        <Tooltip content={<CustomTooltip isCurrency />} />
                                        <Area type="monotone" dataKey="avg" stroke="#f97316" strokeWidth={2} fill="url(#colorAvgCust)" name="Average" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- FILTER & TABLE --- */}
            <div className="space-y-4">
                <div className="relative w-full flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text" placeholder="Search Customer's name"
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white text-sm"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg transition-colors text-sm"
                    >
                        Search
                    </button>
                </div>

                <div>
                    <button
                        onClick={() => setIsAdvSearchOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all shadow-sm"
                    >
                        <Filter className="w-4 h-4" /> Advanced Search
                        {activeFiltersCount > 0 && <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">{activeFiltersCount}</span>}
                    </button>
                </div>

                <CustomerTable externalFilters={tableFilters} />
            </div>

            <Modal isOpen={isAdvSearchOpen} onClose={() => { if (!isLocPickerOpen) setIsAdvSearchOpen(false); }} title="Advanced Search">
                <CustomerAdvancedSearch
                    selectedLocations={locations}
                    onRemoveLocation={(loc) => setLocations(prev => prev.filter(l => l.id !== loc.id))}
                    onOpenLocationPicker={() => setIsLocPickerOpen(true)}
                    onApply={handleApplyFilters}
                    onReset={handleReset}
                />
            </Modal>
            <LocationPicker isOpen={isLocPickerOpen} onClose={() => setIsLocPickerOpen(false)} initialSelected={locations} onConfirm={(newLocs) => { setLocations(newLocs); setIsLocPickerOpen(false); }} />
        </div>
    );
}