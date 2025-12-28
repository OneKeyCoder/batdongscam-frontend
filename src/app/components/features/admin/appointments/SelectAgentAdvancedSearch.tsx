'use client';

import React, { useState } from 'react';
import { ChevronDown, RotateCcw, Search } from 'lucide-react';
import { FreeAgentFilters } from '@/lib/api/services/assignment.service';

const TIERS = [
  { label: 'Bronze', value: 'BRONZE' },
  { label: 'Silver', value: 'SILVER' },
  { label: 'Gold', value: 'GOLD' },
  { label: 'Platinum', value: 'PLATINUM' }
];

interface SearchProps {
  onApply: (filters: FreeAgentFilters) => void;
  onReset: () => void;
}

const RangeInput = ({ label, fromValue, toValue, onFromChange, onToChange, fromPlaceholder = "10", toPlaceholder = "---" }: any) => (
  <>
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
      <input
        type="number"
        min="0"
        value={fromValue}
        onChange={(e) => onFromChange(e.target.value)}
        placeholder={fromPlaceholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500"
      />
    </div>
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-1.5 opacity-0">To</label>
      <input
        type="number"
        min="0"
        value={toValue}
        onChange={(e) => onToChange(e.target.value)}
        placeholder={toPlaceholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500"
      />
    </div>
  </>
);

export default function SelectAgentAdvancedSearch({ onApply, onReset }: SearchProps) {

  // Local States
  const [tier, setTier] = useState('All');

  // minAssignedAppointments / maxAssignedAppointments
  const [minAssignments, setMinAssignments] = useState('');
  const [maxAssignments, setMaxAssignments] = useState('');

  // minAssignedProperties / maxAssignedProperties
  const [minProperties, setMinProperties] = useState('');
  const [maxProperties, setMaxProperties] = useState('');

  // minCurrentlyHandle / maxCurrentlyHandle
  const [currentHandleFrom, setCurrentHandleFrom] = useState('');
  const [currentHandleTo, setCurrentHandleTo] = useState('');

  const handleApply = () => {
    const filters: FreeAgentFilters = {};

    if (tier && tier !== 'All') filters.agentTiers = [tier];

    if (minAssignments) filters.minAssignedAppointments = parseInt(minAssignments);
    if (maxAssignments) filters.maxAssignedAppointments = parseInt(maxAssignments);

    if (minProperties) filters.minAssignedProperties = parseInt(minProperties);
    if (maxProperties) filters.maxAssignedProperties = parseInt(maxProperties);

    if (currentHandleFrom) filters.minCurrentlyHandle = parseInt(currentHandleFrom);
    if (currentHandleTo) filters.maxCurrentlyHandle = parseInt(currentHandleTo);

    onApply(filters);
  };

  const handleResetInternal = () => {
    setTier('All');
    setMinAssignments(''); setMaxAssignments('');
    setMinProperties(''); setMaxProperties('');
    setCurrentHandleFrom(''); setCurrentHandleTo('');
    onReset();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
        <p className="text-sm text-gray-500">Filter agents by workload criteria</p>

        <div className="grid grid-cols-2 gap-4">
          {/* Tier */}
          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Tier</label>
            <div className="relative">
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500"
              >
                <option value="All">Multiple</option>
                {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="hidden md:block"></div>

          {/* Assignments Range */}
          <RangeInput
            label="Min appointments"
            fromPlaceholder="10"
            fromValue={minAssignments} toValue={maxAssignments}
            onFromChange={setMinAssignments} onToChange={setMaxAssignments}
          />

          {/* Properties Range */}
          <RangeInput
            label="Min properties"
            fromPlaceholder="10" toPlaceholder="15"
            fromValue={minProperties} toValue={maxProperties}
            onFromChange={setMinProperties} onToChange={setMaxProperties}
          />

          {/* Current Handle Range */}
          <RangeInput
            label="Min current handle"
            fromPlaceholder="10" toPlaceholder="15"
            fromValue={currentHandleFrom} toValue={currentHandleTo}
            onFromChange={setCurrentHandleFrom} onToChange={setCurrentHandleTo}
          />
        </div>
      </div>

      {/* Footer */}
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