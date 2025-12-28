'use client';

import React, { useState } from 'react';
import { Search, Filter, Calendar, CheckCircle, Clock, Star, Smile } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import LocationPicker, { LocationSelection } from '@/app/components/LocationPicker';
import AppointmentTable from '@/app/components/features/admin/appointments/AppointmentTable';
import AppointmentAdvancedSearch from '@/app/components/features/admin/appointments/AppointmentAdvancedSearch';
import { ViewingListFilters } from '@/lib/api/services/appointment.service';

export default function AppointmentsPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);

  const [filters, setFilters] = useState<ViewingListFilters>({
    page: 1, limit: 10, sortType: 'desc', sortBy: 'createdAt'
  });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [locations, setLocations] = useState<LocationSelection[]>([]);

  const handleSearch = () => setFilters(prev => ({ ...prev, propertyName: searchKeyword, page: 1 }));

  const handleAdvancedSearchApply = (newFilters: ViewingListFilters) => {
    const cityIds = locations.filter(l => ['CITY', 'PROVINCE'].includes(l.type?.toUpperCase())).map(l => l.id);
    const districtIds = locations.filter(l => l.type?.toUpperCase() === 'DISTRICT').map(l => l.id);
    const wardIds = locations.filter(l => l.type?.toUpperCase() === 'WARD').map(l => l.id);

    setFilters(prev => ({
      ...prev, ...newFilters,
      cityIds: cityIds.length ? cityIds : undefined,
      districtIds: districtIds.length ? districtIds : undefined,
      wardIds: wardIds.length ? wardIds : undefined,
      page: 1
    }));
    setIsAdvSearchOpen(false);
  };

  const statsData = [
    { title: "Total appointments", value: "---", trend: "", icon: Calendar },
    { title: "Completed", value: "---", trend: "", icon: CheckCircle },
    { title: "Pending", value: "---", trend: "", icon: Clock },
    { title: "Average rating", value: "4.8", trend: "", icon: Star },
    { title: "Customer satisfaction", value: "96.5%", trend: "", icon: Smile },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Appointments</h2>
        <p className="text-sm text-gray-500">View all customers&apos; bookings</p>
      </div>

      <StatsGrid stats={statsData} />

      <div className="space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text" placeholder="Project/Property listing name"
            className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all"
            value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white px-6 py-1.5 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">Search</button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsAdvSearchOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all">
            <Filter className="w-4 h-4" /> Advanced Search
          </button>
        </div>
      </div>

      <AppointmentTable filters={filters} onFilterChange={setFilters} />

      {/* --- MODALS --- */}
      <Modal isOpen={isAdvSearchOpen} onClose={() => !isLocPickerOpen && setIsAdvSearchOpen(false)} title="Advanced Search">
        <AppointmentAdvancedSearch
          selectedLocations={locations} onOpenLocationPicker={() => setIsLocPickerOpen(true)}
          onApply={handleAdvancedSearchApply} onReset={() => setLocations([])}
          onRemoveLocation={(id) => setLocations(prev => prev.filter(l => l.id !== id))}
        />
      </Modal>

      <LocationPicker isOpen={isLocPickerOpen} onClose={() => setIsLocPickerOpen(false)} initialSelected={locations} onConfirm={(newLocations) => { setLocations(newLocations); setIsLocPickerOpen(false); }} />
    </div>
  );
}