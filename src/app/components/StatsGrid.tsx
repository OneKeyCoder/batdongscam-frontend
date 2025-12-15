import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatItemData {
  title: string;
  value: string | number;
  trend?: string; 
  icon: LucideIcon;
}

export default function StatsGrid({ stats }: { stats: StatItemData[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-gray-500 text-xs font-medium mb-1">{stat.title}</p>
            <h4 className="text-xl font-bold text-gray-900">{stat.value}</h4>
            {stat.trend && (
              <p className="text-green-600 text-xs font-medium mt-1 flex items-center">
                <span className="text-lg leading-none mr-0.5">↑</span> {stat.trend}
              </p>
            )}
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <stat.icon className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      ))}
    </div>
  );
}