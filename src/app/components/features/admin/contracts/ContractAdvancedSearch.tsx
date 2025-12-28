'use client';

import React, { useState } from 'react';
import { ChevronDown, RotateCcw, Search, Calendar } from 'lucide-react';
import { ContractFilters } from '@/lib/api/services/contract.service';

interface SearchProps {
    onApply: (filters: ContractFilters) => void;
    onReset: () => void;
}

export default function ContractAdvancedSearch({ onApply, onReset }: SearchProps) {

    // Selects
    const [status, setStatus] = useState('All');
    const [contractType, setContractType] = useState('All');

    // Dates
    const [startDateFrom, setStartDateFrom] = useState('');
    const [startDateTo, setStartDateTo] = useState('');
    const [endDateFrom, setEndDateFrom] = useState('');
    const [endDateTo, setEndDateTo] = useState('');

    // IDs 
    const [customerId, setCustomerId] = useState('');
    const [agentId, setAgentId] = useState('');
    const [propertyId, setPropertyId] = useState('');

    const handleApply = () => {
        const filters: ContractFilters = {};

        // Status & Type
        if (status !== 'All') filters.statuses = [status as any];
        if (contractType !== 'All') filters.contractTypes = [contractType as any];

        // Dates - Start Date Range
        if (startDateFrom) filters.startDateFrom = startDateFrom;
        if (startDateTo) filters.startDateTo = startDateTo;

        // Dates - End Date Range
        if (endDateFrom) filters.endDateFrom = endDateFrom;
        if (endDateTo) filters.endDateTo = endDateTo;

        // IDs (nếu có)
        if (customerId.trim()) filters.customerId = customerId.trim();
        if (agentId.trim()) filters.agentId = agentId.trim();
        if (propertyId.trim()) filters.propertyId = propertyId.trim();

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
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
                <p className="text-sm text-gray-500">Filter contracts by multiple criteria</p>

                <div className="grid grid-cols-2 gap-4">

                    {/* Row 1: Status & Type */}
                    <SelectInput
                        label="Contract status"
                        value={status}
                        onChange={setStatus}
                        options={['All', 'DRAFT', 'PENDING_SIGNING', 'ACTIVE', 'COMPLETED', 'CANCELLED']}
                    />
                    <SelectInput
                        label="Contract type"
                        value={contractType}
                        onChange={setContractType}
                        options={['All', 'PURCHASE', 'RENTAL']}
                    />

                    {/* Row 2: Start Date Range */}
                    <DateInput
                        label="Start date from"
                        value={startDateFrom}
                        onChange={setStartDateFrom}
                        placeholder="Select date"
                    />
                    <DateInput
                        label="Start date to"
                        value={startDateTo}
                        onChange={setStartDateTo}
                        placeholder="Select date"
                    />

                    {/* Row 3: End Date Range */}
                    <DateInput
                        label="End date from"
                        value={endDateFrom}
                        onChange={setEndDateFrom}
                        placeholder="Select date"
                    />
                    <DateInput
                        label="End date to"
                        value={endDateTo}
                        onChange={setEndDateTo}
                        placeholder="Select date"
                    />

                    <TextInput
                        label="Customer ID"
                        value={customerId}
                        onChange={setCustomerId}
                        placeholder="Enter customer ID"
                    />
                    <TextInput
                        label="Agent ID"
                        value={agentId}
                        onChange={setAgentId}
                        placeholder="Enter agent ID"
                    />
                    <TextInput
                        label="Property ID"
                        value={propertyId}
                        onChange={setPropertyId}
                        placeholder="Enter property ID"
                    />

                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    onClick={handleResetInternal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                >
                    <RotateCcw className="w-3 h-3" /> Reset All
                </button>
                <button
                    onClick={handleApply}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm"
                >
                    <Search className="w-3 h-3" /> Apply
                </button>
            </div>
        </div>
    );
}


const SelectInput = ({ label, value, onChange, options, optionsMap }: any) => (
    <div>
        <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
        <div className="relative">
            <select
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500 cursor-pointer"
                value={value}
                onChange={e => onChange(e.target.value)}
            >
                {optionsMap ?
                    optionsMap.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>) :
                    options?.map((o: string) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)
                }
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
    </div>
);

const TextInput = ({ label, value, onChange, placeholder = "---" }: any) => (
    <div>
        <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
        <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
);

const DateInput = ({ label, value, onChange, placeholder }: any) => {
    const ref = React.useRef<HTMLInputElement>(null);
    const displayValue = value ? new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

    return (
        <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
            <div
                className="relative w-full border border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:border-red-500 transition-colors"
                onClick={() => ref.current?.showPicker()}
            >
                <div className="flex items-center justify-between px-3 py-2.5">
                    <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                        {displayValue || placeholder}
                    </span>
                    <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <input
                    ref={ref}
                    type="date"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
};