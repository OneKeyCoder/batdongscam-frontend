'use client';

import React, { useState, useRef } from 'react';
import { ChevronDown, RotateCcw, Search, Calendar, X, Check, RefreshCcw } from 'lucide-react';
import { ViewingListFilters } from '@/lib/api/services/appointment.service';
import { LocationSelection } from '@/app/components/LocationPicker';

// --- STYLES ---
const scrollbarStyle = `
  .hide-scrollbar::-webkit-scrollbar { width: 4px; }
  .hide-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .hide-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
  .hide-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
`;

// --- CONSTANTS ---
const APPOINTMENT_STATUSES = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' }
];

const TIERS = [
  { label: 'BRONZE', value: 'BRONZE' },
  { label: 'Silver', value: 'SILVER' },
  { label: 'Gold', value: 'GOLD' },
  { label: 'Platinum', value: 'PLATINUM' }
];

// --- INTERFACES ---
interface SearchProps {
  onOpenLocationPicker: () => void;
  onApply: (filters: ViewingListFilters) => void;
  onReset: () => void;
  selectedLocations?: LocationSelection[];
  onRemoveLocation?: (id: string) => void;
}

interface LocalState {
  status: string; 
  transactionType: string;
  agentName: string;
  agentTier: string;
  customerName: string;
  customerTier: string;
  dateFrom: string;
  dateTo: string;
  minRating: string;
  maxRating: string;
}

