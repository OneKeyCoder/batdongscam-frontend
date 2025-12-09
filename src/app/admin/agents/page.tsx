'use client';

import React, { useState } from 'react';
import { Users, Search, Filter, ChevronDown, Award, Medal, PlusCircle, Building2 } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import LocationPicker from '@/app/components/LocationPicker';
import AgentsTable from '@/app/components/features/agents/AgentsTable';
import SalaryTable from '@/app/components/features/agents/SalaryTable';
import AgentsAdvancedSearch from '@/app/components/features/agents/AgentsAdvancedSearch';
import SalaryAdvancedSearch from '@/app/components/features/agents/SalaryAdvancedSearch';

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<'agents' | 'salary'>('agents');
  
  // Modals state
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);

  // --- STATS CONFIG ---
  const agentsStats = [
    { title: "Total agents", value: "72.5M", trend: "+12.5%", icon: Building2 }, 
    { title: "Platinum", value: "2,817", trend: "+8.2%", icon: Award },
    { title: "Gold", value: "72.5M", trend: "+12.5%", icon: Medal },
    { title: "Silver", value: "72.5M", trend: "+12.5%", icon: Medal },
    { title: "Bronze", value: "72.5M", trend: "+12.5%", icon: Medal },
  ];

  const salaryStats = [
    { title: "Total paid", value: "72.5M", trend: "+12.5%", icon: Building2 },
    { title: "Month salary", value: "2,817", trend: "+8.2%", icon: Award },
    { title: "Month paid", value: "72.5M", trend: "+12.5%", icon: Medal },
    { title: "Month unpaid", value: "72.5M", trend: "", icon: Medal }, 
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Sales Agents</h2>
        <p className="text-sm text-gray-500">Manage your sales team</p>
      </div>

      {/* Stats Grid (Dynamic based on Tab) */}
      <StatsGrid stats={activeTab === 'agents' ? agentsStats : salaryStats} />

      {/* --- TAB & FILTER SECTION --- */}
      <div className="space-y-4">
          
          {/* Row 1: Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                type="text"
                placeholder={activeTab === 'agents' ? "Agent's name or code" : "Search salary records..."}
                className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg transition-colors text-sm">
                Search
            </button>
          </div>

          {/* Row 2: Filters & Tabs */}
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-start md:items-center">
                  
                  {/* Filter Group */}
                  <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setIsAdvSearchOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all whitespace-nowrap"
                      >
                        <Filter className="w-4 h-4" />
                        Advanced Search
                        <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">3</span>
                      </button>

                      <div className="relative group">
                          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all min-w-[140px] justify-between">
                              October, 2025
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                          </button>
                      </div>
                  </div>
              </div>

              {/* Add Button (Only for Agents tab in design?) */}
               {activeTab === 'agents' && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shrink-0 text-sm">
                    <PlusCircle className="w-4 h-4" />
                    Add Agent
                  </button>
               )}
          </div>

          {/* --- TABS NAVIGATION --- */}
          <div className="flex gap-6 border-b border-gray-200 pb-0 mt-4">
              <button 
                onClick={() => setActiveTab('agents')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'agents' 
                    ? 'border-red-600 text-red-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Agents
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
      </div>

      {/* --- CONTENT BASED ON TAB --- */}
      {activeTab === 'agents' ? <AgentsTable /> : <SalaryTable />}

      {/* --- MODALS --- */}
      
      {/* 1. Advanced Search Modal */}
      <Modal 
        isOpen={isAdvSearchOpen} 
        onClose={() => {
            if (!isLocPickerOpen) setIsAdvSearchOpen(false);
        }}
        title="Advanced Search"
      >
        {activeTab === 'agents' ? (
            <AgentsAdvancedSearch 
                onOpenLocationPicker={() => setIsLocPickerOpen(true)}
                onApply={() => setIsAdvSearchOpen(false)}
                onReset={() => {}}
            />
        ) : (
            <SalaryAdvancedSearch 
                onApply={() => setIsAdvSearchOpen(false)}
                onReset={() => {}}
            />
        )}
      </Modal>

      {/* 2. Location Picker (Only used in Agents Search) */}
      <LocationPicker 
        isOpen={isLocPickerOpen} 
        onClose={() => setIsLocPickerOpen(false)}
        onSelect={(val) => {
            console.log("Selected:", val);
            setIsLocPickerOpen(false);
        }}
      />
    </div>
  );
}