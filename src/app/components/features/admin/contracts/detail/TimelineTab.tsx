'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle, Eye, XCircle } from 'lucide-react';
import { ContractDetailResponse, PaymentSummary } from '@/lib/api/services/contract.service';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import PaymentDetailModal from './PaymentDetailModal';

interface Props {
    data: ContractDetailResponse;
}

const TimelineItem = ({ label, date, icon: Icon, colorClass }: any) => (
    <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${colorClass}`}><Icon className="w-5 h-5" /></div>
        <div>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm font-bold text-gray-900">{date || '---'}</p>
        </div>
    </div>
);

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'PAID': return <Badge variant="success">Paid</Badge>;
        case 'PENDING': return <Badge variant="warning">Pending</Badge>;
        case 'OVERDUE': return <Badge variant="failed">Overdue</Badge>;
        default: return <Badge variant="default">{status}</Badge>;
    }
}

export default function TimelineTab({ data }: Props) {
    const [selectedPayment, setSelectedPayment] = useState<PaymentSummary | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Sort payment: Mới nhất lên đầu hoặc theo installment
    const payments = [...(data.payments || [])].sort((a, b) =>
        (a.installmentNumber || 0) - (b.installmentNumber || 0)
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPayments = payments.slice(indexOfFirstItem, indexOfLastItem);

    const formatDate = (str?: string) => str ? new Date(str).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---';
    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <div className="space-y-6">
            {/* 1. Contract Timeline */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6">Contract Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <TimelineItem icon={Calendar} colorClass="text-gray-600" label="Created at" date={formatDate(data.createdAt)} />
                    <TimelineItem icon={Calendar} colorClass="text-gray-600" label="Last updated at" date={formatDate(data.updatedAt)} />
                    <TimelineItem icon={CheckCircle} colorClass="text-green-600" label="Signed at" date={formatDate(data.signedAt)} />

                    {data.status === 'CANCELLED' ? (
                        <TimelineItem icon={XCircle} colorClass="text-red-600" label="Cancelled at" date={formatDate(data.completedAt)} />
                    ) : (
                        <TimelineItem icon={CheckCircle} colorClass="text-green-600" label="Completed at" date={data.status === 'COMPLETED' ? formatDate(data.completedAt) : '---'} />
                    )}
                </div>
            </div>

            {/* 2. Payment History Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900">Payment History</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-900">Installment #</th>
                                <th className="px-6 py-4 font-bold text-gray-900">Amount</th>
                                <th className="px-6 py-4 font-bold text-gray-900">Type</th>
                                <th className="px-6 py-4 font-bold text-gray-900">Status</th>
                                <th className="px-6 py-4 font-bold text-gray-900">Due Date</th>
                                <th className="px-6 py-4 font-bold text-gray-900 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentPayments.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No payments recorded.</td></tr>
                            ) : (
                                currentPayments.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {item.installmentNumber || '-'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(item.amount)}</td>
                                        <td className="px-6 py-4"><Badge variant="blue">{item.paymentType}</Badge></td>
                                        <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                                        <td className="px-6 py-4 text-gray-900">{formatDate(item.dueDate).split(',')[0]}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedPayment(item)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg inline-flex items-center justify-center transition-colors">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={payments.length}
                    pageSize={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </div>

            <PaymentDetailModal
                isOpen={!!selectedPayment}
                onClose={() => setSelectedPayment(null)}
                payment={selectedPayment}
                contract={data}
            />
        </div>
    );
}