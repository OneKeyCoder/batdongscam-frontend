'use client';

import React, { useState } from 'react';
import { Minus, Plus, Search, RotateCcw, ChevronDown, X } from 'lucide-react';
import { PropertyFilters } from '@/lib/api/types';
import { LocationSelection } from '@/app/components/LocationPicker'; 

interface AdvancedSearchFormProps {
  onApply: (filters: PropertyFilters) => void;
  onReset: () => void;
  onOpenLocationPicker: () => void;
  selectedLocations?: LocationSelection[]; 
  onRemoveLocation: (locationId: string) => void;
}

function CounterInput({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
  const handleDecrease = () => onChange(Math.max(0, value - 1));
  const handleIncrease = () => onChange(value + 1);

  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50">
        <input 
            type="text" 
            value={value === 0 ? '---' : value} 
            readOnly 
            className="flex-1 bg-transparent focus:outline-none text-gray-900 text-sm font-medium" 
        />
        <div className="flex items-center gap-3 ml-2">
          <button onClick={handleDecrease} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded">
            <Minus className="w-3.5 h-3.5"/>
          </button>
          <button onClick={handleIncrease} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded">
            <Plus className="w-3.5 h-3.5"/>
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

  const [ownerName, setOwnerName] = useState('');
  const [ownerTier, setOwnerTier] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentTier, setAgentTier] = useState('');

  const [rooms, setRooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [bedrooms, setBedrooms] = useState(0);
  const [floors, setFloors] = useState(0);

  const [houseOrientation, setHouseOrientation] = useState('');
  const [balconyOrientation, setBalconyOrientation] = useState('');

  const handleApply = () => {
      const filters: PropertyFilters = {};
      
      if (status) filters.statuses = [status];
      if (transactionType) filters.transactionType = [transactionType as any];
      if (propertyType) filters.propertyTypeIds = [propertyType];

      if (minPrice) filters.minPrice = Number(minPrice);
      if (maxPrice) filters.maxPrice = Number(maxPrice);
      if (minArea) filters.minArea = Number(minArea);
      if (maxArea) filters.maxArea = Number(maxArea);

      if (rooms > 0) filters.rooms = rooms;
      if (bathrooms > 0) filters.bathrooms = bathrooms;
      if (bedrooms > 0) filters.bedrooms = bedrooms;
      if (floors > 0) filters.floors = floors;

      if (houseOrientation) filters.houseOrientation = houseOrientation;
      if (balconyOrientation) filters.balconyOrientation = balconyOrientation;

      onApply(filters);
  };

  const handleReset = () => {
      setStatus('');
      setPropertyType('');
      setTransactionType('');
      setMinPrice(''); setMaxPrice('');
      setMinArea(''); setMaxArea('');
      setOwnerName(''); setOwnerTier('');
      setAgentName(''); setAgentTier('');
      setRooms(0); setBathrooms(0); setBedrooms(0); setFloors(0);
      setHouseOrientation(''); setBalconyOrientation('');
      onReset(); 
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-5 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
        <p className="text-xs text-gray-500 mb-2">Filter properties by multiple criteria</p>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
             {/* 1. Status & Property Type */}
             <div>
               <label className="block text-xs font-bold text-gray-900 mb-1.5">Status</label>
               <div className="relative">
                 <select 
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-xs font-medium focus:outline-none focus:border-red-500"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                 >
                    <option value="">Multiple</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING">Pending</option>
                    <option value="SOLD">Sold</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
               </div>
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-900 mb-1.5">Property type</label>
               <div className="relative">
                 <select 
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-xs font-medium focus:outline-none focus:border-red-500"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                 >
                    <option value="">House</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="VILLA">Villa</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
               </div>
             </div>

             {/* 2. Transaction Type */}
             <div className="col-span-2">
               <label className="block text-xs font-bold text-gray-900 mb-1.5">Transaction type</label>
               <div className="relative">
                 <select 
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-xs font-medium focus:outline-none focus:border-red-500"
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                 >
                    <option value="">For sale</option>
                    <option value="SALE">For Sale</option>
                    <option value="RENTAL">For Rent</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
               </div>
             </div>

             {/* 3. Price Range */}
             <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">Min price (VNĐ)</label>
                <input type="number" placeholder="10B" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-xs" />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">Max price (VNĐ)</label>
                <input type="number" placeholder="---" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-xs" />
             </div>

             {/* 4. Area Range */}
             <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">Min area (m²)</label>
                <input type="number" placeholder="100" value={minArea} onChange={e => setMinArea(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-xs" />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">Max price (m²)</label>
                <input type="number" placeholder="---" value={maxArea} onChange={e => setMaxArea(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-xs" />
             </div>

             {/* 5. Owner Info */}
             <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">Owner&apos;s name</label>
                <input type="text" placeholder="Văn A" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-xs" />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-900 mb-1.5">Owner&apos;s tier</label>
               <div className="relative">
                 <select 
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-xs font-medium focus:outline-none focus:border-red-500"
                    value={ownerTier}
                    onChange={(e) => setOwnerTier(e.target.value)}
                 >
                    <option value="">All tier</option>
                    <option value="PLATINUM">Platinum</option>
                    <option value="GOLD">Gold</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
               </div>
             </div>

             {/* 6. Agent Info */}
             <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">Agent&apos;s name</label>
                <input type="text" placeholder="---" value={agentName} onChange={e => setAgentName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-xs" />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-900 mb-1.5">Agent&apos;s tier</label>
               <div className="relative">
                 <select 
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-xs font-medium focus:outline-none focus:border-red-500"
                    value={agentTier}
                    onChange={(e) => setAgentTier(e.target.value)}
                 >
                    <option value="">PLANTINUM</option>
                    <option value="GOLD">GOLD</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
               </div>
             </div>

             {/* 7. Counters */}
             <CounterInput label="Number of Rooms" value={rooms} onChange={setRooms} />
             <CounterInput label="Number of Bathrooms" value={bathrooms} onChange={setBathrooms} />
             <CounterInput label="Number of Bedrooms" value={bedrooms} onChange={setBedrooms} />
             <CounterInput label="Number of Floors" value={floors} onChange={setFloors} />

             {/* 8. Orientations */}
             <div>
               <label className="block text-xs font-bold text-gray-900 mb-1.5">House Orientations</label>
               <div className="relative">
                 <select 
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-xs font-medium focus:outline-none focus:border-red-500"
                    value={houseOrientation}
                    onChange={(e) => setHouseOrientation(e.target.value)}
                 >
                    <option value="">North West</option>
                    <option value="NORTH">North</option>
                    <option value="SOUTH">South</option>
                    <option value="EAST">East</option>
                    <option value="WEST">West</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
               </div>
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-900 mb-1.5">Balcony Orientations</label>
               <div className="relative">
                 <select 
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-xs font-medium focus:outline-none focus:border-red-500"
                    value={balconyOrientation}
                    onChange={(e) => setBalconyOrientation(e.target.value)}
                 >
                    <option value="">---</option>
                    <option value="NORTH">North</option>
                    <option value="SOUTH">South</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
               </div>
             </div>

             <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-900 mb-1.5">Location</label>
                <div 
                   onClick={onOpenLocationPicker}
                   className="w-full min-h-[38px] border border-gray-300 rounded-lg px-2 py-1.5 bg-gray-50 flex flex-wrap items-center gap-2 cursor-pointer hover:border-red-500 transition-colors"
                >
                   {selectedLocations.length > 0 ? (
                       selectedLocations.map((loc, idx) => (
                         <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-700 shadow-sm whitespace-nowrap">
                             {loc.name} 
                             <X 
                                 className="w-3 h-3 text-red-500 hover:text-red-700 cursor-pointer" 
                                 onClick={(e) => {
                                     e.stopPropagation();
                                     onRemoveLocation(loc.id); 
                                 }}
                             />
                         </span>
                       ))
                   ) : (
                       <span className="text-xs text-gray-400 px-1">Select cities/districts...</span>
                   )}
                   <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                </div>
             </div>

        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button onClick={handleReset} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
            <RotateCcw className="w-3 h-3" /> Reset All
        </button>
        <button onClick={handleApply} className="px-5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors">
            <Search className="w-3 h-3" /> Apply
        </button>
      </div>
    </div>
  );
}