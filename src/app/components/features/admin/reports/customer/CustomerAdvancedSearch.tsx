'use client';

import React, { useState, useRef } from 'react';
import { ChevronDown, RotateCcw, Search, X, Calendar } from 'lucide-react';
import { CustomerFilters } from '@/lib/api/services/account.service';

export interface LocationSelection {
  id: string;
  name: string;
  type: 'CITY' | 'DISTRICT' | 'WARD';
}

interface SearchProps {
  onOpenLocationPicker: () => void;
  onApply: (filters: CustomerFilters) => void;
  onReset: () => void;
  selectedLocations?: LocationSelection[];
  onRemoveLocation: (location: LocationSelection) => void;
}

// Helper Components
const RangeInput = ({ labelFrom, labelTo, placeholderFrom, placeholderTo, valFrom, valTo, setValFrom, setValTo }: any) => {
  const handleNumberChange = (val: string, setter: (v: number | undefined) => void) => {
    if (val === '') { setter(undefined); return; }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) setter(num);
  };
  return (
    <>
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-1.5">{labelFrom}</label>
        <input type="number" min="0" placeholder={placeholderFrom} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500"
          value={valFrom !== undefined ? valFrom : ''} onChange={(e) => handleNumberChange(e.target.value, setValFrom)}
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-1.5">{labelTo}</label>
        <input type="number" min="0" placeholder={placeholderTo} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500"
          value={valTo !== undefined ? valTo : ''} onChange={(e) => handleNumberChange(e.target.value, setValTo)}
        />
      </div>
    </>
  );
};

