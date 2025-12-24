'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronDown } from 'lucide-react';

import AgentProfileCard from '@/app/components/features/admin/agents/details/AgentProfileCard';
import AgentPerformanceTab from '@/app/components/features/admin/agents/details/AgentPerformanceTab';
import AgentSalaryTab from '@/app/components/features/admin/agents/details/AgentSalaryTab';

export default function AgentDetailPage() {
  const [activeTab, setActiveTab] = useState<'performance' | 'salary'>('performance');

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">
      {/* Back Link */}
      <div>
         <Link 
            href="/admin/agents" 
            className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors text-xs font-medium"
         >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Agents List
         </Link>
      </div>

      {/* Profile Card */}
      <AgentProfileCard />

      {/* --- TABS & FILTER --- */}
      <div className="flex flex-col md:flex-row items-end justify-between border-b border-gray-200">
          {/* Tabs Nav */}
          <div className="flex gap-6">
              <button 
                onClick={() => setActiveTab('performance')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'performance' 
                    ? 'border-red-600 text-red-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Performance
              </button>
              <button 
                 onClick={() => setActiveTab('salary')}
                 className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'salary' 
                    ? 'border-red-600 text-red-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Salary
              </button>
          </div>

          {/* Date Picker (Top Right of Tabs) */}
          <div className="mb-2 relative">
             <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-xs text-gray-700 transition-all min-w-[130px] justify-between">
                October, 2025
                <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
          </div>
      </div>

      {/* --- TAB CONTENT --- */}
      <div className="pt-2">
          {activeTab === 'performance' ? <AgentPerformanceTab /> : <AgentSalaryTab />}
      </div>
    </div>
  );
}