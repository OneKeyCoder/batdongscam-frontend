'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, RotateCcw, Search, Calendar, Loader2, X } from 'lucide-react';
import { ContractFilters } from '@/lib/api/services/contract.service';
import { accountService } from '@/lib/api/services/account.service';
import { propertyService } from '@/lib/api/services/property.service';

// --- Reusable Async Select Component ---
interface Option {
    value: string;
    label: string;
    subLabel?: string;
}

interface AsyncSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    fetchOptions: (keyword: string) => Promise<Option[]>;
    placeholder?: string;
}

const AsyncSelect = ({ label, value, onChange, fetchOptions, placeholder }: AsyncSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!value) setSelectedLabel('');
    }, [value]);

    const fetchData = async (search: string) => {
        setLoading(true);
        try {
            const data = await fetchOptions(search);
            setOptions(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => fetchData(keyword), 300);
        return () => clearTimeout(timer);
    }, [keyword, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (opt: Option) => {
        onChange(opt.value);
        setSelectedLabel(opt.label);
        setIsOpen(false);
        setKeyword('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setSelectedLabel('');
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
            <div
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white flex items-center justify-between cursor-pointer hover:border-red-400 transition-colors shadow-sm"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-sm ${selectedLabel ? 'text-gray-900 font-medium' : 'text-gray-400'} truncate`}>
                    {selectedLabel || placeholder || 'Select...'}
                </span>
                <div className="flex items-center gap-2">
                    {value && (
                        <div onClick={handleClear} className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-8 pr-2 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                                placeholder="Type to search..."
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {loading ? (
                            <div className="p-4 text-center text-gray-400 text-xs flex justify-center items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                            </div>
                        ) : options.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-xs">No results found.</div>
                        ) : (
                            options.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleSelect(opt)}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-red-50 flex flex-col border-b border-gray-50 last:border-0 transition-colors ${value === opt.value ? 'bg-red-50 text-red-700' : 'text-gray-700'}`}
                                >
                                    <span className="font-medium truncate">{opt.label}</span>
                                    {opt.subLabel && <span className="text-xs text-gray-500 truncate">{opt.subLabel}</span>}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

interface SearchProps {
    onApply: (filters: ContractFilters) => void;
    onReset: () => void;
}

export default function ContractAdvancedSearch({ onApply, onReset }: SearchProps) {
    const [status, setStatus] = useState('All');
    const [contractType, setContractType] = useState('All');

    const [startDateFrom, setStartDateFrom] = useState('');
    const [startDateTo, setStartDateTo] = useState('');
    const [endDateFrom, setEndDateFrom] = useState('');
    const [endDateTo, setEndDateTo] = useState('');

    const [customerId, setCustomerId] = useState('');
    const [agentId, setAgentId] = useState('');
    const [propertyId, setPropertyId] = useState('');

    // Fetchers
    const fetchCustomers = async (keyword: string): Promise<Option[]> => {
        try {
            const res = await accountService.getAllCustomers({ name: keyword, page: 1, limit: 10 });
            return res.data.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }));
        } catch { return []; }
    };

    const fetchAgents = async (keyword: string): Promise<Option[]> => {
        try {
            const res = await accountService.getAllSaleAgents({ name: keyword, page: 1, limit: 10 });
            return res.data.map(a => ({ value: a.id, label: `${a.firstName} ${a.lastName}`, subLabel: `Code: ${a.employeeCode || 'N/A'}` }));
        } catch { return []; }
    };

    const fetchProperties = async (keyword: string): Promise<Option[]> => {
        try {
            const res = await propertyService.getPropertyCards({ search: keyword, page: 1, limit: 10 } as any);
            return res.data.map(p => ({
                value: p.id,
                label: p.title,
                subLabel: p.location ? `${p.location}` : undefined
            }));
        } catch { return []; }
    };

    const handleApply = () => {
        const filters: ContractFilters = { page: 1, size: 10, search: '' };

        if (status !== 'All') filters.statuses = [status as any];
        if (contractType !== 'All') filters.contractTypes = [contractType as any];

        if (startDateFrom) filters.startDateFrom = startDateFrom;
        if (startDateTo) filters.startDateTo = startDateTo;
        if (endDateFrom) filters.endDateFrom = endDateFrom;
        if (endDateTo) filters.endDateTo = endDateTo;

        if (customerId) filters.customerId = customerId;
        if (agentId) filters.agentId = agentId;
        if (propertyId) filters.propertyId = propertyId;

        onApply(filters);
    };

    const handleResetInternal = () => {
        setStatus('All');
        setContractType('All');
        setStartDateFrom('');
        setStartDateTo('');
        setEndDateFrom('');
        setEndDateTo('');
        setCustomerId('');
        setAgentId('');
        setPropertyId('');
        onReset();
    };

    return (
        <div className="flex flex-col h-full">
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Status & Type */}
                    <SelectInput
                        label="Contract status"
                        value={status}
                        onChange={setStatus}
                        options={[
                            { label: 'All Statuses', value: 'All' },
                            { label: 'Draft', value: 'DRAFT' },
                            { label: 'Pending Sign', value: 'PENDING_SIGNING' },
                            { label: 'Active', value: 'ACTIVE' },
                            { label: 'Completed', value: 'COMPLETED' },
                            { label: 'Cancelled', value: 'CANCELLED' }
                        ]}
                    />
                    <SelectInput
                        label="Contract type"
                        value={contractType}
                        onChange={setContractType}
                        options={[
                            { label: 'All Types', value: 'All' },
                            { label: 'Purchase', value: 'PURCHASE' },
                            { label: 'Rental', value: 'RENTAL' }
                        ]}
                    />

                    {/* Entities Group */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-gray-50/50 rounded-xl border border-gray-200">
                        {/* FIX: Property chiếm full chiều ngang (col-span-2) 
                            để hiển thị tên dài tốt hơn 
                        */}
                        <div className="md:col-span-2">
                            <AsyncSelect
                                label="Find Property"
                                placeholder="Search by property title..."
                                value={propertyId}
                                onChange={setPropertyId}
                                fetchOptions={fetchProperties}
                            />
                        </div>

                        <AsyncSelect
                            label="Filter by Customer"
                            placeholder="Search customer name..."
                            value={customerId}
                            onChange={setCustomerId}
                            fetchOptions={fetchCustomers}
                        />
                        <AsyncSelect
                            label="Filter by Agent"
                            placeholder="Search agent name/code..."
                            value={agentId}
                            onChange={setAgentId}
                            fetchOptions={fetchAgents}
                        />
                    </div>

                    {/* Date Ranges */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-3">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</span>
                            <div className="grid grid-cols-2 gap-2">
                                <DateInput value={startDateFrom} onChange={setStartDateFrom} placeholder="From" />
                                <DateInput value={startDateTo} onChange={setStartDateTo} placeholder="To" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">End Date</span>
                            <div className="grid grid-cols-2 gap-2">
                                <DateInput value={endDateFrom} onChange={setEndDateFrom} placeholder="From" />
                                <DateInput value={endDateTo} onChange={setEndDateTo} placeholder="To" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                <button
                    onClick={handleResetInternal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                <button
                    onClick={handleApply}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                >
                    <Search className="w-3.5 h-3.5" /> Apply Filter
                </button>
            </div>
        </div>
    );
}

// Sub-components
const SelectInput = ({ label, value, onChange, options }: any) => (
    <div>
        <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
        <div className="relative">
            <select
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-white text-sm focus:outline-none focus:border-red-500 cursor-pointer hover:border-gray-400 transition-colors shadow-sm"
                value={value}
                onChange={e => onChange(e.target.value)}
            >
                {options.map((o: any) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
    </div>
);

const DateInput = ({ value, onChange, placeholder }: any) => {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div
            className="relative w-full border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-red-500 transition-colors shadow-sm group"
            onClick={() => ref.current?.showPicker()}
        >
            <div className="flex items-center justify-between px-3 py-2.5">
                <span className={`text-sm ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {value ? new Date(value).toLocaleDateString('en-GB') : placeholder}
                </span>
                <Calendar className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 transition-colors" />
            </div>
            <input
                ref={ref}
                type="date"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};