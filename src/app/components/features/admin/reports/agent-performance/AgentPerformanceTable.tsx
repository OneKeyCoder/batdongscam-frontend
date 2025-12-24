'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';

const agents = Array(10).fill(null).map((_, i) => ({
  id: i + 1,
  name: "Agent's Name",
  number: `#${i + 1}`,
  code: "SA0123",
  point: "95",
  tier: "PLATINUM",
  assignments: "16",
  contracts: "15",
  rating: "4.8",
  totalRates: "172",
  hiredDate: "January 2nd, 2022"
}));

export default function AgentPerformanceTable() {

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAgents = agents.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900">Sale Agent</th>
              <th className="px-6 py-4 font-bold text-gray-900">Point</th>
              <th className="px-6 py-4 font-bold text-gray-900">Tier</th>
              <th className="px-6 py-4 font-bold text-gray-900">Assignments</th>
              <th className="px-6 py-4 font-bold text-gray-900">Contracts</th>
              <th className="px-6 py-4 font-bold text-gray-900">Rating</th>
              <th className="px-6 py-4 font-bold text-gray-900">Hired date</th>
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
                <td className="px-6 py-4 font-bold text-red-600">{item.point}</td>
                <td className="px-6 py-4"><Badge variant="pink">{item.tier}</Badge></td>
                <td className="px-6 py-4 font-bold text-red-600">{item.assignments}</td>
                <td className="px-6 py-4 font-bold text-red-600">{item.contracts}</td>
                <td className="px-6 py-4 font-bold text-red-600">
                  {item.rating} <span className="text-red-400 font-normal">({item.totalRates})</span>
                </td>
                <td className="px-6 py-4 text-gray-900">{item.hiredDate}</td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/agents/${item.id}`}
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
      <Pagination
        currentPage={currentPage}
        totalItems={agents.length}
        pageSize={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}