'use client';

import React, { useState, useRef, useEffect } from 'react';
import { RefreshCcw, Check, ChevronDown, Calendar, X, Search, Loader2 } from 'lucide-react';
import { PaymentFilters } from '@/lib/api/services/payment.service';
import { accountService } from '@/lib/api/services/account.service';

interface Option {
  value: string;
  label: string;
  subLabel?: string;
  type?: 'Customer' | 'Agent';
}

interface AsyncSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  fetchOptions: (keyword: string) => Promise<Option[]>;
  placeholder?: string;
}

const AsyncSelect = ({ label, value, onChange, fetchOptions, placeholder }: AsyncSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Clear label when value is reset externally
  useEffect(() => {
    if (!value) setSelectedLabel('');
  }, [value]);

  const fetchData = async (search: string) => {
    setLoading(true);
    try {
      const data = await fetchOptions(search);
      setOptions(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => fetchData(keyword), 300);
    return () => clearTimeout(timer);
  }, [keyword, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (opt: Option) => {
    onChange(opt.value);
    setSelectedLabel(opt.label);
    setIsOpen(false);
    setKeyword('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSelectedLabel('');
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="text-sm font-bold text-gray-900 mb-1.5 block">{label}</label>
      <div
        className="w-full h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 flex items-center justify-between cursor-pointer hover:bg-white hover:border-red-200 transition-all shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-sm truncate ${selectedLabel ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
          {selectedLabel || placeholder || 'Select...'}
        </span>
        <div className="flex items-center gap-2">
          {value && (
            <div onClick={handleClear} className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-3.5 h-3.5" />
            </div>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                className="w-full pl-8 pr-2 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                placeholder="Type name to search..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {loading ? (
              <div className="p-4 text-center text-gray-400 text-xs flex justify-center items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Searching...
              </div>
            ) : options.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-xs">No users found.</div>
            ) : (
              options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-red-50 flex flex-col border-b border-gray-50 last:border-0 transition-colors ${value === opt.value ? 'bg-red-50 text-red-700' : 'text-gray-700'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-medium truncate">{opt.label}</span>
                    {opt.type && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${opt.type === 'Agent' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                        {opt.type}
                      </span>
                    )}
                  </div>
                  {opt.subLabel && <span className="text-xs text-gray-500 truncate mt-0.5">{opt.subLabel}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- 2. Main Component ---

const scrollbarStyle = `
  .hide-scrollbar::-webkit-scrollbar { width: 4px; }
  .hide-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .hide-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
  .hide-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
`;

interface LocalUIState extends PaymentFilters {
  minAmount?: string;
  maxAmount?: string;
}

interface AdvancedSearchProps {
  onApply: (filters: PaymentFilters) => void;
  onReset: () => void;
  onClose?: () => void;
}

export default function PaymentAdvancedSearch({ onApply, onReset, onClose }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<LocalUIState>({
    statuses: [],
    paymentTypes: [],
    payerId: '',
    payeeId: '',
    minAmount: '',
    maxAmount: '',
    paidDateFrom: '',
    paidDateTo: '',
    dueDateFrom: '',
    dueDateTo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Helper: Fetch Users (Customers + Agents) ---
  const fetchUsersCombined = async (keyword: string): Promise<Option[]> => {
    try {
      const [customersRes, agentsRes] = await Promise.all([
        accountService.getAllCustomers({ name: keyword, page: 1, limit: 5 }),
        accountService.getAllSaleAgents({ name: keyword, page: 1, limit: 5 })
      ]);

      const customerOpts: Option[] = customersRes.data.map(c => ({
        value: c.id,
        label: `${c.firstName} ${c.lastName}`,
        type: 'Customer'
      }));

      const agentOpts: Option[] = agentsRes.data.map(a => ({
        value: a.id,
        label: `${a.firstName} ${a.lastName}`,
        subLabel: `Code: ${a.employeeCode || 'N/A'}`,
        type: 'Agent'
      }));

      return [...customerOpts, ...agentOpts];
    } catch {
      return [];
    }
  };

  const handleChange = (field: keyof LocalUIState, value: any) => {
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
    if (filters.minAmount && filters.maxAmount) {
      const min = parseFloat(filters.minAmount.replace(/\./g, ''));
      const max = parseFloat(filters.maxAmount.replace(/\./g, ''));
      if (min > max) newErrors.maxAmount = 'Max > Min';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApply = () => {
    if (!validateForm()) return;

    const payload: any = { ...filters };
    delete payload.minAmount;
    delete payload.maxAmount;

    // Filter empty values
    Object.keys(payload).forEach(key => {
      if (!payload[key] || (Array.isArray(payload[key]) && payload[key].length === 0)) {
        delete payload[key];
      }
    });

    onApply(payload as PaymentFilters);
    onClose?.();
  };

  const handleReset = () => {
    setFilters({
      statuses: [],
      paymentTypes: [],
      payerId: '',
      payeeId: '',
      minAmount: '',
      maxAmount: '',
      paidDateFrom: '',
      paidDateTo: '',
      dueDateFrom: '',
      dueDateTo: ''
    });
    setErrors({});
    onReset();
  };

  return (
    <>
      <style>{scrollbarStyle}</style>
      <div className="flex flex-col h-full w-full bg-white text-left font-sans">
        <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">

            {/* Status & Type */}
            <FormGroup label="Payment status">
              <SelectInput
                value={filters.statuses?.[0] || ''}
                label={filters.statuses?.length ? `Selected (${filters.statuses.length})` : "All Statuses"}
                count={filters.statuses?.length}
                onChange={(val) => handleChange('statuses', val ? [val] : [])}
                options={[
                  { label: 'Pending', value: 'PENDING' },
                  { label: 'Success', value: 'SUCCESS' },
                  { label: 'Failed', value: 'FAILED' },
                  { label: 'System Pending', value: 'SYSTEM_PENDING' },
                  { label: 'System Success', value: 'SYSTEM_SUCCESS' },
                  { label: 'System Failed', value: 'SYSTEM_FAILED' },
                ]}
              />
            </FormGroup>

            <FormGroup label="Payment type">
              <SelectInput
                value={filters.paymentTypes?.[0] || ''}
                label={filters.paymentTypes?.length ? `Selected (${filters.paymentTypes.length})` : "All Types"}
                count={filters.paymentTypes?.length}
                onChange={(val) => handleChange('paymentTypes', val ? [val] : [])}
                options={[
                  { label: 'Deposit', value: 'DEPOSIT' },
                  { label: 'Advance Payment', value: 'ADVANCE' },
                  { label: 'Installment', value: 'INSTALLMENT' },
                  { label: 'Paid In Full', value: 'FULL_PAY' },
                  { label: 'Monthly Rent', value: 'MONTHLY' },
                  { label: 'Penalty', value: 'PENALTY' },
                  { label: 'Money Sale', value: 'MONEY_SALE' },
                  { label: 'Money Rental', value: 'MONEY_RENTAL' },
                  { label: 'Salary', value: 'SALARY' },
                  { label: 'Bonus', value: 'BONUS' },
                  { label: 'Service Fee', value: 'SERVICE_FEE' },
                ]}
              />
            </FormGroup>

            {/* Users Selection - Full Width Row */}
            <div className="col-span-2 p-4 bg-gray-50/50 rounded-xl border border-gray-100 grid grid-cols-2 gap-5">
              <AsyncSelect
                label="Filter by Payer"
                placeholder="Search payer name..."
                value={filters.payerId || ''}
                onChange={(val) => handleChange('payerId', val)}
                fetchOptions={fetchUsersCombined}
              />
              <AsyncSelect
                label="Filter by Payee"
                placeholder="Search payee name..."
                value={filters.payeeId || ''}
                onChange={(val) => handleChange('payeeId', val)}
                fetchOptions={fetchUsersCombined}
              />
            </div>

            {/* Amount Range */}
            <FormGroup label="Min Amount">
              <CurrencyInput
                value={filters.minAmount || ''}
                onChange={(val) => handleChange('minAmount', val)}
                placeholder="0"
              />
            </FormGroup>

            <FormGroup label="Max Amount" error={errors.maxAmount}>
              <CurrencyInput
                value={filters.maxAmount || ''}
                onChange={(val) => handleChange('maxAmount', val)}
                placeholder="No limit"
                error={!!errors.maxAmount}
              />
            </FormGroup>

            {/* Date Ranges */}
            <div className="col-span-2 grid grid-cols-2 gap-6 pt-2 border-t border-dashed border-gray-100">
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Paid Date</span>
                <div className="grid grid-cols-2 gap-2">
                  <DateInput value={filters.paidDateFrom} onChange={(val) => handleChange('paidDateFrom', val)} placeholder="From" />
                  <DateInput value={filters.paidDateTo} onChange={(val) => handleChange('paidDateTo', val)} placeholder="To" error={!!errors.paidDateTo} />
                </div>
              </div>
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Due Date</span>
                <div className="grid grid-cols-2 gap-2">
                  <DateInput value={filters.dueDateFrom} onChange={(val) => handleChange('dueDateFrom', val)} placeholder="From" />
                  <DateInput value={filters.dueDateTo} onChange={(val) => handleChange('dueDateTo', val)} placeholder="To" error={!!errors.dueDateTo} />
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-100 bg-white shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Reset All
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-[#D31010] rounded-lg hover:bg-red-800 shadow-sm transition-colors"
          >
            <Check className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

// --- Sub-components (Layout & Inputs) ---

const FormGroup = ({ label, children, error }: { label: string, children: React.ReactNode, error?: string }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-bold text-gray-900">{label}</label>
    {children}
    {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
  </div>
);

const CurrencyInput = ({ value, onChange, placeholder, error }: { value: string, onChange: (val: string) => void, placeholder?: string, error?: boolean }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const clean = raw.replace(/^0+/, '') || '0';
    onChange(clean === '0' ? '' : clean.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full h-10 bg-gray-50 border ${error ? 'border-red-300 focus:ring-red-100' : 'border-gray-100 focus:ring-red-100'} rounded-lg px-3 pr-12 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-red-300 focus:bg-white focus:ring-2 transition-all`}
      />
      {value && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">VND</span>}
    </div>
  );
};

const DateInput = ({ value, onChange, placeholder, error }: { value?: string, onChange: (val: string) => void, placeholder?: string, error?: boolean }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      className={`relative w-full h-10 bg-gray-50 border ${error ? 'border-red-300' : 'border-gray-100'} rounded-lg hover:bg-white hover:border-red-200 transition-all cursor-pointer shadow-sm`}
      onClick={() => ref.current?.showPicker?.()}
    >
      <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
        <span className={`text-sm truncate ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
          {value ? new Date(value).toLocaleDateString('en-GB') : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <button onClick={(e) => { e.stopPropagation(); onChange(''); }} className="pointer-events-auto p-0.5 hover:bg-gray-200 rounded">
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>
      <input
        ref={ref}
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
};

const SelectInput = ({ value, label, count, onChange, options }: { value: string | undefined, label: string, count?: number, onChange: (val: string) => void, options: { label: string, value: string }[] }) => (
  <div className="relative w-full h-10 bg-gray-50 border border-gray-100 rounded-lg hover:bg-white hover:border-red-200 transition-all cursor-pointer shadow-sm">
    <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className={`text-sm truncate ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
          {value ? options.find(o => o.value === value)?.label : label}
        </span>
        {count !== undefined && count > 0 && (
          <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[20px] text-center shrink-0">{count}</span>
        )}
      </div>
      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
    </div>
    <select
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select...</option>
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);