export default function AppointmentAdvancedSearch({
  onOpenLocationPicker, onApply, onReset, selectedLocations = [], onRemoveLocation
}: SearchProps) {

  // State form local
  const [filters, setFilters] = useState<LocalState>({
    status: 'All', 
    transactionType: 'All',
    agentName: '',
    agentTier: 'All',
    customerName: '',
    customerTier: 'All',
    dateFrom: '',
    dateTo: '',
    minRating: '',
    maxRating: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof LocalState, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Validate Date Range
    if (filters.dateFrom && filters.dateTo) {
      if (new Date(filters.dateFrom) > new Date(filters.dateTo)) {
        newErrors.dateTo = 'End date must be after start date';
      }
    }

    // 2. Validate Rating Range
    if (filters.minRating && filters.maxRating) {
      if (parseFloat(filters.minRating) > parseFloat(filters.maxRating)) {
        newErrors.maxRating = 'Max > Min';
      }
    }

    // 3. Validate Rating Value (0-5)
    if (filters.minRating && (parseFloat(filters.minRating) < 0 || parseFloat(filters.minRating) > 5)) {
      newErrors.minRating = '0 - 5 only';
    }
    if (filters.maxRating && (parseFloat(filters.maxRating) < 0 || parseFloat(filters.maxRating) > 5)) {
      newErrors.maxRating = '0 - 5 only';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApply = () => {
    if (!validateForm()) return;

    const apiFilters: ViewingListFilters = {};

    if (filters.status && filters.status !== 'All') {
      apiFilters.statusEnums = [filters.status as any];
    }

    if (filters.transactionType && filters.transactionType !== 'All') apiFilters.transactionTypeEnums = [filters.transactionType as any];

    if (filters.agentName.trim()) apiFilters.agentName = filters.agentName;
    if (filters.agentTier && filters.agentTier !== 'All') apiFilters.agentTiers = [filters.agentTier];

    if (filters.customerName.trim()) apiFilters.customerName = filters.customerName;
    if (filters.customerTier && filters.customerTier !== 'All') apiFilters.customerTiers = [filters.customerTier];

    if (filters.dateFrom) apiFilters.requestDateFrom = new Date(filters.dateFrom).toISOString();
    if (filters.dateTo) apiFilters.requestDateTo = new Date(filters.dateTo).toISOString();

    if (filters.minRating) apiFilters.minRating = parseFloat(filters.minRating);
    if (filters.maxRating) apiFilters.maxRating = parseFloat(filters.maxRating);

    onApply(apiFilters);
  };

  const handleResetInternal = () => {
    setFilters({
      status: 'All',
      transactionType: 'All',
      agentName: '',
      agentTier: 'All',
      customerName: '',
      customerTier: 'All',
      dateFrom: '',
      dateTo: '',
      minRating: '',
      maxRating: ''
    });
    setErrors({});
    onReset();
  };

  return (
    <>
      <style>{scrollbarStyle}</style>
      <div className="flex flex-col h-full">
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
          <p className="text-sm text-gray-500">Filter appointments by multiple criteria</p>

          <div className="grid grid-cols-2 gap-4">

            {/* ROW 1: Appointment Status & Transaction Type */}
            <FormGroup label="Appointment status">
              <SelectInput
                value={filters.status}
                label={filters.status === 'All' ? 'All' : 'Selected'}
                onChange={(val) => handleChange('status', val)}
                options={[{ label: 'All', value: 'All' }, ...APPOINTMENT_STATUSES]}
              />
            </FormGroup>

            <FormGroup label="Transaction type">
              <SelectInput
                value={filters.transactionType}
                label={filters.transactionType === 'All' ? 'All' : 'Selected'}
                onChange={(val) => handleChange('transactionType', val)}
                options={[
                  { label: 'All', value: 'All' },
                  { label: 'Sale', value: 'SALE' },
                  { label: 'Rent', value: 'RENT' }
                ]}
              />
            </FormGroup>

            {/* ROW 2: Agent */}
            <FormGroup label="Agent's name">
              <TextInput
                value={filters.agentName}
                onChange={(e) => handleChange('agentName', e.target.value)}
                placeholder="---"
              />
            </FormGroup>

            <FormGroup label="Agent's tier">
              <SelectInput
                value={filters.agentTier}
                label={filters.agentTier === 'All' ? 'Multiple' : 'Selected'}
                onChange={(val) => handleChange('agentTier', val)}
                options={[{ label: 'Multiple', value: 'All' }, ...TIERS]}
              />
            </FormGroup>

            {/* ROW 3: Customer */}
            <FormGroup label="Customer's name">
              <TextInput
                value={filters.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                placeholder="---"
              />
            </FormGroup>

            <FormGroup label="Customer's tier">
              <SelectInput
                value={filters.customerTier}
                label={filters.customerTier === 'All' ? 'Multiple' : 'Selected'}
                onChange={(val) => handleChange('customerTier', val)}
                options={[{ label: 'Multiple', value: 'All' }, ...TIERS]}
              />
            </FormGroup>

            {/* ROW 4: Dates */}
            <FormGroup label="Requested date from">
              <DateInput
                value={filters.dateFrom}
                onChange={(val) => handleChange('dateFrom', val)}
                placeholder="Start date"
              />
            </FormGroup>

            <FormGroup label="Requested date to" error={errors.dateTo}>
              <DateInput
                value={filters.dateTo}
                onChange={(val) => handleChange('dateTo', val)}
                placeholder="End date"
                error={!!errors.dateTo}
              />
            </FormGroup>

            {/* ROW 5: Rating */}
            <FormGroup label="Min rating" error={errors.minRating}>
              <NumberInput
                value={filters.minRating}
                onChange={(val) => handleChange('minRating', val)}
                placeholder="0"
                error={!!errors.minRating}
              />
            </FormGroup>

            <FormGroup label="Max rating" error={errors.maxRating}>
              <NumberInput
                value={filters.maxRating}
                onChange={(val) => handleChange('maxRating', val)}
                placeholder="5"
                error={!!errors.maxRating}
              />
            </FormGroup>

            {/* ROW 6: Location Display */}
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-900 mb-1.5">Location</label>
              <div
                onClick={onOpenLocationPicker}
                className="w-full min-h-[42px] border border-gray-300 rounded-lg px-2 py-1.5 bg-gray-50 flex flex-wrap items-center gap-2 cursor-pointer hover:border-red-500 transition-colors"
              >
                {selectedLocations.length > 0 ? (
                  selectedLocations.map((loc) => (
                    <span key={loc.id} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 shadow-sm whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {loc.name}
                      <X
                        className="w-3 h-3 text-red-500 hover:text-red-700 cursor-pointer"
                        onClick={() => onRemoveLocation && onRemoveLocation(loc.id)}
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

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button onClick={handleResetInternal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
            <RotateCcw className="w-3 h-3" /> Reset All
          </button>
          <button onClick={handleApply} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm">
            <Search className="w-3 h-3" /> Apply
          </button>
        </div>
      </div>
    </>
  );
}


const FormGroup = ({ label, children, error }: { label: string, children: React.ReactNode, error?: string }) => (
  <div className="w-full">
    <label className="block text-sm font-bold text-gray-900 mb-1.5">{label}</label>
    {children}
    {error && <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>}
  </div>
);

const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500 transition-all"
  />
);

const DateInput = ({ value, onChange, placeholder, error }: { value?: string, onChange: (val: string) => void, placeholder?: string, error?: boolean }) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const displayDate = value ? new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div
      className={`relative w-full border rounded-lg bg-gray-50 cursor-pointer transition-all ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-500'}`}
      onClick={() => dateInputRef.current?.showPicker?.()}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className={`text-sm ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
          {displayDate || placeholder || 'Select date'}
        </span>
        <div className="flex items-center gap-2">
          {value && (
            <button onClick={handleClearDate} className="p-0.5 hover:bg-gray-200 rounded pointer-events-auto z-20">
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
        </div>
      </div>

      <input
        ref={dateInputRef}
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
    </div>
  );
};

const NumberInput = ({ value, onChange, placeholder, error }: { value: string, onChange: (val: string) => void, placeholder?: string, error?: boolean }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    if (!/^\d*\.?\d*$/.test(val)) return;

    const numVal = parseFloat(val);
    if (numVal > 5) val = '5'; // Max 5
    if (numVal < 0) val = '0'; // Min 0 

    onChange(val);
  };

  return (
    <input
      type="text" 
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none transition-all ${error ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-red-500'}`}
    />
  );
};

const SelectInput = ({ value, label, onChange, options }: { value: string | undefined, label: string, onChange: (val: string) => void, options: { label: string, value: string }[] }) => {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-red-500 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  );
};