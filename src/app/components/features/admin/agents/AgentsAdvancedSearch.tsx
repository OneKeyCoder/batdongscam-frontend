'use client';

import React, { useState } from 'react';
import { ChevronDown, RotateCcw, Search, X } from 'lucide-react';
import { SaleAgentFilters } from '@/lib/api/services/account.service';

interface AgentsAdvancedSearchProps {
  onOpenLocationPicker: () => void;
  onApply: (filters: SaleAgentFilters) => void;
  onReset: () => void;
  selectedLocations?: string[]; 
  onRemoveLocation: (locationName: string) => void;
}

const RangeInput = ({ label, fromValue, toValue, onFromChange, onToChange, fromPlaceholder = "0", toPlaceholder = "Unlimited" }: any) => (
  <>
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-1.5">Min {label}</label>
      <input
        type="number"
        min="0"
        placeholder={fromPlaceholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500"
        value={fromValue}
        onChange={(e) => onFromChange(e.target.value)}
      />
    </div>
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-1.5">Max {label}</label>
      <input
        type="number"
        min="0"
        placeholder={toPlaceholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500"
        value={toValue}
        onChange={(e) => onToChange(e.target.value)}
      />
    </div>
  </>
);

export default function AgentsAdvancedSearch({
  onOpenLocationPicker,
  onApply,
  onReset,
  selectedLocations = [],
  onRemoveLocation
}: AgentsAdvancedSearchProps) {

  // State for Filters
  const [tier, setTier] = useState('');
  const [minPoint, setMinPoint] = useState('');
  const [maxPoint, setMaxPoint] = useState('');
  const [minAssigns, setMinAssigns] = useState('');
  const [maxAssigns, setMaxAssigns] = useState('');
  const [minContracts, setMinContracts] = useState('');
  const [maxContracts, setMaxContracts] = useState('');
  const [minRating, setMinRating] = useState('');

  const handleApply = () => {
    const filters: SaleAgentFilters = {};

    if (tier) filters.agentTiers = [tier];
    if (minPoint) filters.minPerformancePoint = Number(minPoint);
    if (maxPoint) filters.maxPerformancePoint = Number(maxPoint);
    if (minAssigns) filters.minAssignments = Number(minAssigns);
    if (maxAssigns) filters.maxAssignments = Number(maxAssigns);
    if (minContracts) filters.minContracts = Number(minContracts);
    if (maxContracts) filters.maxContracts = Number(maxContracts);
    if (minRating) filters.minAvgRating = Number(minRating);

    onApply(filters);
  };

  const handleReset = () => {
    setTier('');
    setMinPoint(''); setMaxPoint('');
    setMinAssigns(''); setMaxAssigns('');
    setMinContracts(''); setMaxContracts('');
    setMinRating('');
    onReset();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-1 overflow-y-auto pr-1 pb-4 custom-scrollbar">
        <p className="text-sm text-gray-500">Filter agents by multiple criteria</p>

        <div className="grid grid-cols-2 gap-4">
          {/* Tier */}
          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Tier</label>
            <div className="relative">
              <select
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm font-medium focus:outline-none focus:border-red-500 cursor-pointer"
                value={tier}
                onChange={(e) => setTier(e.target.value)}
              >
                <option value="">All Tiers</option>
                <option value="PLATINUM">Platinum</option>
                <option value="GOLD">Gold</option>
                <option value="SILVER">Silver</option>
                <option value="BRONZE">Bronze</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <RangeInput
            label="Performance Point"
            fromValue={minPoint} toValue={maxPoint}
            onFromChange={setMinPoint} onToChange={setMaxPoint}
          />

          <RangeInput
            label="Assignments"
            fromValue={minAssigns} toValue={maxAssigns}
            onFromChange={setMinAssigns} onToChange={setMaxAssigns}
          />

          <RangeInput
            label="Signed Contracts"
            fromValue={minContracts} toValue={maxContracts}
            onFromChange={setMinContracts} onToChange={setMaxContracts}
          />

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Min Rating (0-5)</label>
            <input
              type="number"
              min="0" max="5" step="0.1"
              placeholder="e.g. 4.0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            />
          </div>

          {/* Location Picker Trigger */}
          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Location</label>
            <div
              onClick={onOpenLocationPicker}
              className="w-full min-h-[42px] border border-gray-300 rounded-lg px-2 py-1.5 bg-gray-50 flex flex-wrap items-center gap-2 cursor-pointer hover:border-red-500 transition-colors"
            >
              {selectedLocations.length > 0 ? (
                selectedLocations.map((locName, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 shadow-sm whitespace-nowrap">
                    {locName}
                    <X
                      className="w-3 h-3 text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveLocation(locName);
                      }}
                    />
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400 px-1">Select cities/districts...</span>
              )}
              <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button onClick={handleReset} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <RotateCcw className="w-3 h-3" /> Reset All
        </button>
        <button onClick={handleApply} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors">
          <Search className="w-3 h-3" /> Apply
        </button>
      </div>
    </div>
  );
}