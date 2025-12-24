'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import OverviewTab from '@/app/components/features/admin/contracts/detail/OverviewTab';
import PaymentDetailsTab from '@/app/components/features/admin/contracts/detail/PaymentDetailsTab';
import PartiesTab from '@/app/components/features/admin/contracts/detail/PartiesTab';
import TimelineTab from '@/app/components/features/admin/contracts/detail/TimelineTab';

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'payment' | 'parties' | 'timeline'>('overview');

  return (
    <div className="space-y-6 pb-10">
      {/* --- BACK LINK --- */}
      <Link href="/admin/contracts" className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors text-sm font-medium">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Contracts
      </Link>

      {/* --- HEADER SECTION --- */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Contract Details</h2>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-lg font-medium text-gray-700">CTR-01234152</span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">Active</span>
                </div>
            </div>
            <div className="flex gap-3">
                <button className="px-4 py-2 border border-red-200 text-red-600 font-bold rounded-lg text-sm hover:bg-red-50 transition-colors">
                    Cancel
                </button>
                <button className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 transition-colors">
                    Edit
                </button>
            </div>
        </div>

        {/* --- TABS NAVIGATION --- */}
        <div className="flex gap-8 border-b border-gray-200">
            {[
                { id: 'overview', label: 'Overview' },
                { id: 'payment', label: 'Payment details' },
                { id: 'parties', label: 'Parties' },
                { id: 'timeline', label: 'Timeline' },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === tab.id 
                        ? 'border-red-600 text-red-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      {/* --- TAB CONTENT --- */}
      <div className="animate-in fade-in duration-300">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'payment' && <PaymentDetailsTab />}
        {activeTab === 'parties' && <PartiesTab />}
        {activeTab === 'timeline' && <TimelineTab />}
      </div>
    </div>
  );
}