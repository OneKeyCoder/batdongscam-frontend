'use client';

import React, { useState, useRef } from 'react';
import { ChevronDown, RotateCcw, Search, X, Calendar } from 'lucide-react';
import { SaleAgentFilters } from '@/lib/api/services/account.service';

// --- TYPES ---
export interface LocationSelection {
  id: string;
  name: string;
  type: 'CITY' | 'DISTRICT' | 'WARD';
}

interface SearchProps {
  onOpenLocationPicker: () => void;
  onApply: (filters: SaleAgentFilters) => void;
  onReset: () => void;
  selectedLocations?: LocationSelection[];
  onRemoveLocation: (location: LocationSelection) => void;
}

// --- HELPER COMPONENTS ---

const RangeInput = ({
  labelFrom, labelTo, placeholderFrom, placeholderTo,
  valFrom, valTo, setValFrom, setValTo
}: any) => {
  const handleNumberChange = (val: string, setter: (v: number | undefined) => void) => {
    if (val === '') {
      setter(undefined);
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setter(num);
    }
  };

  return (
    <>
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-1.5">{labelFrom}</label>
        <input
          type="number"
          min="0"
          placeholder={placeholderFrom}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
          value={valFrom !== undefined ? valFrom : ''}
          onChange={(e) => handleNumberChange(e.target.value, setValFrom)}
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-1.5">{labelTo}</label>
        <input
          type="number"
          min="0"
          placeholder={placeholderTo}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
          value={valTo !== undefined ? valTo : ''}
          onChange={(e) => handleNumberChange(e.target.value, setValTo)}
        />
      </div>
    </>
  );
};

