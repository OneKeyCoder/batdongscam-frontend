'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ViolationDetailsTab from '@/app/components/features/admin/violations/details/ViolationDetailsTab';
import ViolationEvidenceTab from '@/app/components/features/admin/violations/details/ViolationEvidenceTab';
import ViolationResolutionTab from '@/app/components/features/admin/violations/details/ViolationResolutionTab';

export default function ViolationDetailPage() {
  const [activeTab, setActiveTab] = useState<'details' | 'evidence' | 'resolution'>('details');

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-6">
        {/* Header */}
        <div>
            <Link href="/admin/violations" className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors text-xs font-medium mb-4">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Violations
            </Link>
            <h2 className="text-3xl font-bold text-gray-900">Violation Report Details</h2>
        </div>

        {/* Tabs Nav */}
        <div className="flex gap-8 border-b border-gray-200">
            <button 
                onClick={() => setActiveTab('details')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Details
            </button>
            <button 
                onClick={() => setActiveTab('evidence')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'evidence' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Evidence
            </button>
            <button 
                onClick={() => setActiveTab('resolution')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'resolution' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Resolution
            </button>
        </div>

        {/* Content */}
        <div className="pt-2">
            {activeTab === 'details' && <ViolationDetailsTab />}
            {activeTab === 'evidence' && <ViolationEvidenceTab />}
            {activeTab === 'resolution' && <ViolationResolutionTab />}
        </div>
    </div>
  );
}