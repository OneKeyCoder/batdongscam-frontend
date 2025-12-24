'use client';

import React from 'react';
import { X, Calendar, DollarSign, Clock, AlertCircle, FileText, CreditCard, CheckCircle } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; 
}

const InfoRow = ({ label, value, icon: Icon }: any) => (
    <div className="flex gap-3 mb-6 last:mb-0">
        <div className="mt-0.5"><Icon className="w-4 h-4 text-gray-400" /></div>
        <div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-sm font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

export default function PaymentDetailModal({ isOpen, onClose, data }: PaymentDetailModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <div>
                <h3 className="text-xl font-bold text-gray-900">Payment information</h3>
                <p className="text-sm text-gray-500 mt-1">Transaction id: abc hello yeu em</p>
                <div className="flex gap-2 mt-2">
                    <Badge variant="blue">Installment</Badge>
                    <Badge variant="success">Success</Badge>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={onClose} className="px-3 py-1.5 border border-gray-300 rounded text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700">Edit</button>
            </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <InfoRow icon={Calendar} label="Installment number" value={data.id > 0 ? data.id : "Deposit/Advance"} />
                <InfoRow icon={DollarSign} label="Total amount" value={`${data.amount} VNĐ`} />
                
                <InfoRow icon={Calendar} label="Paid date" value="January 17th, 2025 - 2:15 PM" />
                <InfoRow icon={Calendar} label="Due date" value={data.dueDate} />
                
                <InfoRow icon={Calendar} label="Overdue days" value="3" />
                <InfoRow icon={DollarSign} label="Penalty apply" value="6.000.000 VNĐ" />
                
                <InfoRow icon={CreditCard} label="Payment type" value={data.type} />
                <InfoRow icon={CheckCircle} label="Payment status" value={data.status} />
                
                <InfoRow icon={CreditCard} label="Payment method" value="VNPay" />
            </div>

            {/* Note Section */}
            <div className="mt-4">
                <div className="flex gap-3 mb-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-xs text-gray-500 font-bold">Note</span>
                </div>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 min-h-[60px]">
                    Xin lỗi vì đóng trễ.
                </div>
            </div>

            {/* Payer Information */}
            <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4">Payer information</h4>
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                        <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Payer" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">Phan Đình Minh - Customer</span>
                        </div>
                        <div className="mt-1 mb-1"><Badge variant="pink" className="text-[10px]">PLATINUM</Badge></div>
                        <p className="text-xs text-gray-500">0865 8***</p>
                        <p className="text-xs text-gray-500">phandinhminh48@gmail.com</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Action */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <button className="w-full py-2.5 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 transition-colors">
                View Account
            </button>
        </div>

      </div>
    </div>
  );
}