// Component DateInput đã sửa UI để ẩn icon mặc định của trình duyệt
const DateInput = ({ label, value, onChange, placeholder }: any) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
      <div
        className="relative cursor-pointer group"
        onClick={() => inputRef.current?.showPicker()}
      >
        <input
          ref={inputRef}
          type="date"
          // [Fix UI]: [&::-webkit-calendar-picker-indicator]:hidden -> Ẩn icon lịch mặc định của Chrome/Edge
          className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all cursor-pointer text-gray-700 placeholder-transparent [&::-webkit-calendar-picker-indicator]:hidden appearance-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        {/* Custom Icon */}
        <Calendar
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors pointer-events-none"
        />

        {/* Placeholder giả (chỉ hiện khi chưa có value) */}
        {!value && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none bg-gray-50 pr-4 select-none">
            {placeholder}
          </span>
        )}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function AgentPerformanceAdvancedSearch({
  onOpenLocationPicker, onApply, onReset, selectedLocations = [], onRemoveLocation
}: SearchProps) {

  // --- STATE ---
  const [tier, setTier] = useState<string>('All');
  const [maxProperties, setMaxProperties] = useState<number | undefined>();
  const [minPerfPoint, setMinPerfPoint] = useState<number | undefined>();
  const [maxPerfPoint, setMaxPerfPoint] = useState<number | undefined>();
  const [minRank, setMinRank] = useState<number | undefined>();
  const [maxRank, setMaxRank] = useState<number | undefined>();
  const [minAssigned, setMinAssigned] = useState<number | undefined>();
  const [maxAssigned, setMaxAssigned] = useState<number | undefined>();
  const [minContracts, setMinContracts] = useState<number | undefined>();
  const [maxContracts, setMaxContracts] = useState<number | undefined>();
  const [minAvgRating, setMinAvgRating] = useState<number | undefined>();
  const [maxAvgRating, setMaxAvgRating] = useState<number | undefined>();
  const [hiredFrom, setHiredFrom] = useState<string>('');
  const [hiredTo, setHiredTo] = useState<string>('');

  // --- HANDLERS ---

  const handleApplyInternal = () => {
    const filters: SaleAgentFilters = {};

    if (tier !== 'All') filters.agentTiers = [tier];
    if (maxProperties !== undefined) filters.maxProperties = maxProperties;
    if (minPerfPoint !== undefined) filters.minPerformancePoint = minPerfPoint;
    if (maxPerfPoint !== undefined) filters.maxPerformancePoint = maxPerfPoint;
    if (minRank !== undefined) filters.minRanking = minRank;
    if (maxRank !== undefined) filters.maxRanking = maxRank;
    if (minAssigned !== undefined) filters.minAssignedProperties = minAssigned;
    if (maxAssigned !== undefined) filters.maxAssignedProperties = maxAssigned;
    if (minContracts !== undefined) filters.minContracts = minContracts;
    if (maxContracts !== undefined) filters.maxContracts = maxContracts;
    if (minAvgRating !== undefined) filters.minAvgRating = minAvgRating;
    if (maxAvgRating !== undefined) filters.maxAvgRating = maxAvgRating;


    if (hiredFrom) {
      filters.hiredDateFrom = `${hiredFrom}T00:00:00`;

      if (!hiredTo) {
        const today = new Date().toISOString().split('T')[0];
        filters.hiredDateTo = `${today}T23:59:59`;
      }
    }

    if (hiredTo) {
      filters.hiredDateTo = `${hiredTo}T23:59:59`;

      if (!hiredFrom) {
        filters.hiredDateFrom = "1970-01-01T00:00:00";
      }
    }

    if (selectedLocations.length > 0) {
      filters.cityIds = selectedLocations.filter(l => l.type === 'CITY').map(l => l.id);
      filters.districtIds = selectedLocations.filter(l => l.type === 'DISTRICT').map(l => l.id);
      filters.wardIds = selectedLocations.filter(l => l.type === 'WARD').map(l => l.id);
    }

    onApply(filters);
  };

  const handleResetInternal = () => {
    setTier('All');
    setMaxProperties(undefined);
    setMinPerfPoint(undefined); setMaxPerfPoint(undefined);
    setMinRank(undefined); setMaxRank(undefined);
    setMinAssigned(undefined); setMaxAssigned(undefined);
    setMinContracts(undefined); setMaxContracts(undefined);
    setMinAvgRating(undefined); setMaxAvgRating(undefined);
    setHiredFrom(''); setHiredTo('');
    onReset();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="space-y-5 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar p-1">
        <p className="text-sm text-gray-500 italic">Filter agents based on performance metrics and profile details.</p>

        <div className="grid grid-cols-2 gap-5">
          {/* Tier */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Tier</label>
            <div className="relative">
              <select
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 cursor-pointer transition-all"
                value={tier}
                onChange={(e) => setTier(e.target.value)}
              >
                <option value="All">All Tiers</option>
                <option value="BRONZE">Bronze</option>
                <option value="SILVER">Silver</option>
                <option value="GOLD">Gold</option>
                <option value="PLATINUM">Platinum</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Max Properties */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Max properties limit</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 50"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              value={maxProperties !== undefined ? maxProperties : ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setMaxProperties(!isNaN(val) && val >= 0 ? val : undefined);
              }}
            />
          </div>

          <div className="col-span-2 h-px bg-gray-100 my-1"></div>

          <RangeInput
            labelFrom="Min points" labelTo="Max points"
            placeholderFrom="100" placeholderTo="5000"
            valFrom={minPerfPoint} setValFrom={setMinPerfPoint}
            valTo={maxPerfPoint} setValTo={setMaxPerfPoint}
          />

          <RangeInput
            labelFrom="Rank from" labelTo="Rank to"
            placeholderFrom="1" placeholderTo="10"
            valFrom={minRank} setValFrom={setMinRank}
            valTo={maxRank} setValTo={setMaxRank}
          />

          <RangeInput
            labelFrom="Min assigned props" labelTo="Max assigned props"
            placeholderFrom="5" placeholderTo="20"
            valFrom={minAssigned} setValFrom={setMinAssigned}
            valTo={maxAssigned} setValTo={setMaxAssigned}
          />

          <RangeInput
            labelFrom="Min contracts" labelTo="Max contracts"
            placeholderFrom="2" placeholderTo="50"
            valFrom={minContracts} setValFrom={setMinContracts}
            valTo={maxContracts} setValTo={setMaxContracts}
          />

          <RangeInput
            labelFrom="Min avg rating" labelTo="Max avg rating"
            placeholderFrom="3.5" placeholderTo="5.0"
            valFrom={minAvgRating} setValFrom={setMinAvgRating}
            valTo={maxAvgRating} setValTo={setMaxAvgRating}
          />

          <div className="col-span-2 h-px bg-gray-100 my-1"></div>

          {/* Hired Date */}
          <DateInput
            label="Hired date from"
            value={hiredFrom}
            onChange={setHiredFrom}
            placeholder="Select start date"
          />
          <DateInput
            label="Hired date to"
            value={hiredTo}
            onChange={setHiredTo}
            placeholder="Select end date"
          />

          {/* Location Picker */}
          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Working Locations</label>
            <div
              onClick={onOpenLocationPicker}
              className="w-full min-h-[46px] border border-gray-300 rounded-lg px-2 py-2 bg-gray-50 flex flex-wrap items-center gap-2 cursor-pointer hover:border-red-500 hover:ring-1 hover:ring-red-500 transition-all"
            >
              {selectedLocations.length > 0 ? (
                selectedLocations.map((loc, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 shadow-sm whitespace-nowrap group hover:border-red-200">
                    {loc.name}
                    <div
                      className="p-0.5 rounded-full hover:bg-red-100 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveLocation(loc);
                      }}
                    >
                      <X className="w-3 h-3 text-gray-400 group-hover:text-red-500" />
                    </div>
                  </span>
                ))
              ) : <span className="text-sm text-gray-400 px-2">Select cities, districts or wards...</span>}
              <ChevronDown className="w-4 h-4 text-gray-400 ml-auto mr-2" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2 bg-white">
        <button
          onClick={handleResetInternal}
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-800 flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        <button
          onClick={handleApplyInternal}
          className="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <Search className="w-4 h-4" /> Apply Filters
        </button>
      </div>
    </div>
  );
}