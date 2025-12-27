'use client';

import React, { useState, useRef } from 'react';
import { ChevronDown, RotateCcw, Search, X, Calendar } from 'lucide-react';
import { PropertyOwnerFilters } from '@/lib/api/services/account.service';

export interface LocationSelection {
  id: string;
  name: string;
  type: 'CITY' | 'DISTRICT' | 'WARD';
}

interface SearchProps {
  onOpenLocationPicker: () => void;
  onApply: (filters: PropertyOwnerFilters) => void;
  onReset: () => void;
  selectedLocations?: LocationSelection[];
  onRemoveLocation: (location: LocationSelection) => void;
}

// Helper Components (Reused from Agent Search for consistency)
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

export default function OwnerAdvancedSearch({
  onOpenLocationPicker, onApply, onReset, selectedLocations = [], onRemoveLocation
}: SearchProps) {

  // State
  const [tier, setTier] = useState('All');
  const [minPoint, setMinPoint] = useState<number | undefined>();
  const [maxPoint, setMaxPoint] = useState<number | undefined>();
  const [minProps, setMinProps] = useState<number | undefined>();
  const [maxProps, setMaxProps] = useState<number | undefined>();
  const [minSale, setMinSale] = useState<number | undefined>();
  const [maxSale, setMaxSale] = useState<number | undefined>();
  const [minRent, setMinRent] = useState<number | undefined>();
  const [maxRent, setMaxRent] = useState<number | undefined>();
  const [minProject, setMinProject] = useState<number | undefined>();
  const [maxProject, setMaxProject] = useState<number | undefined>();
  const [minRank, setMinRank] = useState<number | undefined>();
  const [maxRank, setMaxRank] = useState<number | undefined>();

  const [joinFrom, setJoinFrom] = useState('');
  const [joinTo, setJoinTo] = useState('');

  const handleApply = () => {
    const filters: PropertyOwnerFilters = {};

    if (tier !== 'All') filters.ownerTiers = [tier];

    if (minPoint !== undefined) filters.minContributionPoint = minPoint;
    if (maxPoint !== undefined) filters.maxContributionPoint = maxPoint;

    if (minProps !== undefined) filters.minProperties = minProps;
    if (maxProps !== undefined) filters.maxProperties = maxProps;

    if (minSale !== undefined) filters.minPropertiesForSale = minSale;
    if (maxSale !== undefined) filters.maxPropertiesForSale = maxSale;

    if (minRent !== undefined) filters.minPropertiesForRents = minRent;
    if (maxRent !== undefined) filters.maxPropertiesForRents = maxRent;

    if (minProject !== undefined) filters.minProjects = minProject;
    if (maxProject !== undefined) filters.maxProjects = maxProject;

    if (minRank !== undefined) filters.minRanking = minRank;
    if (maxRank !== undefined) filters.maxRanking = maxRank;

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
    setMinPoint(undefined); setMaxPoint(undefined);
    setMinProps(undefined); setMaxProps(undefined);
    setMinSale(undefined); setMaxSale(undefined);
    setMinRent(undefined); setMaxRent(undefined);
    setMinProject(undefined); setMaxProject(undefined);
    setMinRank(undefined); setMaxRank(undefined);
    setJoinFrom(''); setJoinTo('');
    onReset();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
        <p className="text-sm text-gray-500">Filter property owners by criteria</p>

        <div className="grid grid-cols-2 gap-4">

          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Owner&apos;s tier</label>
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

          <RangeInput labelFrom="Min points" labelTo="Max points" placeholderFrom="100" placeholderTo="5000" valFrom={minPoint} valTo={maxPoint} setValFrom={setMinPoint} setValTo={setMaxPoint} />
          <RangeInput labelFrom="Min properties" labelTo="Max properties" placeholderFrom="1" placeholderTo="50" valFrom={minProps} valTo={maxProps} setValFrom={setMinProps} setValTo={setMaxProps} />
          <RangeInput labelFrom="Min for sale" labelTo="Max for sale" placeholderFrom="1" placeholderTo="20" valFrom={minSale} valTo={maxSale} setValFrom={setMinSale} setValTo={setMaxSale} />
          <RangeInput labelFrom="Min for rent" labelTo="Max for rent" placeholderFrom="1" placeholderTo="20" valFrom={minRent} valTo={maxRent} setValFrom={setMinRent} setValTo={setMaxRent} />
          <RangeInput labelFrom="Min projects" labelTo="Max projects" placeholderFrom="1" placeholderTo="10" valFrom={minProject} valTo={maxProject} setValFrom={setMinProject} setValTo={setMaxProject} />
          <RangeInput labelFrom="Min ranking" labelTo="Max ranking" placeholderFrom="1" placeholderTo="100" valFrom={minRank} valTo={maxRank} setValFrom={setMinRank} setValTo={setMaxRank} />

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