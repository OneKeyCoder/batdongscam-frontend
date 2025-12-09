import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

const owners = Array(10).fill(null).map((_, i) => ({
    id: i + 1,
    name: "Owner's Name",
    code: "#1",
    score: "95",
    tier: "PLATINUM",
    value: "50B",
    properties: "15",
    joinedAt: "January 2nd, 2022"
}));

export default function OwnersTable() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900">Property Owner</th>
              <th className="px-6 py-4 font-bold text-gray-900">Point</th>
              <th className="px-6 py-4 font-bold text-gray-900">Tier</th>
              <th className="px-6 py-4 font-bold text-gray-900">Value</th>
              <th className="px-6 py-4 font-bold text-gray-900">Properties</th>
              <th className="px-6 py-4 font-bold text-gray-900">Joined at</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {owners.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0"></div>
                        <div>
                            <p className="font-bold text-gray-900 text-xs">{item.name}</p>
                            <p className="text-[10px] text-red-600 font-bold mt-0.5">{item.code}</p>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 font-bold text-red-600">{item.score}</td>
                <td className="px-6 py-4">
                    <Badge variant={item.tier === 'PLATINUM' ? 'pink' : 'gold'}>{item.tier}</Badge>
                </td>
                <td className="px-6 py-4 font-bold text-red-600">{item.value}</td>
                <td className="px-6 py-4 font-bold text-red-600">{item.properties}</td>
                <td className="px-6 py-4 text-gray-900">{item.joinedAt}</td>
                <td className="px-6 py-4 text-right">
                    <Link 
                        href={`/admin/owners/${item.id}`} 
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
      {/* Pagination reuse */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">1-10</span> of <span className="font-medium">97</span>
          </p>
          <div className="flex items-center gap-2">
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                 <button className="p-2 border border-gray-300 rounded-lg hover:bg-white text-gray-700 font-medium">
                    1/10
                </button>
                 <button className="p-2 border border-gray-300 rounded-lg hover:bg-white">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
          </div>
      </div>
    </div>
  );
}