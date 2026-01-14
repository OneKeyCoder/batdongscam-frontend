'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Search, ChevronDown, DollarSign, Calendar, AlertCircle, Package } from 'lucide-react';
import { contractService, CreatePurchaseContractRequest } from '@/lib/api/services/contract.service';
import { accountService } from '@/lib/api/services/account.service';
import { propertyService } from '@/lib/api/services/property.service';

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
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => fetchData(keyword), 300);
        return () => clearTimeout(timer);
    }, [keyword, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div
                className="w-full border border-gray-300 rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer bg-white hover:border-red-400 focus-within:ring-1 focus-within:ring-red-500 focus-within:border-red-500 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-sm truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedLabel || placeholder || 'Select...'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
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

// --- 2. Main Form ---

interface Props {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function AddPurchaseContractForm({ onSuccess, onCancel }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<CreatePurchaseContractRequest>({
        propertyId: '',
        customerId: '',
        agentId: '',
        depositContractId: '',
        propertyValue: 0,
        advancePaymentAmount: 0,
        commissionAmount: 0,
        startDate: '',
        specialTerms: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!formData.propertyId || !formData.customerId || !formData.startDate) {
                throw new Error("Please fill in all required fields (Property, Customer, Start Date).");
            }

            if (formData.propertyValue <= 0) {
                throw new Error("Property value must be greater than zero.");
            }

            if (formData.commissionAmount < 0) {
                throw new Error("Commission amount cannot be negative.");
            }

            if (formData.commissionAmount >= formData.propertyValue) {
                throw new Error("Commission must be less than property value.");
            }

            await contractService.createPurchaseContract(formData);
            onSuccess();
        } catch (err: any) {
            console.error("Failed to create purchase contract:", err);
            setError(err.response?.data?.message || err.message || "Failed to create purchase contract.");
        } finally {
            setLoading(false);
        }
    };

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

    // --- API Fetchers ---
    const fetchCustomers = async (keyword: string) => {
        try {
            const res = await accountService.getAllCustomers({ name: keyword, page: 1, limit: 10 });
            return res.data.map(c => ({
                value: c.id,
                label: `${c.firstName} ${c.lastName}`,
            }));
        } catch { return []; }
    };

    const fetchAgents = async (keyword: string) => {
        try {
            const res = await accountService.getAllSaleAgents({ name: keyword, page: 1, limit: 10 });
            return res.data.map(a => ({
                value: a.id,
                label: `${a.firstName} ${a.lastName}`,
                subLabel: `Code: ${a.employeeCode || 'N/A'}`
            }));
        } catch { return []; }
    };

    const fetchProperties = async (keyword: string) => {
        try {
            const res = await propertyService.getPropertyCards({ search: keyword, page: 1, limit: 10 } as any);
            return res.data.map(p => ({
                value: p.id,
                label: p.title,
                subLabel: `${p.location || 'VN'} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price || 0)}`
            }));
        } catch { return []; }
    };

    const fetchDepositContracts = async (keyword: string) => {
        try {
            const res = await contractService.getDepositContracts({
                search: keyword,
                page: 1,
                size: 10,
                statuses: ['ACTIVE'] 
            });
            return res.data.map(d => ({
                value: d.id,
                label: d.contractNumber,
                subLabel: `${d.propertyTitle} - Deposit: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(d.depositAmount)}`
            }));
        } catch { return []; }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 px-1 pb-2">
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 font-medium animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {/* Info Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                <p className="font-bold mb-1 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Purchase Contract</p>
                <p>Create a final purchase contract. You can link this to an existing Deposit Contract to inherit customer and property details.</p>
            </div>

            {/* Link Deposit Contract (Optional) */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-gray-900">Link Deposit Contract (Optional)</span>
                </div>
                <AsyncSelect
                    label="Search Deposit Contract"
                    placeholder="Search active deposit contract..."
                    value={formData.depositContractId || ''}
                    onChange={(val) => setFormData(prev => ({ ...prev, depositContractId: val }))}
                    fetchOptions={fetchDepositContracts}
                />
                <p className="text-xs text-gray-500 mt-2 ml-1">
                    Linking will validate that the property value matches the agreed price in the deposit contract.
                </p>
            </div>

            {/* Entities Selection */}
            <div className="space-y-4 p-4 bg-gray-50/80 rounded-xl border border-gray-200">
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
                        label="Customer (Buyer)"
                        placeholder="Search customer..."
                        value={formData.customerId}
                        onChange={(val) => setFormData(prev => ({ ...prev, customerId: val }))}
                        fetchOptions={fetchCustomers}
                        required
                    />
                    <AsyncSelect
                        label="Agent"
                        placeholder="Search agent (optional)..."
                        value={formData.agentId || ''}
                        onChange={(val) => setFormData(prev => ({ ...prev, agentId: val }))}
                        fetchOptions={fetchAgents}
                    />
                </div>
            </div>

            {/* Start Date */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <div className="relative">
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        onClick={(e) => e.currentTarget.showPicker()}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:ring-green-500 focus:border-green-500 cursor-pointer text-sm shadow-sm"
                        required
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Financial Details */}
            <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-4 shadow-sm">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
                    <DollarSign className="w-4 h-4 text-green-600" /> Financial Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Property Value (VND) *</label>
                        <input
                            type="number"
                            min="0"
                            name="propertyValue"
                            value={formData.propertyValue}
                            onChange={handleNumberChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500 text-sm font-bold text-green-700 bg-green-50"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Advance Payment (VND)
                        </label>
                        <input
                            type="number"
                            min="0"
                            name="advancePaymentAmount"
                            value={formData.advancePaymentAmount}
                            onChange={handleNumberChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">Paid before paperwork completion.</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Commission Amount (VND)
                    </label>
                    <input
                        type="number"
                        min="0"
                        name="commissionAmount"
                        value={formData.commissionAmount}
                        onChange={handleNumberChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900"
                    />
                </div>
            </div>

            {/* Special Terms */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Terms</label>
                <textarea
                    name="specialTerms"
                    value={formData.specialTerms}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    placeholder="Additional contract terms..."
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors"
                    disabled={loading}
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Purchase Contract
                </button>
            </div>
        </form>
    );
}