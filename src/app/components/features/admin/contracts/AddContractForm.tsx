'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Search, ChevronDown, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { contractService, CreateContractRequest } from '@/lib/api/services/contract.service';
import { accountService } from '@/lib/api/services/account.service';
import { propertyService } from '@/lib/api/services/property.service';

// --- Helper: Async Searchable Select ---
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
    required?: boolean;
}

const AsyncSelect = ({ label, value, onChange, fetchOptions, placeholder, required }: AsyncSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value && !selectedLabel) fetchData('');
    }, [value]);

    const fetchData = async (search: string) => {
        setLoading(true);
        try {
            const data = await fetchOptions(search);
            setOptions(data);
            if (value) {
                const found = data.find(o => o.value === value);
                if (found) setSelectedLabel(found.label);
            }
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

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && '*'}</label>
            <div
                className="w-full border border-gray-300 rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer bg-white hover:border-red-400 focus-within:ring-1 focus-within:ring-red-500 focus-within:border-red-500"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-400'} truncate`}>{selectedLabel || placeholder || 'Select...'}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-8 pr-2 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-red-500"
                                placeholder="Type to search..."
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {loading ? <div className="p-4 text-center text-gray-400 text-xs flex justify-center"><Loader2 className="w-4 h-4 animate-spin" /></div> : options.length === 0 ? <div className="p-4 text-center text-gray-400 text-xs">No results found.</div> : (
                            options.map(opt => (
                                <button key={opt.value} type="button" onClick={() => handleSelect(opt)} className={`w-full text-left px-3 py-2 text-sm hover:bg-red-50 flex flex-col border-b border-gray-50 last:border-0 ${value === opt.value ? 'bg-red-50 text-red-700' : 'text-gray-700'}`}>
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

// --- Main Form ---

interface AddContractFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

type FullContractRequest = CreateContractRequest & {
    commissionAmount: number;
    advancePaymentAmount: number;
    installmentAmount: number;
    progressMilestone: number;
};

export default function AddContractForm({ onSuccess, onCancel }: AddContractFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<FullContractRequest>({
        propertyId: '',
        customerId: '',
        agentId: '',
        contractType: 'PURCHASE', 
        startDate: '',
        endDate: '',
        contractPaymentType: 'MORTGAGE',

        // Financials
        totalContractAmount: 0,
        depositAmount: 0,
        advancePaymentAmount: 0,
        installmentAmount: 0,   
        commissionAmount: 0,    

        // Configs
        progressMilestone: 0,    
        latePaymentPenaltyRate: 0.05,

        specialTerms: '',
        specialConditions: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) numValue = 0; 
        setFormData(prev => ({ ...prev, [name]: numValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Validate Required Fields
            if (!formData.propertyId || !formData.customerId || !formData.agentId || !formData.startDate || !formData.endDate) {
                throw new Error("Please fill in all required fields (IDs and Dates).");
            }

            // 2. Validate Date Logic
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (start >= end) {
                throw new Error("Start Date must be before End Date.");
            }

            await contractService.createContract(formData as any);
            onSuccess();
        } catch (err: any) {
            console.error("Failed to create contract:", err);
            setError(err.response?.data?.message || err.message || "Failed to create contract.");
        } finally {
            setLoading(false);
        }
    };

    // --- API Fetchers ---
    const fetchCustomers = async (keyword: string): Promise<Option[]> => {
        try {
            const res = await accountService.getAllCustomers({ name: keyword, page: 1, limit: 10 });
            return res.data.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}`, subLabel: c.location || 'No address' }));
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
                subLabel: `${p.location || 'VN'} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price || 0)}`
            }));
        } catch { return []; }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 px-1 pb-2">
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 font-medium">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {/* Group 1: General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-lg px-3 py-2 font-bold text-xs select-none uppercase tracking-wider">
                        Draft
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
                    <select
                        name="contractType"
                        value={formData.contractType}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-red-500 focus:border-red-500 bg-white text-sm"
                    >
                        <option value="PURCHASE">Purchase (Mua bán)</option>
                        <option value="RENTAL">Rental (Cho thuê)</option>
                    </select>
                </div>
            </div>

            {/* Group 2: Entities Selection */}
            <div className="space-y-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <AsyncSelect
                    label="Property"
                    placeholder="Search property..."
                    value={formData.propertyId}
                    onChange={(val) => setFormData(prev => ({ ...prev, propertyId: val }))}
                    fetchOptions={fetchProperties}
                    required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AsyncSelect
                        label="Customer"
                        placeholder="Search customer..."
                        value={formData.customerId}
                        onChange={(val) => setFormData(prev => ({ ...prev, customerId: val }))}
                        fetchOptions={fetchCustomers}
                        required
                    />
                    <AsyncSelect
                        label="Agent"
                        placeholder="Search agent..."
                        value={formData.agentId}
                        onChange={(val) => setFormData(prev => ({ ...prev, agentId: val }))}
                        fetchOptions={fetchAgents}
                        required
                    />
                </div>
            </div>

            {/* Group 3: Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <div className="relative">
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            onClick={(e) => e.currentTarget.showPicker()}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:ring-red-500 focus:border-red-500 cursor-pointer text-sm"
                            required
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                    <div className="relative">
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            onClick={(e) => e.currentTarget.showPicker()}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:ring-red-500 focus:border-red-500 cursor-pointer text-sm"
                            required
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Group 4: Financials  */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" /> Financial Details
                </h4>

                {/* Configs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                        <select
                            name="contractPaymentType"
                            value={formData.contractPaymentType}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-red-500 focus:border-red-500 bg-white text-sm"
                        >
                            <option value="MORTGAGE">Mortgage</option>
                            <option value="MONTHLY_RENT">Monthly Rent</option>
                            <option value="PAID_IN_FULL">Paid In Full</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Late Penalty (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                name="latePaymentPenaltyRate"
                                value={(formData.latePaymentPenaltyRate * 100).toFixed(1)}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setFormData(prev => ({ ...prev, latePaymentPenaltyRate: (val || 0) / 100 }));
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-red-500 focus:border-red-500 text-sm pr-8"
                                placeholder="5"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Progress Milestone</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            name="progressMilestone"
                            value={formData.progressMilestone}
                            onChange={handleNumberChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-red-500 focus:border-red-500 text-sm"
                            placeholder="e.g. 0.5"
                        />
                    </div>
                </div>

                {/* Core Amounts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Contract Value (VND)</label>
                        <input
                            type="number"
                            min="0"
                            name="totalContractAmount"
                            value={formData.totalContractAmount}
                            onChange={handleNumberChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-red-500 focus:border-red-500 text-sm font-bold text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount (VND)</label>
                        <input
                            type="number"
                            min="0"
                            name="depositAmount"
                            value={formData.depositAmount}
                            onChange={handleNumberChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-red-500 focus:border-red-500 text-sm"
                        />
                    </div>
                </div>

                {/* Extra Amounts (Required by Schema) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Advance Payment (VND)</label>
                        <input
                            type="number"
                            min="0"
                            name="advancePaymentAmount"
                            value={formData.advancePaymentAmount}
                            onChange={handleNumberChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-red-500 focus:border-red-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Installment Amt (VND)</label>
                        <input
                            type="number"
                            min="0"
                            name="installmentAmount"
                            value={formData.installmentAmount}
                            onChange={handleNumberChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-red-500 focus:border-red-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Commission (VND)</label>
                        <input
                            type="number"
                            min="0"
                            name="commissionAmount"
                            value={formData.commissionAmount}
                            onChange={handleNumberChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-bold text-blue-700 bg-blue-50"
                        />
                    </div>
                </div>
            </div>

            {/* Group 5: Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Terms</label>
                    <textarea
                        name="specialTerms"
                        value={formData.specialTerms}
                        onChange={handleChange}
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-red-500 focus:border-red-500 text-sm"
                        placeholder="Contract terms..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Conditions</label>
                    <textarea
                        name="specialConditions"
                        value={formData.specialConditions}
                        onChange={handleChange}
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-red-500 focus:border-red-500 text-sm"
                        placeholder="Handover conditions..."
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm flex items-center gap-2"
                    disabled={loading}
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Contract
                </button>
            </div>
        </form>
    );
}