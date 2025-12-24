'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Calendar, DollarSign, CreditCard, CheckCircle, FileText, Wallet, Phone, Mail } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

const InfoRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5"><Icon className="w-5 h-5 text-gray-400" /></div>
        <div>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const UserCard = ({ title, name, role, phone, email, isPayee = false }: any) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-full">
        <h3 className="font-bold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${name}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
                <p className="font-bold text-gray-900 text-sm">{name} - {role}</p>
                <div className="mt-1 mb-1"><Badge variant="pink" className="text-[10px]">PLATINUM</Badge></div>
                <div className="space-y-0.5">
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {phone}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {email}</p>
                </div>
            </div>
        </div>
        <div className="mt-auto flex gap-3">
            <button className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 transition-colors">
                View Account
            </button>
            {isPayee && (
                <button className="flex-1 py-2.5 border border-red-200 text-red-600 font-bold rounded-lg text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                    <Wallet className="w-4 h-4" /> Pay
                </button>
            )}
        </div>
    </div>
);

export default function AccountantPaymentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
       {/* Back Link */}
       <Link href="/accountant/payments" className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Payments List
       </Link>

       {/* Main Detail Card */}
       <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payment information</h2>
                    <p className="text-sm text-gray-500 mt-1">Transaction id: abc hello yeu em</p>
                    <div className="flex gap-2 mt-3">
                        <Badge variant="blue">Installment</Badge>
                        <Badge variant="success">Success</Badge>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">Edit</button>
                </div>
            </div>

            {/* Grid Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 mb-8">
                <InfoRow icon={Calendar} label="Installment number" value="10" />
                <InfoRow icon={Calendar} label="Total amount" value="1.200.000.000 VNĐ" />

                <InfoRow icon={Calendar} label="Paid date" value="January 17th, 2025 - 2:15 PM" />
                <InfoRow icon={Calendar} label="Due date" value="January 20th, 2025 - 1:10 PM" />

                <InfoRow icon={Calendar} label="Overdue days" value="3" />
                <InfoRow icon={DollarSign} label="Penalty apply" value="6.000.000 VNĐ" />

                <InfoRow icon={CreditCard} label="Payment type" value="Installment" />
                <InfoRow icon={CheckCircle} label="Payment status" value="Success" />

                <InfoRow icon={CreditCard} label="Payment method" value="VNPay" />
            </div>

            {/* Note */}
            <div className="mb-8">
                 <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-500">Note</span>
                 </div>
                 <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-900">
                    Xin lỗi vì đóng trễ.
                 </div>
            </div>

            {/* User Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UserCard 
                    title="Payer information" 
                    name="Phan Đình Minh" 
                    role="Customer"
                    phone="0865 8***"
                    email="phandinhminh48@gmail.com"
                />
                <UserCard 
                    title="Payee information" 
                    name="Phan Đình Minh" 
                    role="Property Owner"
                    phone="0865 8***"
                    email="phandinhminh48@gmail.com"
                    isPayee={true} // Enable Pay button
                />
            </div>
       </div>
    </div>
  );
}