'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Calendar, DollarSign, Clock, AlertCircle, FileText, CreditCard, CheckCircle, Phone, Mail, User } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import { ContractDetailResponse, PaymentSummary } from '@/lib/api/services/contract.service';

interface PaymentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: PaymentSummary | null; 
    contract: ContractDetailResponse; 
}

const InfoRow = ({ label, value, icon: Icon, isPenalty = false }: any) => (
    <div className="flex gap-3 mb-6 last:mb-0">
        <div className="mt-0.5"><Icon className={`w-4 h-4 ${isPenalty ? 'text-red-500' : 'text-gray-400'}`} /></div>
        <div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-sm font-bold ${isPenalty ? 'text-red-600' : 'text-gray-900'}`}>{value || '---'}</p>
        </div>
    </div>
);

export default function PaymentDetailModal({ isOpen, onClose, payment, contract }: PaymentDetailModalProps) {
    const router = useRouter();

    if (!isOpen || !payment) return null;

    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '---';
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'PAID': return 'success';
            case 'PENDING': return 'warning';
            case 'OVERDUE': return 'failed';
            default: return 'default';
        }
    };

    const calculateOverdueDays = () => {
        if (payment.status === 'PAID') return 0;
        const due = new Date(payment.dueDate).getTime();
        const now = new Date().getTime();
        if (now <= due) return 0;

        const diffTime = Math.abs(now - due);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const overdueDays = calculateOverdueDays();

    const penaltyAmount = overdueDays > 0 ? (payment.amount * (contract.latePaymentPenaltyRate || 0) * overdueDays) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Payment information</h3>
                        <p className="text-xs text-gray-500 mt-1 font-mono">Transaction ID: {payment.id}</p>
                        <div className="flex gap-2 mt-2">
                            <Badge variant="blue">{payment.paymentType}</Badge>
                            <Badge variant={getStatusVariant(payment.status) as any}>{payment.status}</Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {/* Cột Trái */}
                        <div className="space-y-1">
                            <InfoRow icon={Calendar} label="Installment number" value={payment.installmentNumber ? `#${payment.installmentNumber}` : "One-time / Deposit"} />
                            <InfoRow icon={DollarSign} label="Total amount" value={formatCurrency(payment.amount)} />
                            <InfoRow icon={CreditCard} label="Payment type" value={payment.paymentType} />
                            <InfoRow icon={CreditCard} label="Payment method" value="---" />
                        </div>

                        {/* Cột Phải */}
                        <div className="space-y-1">
                            <InfoRow icon={Calendar} label="Due date" value={formatDate(payment.dueDate)} />
                            <InfoRow icon={CheckCircle} label="Paid date" value={formatDate(payment.paidDate)} />
                            {(overdueDays > 0) && (
                                <>
                                    <InfoRow icon={Clock} label="Overdue days" value={`${overdueDays} days`} isPenalty />
                                    <InfoRow icon={AlertCircle} label="Penalty estimated" value={formatCurrency(penaltyAmount)} isPenalty />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Note Section */}
                    <div className="mt-6">
                        <div className="flex gap-2 mb-2 items-center">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-700 font-bold uppercase tracking-wider">Note</span>
                        </div>
                        <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 min-h-[60px] italic">
                            {payment.status === 'OVERDUE'
                                ? `Payment is overdue by ${overdueDays} days. Penalty rate: ${(contract.latePaymentPenaltyRate * 100).toFixed(2)}% / day.`
                                : (payment.status === 'PAID' ? 'Payment completed successfully.' : 'Waiting for payment.')
                            }
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Payer information</h4>
                        <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="w-12 h-12 rounded-full bg-blue-100 shrink-0 overflow-hidden flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-200">
                                {contract.customerFirstName?.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 text-sm">{contract.customerFirstName} {contract.customerLastName}</span>
                                    <Badge variant="default" className="text-[10px]">Customer</Badge>
                                </div>

                                <div className="flex gap-4 mt-2">
                                    <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {contract.customerPhone}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {contract.customerEmail}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            router.push(`/admin/customers/${contract.customerId}`);
                        }}
                        className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        <User className="w-4 h-4" /> View Account
                    </button>
                </div>

            </div>
        </div>
    );
}