'use client';

import React, { useState } from 'react';
import { Search, Filter, ChevronDown, Award, TrendingUp, Users, Smile } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import LocationPicker from '@/app/components/LocationPicker';
import CustomersTable from '@/app/components/features/customers/CustomersTable';
import OwnersTable from '@/app/components/features/customers/OwnersTable';
import CustomersAdvancedSearch from '@/app/components/features/customers/CustomersAdvancedSearch';
import OwnersAdvancedSearch from '@/app/components/features/customers/OwnersAdvancedSearch';

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState<'customers' | 'owners'>('customers');
  
  // Modals state
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);

  // --- STATS CONFIG ---
  const customerStats = [
    { title: "Total customers", value: "72.5M", trend: "+12.5%", icon: Users }, 
    { title: "New this month", value: "2,817", trend: "+8.2%", icon: Users },
    { title: "High value customers", value: "72.5M", trend: "+12.5%", icon: TrendingUp },
    { title: "Customer satisfaction", value: "95.8%", trend: "+12.5%", icon: Smile },
  ];

  const ownerStats = [
    { title: "Total owners", value: "72.5M", trend: "+12.5%", icon: Users },
    { title: "New this month", value: "2,817", trend: "+8.2%", icon: Users },
    { title: "Contribution value", value: "10.000B", trend: "+12.5%", icon: TrendingUp },
    { title: "Average value per owner", value: "20B", trend: "+12.5%", icon: Award }, 
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Customer & Owners</h2>
        <p className="text-sm text-gray-500">Hello 1234</p>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={activeTab === 'customers' ? customerStats : ownerStats} />

      {/* --- TAB & FILTER SECTION --- */}
      <div className="space-y-4">
          
          {/* Row 1: Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                type="text"
                placeholder={activeTab === 'customers' ? "Customer's name" : "Property owner's name"}
                className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg transition-colors text-sm">
                Search
            </button>
          </div>

          {/* Row 2: Filters & Tabs */}
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
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

          {/* --- TABS NAVIGATION --- */}
          <div className="flex gap-6 border-b border-gray-200 pb-0 mt-4">
              <button 
                onClick={() => setActiveTab('customers')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'customers' 
                    ? 'border-red-600 text-red-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Customers
              </button>
              <button 
                 onClick={() => setActiveTab('owners')}
                 className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === 'owners' 
                    ? 'border-red-600 text-red-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Property Owners
              </button>
          </div>
      </div>

      {/* --- CONTENT --- */}
      {activeTab === 'customers' ? <CustomersTable /> : <OwnersTable />}

      {/* --- MODALS --- */}
      
      <Modal 
        isOpen={isAdvSearchOpen} 
        onClose={() => {
            if (!isLocPickerOpen) setIsAdvSearchOpen(false);
        }}
        title="Advanced Search"
      >
        {activeTab === 'customers' ? (
            <CustomersAdvancedSearch 
                onOpenLocationPicker={() => setIsLocPickerOpen(true)}
                onApply={() => setIsAdvSearchOpen(false)}
                onReset={() => {}}
            />
        ) : (
            <OwnersAdvancedSearch 
                onOpenLocationPicker={() => setIsLocPickerOpen(true)}
                onApply={() => setIsAdvSearchOpen(false)}
                onReset={() => {}}
            />
        )}
      </Modal>

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