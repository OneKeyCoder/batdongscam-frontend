import React, { useState, useRef } from 'react';
import { RefreshCcw, Check, ChevronDown, Calendar, X } from 'lucide-react';
import { PaymentFilters } from '@/lib/api/services/payment.service';

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

    // Validate amount range
    if (filters.minAmount && filters.maxAmount) {
      const min = parseFloat(filters.minAmount.replace(/\./g, ''));
      const max = parseFloat(filters.maxAmount.replace(/\./g, ''));
      if (min > max) {
        newErrors.maxAmount = 'Max amount must be greater than min amount';
      }
    }

    // Validate paid date range
    if (filters.paidDateFrom && filters.paidDateTo) {
      if (new Date(filters.paidDateFrom) > new Date(filters.paidDateTo)) {
        newErrors.paidDateTo = 'End date must be after start date';
      }
    }

    // Validate due date range
    if (filters.dueDateFrom && filters.dueDateTo) {
      if (new Date(filters.dueDateFrom) > new Date(filters.dueDateTo)) {
        newErrors.dueDateTo = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApply = () => {
    if (!validateForm()) {
      return;
    }

    const payload: any = { ...filters };
    delete payload.minAmount;
    delete payload.maxAmount;

    // Remove empty values
    Object.keys(payload).forEach(key => {
      if (!payload[key] || (Array.isArray(payload[key]) && payload[key].length === 0)) {
        delete payload[key];
      }
    });

    console.log('🔍 Filters being applied:', payload);
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
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <FormGroup label="Payment status">
              <SelectInput
                value={filters.statuses?.[0] || ''}
                label={filters.statuses?.length ? `Selected (${filters.statuses.length})` : "Select status"}
                count={filters.statuses?.length}
                onChange={(val) => handleChange('statuses', val ? [val] : [])}
                options={[
                  { label: 'Success', value: 'SUCCESS' },
                  { label: 'Pending', value: 'PENDING' },
                  { label: 'Failed', value: 'FAILED' },
                  { label: 'Cancelled', value: 'CANCELLED' },
                  { label: 'Overdue', value: 'OVERDUE' },
                ]}
              />
            </FormGroup>

            <FormGroup label="Payment type">
              <SelectInput
                value={filters.paymentTypes?.[0] || ''}
                label={filters.paymentTypes?.length ? `Selected (${filters.paymentTypes.length})` : "Select type"}
                count={filters.paymentTypes?.length}
                onChange={(val) => handleChange('paymentTypes', val ? [val] : [])}
                options={[
                  { label: 'Monthly', value: 'MONTHLY' },
                  { label: 'Paid In Full', value: 'PAID_IN_FULL' },
                  { label: 'Mortgage', value: 'MORTGAGE' },
                  { label: 'Salary', value: 'SALARY' },
                  { label: 'Bonus', value: 'BONUS' },
                ]}
              />
            </FormGroup>

            <FormGroup label="Payer ID / Name">
              <TextInput
                value={filters.payerId || ''}
                onChange={(e) => handleChange('payerId', e.target.value)}
                placeholder="Enter payer ID..."
              />
            </FormGroup>

            <FormGroup label="Payer's role">
              <div className="w-full h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 flex items-center text-sm text-gray-400 cursor-not-allowed">
                Not supported by API
              </div>
            </FormGroup>

            <FormGroup label="Payee ID / Name">
              <TextInput
                value={filters.payeeId || ''}
                onChange={(e) => handleChange('payeeId', e.target.value)}
                placeholder="Enter payee ID..."
              />
            </FormGroup>

            <FormGroup label="Payee's role">
              <div className="w-full h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 flex items-center text-sm text-gray-400 cursor-not-allowed">
                Not supported by API
              </div>
            </FormGroup>

            <FormGroup label="Min payment amount">
              <CurrencyInput
                value={filters.minAmount || ''}
                onChange={(val) => handleChange('minAmount', val)}
                placeholder="0"
              />
            </FormGroup>

            <FormGroup label="Max payment amount" error={errors.maxAmount}>
              <CurrencyInput
                value={filters.maxAmount || ''}
                onChange={(val) => handleChange('maxAmount', val)}
                placeholder="No limit"
                error={!!errors.maxAmount}
              />
            </FormGroup>

            <FormGroup label="Paid date from">
              <DateInput
                value={filters.paidDateFrom}
                onChange={(val) => handleChange('paidDateFrom', val)}
                placeholder="Start date"
              />
            </FormGroup>

            <FormGroup label="Paid date to" error={errors.paidDateTo}>
              <DateInput
                value={filters.paidDateTo}
                onChange={(val) => handleChange('paidDateTo', val)}
                placeholder="End date"
                error={!!errors.paidDateTo}
              />
            </FormGroup>

            <FormGroup label="Due date from">
              <DateInput
                value={filters.dueDateFrom}
                onChange={(val) => handleChange('dueDateFrom', val)}
                placeholder="Start date"
              />
            </FormGroup>

            <FormGroup label="Due date to" error={errors.dueDateTo}>
              <DateInput
                value={filters.dueDateTo}
                onChange={(val) => handleChange('dueDateTo', val)}
                placeholder="End date"
                error={!!errors.dueDateTo}
              />
            </FormGroup>
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

const FormGroup = ({ label, children, error }: { label: string, children: React.ReactNode, error?: string }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-bold text-gray-900">{label}</label>
    {children}
    {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
  </div>
);

const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full h-10 bg-gray-50 border border-gray-100 rounded-lg px-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
  />
);

const CurrencyInput = ({
  value,
  onChange,
  placeholder,
  error
}: {
  value: string,
  onChange: (val: string) => void,
  placeholder?: string,
  error?: boolean
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const cleanValue = rawValue.replace(/^0+/, '') || '0';
    const formattedValue = cleanValue === '0' ? '' : cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    onChange(formattedValue);
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
      {value && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
          VND
        </span>
      )}
    </div>
  );
};

const DateInput = ({ value, onChange, placeholder, error }: { value?: string, onChange: (val: string) => void, placeholder?: string, error?: boolean }) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const displayDate = value ? new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div
      className={`relative w-full h-10 bg-gray-50 border ${error ? 'border-red-300' : 'border-gray-100'} rounded-lg hover:bg-white hover:border-red-200 transition-all cursor-pointer`}
      onClick={() => dateInputRef.current?.showPicker?.()}
    >
      <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
        <span className={`text-sm truncate ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
          {displayDate || placeholder || 'Select date'}
        </span>
        <div className="flex items-center gap-2">
          {value && (
            <button onClick={handleClearDate} className="pointer-events-auto p-0.5 hover:bg-gray-200 rounded transition-colors">
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
          <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
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

const SelectInput = ({ value, label, count, onChange, options }: {
  value: string | undefined, label: string, count?: number, onChange: (val: string) => void, options: { label: string, value: string }[]
}) => {
  return (
    <div className="relative w-full h-10 bg-gray-50 border border-gray-100 rounded-lg hover:bg-white hover:border-red-200 transition-all cursor-pointer">
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
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none focus:outline-none"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};