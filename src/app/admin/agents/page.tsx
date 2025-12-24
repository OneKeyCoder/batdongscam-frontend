'use client';

import React, { useState } from 'react';
import { Search, Filter, ChevronDown, User, TrendingUp, Award, Smile } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import LocationPicker from '@/app/components/LocationPicker';

// Components
import AgentsTable from '@/app/components/features/admin/agents/AgentsTable';
import AgentsAdvancedSearch from '@/app/components/features/admin/agents/AgentsAdvancedSearch';

export default function AgentsPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);
  
  // 1. Thêm State lưu địa điểm
  const [locations, setLocations] = useState<string[]>([]);

  const stats = [
    { title: "Total agents", value: "72.5M", trend: "+12.5%", icon: User },
    { title: "New this month", value: "2,817", trend: "+8.2%", icon: User },
    { title: "Active agents", value: "100", trend: "+12.5%", icon: TrendingUp },
    { title: "Top performer", value: "Minh Phan", trend: "", icon: Award },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Agents List</h2>
        <p className="text-sm text-gray-500">Manage your sales force effectively</p>
      </div>

      <StatsGrid stats={stats} />

      <div className="space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Agent's name or code" className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white" />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg text-sm">Search</button>
          </div>

          <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsAdvSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700"
              >
                <Filter className="w-4 h-4" /> Advanced Search <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">3</span>
              </button>
          </div>
      </div>

      <AgentsTable />

      {/* Modal Advanced Search */}
      <Modal 
        isOpen={isAdvSearchOpen} 
        onClose={() => { if (!isLocPickerOpen) setIsAdvSearchOpen(false); }}
        title="Advanced Search"
      >
        <AgentsAdvancedSearch 
            selectedLocations={locations} // 2. Truyền state vào để hiển thị
            onRemoveLocation={(loc) => setLocations(prev => prev.filter(l => l !== loc))} // 3. Hàm xóa tag
            onOpenLocationPicker={() => setIsLocPickerOpen(true)}
            onApply={() => setIsAdvSearchOpen(false)}
            onReset={() => setLocations([])}
        />
      </Modal>

      {/* Modal Location Picker */}
      <LocationPicker 
        isOpen={isLocPickerOpen} 
        onClose={() => setIsLocPickerOpen(false)}
        initialSelected={locations} // 4. Truyền state hiện tại vào
        onConfirm={(newLocs) => {   // 5. Cập nhật state khi chọn xong
            setLocations(newLocs);
            setIsLocPickerOpen(false);
        }}
      />
    </div>
  );
}