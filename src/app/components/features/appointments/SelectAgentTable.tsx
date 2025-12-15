'use client';

import React from 'react';
import Badge from '@/app/components/ui/Badge';

const agents = Array(10).fill(null).map((_, i) => ({
    id: i + 1,
    name: "Agent's Name",
    number: `#${i + 1}`,
    code: "SA0123",
    tier: "PLATINUM",
    appointments: "13",
    properties: "1",
    maxProp: "10",
    handling: "8"
}));

interface SelectAgentTableProps {
    onSelect: (agentId: number) => void;
}

export default function SelectAgentTable({ onSelect }: SelectAgentTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900">Agents</th>
              <th className="px-6 py-4 font-bold text-gray-900">Tier</th>
              <th className="px-6 py-4 font-bold text-gray-900">Appointments</th>
              <th className="px-6 py-4 font-bold text-gray-900">Properties</th>
              <th className="px-6 py-4 font-bold text-gray-900">Max properties per day</th>
              <th className="px-6 py-4 font-bold text-gray-900">Currently handling</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agents.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0"></div>
                        <div>
                            <p className="font-bold text-gray-900 text-xs">{item.name}</p>
                            <p className="text-[10px] text-red-600 font-bold mt-0.5">{item.number}</p>
                            <p className="text-[10px] text-red-600 font-bold">{item.code}</p>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4"><Badge variant="pink">{item.tier}</Badge></td>
                <td className="px-6 py-4 font-medium text-gray-900">{item.appointments}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{item.properties}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{item.maxProp}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{item.handling}</td>
                <td className="px-6 py-4 text-right">
                    <button 
                        onClick={() => onSelect(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors ml-auto"
                    >
                        Select
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white text-sm text-gray-500 flex justify-between items-center">
          <span>1-10 of 97</span>
          <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center border rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center border rounded-lg bg-white text-gray-600 font-medium">1/10</button>
              <button className="w-8 h-8 flex items-center justify-center border rounded-lg bg-white text-gray-600 hover:bg-gray-50">&gt;</button>
          </div>
      </div>
    </div>
  );
}