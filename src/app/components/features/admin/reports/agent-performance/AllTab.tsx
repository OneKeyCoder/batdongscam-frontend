'use client';

import React, { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import LocationPicker from '@/app/components/LocationPicker';
import AgentPerformanceTable from './AgentPerformanceTable';
import AgentPerformanceAdvancedSearch from './AgentPerformanceAdvancedSearch';

export default function AllTab() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* --- CHARTS SECTION --- */}
      <div>
          {/* Year Filter for Charts */}
          <div className="flex justify-end mb-4">
              <button className="flex items-center justify-between gap-2 px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 min-w-[100px]">
                  2025
                  <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Total Agents (Full Width) */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 lg:col-span-2 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                      <span className="w-4 h-4 rounded-full border border-gray-400 inline-block"></span> Total Agents Growth
                  </h3>
                  <div className="h-48 bg-gray-100/70 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                      [Chart Placeholder: Line Chart]
                  </div>
              </div>

              {/* Chart 2: Tier Distribution (NEW - Mới bổ sung) */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                      <span className="w-4 h-4 rounded-full border border-gray-400 inline-block"></span> Tier Distribution
                  </h3>
                  <div className="h-36 bg-gray-100/70 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                      [Chart Placeholder: Pie/Bar Chart]
                  </div>
              </div>

              {/* Chart 3: Total rates & Avg Rating */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                      <span className="w-4 h-4 rounded-full border border-gray-400 inline-block"></span> Total rates & Average Rating
                  </h3>
                  <div className="h-36 bg-gray-100/70 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                      [Chart Placeholder]
                  </div>
              </div>

              {/* Chart 4: Avg Customer Satisfaction */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 lg:col-span-2 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                      <span className="w-4 h-4 rounded-full border border-gray-400 inline-block"></span> Average Customer Satisfaction
                  </h3>
                  <div className="h-36 bg-gray-100/70 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                      [Chart Placeholder]
                  </div>
              </div>
          </div>
      </div>

      {/* --- FILTER & TABLE SECTION --- */}
      <div className="space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Agent's name or code" className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white" />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg transition-colors text-sm">Search</button>
          </div>

          <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsAdvSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all whitespace-nowrap"
              >
                <Filter className="w-4 h-4" /> Advanced Search <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">3</span>
              </button>
          </div>

          <AgentPerformanceTable />
      </div>

      {/* Modals */}
      <Modal isOpen={isAdvSearchOpen} onClose={() => { if (!isLocPickerOpen) setIsAdvSearchOpen(false); }} title="Advanced Search">
        <AgentPerformanceAdvancedSearch selectedLocations={locations} onRemoveLocation={(loc) => setLocations(prev => prev.filter(l => l !== loc))} onOpenLocationPicker={() => setIsLocPickerOpen(true)} onApply={() => setIsAdvSearchOpen(false)} onReset={() => setLocations([])} />
      </Modal>
      <LocationPicker isOpen={isLocPickerOpen} onClose={() => setIsLocPickerOpen(false)} initialSelected={locations} onConfirm={(newLocs) => { setLocations(newLocs); setIsLocPickerOpen(false); }} />
    </div>
  );
}