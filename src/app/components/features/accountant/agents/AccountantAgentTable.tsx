'use client';

import React from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

const agents = Array(10).fill(null).map((_, i) => ({
    id: i + 1,
    name: "Agent's Name",
    rank: `#${i + 1}`,
    code: "SA0123",
    point: "95",
    tier: "platinum", 
    salary: "50.000.000",
    paid: "50.000.000",
    unpaid: "0.000",
    bonus: "3.000.000"
}));

export default function AccountantAgentTable() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900">Agents</th>
              <th className="px-6 py-4 font-bold text-gray-900">Point</th>
              <th className="px-6 py-4 font-bold text-gray-900">Tier</th>
              <th className="px-6 py-4 font-bold text-gray-900">Salary</th>
              <th className="px-6 py-4 font-bold text-gray-900">Paid</th>
              <th className="px-6 py-4 font-bold text-gray-900">Unpaid</th>
              <th className="px-6 py-4 font-bold text-gray-900">Bonus</th>
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
                            <p className="text-[10px] text-red-600 font-bold mt-0.5">{item.rank}</p>
                            <p className="text-[10px] text-red-600 font-bold">{item.code}</p>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 font-bold text-red-600">{item.point}</td>
                <td className="px-6 py-4">
                    <Badge variant="pink" className="uppercase">{item.tier}</Badge>
                </td>
                <td className="px-6 py-4 font-bold text-red-600">{item.salary}</td>
                <td className="px-6 py-4 font-bold text-red-600">{item.paid}</td>
                <td className="px-6 py-4 font-bold text-red-600">{item.unpaid}</td>
                <td className="px-6 py-4 font-bold text-red-600">{item.bonus}</td>
                <td className="px-6 py-4 text-right">
                    {/* Link đến trang chi tiết */}
                    <Link 
                        href={`/accountant/agents/${item.id}`} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg inline-flex items-center justify-center transition-colors"
                    >
                        <Eye className="w-5 h-5" />
                    </Link>
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