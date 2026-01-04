'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, CheckCircle, Clock, Star, Smile, Plus } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import LocationPicker, { LocationSelection } from '@/app/components/LocationPicker';
import AppointmentTable from '@/app/components/features/admin/appointments/AppointmentTable';
import AppointmentAdvancedSearch from '@/app/components/features/admin/appointments/AppointmentAdvancedSearch';
import AddAppointmentForm from '@/app/components/features/admin/appointments/AddAppointmentForm';
import { ViewingListFilters, appointmentService } from '@/lib/api/services/appointment.service';
import { reportService } from '@/lib/api/services/statistic-report.service';

export default function AppointmentsPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [filters, setFilters] = useState<ViewingListFilters>({
    page: 1, limit: 10, sortType: 'desc', sortBy: 'createdAt'
  });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [locations, setLocations] = useState<LocationSelection[]>([]);

  // State for stats
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    avgRating: 0,
    satisfaction: 0
  });

  // Fetch Statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const currentYear = new Date().getFullYear();

        const [
          totalRes,
          completedRes,
          pendingRes,
          financialRes,
          dashboardRes
        ] = await Promise.all([
          appointmentService.getViewingList({ limit: 1 }),
          appointmentService.getViewingList({ limit: 1, statusEnums: ['COMPLETED'] }),
          appointmentService.getViewingList({ limit: 1, statusEnums: ['PENDING'] }),
          reportService.getFinancialStats(currentYear),
          reportService.getDashboardTopStats()
        ]);

        const getTotal = (res: any) => res.paging?.total ?? res.meta?.total ?? 0;

        setStats({
          total: getTotal(totalRes),
          completed: getTotal(completedRes),
          pending: getTotal(pendingRes),
          avgRating: financialRes?.avgRating ?? 0,
          satisfaction: dashboardRes?.customerStatisfaction ?? 0
        });

      } catch (error) {
        console.error("Failed to fetch appointment stats", error);
      }
    };

    fetchStats();
  }, []);

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

  const handleCreateSuccess = () => {
    setIsAddModalOpen(false);
    window.location.reload();
  };

  // --- Handle Reset & Check Filters ---
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortType: 'desc',
      sortBy: 'createdAt',
      propertyName: ''
    });
    setSearchKeyword('');
    setLocations([]);
  };

  const hasAdvancedFilters = !!(
    // Array checks
    filters.statusEnums?.length ||
    filters.transactionTypeEnums?.length ||
    filters.propertyTypeIds?.length ||
    filters.agentTiers?.length ||
    filters.customerTiers?.length ||
    filters.cityIds?.length ||
    filters.districtIds?.length ||
    filters.wardIds?.length ||
    // String/Text checks
    filters.agentName ||
    filters.customerName ||
    // Date checks
    filters.requestDateFrom ||
    filters.requestDateTo ||
    // Range checks
    filters.minRating !== undefined ||
    filters.maxRating !== undefined
  );
  // ------------------------------------------

  const statsData = [
    { title: "Total appointments", value: stats.total.toLocaleString(), trend: "", icon: Calendar },
    { title: "Completed", value: stats.completed.toLocaleString(), trend: "", icon: CheckCircle },
    { title: "Pending", value: stats.pending.toLocaleString(), trend: "", icon: Clock },
    { title: "Average rating", value: stats.avgRating.toFixed(1), trend: "", icon: Star },
    { title: "Customer satisfaction", value: `${stats.satisfaction}%`, trend: "", icon: Smile },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Appointments</h2>
        <p className="text-sm text-gray-500">View all customers&apos; bookings</p>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={statsData} />

      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text" placeholder="Project/Property listing name"
            className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all"
            value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white px-6 py-1.5 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">Search</button>
        </div>

        {/* Control Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsAdvSearchOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700 transition-all">
              <Filter className="w-4 h-4" /> Advanced Search
            </button>

            {/* Filter Summary & Clear */}
            {hasAdvancedFilters && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded hidden sm:inline-block">
                  {[
                    filters.statusEnums?.length && 'Status',
                    (filters.requestDateFrom || filters.requestDateTo) && 'Date',
                    (filters.minRating !== undefined || filters.maxRating !== undefined) && 'Rating',
                    (filters.cityIds?.length || filters.districtIds?.length) && 'Location'
                  ].filter(Boolean).join(', ')}
                </span>
                <button onClick={handleResetFilters} className="text-xs text-red-600 underline hover:text-red-700 whitespace-nowrap">
                  Clear all
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm"
          >
            <Plus className="w-5 h-5" />
            Add Appointment
          </button>
        </div>
      </div>

      <AppointmentTable filters={filters} onFilterChange={setFilters} />

      {/* --- MODALS --- */}
      <Modal isOpen={isAdvSearchOpen} onClose={() => !isLocPickerOpen && setIsAdvSearchOpen(false)} title="Advanced Search">
        <AppointmentAdvancedSearch
          selectedLocations={locations} onOpenLocationPicker={() => setIsLocPickerOpen(true)}
          onApply={handleAdvancedSearchApply} onReset={handleResetFilters}
          onRemoveLocation={(id) => setLocations(prev => prev.filter(l => l.id !== id))}
        />
      </Modal>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Appointment">
        {isAddModalOpen && <AddAppointmentForm onSuccess={handleCreateSuccess} onCancel={() => setIsAddModalOpen(false)} />}
      </Modal>

      <LocationPicker isOpen={isLocPickerOpen} onClose={() => setIsLocPickerOpen(false)} initialSelected={locations} onConfirm={(newLocations) => { setLocations(newLocations); setIsLocPickerOpen(false); }} />
    </div>
  );
}