import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatItemData {
  title: string;
  value: string | number;
  trend?: string;
  icon: LucideIcon;
}

export default function StatsGrid({ stats }: { stats: StatItemData[] }) {

  const getGridCols = (count: number) => {
    switch (count) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-3'; 
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'; 
      default: return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5'; 
    }
  };

  return (
    <div className={`grid ${getGridCols(stats.length)} gap-4 mb-6`}>
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide">{stat.title}</p>
            <h4 className="text-2xl font-bold text-gray-900">{stat.value}</h4>
            {stat.trend && (
              <p className="text-green-600 text-xs font-medium mt-1.5 flex items-center bg-green-50 w-fit px-1.5 py-0.5 rounded">
                <span className="text-sm leading-none mr-1">↑</span> {stat.trend}
              </p>
            )}
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <stat.icon className="w-6 h-6 text-red-600" />
          </div>
        </div>
      ))}
    </div>
  );
}