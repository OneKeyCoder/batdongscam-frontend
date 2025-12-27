'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import ViolationDetailsTab from '@/app/components/features/admin/violations/details/ViolationDetailsTab';
import ViolationEvidenceTab from '@/app/components/features/admin/violations/details/ViolationEvidenceTab';
import ViolationResolutionTab from '@/app/components/features/admin/violations/details/ViolationResolutionTab';
import { violationService, ViolationAdminDetails } from '@/lib/api/services/violation.service';

export default function ViolationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [activeTab, setActiveTab] = useState<'details' | 'evidence' | 'resolution'>('details');
    const [data, setData] = useState<ViolationAdminDetails | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await violationService.getViolationAdminDetails(id);
            setData(res);
        } catch (error) {
            console.error("Fetch detail failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;
    if (!data) return <div className="text-center py-20">Report not found</div>;

    return (
        <div className="max-w-5xl mx-auto pb-10 space-y-6">
            <div>
                <Link href="/admin/violations" className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors text-xs font-medium mb-4">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Violations
                </Link>
                <h2 className="text-3xl font-bold text-gray-900">Violation Report Details</h2>
            </div>

            <div className="flex gap-8 border-b border-gray-200">
                {['details', 'evidence', 'resolution'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="pt-2">
                {activeTab === 'details' && <ViolationDetailsTab data={data} />}
                {activeTab === 'evidence' && <ViolationEvidenceTab data={data} />}
                {activeTab === 'resolution' && <ViolationResolutionTab data={data} onUpdateSuccess={fetchData} />}
            </div>
        </div>
    );
}