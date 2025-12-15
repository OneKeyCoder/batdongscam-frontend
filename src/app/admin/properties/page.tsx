'use client';

import React from 'react';
import { Building, FilePlus, Tag, Key, FolderKanban } from 'lucide-react';
import StatsGrid, { StatItemData } from '@/app/components/StatsGrid';
import FilterBar from '@/app/components/FilterBar';
import PropertiesTable from '@/app/components/features/properties/PropertiesTable';
import AdvancedSearchForm from '@/app/components/features/properties/AdvancedSearchForm';

export default function PropertiesManagementPage() {
  
  // 1. Config Stats
  const statsData: StatItemData[] = [
    { title: "Total Properties", value: "72.5M", trend: "+12.5%", icon: Building },
    { title: "New this month", value: "2,817", trend: "+8.2%", icon: FilePlus },
    { title: "For sales", value: "72.5M", trend: "+12.5%", icon: Tag },
    { title: "For rents", value: "72.5M", trend: "+12.5%", icon: Key },
    { title: "Projects", value: "72.5M", trend: "+12.5%", icon: FolderKanban },
  ];

  // 2. Handle Filters
  const handleSearch = (term: string) => {
    console.log("Searching for:", term);
  };

  return (
    <div>
      {/* Header Text */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Properties Management</h2>
        <p className="text-sm text-gray-500">Manage all your property listings</p>
      </div>

      {/* Reusable Stats Grid */}
      <StatsGrid stats={statsData} />

      {/* Reusable Filter Bar */}
      <FilterBar 
        searchPlaceholder="Project/Property listing name"
        onSearch={handleSearch}
        advancedSearchContent={
            <AdvancedSearchForm 
                onApply={() => console.log('Apply')} 
                onReset={() => console.log('Reset')} 
            />
        }
      />

      {/* Table */}
      <PropertiesTable />
    </div>
  );
}