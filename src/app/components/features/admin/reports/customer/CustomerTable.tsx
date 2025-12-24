'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';

const customers = Array(10).fill(null).map((_, i) => ({
  id: i + 1,
  name: "Customer's Name",
  number: `#${i + 1}`,
  point: "95",
  tier: "PLATINUM",
  spending: "50B",
  properties: "15",
  joinedAt: "January 2nd, 2022"
}));

export default function CustomerTable() {

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentcustomers = customers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };


  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900">Customer</th>
              <th className="px-6 py-4 font-bold text-gray-900">Point</th>
              <th className="px-6 py-4 font-bold text-gray-900">Tier</th>
              <th className="px-6 py-4 font-bold text-gray-900">Value (Spending)</th>
              <th className="px-6 py-4 font-bold text-gray-900">Properties</th>
              <th className="px-6 py-4 font-bold text-gray-900">Joined at</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0"></div>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">{item.name}</p>
                      <p className="text-[10px] text-red-600 font-bold mt-0.5">{item.number}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-red-600">{item.point}</td>
                <td className="px-6 py-4"><Badge variant="pink">{item.tier}</Badge></td>
                <td className="px-6 py-4 font-bold text-red-600">{item.spending}</td>
                <td className="px-6 py-4 font-bold text-red-600">{item.properties}</td>
                <td className="px-6 py-4 text-gray-900">{item.joinedAt}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={customers.length}
        pageSize={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}