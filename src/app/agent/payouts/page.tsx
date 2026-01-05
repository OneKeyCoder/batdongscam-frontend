'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, Clock, Check, AlertCircle, Loader2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import { paymentService, PaymentListItem } from '@/lib/api/services/payment.service';

export default function AgentPayoutsPage() {
  const [payouts, setPayouts] = useState<PaymentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayouts = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await paymentService.getMyPayouts({ page: 0, size: 20 });
        setPayouts(res.data || []);
      } catch (err: any) {
        console.error('Failed to fetch payouts:', err);
        setError('Failed to load payouts. This feature is not yet available.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-red-600" />
          My Payouts
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          View your salary, bonus, and commission payments
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-16 h-16 text-orange-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Coming Soon</h3>
            <p className="text-gray-500 text-sm text-center max-w-md">
              Agent payout tracking is not yet available. Your salary and bonus payments will appear here once the feature is implemented.
            </p>
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Wallet className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payouts yet</h3>
            <p className="text-gray-500 text-sm">Your salary and bonus payments will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Badge variant="info">{payout.paymentType}</Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {formatAmount(payout.amount)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(payout.paidTime || payout.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={payout.status === 'SUCCESS' ? 'success' : 'warning'}>
                        {payout.status === 'SUCCESS' ? <Check className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {payout.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
