'use client';

import React from 'react';
import { X, Calendar, FileText, CreditCard, AlertCircle, Mail, Phone } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any; 
}

export default function PaymentDetailModal({ isOpen, onClose, payment }: PaymentDetailModalProps) {
  if (!isOpen || !payment) return null;

  // Map dữ liệu mock sang variant của Badge
  const getBadgeVariant = (text: string) => {
      const map: any = { 
          'Success': 'success', 'Pending': 'pending', 'Failed': 'failed',
          'Installment': 'installment', 'Deposit': 'deposit', 'Advance': 'advance'
      };
      return map[text] || 'default';
  };

  const DetailRow = ({ label, value, icon: Icon, isBadge }: any) => (
      <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
             {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
             <span className="text-xs text-gray-500 font-medium">{label}</span>
          </div>
          {isBadge ? (
              <Badge variant={getBadgeVariant(value)}>{value}</Badge>
          ) : (
              <p className="text-sm font-bold text-gray-900">{value}</p>
          )}
      </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Payment information</h2>
                    <p className="text-sm text-gray-500 mt-1">Transaction id: {payment.id || 'abc hello yeu em'}</p>
                    <div className="flex gap-2 mt-2">
                        <Badge variant={getBadgeVariant(payment.type)}>{payment.type}</Badge>
                        <Badge variant={getBadgeVariant(payment.status)}>{payment.status}</Badge>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-x-8">
                    <DetailRow icon={FileText} label="Installment number" value="10" />
                    <DetailRow icon={FileText} label="Total amount" value={payment.amount || "1.200.000.000 VNĐ"} />
                    
                    <DetailRow icon={Calendar} label="Paid date" value="January 17th, 2025 - 2:15 PM" />
                    <DetailRow icon={Calendar} label="Due date" value="January 20th, 2025 - 1:10 PM" />
                    
                    <DetailRow icon={AlertCircle} label="Overdue days" value="3" />
                    <DetailRow icon={AlertCircle} label="Penalty apply" value="5.000.000 VNĐ" />
                    
                    <DetailRow icon={CreditCard} label="Payment type" value={payment.type} isBadge />
                    <DetailRow icon={CreditCard} label="Payment status" value={payment.status} isBadge />
                    
                    <DetailRow icon={CreditCard} label="Payment method" value="VNPay" />
                </div>

                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium">Note</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                        Xin lỗi vì đóng trễ.
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Payer information</h3>
                    <div className="flex items-center gap-4 bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-gray-200 border border-gray-100 flex items-center justify-center overflow-hidden">
                             <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="Avt" className="w-full h-full object-cover"/>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-900">Phan Đình Minh</p>
                                <span className="text-xs text-gray-500">- Customer</span>
                            </div>
                            <div className="mt-1">
                                <Badge variant="pink">PLATINUM</Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1 mt-2 text-[11px] text-gray-500">
                                <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> 0865 8***</span>
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> phandinhminh48@gmail.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                    View Account
                </button>
            </div>
        </div>
    </div>
  );
}