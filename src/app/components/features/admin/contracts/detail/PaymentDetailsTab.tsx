'use client';

import React from 'react';
import { CreditCard, AlertCircle, DollarSign, Calendar, FileText } from 'lucide-react';

const InfoItem = ({ icon: Icon, label, value, isBold = false }: any) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5"><Icon className="w-4 h-4 text-gray-400" /></div>
        <div>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className={`text-sm text-gray-900 ${isBold ? 'font-bold' : ''}`}>{value}</p>
        </div>
    </div>
);

export default function PaymentDetailsTab() {
  return (
    <div className="space-y-6">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Total amount</p>
                <p className="text-xl font-bold text-red-600">10.000.000.000</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Paid</p>
                <p className="text-xl font-bold text-green-600">8.000.000.000</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Remaining</p>
                <p className="text-xl font-bold text-yellow-600">2.000.000.000</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Progress</p>
                <p className="text-xl font-bold text-blue-600">80%</p>
            </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Payment Breakdown</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-4 mb-8">
                <InfoItem icon={CreditCard} label="Payment type" value="MORTGAGE" isBold />
                <InfoItem icon={AlertCircle} label="Late Payment Penalty Rate" value="5.00% per day" isBold />
                <InfoItem icon={DollarSign} label="Total penalty" value="0.000" isBold />

                <InfoItem icon={FileText} label="Contract amount" value="10.000.000.000" isBold />
                <InfoItem icon={DollarSign} label="Deposit amount" value="500.000.000" isBold />
                <InfoItem icon={DollarSign} label="Advance payment amount" value="100.000.000" isBold />

                <InfoItem icon={DollarSign} label="Final payment amount" value="9.400.000.000" isBold />
                <InfoItem icon={Calendar} label="Installment counts" value="12" isBold />
                <InfoItem icon={DollarSign} label="Installment amount" value="791.667.000" isBold />
            </div>

            {/* Special Conditions */}
            <div>
                <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <FileText className="w-4 h-4" /> Special conditions
                </label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 min-h-[80px]">
                    Special payment terms applied.
                </div>
            </div>
        </div>
    </div>
  );
}