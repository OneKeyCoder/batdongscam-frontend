'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Filter, ChevronLeft } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import SelectAgentTable from '@/app/components/features/admin/appointments/SelectAgentTable';
import SelectAgentAdvancedSearch from '@/app/components/features/admin/appointments/SelectAgentAdvancedSearch';

export default function ChangeAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);

  const handleSelectAgent = (agentId: number) => {
      console.log(`Assigning Agent ${agentId} to Appointment ${id}`);
      router.push(`/admin/appointments/${id}`);
  };

  return (
    <div className="space-y-6">
      <div>
         <Link href={`/admin/appointments/${id}`} className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors text-xs font-medium mb-2">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Appointment Details
         </Link>
         <div className="flex items-center gap-4 mt-2">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="Agent's name or code" className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white" />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg transition-colors text-sm">Search</button>
             </div>
             <button onClick={() => setIsAdvSearchOpen(true)} className="flex items-center gap-2 px-3 py-3 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all whitespace-nowrap h-[50px]">
                <Filter className="w-4 h-4" /> Advanced Search <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">3</span>
             </button>
         </div>
      </div>

      <SelectAgentTable onSelect={handleSelectAgent} />

      <Modal isOpen={isAdvSearchOpen} onClose={() => setIsAdvSearchOpen(false)} title="Advanced Search">
        <SelectAgentAdvancedSearch onApply={() => setIsAdvSearchOpen(false)} onReset={() => {}} />
      </Modal>
    </div>
  );
}