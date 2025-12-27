'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, Wallet, Loader2 } from 'lucide-react';
import { paymentService, PaymentListItem } from '@/lib/api/services/payment.service';
import CreatePaymentModal from './CreatePaymentModal';

const SalaryCard = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-center h-28 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
        </div>
        <p className="text-lg font-bold text-red-600">{value}</p>
    </div>
);

interface AgentSalaryTabProps {
    agentId: string;
    month: number;
    year: number;
}

export default function AgentSalaryTab({ agentId, month, year }: AgentSalaryTabProps) {
    const [payments, setPayments] = useState<PaymentListItem[]>([]);
    const [summary, setSummary] = useState({ total: 0, paid: 0, unpaid: 0, bonus: 0 });
    const [loading, setLoading] = useState(true);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const fetchSalary = async () => {
        setLoading(true);
        try {
            const res = await paymentService.getPayments({
                agentId: agentId,
                page: 1,
                size: 100,
            });

            const allPayments = res.data;
            setPayments(allPayments);

            let total = 0, paid = 0, unpaid = 0, bonus = 0;

            allPayments.forEach(p => {
                const amount = p.amount || 0;
                if (p.paymentType === 'SALARY' || p.paymentType === 'BONUS') {
                    total += amount;
                    if (p.status === 'SUCCESS' || p.status === 'PAID') {
                        paid += amount;
                    } else {
                        unpaid += amount;
                    }

                    if (p.paymentType === 'BONUS') {
                        bonus += amount;
                    }
                }
            });

            setSummary({ total, paid, unpaid, bonus });

        } catch (error) {
            console.error("Failed to fetch payments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalary();
    }, [agentId, month, year]);

    if (loading) {
        return <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 text-red-600 animate-spin" /></div>;
    }

    return (
        <div className="space-y-8">
            <div className="relative">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 text-sm">Salary Summary (Calculated from Payments)</h3>

                    <button
                        onClick={() => setIsPayModalOpen(true)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm active:scale-95"
                    >
                        <Wallet className="w-3 h-3" /> Pay
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <SalaryCard label="Total salary" value={`${summary.total.toLocaleString()} VNĐ`} />
                    <SalaryCard label="Paid" value={`${summary.paid.toLocaleString()} VNĐ`} />
                    <SalaryCard label="Unpaid" value={`${summary.unpaid.toLocaleString()} VNĐ`} />
                    <SalaryCard label="Bonus" value={`${summary.bonus.toLocaleString()} VNĐ`} />
                </div>
            </div>

            {/* (Optional) Bảng lịch sử thanh toán chi tiết có thể đặt ở đây */}
            {/* <div className="mt-8">
                <h3 className="font-bold text-gray-900 text-sm mb-4">Payment History</h3>
                ... Table component here ...
            </div> 
            */}

            <CreatePaymentModal
                isOpen={isPayModalOpen}
                onClose={() => setIsPayModalOpen(false)}
                agentId={agentId}
                onSuccess={fetchSalary}
            />
        </div>
    );
}