'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, User, TrendingUp, Award, RotateCcw } from 'lucide-react';
import StatsGrid from '@/app/components/StatsGrid';
import Modal from '@/app/components/ui/Modal';
import LocationPicker, { LocationSelection } from '@/app/components/LocationPicker';

import AgentsTable from '@/app/components/features/admin/agents/AgentsTable';
import AgentsAdvancedSearch from '@/app/components/features/admin/agents/AgentsAdvancedSearch';

// Services
import { accountService, SaleAgentListItem, SaleAgentFilters } from '@/lib/api/services/account.service';
import { reportService } from '@/lib/api/services/statistic-report.service'; 

export default function AgentsPage() {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);

  // Data State
  const [agents, setAgents] = useState<SaleAgentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // State cho Top Performer
  const [topPerformerName, setTopPerformerName] = useState<string>("---");

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SaleAgentFilters>({
    page: 1,
    limit: 10,
    sortType: 'desc',
    sortBy: 'createdAt'
  });

  const [selectedLocations, setSelectedLocations] = useState<LocationSelection[]>([]);

  // 1. Fetch Stats & Top Performer
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const rankingRes = await reportService.getDashboardAgentRanking(currentMonth, currentYear);

        if (rankingRes && rankingRes.agents && rankingRes.agents.length > 0) {
          const top1 = rankingRes.agents[0];
          setTopPerformerName(`${top1.firstName} ${top1.lastName}`);
        } else {
          setTopPerformerName("No Data");
        }

      } catch (error) {
        console.error("Failed to fetch top performer", error);
      }
    };
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const queryParams: SaleAgentFilters = {
          ...filters,
          name: searchTerm,
        };
        const res = await accountService.getAllSaleAgents(queryParams);
        setAgents(res.data);
        if (res.paging) setTotalItems(res.paging.total);
        else if ((res as any).meta) setTotalItems((res as any).meta.total);
      } catch (error) {
        console.error("Failed to fetch agents", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchAgents, 500);
    return () => clearTimeout(timer);
  }, [filters, searchTerm]);

  const handlePageChange = (page: number) => setFilters(prev => ({ ...prev, page }));

  const handleApplyAdvancedSearch = (newFilters: SaleAgentFilters) => {
    const cityIds = selectedLocations.filter(l => l.type === 'CITY').map(l => l.id);
    const districtIds = selectedLocations.filter(l => l.type === 'DISTRICT').map(l => l.id);

    setFilters(prev => ({
      ...prev,
      ...newFilters,
      cityIds: cityIds.length > 0 ? cityIds : undefined,
      districtIds: districtIds.length > 0 ? districtIds : undefined,
      page: 1
    }));
    setIsAdvSearchOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 10, sortType: 'desc', sortBy: 'createdAt' });
    setSearchTerm('');
    setSelectedLocations([]);
  };

  const stats = [
    {
      title: "Total agents",
      value: totalItems.toLocaleString(),
      trend: "",
      icon: User
    },
    {
      title: "New this month",
      value: "---", 
      trend: "",
      icon: User
    },
    {
      title: "Active agents",
      value: totalItems.toLocaleString(),
      trend: "",
      icon: TrendingUp
    },
    {
      title: "Top performer",
      value: topPerformerName, 
      trend: "Month #" + (new Date().getMonth() + 1), 
      icon: Award
    },
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
          <input
            type="text"
            placeholder="Search by name or code..."
            className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 rounded-lg text-sm">Search</button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdvSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg text-sm text-gray-700"
          >
            <Filter className="w-4 h-4" /> Advanced Search
            <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">
              {Object.keys(filters).length - 4 > 0 ? Object.keys(filters).length - 4 : 0}
            </span>
          </button>

          {(Object.keys(filters).length > 4 || searchTerm) && (
            <button onClick={handleResetFilters} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Reset">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <AgentsTable
        data={agents}
        loading={loading}
        currentPage={filters.page || 1}
        itemsPerPage={filters.limit || 10}
        totalItems={totalItems}
        onPageChange={handlePageChange}
      />

      <Modal
        isOpen={isAdvSearchOpen}
        onClose={() => { if (!isLocPickerOpen) setIsAdvSearchOpen(false); }}
        title="Advanced Search"
      >
        <AgentsAdvancedSearch
          onApply={handleApplyAdvancedSearch}
          onReset={handleResetFilters}
          onOpenLocationPicker={() => setIsLocPickerOpen(true)}
          selectedLocations={selectedLocations.map(l => l.name)}
          onRemoveLocation={(name) => setSelectedLocations(prev => prev.filter(l => l.name !== name))}
        />
      </Modal>

      <LocationPicker
        isOpen={isLocPickerOpen}
        onClose={() => setIsLocPickerOpen(false)}
        initialSelected={selectedLocations}
        onConfirm={(newLocs) => {
          setSelectedLocations(newLocs);
          setIsLocPickerOpen(false);
        }}
      />
    </div>
  );
}