import React from 'react';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode; // Nút phụ trên header (ví dụ: Edit)
}

export default function InfoCard({ title, children, className = '', action }: InfoCardProps) {
  return (
    <div className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-gray-900">{title}</h4>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}