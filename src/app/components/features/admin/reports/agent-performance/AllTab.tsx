'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown, TrendingUp, Users, Star, Activity, Loader2 } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';

import Modal from '@/app/components/ui/Modal';
import LocationPicker from '@/app/components/LocationPicker';
import AgentPerformanceTable from './AgentPerformanceTable';
import AgentPerformanceAdvancedSearch, { LocationSelection } from './AgentPerformanceAdvancedSearch';
import { reportService, AgentPerformanceStats } from '@/lib/api/services/statistic-report.service';
import { SaleAgentFilters } from '@/lib/api/services/account.service';

export default function AllTab() {
    const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
    const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);

    const [locations, setLocations] = useState<LocationSelection[]>([]);
    const [tableFilters, setTableFilters] = useState<SaleAgentFilters>({});
    const [keyword, setKeyword] = useState('');

    const [year, setYear] = useState(new Date().getFullYear());
    const [stats, setStats] = useState<AgentPerformanceStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoadingStats(true);
            try {
                const res = await reportService.getAgentPerformanceStats(year);
                setStats(res);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, [year]);

    const handleApplyFilters = (newFilters: SaleAgentFilters) => {
        setTableFilters(newFilters);
        setIsAdvSearchOpen(false);
    };

    const handleSearch = () => {
        setTableFilters(prev => ({ ...prev, name: keyword }));
    };

    const chartData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.map((monthName, index) => {
            const monthNum = index + 1;
            return {
                name: monthName,
                totalAgents: stats?.totalAgents?.[monthNum] || 0,
                totalRates: stats?.totalRates?.[monthNum] || 0,
                avgRating: stats?.avgRating?.[monthNum] || 0,
                satisfaction: stats?.customerSatisfaction?.[monthNum] || 0,
            };
        });
    }, [stats]);

    const totalAgentsCurrent = chartData.reduce((acc, curr) => acc + curr.totalAgents, 0);
    const activeFiltersCount = Object.keys(tableFilters).filter(k => tableFilters[k as keyof SaleAgentFilters] !== undefined).length;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-200 p-3 rounded shadow-lg text-xs z-50">
                    <p className="font-bold mb-1 text-gray-700">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="font-medium">
                            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            {/* 1. CHARTS SECTION */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <div></div>
                    <div className="relative">
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:border-red-500 cursor-pointer shadow-sm hover:bg-gray-50"
                        >
                            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                {loadingStats ? (
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-6">

                        {/* Chart 1: Total Agents (RED Area Chart) */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <Users className="w-5 h-5 text-gray-700" />
                                <h3 className="text-base font-bold text-gray-900">Total Agents</h3>
                            </div>

                            <div className="w-full h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorAgents" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="totalAgents"
                                            stroke="#ef4444"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorAgents)"
                                            name="Agents"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Left: Rating (RED Bar Chart) - Đã đổi màu fill */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
                                <div className="flex items-center gap-2 mb-6">
                                    <Star className="w-5 h-5 text-gray-700" />
                                    <h3 className="text-base font-bold text-gray-900">Total rates & Average Rating</h3>
                                </div>
                                <div className="w-full h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} interval={0} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            {/* SỬA MÀU: fill="#ef4444" (Đỏ) */}
                                            <Bar dataKey="totalRates" radius={[4, 4, 0, 0]} name="Rates" barSize={20} fill="#ef4444" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Right: Customer Satisfaction (RED Area Chart) - Đã đổi màu stroke & fill */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
                                <div className="flex items-center gap-2 mb-6">
                                    <Activity className="w-5 h-5 text-gray-700" />
                                    <h3 className="text-base font-bold text-gray-900">Average Customer Satisfaction</h3>
                                </div>
                                <div className="w-full h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                            <defs>
                                                {/* SỬA MÀU: Gradient Đỏ */}
                                                <linearGradient id="colorSatRed" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} interval={0} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} unit="%" />
                                            <Tooltip content={<CustomTooltip />} />
                                            {/* SỬA MÀU: stroke="#dc2626" (Đỏ đậm) */}
                                            <Area
                                                type="monotone"
                                                dataKey="satisfaction"
                                                stroke="#dc2626"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorSatRed)"
                                                name="Satisfaction"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. SEARCH & FILTER SECTION */}
            <div className="pt-2 pb-2">
                <div className="flex flex-col gap-4">
                    <div className="flex w-full">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Agent's name or code"
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-l-lg border-r-0 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white text-sm"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-r-lg text-sm transition-colors"
                        >
                            Search
                        </button>
                    </div>

                    <div>
                        <button
                            onClick={() => setIsAdvSearchOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-bold rounded-lg text-xs text-gray-700 transition-all shadow-sm"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Advanced Search
                            {activeFiltersCount > 0 && (
                                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. TABLE */}
            <AgentPerformanceTable externalFilters={tableFilters} />

            {/* Modals */}
            <Modal isOpen={isAdvSearchOpen} onClose={() => { if (!isLocPickerOpen) setIsAdvSearchOpen(false); }} title="Advanced Search">
                <AgentPerformanceAdvancedSearch
                    selectedLocations={locations}
                    onRemoveLocation={(loc) => setLocations(prev => prev.filter(l => l.id !== loc.id))}
                    onOpenLocationPicker={() => setIsLocPickerOpen(true)}
                    onApply={handleApplyFilters}
                    onReset={() => { setLocations([]); setTableFilters({}); }}
                />
            </Modal>

            <LocationPicker
                isOpen={isLocPickerOpen}
                onClose={() => setIsLocPickerOpen(false)}
                initialSelected={locations}
                onConfirm={(newLocs) => { setLocations(newLocs); setIsLocPickerOpen(false); }}
            />
        </div>
    );
}