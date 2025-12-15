'use client';

import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';

interface FilterBarProps {
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  // Nội dung Form advanced search sẽ được truyền vào đây
  advancedSearchContent?: React.ReactNode; 
}

export default function FilterBar({ 
  searchPlaceholder = "Search...", 
  onSearch, 
  advancedSearchContent 
}: FilterBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
        
        <button className="hidden md:block px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shrink-0">
            Search
        </button>

        {advancedSearchContent && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 font-medium rounded-xl text-gray-700 transition-all shrink-0"
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Advanced Search</span>
            <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-md ml-1">3</span>
          </button>
        )}
      </div>

      {/* Modal được tích hợp sẵn trong FilterBar */}
      {advancedSearchContent && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Advanced Search"
        >
          {advancedSearchContent}
        </Modal>
      )}
    </>
  );
}