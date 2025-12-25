'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { locationService } from '@/lib/api/services/location.service';

export interface AdvancedSearchFilters {
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  ownerName?: string;
  ownerTier?: string;
  numberOfRooms?: number;
  numberOfBathrooms?: number;
  numberOfBedrooms?: number;
  numberOfFloors?: number;
  houseOrientation?: string;
  balconyOrientation?: string;
  cityIds?: string[];
  districtIds?: string[];
  wardIds?: string[];
}

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: AdvancedSearchFilters) => void;
  initialFilters?: AdvancedSearchFilters;
}

export default function AdvancedSearchModal({
  isOpen,
  onClose,
  onApply,
  initialFilters = {}
}: AdvancedSearchModalProps) {
  const [filters, setFilters] = useState<AdvancedSearchFilters>(initialFilters);
  const [cities, setCities] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const citiesMap = await locationService.getChildLocations('CITY');
        setCities(citiesMap);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Advanced Search</h2>
            <p className="text-sm text-gray-600 mt-1">Filter properties by multiple criteria</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Min price (VND)
              </label>
              <input
                type="number"
                placeholder="---"
                value={filters.minPrice || ''}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Max price (VND)
              </label>
              <input
                type="number"
                placeholder="---"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          {/* Area Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Min area (m²)
              </label>
              <input
                type="number"
                placeholder="---"
                value={filters.minArea || ''}
                onChange={(e) => setFilters({ ...filters, minArea: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Max area (m²)
              </label>
              <input
                type="number"
                placeholder="---"
                value={filters.maxArea || ''}
                onChange={(e) => setFilters({ ...filters, maxArea: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          {/* Owner Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Owner's name
              </label>
              <input
                type="text"
                placeholder="Enter owner name"
                value={filters.ownerName || ''}
                onChange={(e) => setFilters({ ...filters, ownerName: e.target.value || undefined })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Owner's tier
              </label>
              <div className="relative">
                <select
                  value={filters.ownerTier || ''}
                  onChange={(e) => setFilters({ ...filters, ownerTier: e.target.value || undefined })}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-gray-900 bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  <option value="">All tier</option>
                  <option value="BRONZE">Bronze</option>
                  <option value="SILVER">Silver</option>
                  <option value="GOLD">Gold</option>
                  <option value="PLATINUM">Platinum</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Room Counts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Number of Rooms
              </label>
              <input
                type="number"
                value={filters.numberOfRooms || ''}
                onChange={(e) => setFilters({ ...filters, numberOfRooms: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                placeholder="---"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Number of Bathrooms
              </label>
              <input
                type="number"
                value={filters.numberOfBathrooms || ''}
                onChange={(e) => setFilters({ ...filters, numberOfBathrooms: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                placeholder="---"
              />
            </div>
          </div>

          {/* Bedrooms and Floors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Number of Bedrooms
              </label>
              <input
                type="number"
                value={filters.numberOfBedrooms || ''}
                onChange={(e) => setFilters({ ...filters, numberOfBedrooms: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                placeholder="---"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Number of Floors
              </label>
              <input
                type="number"
                placeholder="---"
                value={filters.numberOfFloors || ''}
                onChange={(e) => setFilters({ ...filters, numberOfFloors: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          {/* Orientations */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                House Orientations
              </label>
              <div className="relative">
                <select
                  value={filters.houseOrientation || ''}
                  onChange={(e) => setFilters({ ...filters, houseOrientation: e.target.value || undefined })}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-gray-900 bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  <option value="">---</option>
                  <option value="NORTH">North</option>
                  <option value="SOUTH">South</option>
                  <option value="EAST">East</option>
                  <option value="WEST">West</option>
                  <option value="NORTHEAST">North East</option>
                  <option value="NORTHWEST">North West</option>
                  <option value="SOUTHEAST">South East</option>
                  <option value="SOUTHWEST">South West</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Balcony Orientations
              </label>
              <div className="relative">
                <select
                  value={filters.balconyOrientation || ''}
                  onChange={(e) => setFilters({ ...filters, balconyOrientation: e.target.value || undefined })}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-gray-900 bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  <option value="">---</option>
                  <option value="NORTH">North</option>
                  <option value="SOUTH">South</option>
                  <option value="EAST">East</option>
                  <option value="WEST">West</option>
                  <option value="NORTHEAST">North East</option>
                  <option value="NORTHWEST">North West</option>
                  <option value="SOUTHEAST">South East</option>
                  <option value="SOUTHWEST">South West</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Reset All
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            ✓ Apply
          </button>
        </div>
      </div>
    </div>
  );
}
