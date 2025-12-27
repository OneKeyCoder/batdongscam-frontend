'use client';

import React from 'react';
import { CreditCard, AlertCircle, DollarSign, Calendar, FileText, Wallet, Percent, Banknote } from 'lucide-react';
import { ContractDetailResponse } from '@/lib/api/services/contract.service';

interface Props {
    data: ContractDetailResponse;
    isEditing?: boolean;
    editData?: any;
    onEditChange?: (data: any) => void;
}

const InfoItem = ({ icon: Icon, label, value, isBold = false }: any) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 text-gray-500"><Icon className="w-4 h-4" /></div>
        <div>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className={`text-sm text-gray-900 ${isBold ? 'font-bold' : ''}`}>{value || '0'}</p>
        </div>
    </div>
);

export default function PaymentDetailsTab({ data, isEditing, editData, onEditChange }: Props) {

    const formatCurrency = (val?: number) => val !== undefined ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) : '---';

    const total = data.totalContractAmount || 0;
    const paid = 8000000000;
    const remaining = total - paid;
    const progress = total > 0 ? Math.round((paid / total) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Total amount</p>
                    <p className="text-xl font-bold text-red-600 truncate">{formatCurrency(total)}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Paid</p>
                    <p className="text-xl font-bold text-green-600 truncate">{formatCurrency(paid)}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Remaining</p>
                    <p className="text-xl font-bold text-yellow-600 truncate">{formatCurrency(remaining)}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Progress</p>
                    <p className="text-xl font-bold text-blue-600">{progress}%</p>
                </div>
            </div>

            {/* Breakdown Container */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6">Payment Breakdown</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-6 mb-8">
                    {/* Col 1 (Read-only) */}
                    <div className="space-y-6">
                        <InfoItem icon={CreditCard} label="Payment type" value={data.contractPaymentType} isBold />
                        <InfoItem icon={Wallet} label="Contract amount" value={formatCurrency(data.totalContractAmount)} isBold />
                        <InfoItem icon={Banknote} label="Final payment amount" value={formatCurrency(data.finalPaymentAmount)} isBold />
                    </div>

                    {/* Col 2 */}
                    <div className="space-y-6">
                        {/* EDITABLE: PENALTY RATE */}
                        {isEditing ? (
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 text-gray-500"><Percent className="w-4 h-4" /></div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-0.5">Late Payment Penalty Rate (%)</p>
                                    <input
                                        type="number"
                                        className="border border-gray-300 rounded px-2 py-1 text-sm font-bold w-full focus:border-red-500 outline-none"
                                        value={editData?.latePaymentPenaltyRate}
                                        onChange={(e) => onEditChange?.({ ...editData, latePaymentPenaltyRate: e.target.value })}
                                        placeholder="e.g 5"
                                    />
                                </div>
                            </div>
                        ) : (
                            <InfoItem icon={Percent} label="Late Payment Penalty Rate" value={`${(data.latePaymentPenaltyRate * 100).toFixed(2)}% per day`} isBold />
                        )}

                        <InfoItem icon={DollarSign} label="Deposit amount" value={formatCurrency(data.depositAmount)} isBold />
                        <InfoItem icon={Calendar} label="Installment counts" value={data.progressMilestone || 12} isBold />
                    </div>

                    {/* Col 3 */}
                    <div className="space-y-6">
                        <InfoItem icon={AlertCircle} label="Total penalty" value={formatCurrency(data.cancellationPenalty || 0)} isBold />
                        <InfoItem icon={DollarSign} label="Advance payment amount" value={formatCurrency(data.advancePaymentAmount)} isBold />
                        <InfoItem icon={DollarSign} label="Installment amount" value={formatCurrency(data.installmentAmount)} isBold />
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <FileText className="w-4 h-4 text-gray-500" /> Special conditions
                    </label>
                    {isEditing ? (
                        <textarea
                            className="w-full bg-white border border-gray-300 rounded-lg p-4 text-sm text-gray-900 focus:outline-none focus:border-red-500 min-h-[80px]"
                            value={editData?.specialConditions || ''}
                            onChange={(e) => onEditChange?.({ ...editData, specialConditions: e.target.value })}
                        />
                    ) : (
                        <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-900 min-h-[80px]">
                            {data.specialConditions || 'No special conditions applied.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}