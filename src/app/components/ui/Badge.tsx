import React from 'react';

type BadgeVariant =
  | 'default' | 'success' | 'danger' | 'warning' | 'info' | 'pink' | 'yellow' | 'gold'
  | 'deposit' | 'advance' | 'installment' | 'fullpay' | 'salary' | 'bonus'
  | 'monthly' | 'penalty' | 'refund' | 'sale' | 'rental' | 'pending' | 'failed'
  | 'scam' | 'spam' | 'reported' | 'resolved' | 'red' | 'blue' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800 border border-gray-200',
    success: 'bg-green-100 text-green-700 border border-green-200',
    danger: 'bg-green-100 text-green-700 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    info: 'bg-blue-100 text-blue-700 border border-blue-200',
    pink: 'bg-pink-100 text-pink-600 border border-pink-200',
    yellow: "bg-yellow-100 text-yellow-600",
    gold: 'bg-yellow-50 text-yellow-600 border border-yellow-200',
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
    gray: 'bg-gray-100 text-gray-800 border border-gray-200', 

    // --- PAYMENT VARIANTS ---
    deposit: 'bg-blue-100 text-blue-700 border-blue-200',
    advance: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    installment: 'bg-teal-100 text-teal-700 border-teal-200',
    fullpay: 'bg-green-100 text-green-700 border-green-200',
    salary: 'bg-sky-100 text-sky-700 border-sky-200',
    bonus: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    monthly: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    penalty: 'bg-rose-100 text-rose-700 border-rose-200',
    refund: 'bg-purple-100 text-purple-700 border-purple-200',
    sale: 'bg-orange-100 text-orange-700 border-orange-200',
    rental: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    failed: 'bg-red-200 text-red-800 border-red-300',

    // --- NEW VIOLATION STYLES ---
    scam: 'bg-red-800 text-white border-red-900',
    spam: 'bg-amber-600 text-white border-amber-700',
    reported: 'bg-red-50 text-red-600 border-red-100',
    resolved: 'bg-green-50 text-green-600 border-green-100',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase leading-4 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}