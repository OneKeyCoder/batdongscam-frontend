'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalItems === 0) return null; 

  return (
    <div className={`flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 ${className}`}>
      <p className="text-sm text-gray-700">
        Showing <span className="font-medium">{startItem}-{endItem}</span> of <span className="font-medium">{totalItems}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          disabled={currentPage <= 1}
          className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <span className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium text-sm">
          {currentPage}/{totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}