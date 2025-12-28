'use client';
import React, { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { AdminViolationFilters } from '@/lib/api/services/violation.service';

interface Props {
    onApply: (filters: AdminViolationFilters) => void;
    onReset: () => void;
}

const TYPES = [
    { label: 'Fraudulent Listing', value: 'FRAUDULENT_LISTING' },
    { label: 'Misrepresentation', value: 'MISREPRESENTATION_OF_PROPERTY' },
    { label: 'Spam / Duplicate', value: 'SPAM_OR_DUPLICATE_LISTING' },
    { label: 'Inappropriate Content', value: 'INAPPROPRIATE_CONTENT' },
    { label: 'Policy Violation', value: 'NON_COMPLIANCE_WITH_TERMS' },
    { label: 'Hidden Info', value: 'FAILURE_TO_DISCLOSE_INFORMATION' },
    { label: 'Harassment', value: 'HARASSMENT' },
    { label: 'Scam Attempt', value: 'SCAM_ATTEMPT' }
];

const STATUSES = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Reported', value: 'REPORTED' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Dismissed', value: 'DISMISSED' }
];

export default function ViolationAdvancedSearch({ onApply, onReset }: Props) {
    const [status, setStatus] = useState('All');
    const [type, setType] = useState('All');

    const handleApply = () => {
        const filters: AdminViolationFilters = {};
        
        if (status !== 'All') {
            filters.statuses = [status];
        }
        if (type !== 'All') {
            filters.violationTypes = [type];
        }

        onApply(filters);
    };

    const handleResetInternal = () => {
        setStatus('All');
        setType('All');
        onReset();
    };

    return (
        <div className="flex flex-col h-full">
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4">
                <p className="text-sm text-gray-500">Filter violations by status and type</p>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1.5">Status</label>
                        <div className="relative">
                            <select
                                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500 cursor-pointer"
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                {STATUSES.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1.5">Violation Type</label>
                        <div className="relative">
                            <select
                                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500 cursor-pointer"
                                value={type}
                                onChange={e => setType(e.target.value)}
                            >
                                <option value="All">All Types</option>
                                {TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    onClick={handleResetInternal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                    <RotateCcw className="w-3 h-3" /> Reset All
                </button>
                <button
                    onClick={handleApply}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                >
                    <Search className="w-3 h-3" /> Apply
                </button>
            </div>
        </div>
    );
}