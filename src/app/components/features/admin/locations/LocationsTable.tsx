'use client';

import React from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { LocationCardResponse } from '@/lib/api/services/location.service';

interface LocationsTableProps {
  data: LocationCardResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function LocationsTable({ 
    data, isLoading, totalItems, currentPage, itemsPerPage, onPageChange 
}: LocationsTableProps) {

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900">Name</th>
              <th className="px-6 py-4 font-bold text-gray-900">Area (km²)</th>
              <th className="px-6 py-4 font-bold text-gray-900">Population</th>
              <th className="px-6 py-4 font-bold text-gray-900">Status</th>
              <th className="px-6 py-4 font-bold text-gray-900">Avg land price (VNĐ/m²)</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Loading...</td></tr>
            ) : data.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10">No locations found.</td></tr>
            ) : (
                data.map((loc) => (
                <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <img 
                            src={loc.imgUrl || 'https://placehold.co/100x100?text=No+Img'} 
                            alt={loc.name} 
                            className="w-10 h-10 rounded-lg object-cover bg-gray-200" 
                        />
                        <span className="font-bold text-gray-900">{loc.name}</span>
                    </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{loc.totalArea ? loc.totalArea.toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 text-gray-900">{loc.population ? loc.population.toLocaleString() : '-'}</td>
                    <td className="px-6 py-4">
                        <Badge variant={loc.isActive ? 'success' : 'danger'}>
                            {loc.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                        {loc.avgLandPrice ? loc.avgLandPrice.toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <Link 
                            href={`/admin/locations/${loc.id}`} 
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg inline-flex items-center justify-center transition-colors"
                        >
                            <Eye className="w-5 h-5" />
                        </Link>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={itemsPerPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}