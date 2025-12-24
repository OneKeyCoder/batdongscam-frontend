'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, Eye } from 'lucide-react'; // Import Eye icon
import Badge from '@/app/components/ui/Badge';
import PaymentDetailModal from './PaymentDetailModal';
import Pagination from '@/app/components/Pagination';

const TimelineItem = ({ label, date, icon: Icon, colorClass }: any) => (
    <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${colorClass}`}><Icon className="w-5 h-5" /></div>
        <div>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm font-bold text-gray-900">{date}</p>
        </div>
    </div>
);

// Helper for table badges
const getTypeBadge = (type: string) => {
    switch (type) {
        case 'Installment': return <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold">Installment</span>;
        case 'Advance': return <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-bold">Advance</span>;
        case 'Deposit': return <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-bold">Deposit</span>;
        default: return <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-bold">{type}</span>;
    }
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Success': return <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">Success</span>;
        case 'Pending': return <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-bold">Pending</span>;
        default: return null;
    }
}

// Mock Data
const history = [
    { id: 12, amount: "1.2B", type: "Installment", status: "Pending", dueDate: "January 18th, 2025" },
    { id: 11, amount: "1.2B", type: "Installment", status: "Pending", dueDate: "January 18th, 2025" },
    { id: 10, amount: "1.2B", type: "Installment", status: "Pending", dueDate: "January 18th, 2025" },
    { id: 9, amount: "1.2B", type: "Installment", status: "Pending", dueDate: "January 18th, 2025" },
    { id: 8, amount: "1.2B", type: "Installment", status: "Pending", dueDate: "January 18th, 2025" },
    { id: 5, amount: "1.201B", type: "Installment", status: "Success", dueDate: "January 18th, 2025" },
    { id: 0, amount: "2.5B", type: "Advance", status: "Success", dueDate: "January 18th, 2025" },
    { id: -1, amount: "5B", type: "Deposit", status: "Success", dueDate: "January 18th, 2025" },
];

export default function TimelineTab() {
    const [selectedPayment, setSelectedPayment] = useState<any>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAgents = history.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="space-y-6">
            {/* 1. Contract Timeline */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6">Contract timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <TimelineItem icon={Calendar} colorClass="text-gray-600" label="Created at" date="January 10th, 2025 - 10:00 AM" />
                    <TimelineItem icon={Calendar} colorClass="text-gray-600" label="Last updated at" date="January 10th, 2025 - 10:00 AM" />
                    <TimelineItem icon={CheckCircle} colorClass="text-green-600" label="Signed at" date="January 10th, 2025 - 10:00 AM" />
                    <TimelineItem icon={CheckCircle} colorClass="text-green-600" label="Completed at" date="---" />
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
                                <th className="px-6 py-4 font-bold text-gray-900">Installment number</th>
                                <th className="px-6 py-4 font-bold text-gray-900">Amount</th>
                                <th className="px-6 py-4 font-bold text-gray-900">Type</th>
                                <th className="px-6 py-4 font-bold text-gray-900">Status</th>
                                <th className="px-6 py-4 font-bold text-gray-900">Due date</th>
                                <th className="px-6 py-4 font-bold text-gray-900 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {item.id < 0 ? (item.id === -1 ? 0 : 0) : item.id}
                                        {/* Handle số 0 cho deposit/advance nếu muốn */}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{item.amount}</td>
                                    <td className="px-6 py-4">{getTypeBadge(item.type)}</td>
                                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                                    <td className="px-6 py-4 text-gray-900">{item.dueDate}</td>
                                    <td className="px-6 py-4 text-right">
                                        {/* --- EYE ICON BUTTON --- */}
                                        <button
                                            onClick={() => setSelectedPayment(item)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg inline-flex items-center justify-center transition-colors">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalItems={history.length}
                    pageSize={itemsPerPage}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* --- MODAL POPUP --- */}
            <PaymentDetailModal
                isOpen={!!selectedPayment}
                onClose={() => setSelectedPayment(null)}
                data={selectedPayment}
            />
        </div>
    );
}