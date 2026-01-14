'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Loader2, Edit, Save, X, Info, CheckCircle, Package, AlertCircle, Search, ChevronDown } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import {
    contractService,
    PurchaseContractDetailResponse,
    UpdatePurchaseContractRequest
} from '@/lib/api/services/contract.service';
import { accountService } from '@/lib/api/services/account.service';

// --- 0. Helper: Extract Error Message ---
const getErrorMessage = (error: any) => {
    if (error?.response?.data?.message) {
        return Array.isArray(error.response.data.message) ? error.response.data.message.join('\n') : error.response.data.message;
    }
    return error.message || "An unexpected error occurred.";
};

// --- 1. Async Select Component ---
interface Option { value: string; label: string; subLabel?: string; }
interface AsyncSelectProps { label: string; value: string; displayValue?: string; onChange: (value: string) => void; fetchOptions: (keyword: string) => Promise<Option[]>; placeholder?: string; }

const AsyncSelect = ({ label, value, displayValue, onChange, fetchOptions, placeholder }: AsyncSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState(displayValue || '');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => { if (displayValue) setSelectedLabel(displayValue); }, [displayValue]);

    const fetchData = async (search: string) => {
        setLoading(true);
        try {
            const data = await fetchOptions(search);
            setOptions(data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
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

    const handleSelect = (opt: Option) => { onChange(opt.value); setSelectedLabel(opt.label); setIsOpen(false); setKeyword(''); };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {label && <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>}
            <div className="w-full border border-green-300 rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer bg-green-50 hover:border-green-500 transition-colors" onClick={() => setIsOpen(!isOpen)}>
                <span className={`text-sm truncate ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{selectedLabel || placeholder || 'Select...'}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" className="w-full pl-8 pr-2 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-green-500" placeholder="Type to search..." value={keyword} onChange={e => setKeyword(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {loading ? <div className="p-4 text-center text-gray-400 text-xs flex justify-center"><Loader2 className="w-4 h-4 animate-spin" /></div> : options.length === 0 ? <div className="p-4 text-center text-gray-400 text-xs">No results found.</div> : (
                            options.map(opt => (
                                <button key={opt.value} onClick={() => handleSelect(opt)} className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 flex flex-col border-b border-gray-50 last:border-0 transition-colors ${value === opt.value ? 'bg-green-50 text-green-700' : 'text-gray-700'}`}>
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

// --- 2. Editable Field ---
interface EditableFieldProps { label: string; isEditing: boolean; value: any; editValue?: any; name?: keyof UpdatePurchaseContractRequest; onChange?: (name: string, value: any) => void; type?: 'text' | 'number' | 'date' | 'select' | 'textarea'; className?: string; formatValue?: (val: any) => string; required?: boolean; }

const EditableField = ({ label, isEditing, value, editValue, name, onChange, type = 'text', className, formatValue, required }: EditableFieldProps) => {
    if (!isEditing || !name || !onChange) {
        return (
            <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
                <p className={`text-sm min-h-[20px] ${className || 'text-gray-900'}`}>{formatValue ? formatValue(value) : value || '-'}</p>
            </div>
        );
    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let val: any = e.target.value;
        if (type === 'number') { if (val < 0) return; val = val === '' ? 0 : parseFloat(val); }
        onChange(name, val);
    };
    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
            {type === 'textarea' ? (
                <textarea value={editValue || ''} onChange={handleChange} rows={4} className="w-full border border-green-300 rounded-lg px-3 py-2 bg-green-50 focus:ring-2 focus:ring-green-500 outline-none text-sm" />
            ) : (
                <div className="relative">
                    <input type={type} value={type === 'date' && editValue ? editValue.split('T')[0] : editValue} onChange={handleChange} onClick={(e) => type === 'date' && e.currentTarget.showPicker()} min={type === 'number' ? "0" : undefined} className={`w-full border border-green-300 rounded-lg px-3 py-2 bg-green-50 focus:ring-2 focus:ring-green-500 outline-none text-sm ${type === 'date' ? 'cursor-pointer' : ''}`} />
                </div>
            )}
        </div>
    );
};

// --- 3. Main Page Component ---

export default function PurchaseContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [activeTab, setActiveTab] = useState<'overview' | 'payment' | 'parties'>('overview');
    const [data, setData] = useState<PurchaseContractDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<UpdatePurchaseContractRequest>({});
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await contractService.getPurchaseContractById(id);
            setData(res);
            setEditData({
                customerId: res.customer.id,
                agentId: res.agent.id,
                propertyValue: res.propertyValue,
                advancePaymentAmount: res.advancePaymentAmount,
                commissionAmount: res.commissionAmount,
                startDate: res.startDate,
                specialTerms: res.specialTerms,
            });
        } catch (error) { console.error("Fetch purchase contract error:", error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleEditChange = (name: string, value: any) => { setEditData(prev => ({ ...prev, [name]: value })); };

    const handleSave = async () => {
        if (!data) return;
        setSaving(true);
        try {
            const payload = { ...editData };
            if (payload.propertyValue && payload.propertyValue <= 0) throw new Error("Property Value must be > 0");
            if (payload.commissionAmount && payload.commissionAmount < 0) throw new Error("Commission cannot be negative");
            if (payload.commissionAmount && payload.propertyValue && payload.commissionAmount >= payload.propertyValue) throw new Error("Commission must be less than Property Value");

            Object.keys(payload).forEach(key => {
                const k = key as keyof UpdatePurchaseContractRequest;
                if (payload[k] === "" || payload[k] === null || payload[k] === undefined) delete payload[k];
            });

            await contractService.updatePurchaseContract(id, payload);
            alert("✅ Purchase contract updated successfully!");
            setIsEditing(false);
            fetchData();
        } catch (error: any) { alert(`❌ Update Failed:\n${getErrorMessage(error)}`); } finally { setSaving(false); }
    };

    const handleApprove = async () => {
        if (!confirm("Approve this purchase contract?")) return;
        setActionLoading(true);
        try { await contractService.approvePurchaseContract(id); alert("✅ Approved!"); fetchData(); } catch (e: any) { alert(`❌ Approve Failed:\n${getErrorMessage(e)}`); } finally { setActionLoading(false); }
    };

    const handleCompletePaperwork = async () => {
        if (!confirm("Mark paperwork as complete?")) return;
        setActionLoading(true);
        try { await contractService.markPurchasePaperworkComplete(id); alert("✅ Completed!"); fetchData(); } catch (e: any) { alert(`❌ Complete Failed:\n${getErrorMessage(e)}`); } finally { setActionLoading(false); }
    };

    const handleVoid = async () => {
        if (!confirm("⚠️ VOID this contract?")) return;
        setActionLoading(true);
        try { await contractService.voidPurchaseContract(id); alert("✅ Voided!"); fetchData(); } catch (e: any) { alert(`❌ Void Failed:\n${getErrorMessage(e)}`); } finally { setActionLoading(false); }
    };

    // --- API Fetchers ---
    const fetchCustomers = async (keyword: string) => { try { const res = await accountService.getAllCustomers({ name: keyword, page: 1, limit: 10 }); return res.data.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}`})); } catch { return []; } };
    const fetchAgents = async (keyword: string) => { try { const res = await accountService.getAllSaleAgents({ name: keyword, page: 1, limit: 10 }); return res.data.map(a => ({ value: a.id, label: `${a.firstName} ${a.lastName}`, subLabel: a.employeeCode })); } catch { return []; } };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString('en-US') : 'N/A';

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-green-600 animate-spin" /></div>;
    if (!data) return <div className="text-center py-20">Purchase contract not found</div>;

    const canEdit = data.status === 'DRAFT';
    const canApprove = data.status === 'DRAFT';
    const canCompletePaperwork = data.status === 'WAITING_OFFICIAL';
    const canCancel = false; // Ẩn nút Cancel theo Backend logic (Admin chỉ Void)

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-bold text-gray-900">Purchase Contract</h2>
                        {data.depositContractId && <Link href={`/admin/contracts/deposit/${data.depositContractId}`} className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"><Package className="w-3 h-3" /> Linked Deposit</Link>}
                    </div>
                    <div className="flex items-center gap-3 mt-1"><span className="text-lg font-medium text-gray-700">{data.contractNumber}</span><Badge variant="default">{data.status.replace(/_/g, ' ')}</Badge></div>
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} disabled={saving} className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50"><X className="w-4 h-4" /> Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 shadow-md">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}</button>
                        </>
                    ) : (
                        <>
                            {canApprove && <button onClick={handleApprove} disabled={actionLoading} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Approve</button>}
                            {canCompletePaperwork && <button onClick={handleCompletePaperwork} disabled={actionLoading} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Complete</button>}
                            {canEdit && <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 shadow-sm"><Edit className="w-4 h-4" /> Edit</button>}
                            <button onClick={handleVoid} disabled={actionLoading} className="px-3 py-2 border border-gray-300 text-gray-600 font-bold rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Void</button>
                        </>
                    )}
                </div>
            </div>

            {isEditing && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-in fade-in">
                    <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-800"><p className="font-bold mb-1">Editing Mode Active</p><p>Changes will be saved to the <strong>DRAFT</strong> version.</p></div>
                </div>
            )}

            <div className="flex gap-8 border-b border-gray-200">
                {['overview', 'payment', 'parties'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-3 text-sm font-bold border-b-2 capitalize transition-colors ${activeTab === tab ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab}</button>
                ))}
            </div>

            <div className="animate-in fade-in duration-300">
                {activeTab === 'overview' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <EditableField label="Status" isEditing={false} value={data.status.replace(/_/g, ' ')} />
                        <EditableField label="Start Date" isEditing={isEditing} value={data.startDate} editValue={editData.startDate} name="startDate" onChange={handleEditChange} type="date" formatValue={formatDate} required />
                        <EditableField label="Property Value" isEditing={isEditing} value={data.propertyValue} editValue={editData.propertyValue} name="propertyValue" onChange={handleEditChange} type="number" formatValue={formatCurrency} required className="text-red-600 font-bold" />
                        <EditableField label="Advance Payment" isEditing={isEditing} value={data.advancePaymentAmount} editValue={editData.advancePaymentAmount} name="advancePaymentAmount" onChange={handleEditChange} type="number" formatValue={formatCurrency} className="text-gray-900 font-bold" />
                        <EditableField label="Commission" isEditing={isEditing} value={data.commissionAmount} editValue={editData.commissionAmount} name="commissionAmount" onChange={handleEditChange} type="number" formatValue={formatCurrency} className="text-blue-600 font-bold" />
                        {data.depositContractId && <EditableField label="Linked Deposit Status" isEditing={false} value={data.depositContractStatus?.replace(/_/g, ' ') || 'N/A'} />}
                        <div className="md:col-span-2"><EditableField label="Special Terms" isEditing={isEditing} value={data.specialTerms} editValue={editData.specialTerms} name="specialTerms" onChange={handleEditChange} type="textarea" /></div>
                        {data.cancellationReason && (
                            <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm font-bold text-red-800 mb-1">Cancellation Reason:</p><p className="text-sm text-red-700">{data.cancellationReason}</p>{data.cancelledBy && <p className="text-xs text-red-600 mt-2">Cancelled by: {data.cancelledBy}</p>}</div>
                        )}
                    </div>
                )}

                {activeTab === 'payment' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Payment History</h3>
                        {data.payments.length === 0 ? <p className="text-gray-500 text-center py-8">No payments yet</p> : (
                            <div className="space-y-3">
                                {data.payments.map((payment) => (
                                    <div key={payment.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                                        <div><p className="font-bold text-gray-900">{payment.paymentType}</p><p className="text-sm text-gray-500">Due: {formatDate(payment.dueDate)}</p>{payment.paidTime && <p className="text-xs text-green-600">Paid: {formatDate(payment.paidTime)}</p>}</div>
                                        <div className="text-right"><p className="font-bold text-gray-900">{formatCurrency(payment.amount)}</p><Badge variant={payment.status === 'PAID' ? 'success' : 'pending' as any}>{payment.status}</Badge></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'parties' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <PartyCard title="Property (Fixed)" data={data.property} type="property" />
                        {isEditing ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-5 border-dashed">
                                <h4 className="text-sm font-bold text-green-900 mb-3">Customer (Edit)</h4>
                                <AsyncSelect label="" value={editData.customerId || ''} displayValue={`${data.customer.firstName} ${data.customer.lastName}`} onChange={(val) => handleEditChange('customerId', val)} fetchOptions={fetchCustomers} placeholder="Search Customer..." />
                            </div>
                        ) : (<PartyCard title="Customer (Buyer)" data={data.customer} type="user" />)}
                        <PartyCard title="Owner (Fixed)" data={data.owner} type="user" />
                        {isEditing ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-5 border-dashed">
                                <h4 className="text-sm font-bold text-green-900 mb-3">Agent (Edit)</h4>
                                <AsyncSelect label="" value={editData.agentId || ''} displayValue={`${data.agent.firstName} ${data.agent.lastName}`} onChange={(val) => handleEditChange('agentId', val)} fetchOptions={fetchAgents} placeholder="Search Agent..." />
                            </div>
                        ) : (<PartyCard title="Agent" data={data.agent} type="user" />)}
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper Components
const PartyCard = ({ title, data, type }: any) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h4 className="text-sm font-bold text-gray-900 mb-3">{title}</h4>
        {type === 'property' ? (
            <div className="space-y-2 text-sm"><p className="font-bold text-gray-900">{data.title}</p><p className="text-gray-600">{data.fullAddress}</p><p className="font-bold text-green-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.priceAmount)}</p></div>
        ) : (
            <div className="space-y-2 text-sm"><p className="font-bold text-gray-900">{data.firstName} {data.lastName}</p><p className="text-gray-600">{data.email}</p><p className="text-gray-600">{data.phone}</p></div>
        )}
    </div>
);