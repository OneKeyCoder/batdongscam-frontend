'use client';

import React, { useState, useRef } from 'react';
import { ChevronDown, RotateCcw, Search, X, Calendar } from 'lucide-react';
import { CustomerFilters } from '@/lib/api/services/account.service';
import { LocationSelection } from '@/app/components/LocationPicker';

const TIERS = [
  { label: 'Bronze', value: 'BRONZE' },
  { label: 'Silver', value: 'SILVER' },
  { label: 'Gold', value: 'GOLD' },
  { label: 'Platinum', value: 'PLATINUM' }
];

interface SearchProps {
  onOpenLocationPicker: () => void;
  onApply: (filters: CustomerFilters) => void;
  onReset: () => void;
  selectedLocations?: LocationSelection[];
  onRemoveLocation: (id: string) => void;
}

export default function CustomersAdvancedSearch({
  onOpenLocationPicker, onApply, onReset, selectedLocations = [], onRemoveLocation
}: SearchProps) {

  const [tier, setTier] = useState('All');

  const [leadingScore, setLeadingScore] = useState({ min: '', max: '' });
  const [viewings, setViewings] = useState({ min: '', max: '' });
  const [spending, setSpending] = useState({ min: '', max: '' });
  const [contracts, setContracts] = useState({ min: '', max: '' });
  const [propBought, setPropBought] = useState({ min: '', max: '' });
  const [propRented, setPropRented] = useState({ min: '', max: '' });
  const [propInvested, setPropInvested] = useState({ min: '', max: '' });
  const [ranking, setRanking] = useState({ min: '', max: '' });

  const [joinDateFrom, setJoinDateFrom] = useState('');
  const [joinDateTo, setJoinDateTo] = useState('');

  // ← SỬA: Gửi format LocalDateTime (YYYY-MM-DDTHH:mm:ss) KHÔNG CÓ Z
  const getLocalDateTimeStart = (dateStr: string) => {
    if (!dateStr) return undefined;
    return dateStr + 'T00:00:00'; // Không có .000Z
  };

  const getLocalDateTimeEnd = (dateStr: string) => {
    if (!dateStr) return undefined;
    return dateStr + 'T23:59:59'; // Không có .000Z
  };

  const safeParseFloat = (val: string) => val ? parseFloat(val) : undefined;
  const safeParseInt = (val: string) => val ? parseInt(val) : undefined;

  const handleApply = () => {
    const filters: CustomerFilters = {};

    if (tier !== 'All') filters.customerTiers = [tier];

    filters.minLeadingScore = safeParseFloat(leadingScore.min);
    filters.maxLeadingScore = safeParseFloat(leadingScore.max);

    filters.minViewings = safeParseInt(viewings.min);
    filters.maxViewings = safeParseInt(viewings.max);

    filters.minSpending = safeParseFloat(spending.min);
    filters.maxSpending = safeParseFloat(spending.max);

    filters.minContracts = safeParseInt(contracts.min);
    filters.maxContracts = safeParseInt(contracts.max);

    filters.minPropertiesBought = safeParseInt(propBought.min);
    filters.maxPropertiesBought = safeParseInt(propBought.max);

    filters.minPropertiesRented = safeParseInt(propRented.min);
    filters.maxPropertiesRented = safeParseInt(propRented.max);

    filters.minPropertiesInvested = safeParseInt(propInvested.min);
    filters.maxPropertiesInvested = safeParseInt(propInvested.max);

    filters.minRanking = safeParseInt(ranking.min);
    filters.maxRanking = safeParseInt(ranking.max);

    // ← SỬA: Dùng helper mới
    if (joinDateFrom) filters.joinedDateFrom = getLocalDateTimeStart(joinDateFrom);
    if (joinDateTo) filters.joinedDateTo = getLocalDateTimeEnd(joinDateTo);

    onApply(filters);
  };

  const handleResetInternal = () => {
    setTier('All');
    setLeadingScore({ min: '', max: '' });
    setViewings({ min: '', max: '' });
    setSpending({ min: '', max: '' });
    setContracts({ min: '', max: '' });
    setPropBought({ min: '', max: '' });
    setPropRented({ min: '', max: '' });
    setPropInvested({ min: '', max: '' });
    setRanking({ min: '', max: '' });
    setJoinDateFrom('');
    setJoinDateTo('');
    onReset();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
        <p className="text-sm text-gray-500">Filter customers by multiple criteria</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Customer&apos;s tier</label>
            <div className="relative">
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="All">Multiple</option>
                {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="hidden md:block"></div>

          <RangeInput label="leading score" state={leadingScore} setState={setLeadingScore} />
          <RangeInput label="viewings" state={viewings} setState={setViewings} />
          <RangeInput label="spending" state={spending} setState={setSpending} placeholder="3.5B" />
          <RangeInput label="contracts" state={contracts} setState={setContracts} />
          <RangeInput label="properties bought" state={propBought} setState={setPropBought} />
          <RangeInput label="properties rented" state={propRented} setState={setPropRented} />
          <RangeInput label="properties invested" state={propInvested} setState={setPropInvested} />
          <RangeInput label="ranking" state={ranking} setState={setRanking} />

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Join date from</label>
            <DateInput value={joinDateFrom} onChange={setJoinDateFrom} placeholder="Start date" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Join date to</label>
            <DateInput value={joinDateTo} onChange={setJoinDateTo} placeholder="End date" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Location</label>
            <div onClick={onOpenLocationPicker} className="w-full min-h-[42px] border border-gray-300 rounded-lg px-2 py-1.5 bg-gray-50 flex flex-wrap items-center gap-2 cursor-pointer hover:border-red-500 transition-colors">
              {selectedLocations.length > 0 ? (
                selectedLocations.map((loc) => (
                  <span key={loc.id} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 shadow-sm whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    {loc.name}
                    <X className="w-3 h-3 text-red-500 hover:text-red-700 cursor-pointer" onClick={() => onRemoveLocation(loc.id)} />
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

const RangeInput = ({ label, state, setState, placeholder = "---" }: any) => {
  const handleInput = (key: 'min' | 'max', val: string) => {
    if (!/^\d*\.?\d*$/.test(val)) return;
    setState({ ...state, [key]: val });
  };
  return (
    <>
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-1.5 capitalize">Min {label}</label>
        <input type="text" value={state.min} onChange={(e) => handleInput('min', e.target.value)} placeholder={placeholder} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-1.5 capitalize">Max {label}</label>
        <input type="text" value={state.max} onChange={(e) => handleInput('max', e.target.value)} placeholder={placeholder} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500" />
      </div>
    </>
  );
};

const DateInput = ({ value, onChange, placeholder }: any) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="relative w-full border border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:border-red-500 transition-colors" onClick={() => ref.current?.showPicker()}>
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}>{value ? new Date(value).toLocaleDateString() : placeholder}</span>
        <Calendar className="w-4 h-4 text-gray-500" />
      </div>
      <input ref={ref} type="date" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
};