const DateInput = ({ label, value, onChange }: any) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
      <div className="relative w-full border border-gray-300 rounded-lg bg-gray-50 cursor-pointer" onClick={() => ref.current?.showPicker()}>
        <input ref={ref} type="date" className="w-full pl-3 pr-10 py-2.5 bg-transparent text-sm focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden" value={value} onChange={(e) => onChange(e.target.value)} />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default function CustomerAdvancedSearch({
  onOpenLocationPicker, onApply, onReset, selectedLocations = [], onRemoveLocation
}: SearchProps) {

  // State
  const [tier, setTier] = useState('All');
  const [minScore, setMinScore] = useState<number | undefined>();
  const [maxScore, setMaxScore] = useState<number | undefined>();
  const [minViews, setMinViews] = useState<number | undefined>();
  const [maxViews, setMaxViews] = useState<number | undefined>();
  const [minSpend, setMinSpend] = useState<number | undefined>();
  const [maxSpend, setMaxSpend] = useState<number | undefined>();
  const [minContracts, setMinContracts] = useState<number | undefined>();
  const [maxContracts, setMaxContracts] = useState<number | undefined>();
  const [minBought, setMinBought] = useState<number | undefined>();
  const [maxBought, setMaxBought] = useState<number | undefined>();
  const [minRented, setMinRented] = useState<number | undefined>();
  const [maxRented, setMaxRented] = useState<number | undefined>();

  const [joinFrom, setJoinFrom] = useState('');
  const [joinTo, setJoinTo] = useState('');

  const handleApply = () => {
    const filters: CustomerFilters = {};

    if (tier !== 'All') filters.customerTiers = [tier];

    if (minScore !== undefined) filters.minLeadingScore = minScore;
    if (maxScore !== undefined) filters.maxLeadingScore = maxScore;

    if (minViews !== undefined) filters.minViewings = minViews;
    if (maxViews !== undefined) filters.maxViewings = maxViews;

    if (minSpend !== undefined) filters.minSpending = minSpend;
    if (maxSpend !== undefined) filters.maxSpending = maxSpend;

    if (minContracts !== undefined) filters.minContracts = minContracts;
    if (maxContracts !== undefined) filters.maxContracts = maxContracts;

    if (minBought !== undefined) filters.minPropertiesBought = minBought;
    if (maxBought !== undefined) filters.maxPropertiesBought = maxBought;

    if (minRented !== undefined) filters.minPropertiesRented = minRented;
    if (maxRented !== undefined) filters.maxPropertiesRented = maxRented;

    // Dates (using T00:00:00 logic)
    if (joinFrom) {
      filters.joinedDateFrom = `${joinFrom}T00:00:00`;
      filters.joinedDateTo = joinTo ? `${joinTo}T23:59:59` : `${new Date().toISOString().split('T')[0]}T23:59:59`;
    } else if (joinTo) {
      filters.joinedDateTo = `${joinTo}T23:59:59`;
    }

    // Locations
    if (selectedLocations.length > 0) {
      filters.cityIds = selectedLocations.filter(l => l.type === 'CITY').map(l => l.id);
      filters.districtIds = selectedLocations.filter(l => l.type === 'DISTRICT').map(l => l.id);
      filters.wardIds = selectedLocations.filter(l => l.type === 'WARD').map(l => l.id);
    }

    onApply(filters);
  };

  const handleResetInternal = () => {
    setTier('All');
    setMinScore(undefined); setMaxScore(undefined);
    setMinViews(undefined); setMaxViews(undefined);
    setMinSpend(undefined); setMaxSpend(undefined);
    setMinContracts(undefined); setMaxContracts(undefined);
    setMinBought(undefined); setMaxBought(undefined);
    setMinRented(undefined); setMaxRented(undefined);
    setJoinFrom(''); setJoinTo('');
    onReset();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
        <p className="text-sm text-gray-500">Filter customers by criteria</p>

        <div className="grid grid-cols-2 gap-4">

          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Customer&apos;s tier</label>
            <div className="relative">
              <select className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500"
                value={tier} onChange={(e) => setTier(e.target.value)}>
                <option value="All">All Tiers</option>
                <option value="BRONZE">Bronze</option>
                <option value="SILVER">Silver</option>
                <option value="GOLD">Gold</option>
                <option value="PLATINUM">Platinum</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="hidden md:block"></div>

          <RangeInput labelFrom="Min score" labelTo="Max score" placeholderFrom="10" placeholderTo="100" valFrom={minScore} valTo={maxScore} setValFrom={setMinScore} setValTo={setMaxScore} />
          <RangeInput labelFrom="Min viewings" labelTo="Max viewings" placeholderFrom="1" placeholderTo="50" valFrom={minViews} valTo={maxViews} setValFrom={setMinViews} setValTo={setMaxViews} />
          <RangeInput labelFrom="Min spending" labelTo="Max spending" placeholderFrom="1B" placeholderTo="10B" valFrom={minSpend} valTo={maxSpend} setValFrom={setMinSpend} setValTo={setMaxSpend} />
          <RangeInput labelFrom="Min contracts" labelTo="Max contracts" placeholderFrom="1" placeholderTo="20" valFrom={minContracts} valTo={maxContracts} setValFrom={setMinContracts} setValTo={setMaxContracts} />
          <RangeInput labelFrom="Min bought" labelTo="Max bought" placeholderFrom="1" placeholderTo="10" valFrom={minBought} valTo={maxBought} setValFrom={setMinBought} setValTo={setMaxBought} />
          <RangeInput labelFrom="Min rented" labelTo="Max rented" placeholderFrom="1" placeholderTo="10" valFrom={minRented} valTo={maxRented} setValFrom={setMinRented} setValTo={setMaxRented} />

          <div className="col-span-2 h-px bg-gray-100 my-1"></div>

          <DateInput label="Join date from" value={joinFrom} onChange={setJoinFrom} />
          <DateInput label="Join date to" value={joinTo} onChange={setJoinTo} />

          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Location</label>
            <div onClick={onOpenLocationPicker} className="w-full min-h-[42px] border border-gray-300 rounded-lg px-2 py-1.5 bg-gray-50 flex flex-wrap items-center gap-2 cursor-pointer hover:border-red-500 transition-colors">
              {selectedLocations.length > 0 ? (
                selectedLocations.map((loc, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 shadow-sm whitespace-nowrap">
                    {loc.name}
                    <X className="w-3 h-3 text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); onRemoveLocation(loc); }} />
                  </span>
                ))
              ) : <span className="text-sm text-gray-400 px-1">Select cities/districts...</span>}
              <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button onClick={handleResetInternal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
          <RotateCcw className="w-3 h-3" /> Reset All
        </button>
        <button onClick={handleApply} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm">
          <Search className="w-3 h-3" /> Apply
        </button>
      </div>
    </div>
  );
}