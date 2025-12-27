'use client';

import React, { useState } from 'react';
import { Minus, Plus, Search, RotateCcw, ChevronDown, X, AlertTriangle } from 'lucide-react';
import { PropertyFilters } from '@/lib/api/types';
import { LocationSelection } from '@/app/components/LocationPicker';

interface AdvancedSearchFormProps {
  onApply: (filters: PropertyFilters) => void;
  onReset: () => void;
  onOpenLocationPicker: () => void;
  selectedLocations?: LocationSelection[];
  onRemoveLocation: (locationId: string) => void;
}

// Component Input số lượng (Không cho phép số âm)
function CounterInput({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
  const handleDecrease = () => onChange(Math.max(0, value - 1));
  const handleIncrease = () => onChange(value + 1);

  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 hover:border-gray-400 transition-colors">
        <input
          type="text"
          value={value === 0 ? 'Any' : value}
          readOnly
          className="flex-1 bg-transparent focus:outline-none text-gray-900 text-sm font-medium cursor-default"
        />
        <div className="flex items-center gap-2 ml-2">
          <button onClick={handleDecrease} type="button" className="text-gray-400 hover:text-red-600 p-1 hover:bg-gray-200 rounded transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          <button onClick={handleIncrease} type="button" className="text-gray-400 hover:text-green-600 p-1 hover:bg-gray-200 rounded transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdvancedSearchForm({
  onApply,
  onReset,
  onOpenLocationPicker,
  selectedLocations = [],
  onRemoveLocation
}: AdvancedSearchFormProps) {

  const [status, setStatus] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [transactionType, setTransactionType] = useState('');

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');

  const [rooms, setRooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [bedrooms, setBedrooms] = useState(0);
  const [floors, setFloors] = useState(0);

  const [houseOrientation, setHouseOrientation] = useState('');
  const [balconyOrientation, setBalconyOrientation] = useState('');

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setter(val);
    }
  };

  const handleApply = () => {
    const minP = minPrice ? Number(minPrice) : 0;
    const maxP = maxPrice ? Number(maxPrice) : 0;
    const minA = minArea ? Number(minArea) : 0;
    const maxA = maxArea ? Number(maxArea) : 0;

    // Validation
    if (maxP > 0 && minP > maxP) {
      alert("Min Price cannot be greater than Max Price!");
      return;
    }
    if (maxA > 0 && minA > maxA) {
      alert("Min Area cannot be greater than Max Area!");
      return;
    }

    const filters: PropertyFilters = {};

    // Mapping Filters
    if (status) filters.statuses = [status];
    if (transactionType) filters.transactionType = [transactionType as any];
    if (propertyType) filters.propertyTypeIds = [propertyType];

    if (minP > 0) filters.minPrice = minP;
    if (maxP > 0) filters.maxPrice = maxP;
    if (minA > 0) filters.minArea = minA;
    if (maxA > 0) filters.maxArea = maxA;

    if (rooms > 0) filters.rooms = rooms;
    if (bathrooms > 0) filters.bathrooms = bathrooms;
    if (bedrooms > 0) filters.bedrooms = bedrooms;
    if (floors > 0) filters.floors = floors;

    if (houseOrientation) filters.houseOrientation = houseOrientation;
    if (balconyOrientation) filters.balconyOrientation = balconyOrientation;

    // Mapping Locations
    if (selectedLocations.length > 0) {
      const cityIds: string[] = [];
      const districtIds: string[] = [];
      const wardIds: string[] = [];

      selectedLocations.forEach(loc => {
        if (loc.type === 'CITY') cityIds.push(loc.id);
        else if (loc.type === 'DISTRICT') districtIds.push(loc.id);
        else if (loc.type === 'WARD') wardIds.push(loc.id);
      });

      if (cityIds.length > 0) filters.cityIds = cityIds;
      if (districtIds.length > 0) filters.districtIds = districtIds;
      if (wardIds.length > 0) filters.wardIds = wardIds;
    }

    onApply(filters);
  };

  const handleReset = () => {
    setStatus(''); setPropertyType(''); setTransactionType('');
    setMinPrice(''); setMaxPrice('');
    setMinArea(''); setMaxArea('');
    setRooms(0); setBathrooms(0); setBedrooms(0); setFloors(0);
    setHouseOrientation(''); setBalconyOrientation('');
    onReset();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-6 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
        <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p>Use filters to narrow down properties. Empty fields will be ignored.</p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          {/* 1. Status */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5">Status</label>
            <div className="relative">
              <select
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-xs font-medium focus:outline-none focus:border-red-500 cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
                <option value="SOLD">Sold</option>
                <option value="RENTED">Rented</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* 2. Property Type */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5">Property Type</label>
            <div className="relative">
              <select
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-xs font-medium focus:outline-none focus:border-red-500 cursor-pointer"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="APARTMENT">Apartment</option>
                <option value="VILLA">Villa</option>
                <option value="HOUSE">House</option>
                <option value="LAND">Land</option>
                <option value="OFFICE">Office</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* 3. Transaction Type */}
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-900 mb-1.5">Transaction Type</label>
            <div className="relative">
              <select
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-xs font-medium focus:outline-none focus:border-red-500 cursor-pointer"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
              >
                <option value="">All</option>
                <option value="SALE">For Sale</option>
                <option value="RENTAL">For Rent</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* 4. Price Range */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5">Min Price (VNĐ)</label>
            <input type="text" placeholder="0" value={minPrice} onChange={(e) => handleNumberInput(e, setMinPrice)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-xs focus:outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5">Max Price (VNĐ)</label>
            <input type="text" placeholder="Unlimited" value={maxPrice} onChange={(e) => handleNumberInput(e, setMaxPrice)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-xs focus:outline-none focus:border-red-500" />
          </div>

          {/* 5. Area Range */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5">Min Area (m²)</label>
            <input type="text" placeholder="0" value={minArea} onChange={(e) => handleNumberInput(e, setMinArea)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-xs focus:outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5">Max Area (m²)</label>
            <input type="text" placeholder="Unlimited" value={maxArea} onChange={(e) => handleNumberInput(e, setMaxArea)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-xs focus:outline-none focus:border-red-500" />
          </div>

          {/* 6. Counters */}
          <CounterInput label="Bedrooms" value={bedrooms} onChange={setBedrooms} />
          <CounterInput label="Bathrooms" value={bathrooms} onChange={setBathrooms} />
          <CounterInput label="Floors" value={floors} onChange={setFloors} />
          <CounterInput label="Rooms (Total)" value={rooms} onChange={setRooms} />

          {/* 7. Orientations */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5">House Orientations</label>
            <div className="relative">
              <select
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-xs font-medium focus:outline-none focus:border-red-500 cursor-pointer"
                value={houseOrientation}
                onChange={(e) => setHouseOrientation(e.target.value)}
              >
                <option value="">Any</option>
                <option value="NORTH">North</option>
                <option value="SOUTH">South</option>
                <option value="EAST">East</option>
                <option value="WEST">West</option>
                <option value="NORTH_EAST">North East</option>
                <option value="NORTH_WEST">North West</option>
                <option value="SOUTH_EAST">South East</option>
                <option value="SOUTH_WEST">South West</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5">Balcony Orientations</label>
            <div className="relative">
              <select
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-xs font-medium focus:outline-none focus:border-red-500 cursor-pointer"
                value={balconyOrientation}
                onChange={(e) => setBalconyOrientation(e.target.value)}
              >
                <option value="">Any</option>
                <option value="NORTH">North</option>
                <option value="SOUTH">South</option>
                <option value="EAST">East</option>
                <option value="WEST">West</option>
                <option value="NORTH_EAST">North East</option>
                <option value="NORTH_WEST">North West</option>
                <option value="SOUTH_EAST">South East</option>
                <option value="SOUTH_WEST">South West</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* 8. Location Display */}
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-900 mb-1.5">Location</label>
            <div
              onClick={onOpenLocationPicker}
              className="w-full min-h-[42px] border border-gray-300 rounded-lg px-2 py-1.5 bg-gray-50 flex flex-wrap items-center gap-1.5 cursor-pointer hover:border-red-500 transition-colors"
            >
              {selectedLocations.length > 0 ? (
                selectedLocations.map((loc, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-700 shadow-sm max-w-full"
                    title={loc.name} 
                  >
                    <span className="truncate max-w-[150px]">
                      {loc.name.length > 25 ? loc.name.substring(0, 25) + '...' : loc.name}
                    </span>
                    <div
                      className="p-0.5 hover:bg-red-50 rounded cursor-pointer group"
                      onClick={(e) => { e.stopPropagation(); onRemoveLocation(loc.id); }}
                    >
                      <X className="w-3 h-3 text-gray-400 group-hover:text-red-600" />
                    </div>
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400 px-2 italic select-none">Select cities, districts...</span>
              )}

              <div className="ml-auto pl-1">
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button onClick={handleReset} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <RotateCcw className="w-3.5 h-3.5" /> Reset All
        </button>
        <button onClick={handleApply} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors">
          <Search className="w-3.5 h-3.5" /> Apply Filters
        </button>
      </div>
    </div>
  );
}