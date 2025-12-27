'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { assignmentService, FreeAgentListItem, FreeAgentFilters } from '@/lib/api/services/assignment.service';

interface SelectAgentTableProps {
  onSelect: (agentId: string) => void;
  filters?: FreeAgentFilters;
  onPageChange?: (page: number) => void;
}

export default function SelectAgentTable({ onSelect, filters, onPageChange }: SelectAgentTableProps) {
  const [data, setData] = useState<FreeAgentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const res = await assignmentService.getFreeAgents(filters);
        setData(res.data);
        if (res.paging) setTotalItems(res.paging.total);
        else if ((res as any).meta) setTotalItems((res as any).meta.total);
      } catch (error) {
        console.error("Error fetching free agents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [filters]);

  const handleSelectClick = async (agentId: string) => {
    setSelectingId(agentId);
    await onSelect(agentId);
    setSelectingId(null);
  };

  if (loading) {
    return <div className="bg-white border border-gray-200 rounded-xl p-12 flex justify-center"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900">Agents</th>
              <th className="px-6 py-4 font-bold text-gray-900">Tier</th>
              <th className="px-6 py-4 font-bold text-gray-900">Assignments</th>
              <th className="px-6 py-4 font-bold text-gray-900">Properties</th>
              <th className="px-6 py-4 font-bold text-gray-900">Max properties per day</th>
              <th className="px-6 py-4 font-bold text-gray-900">Currently handling</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8">No free agents found.</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                        {item.avatarUrl ? (
                          <img src={item.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 text-xs font-bold">
                            {item.fullName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{item.fullName}</p>
                        <p className="text-[10px] text-red-600 font-bold mt-0.5">#{item.ranking || 'N/A'}</p>
                        <p className="text-[10px] text-gray-500 font-bold">{item.employeeCode || 'SA---'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Badge variant="pink">{item.tier || 'MEMBER'}</Badge></td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.assignedAppointments || 0}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.assignedProperties || 0}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.maxProperties || '---'}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.currentlyHandling || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleSelectClick(item.id)}
                      disabled={selectingId !== null}
                      className={`flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-lg transition-colors ml-auto ${selectingId === item.id ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                      {selectingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Select'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={filters?.page || 1}
        totalItems={totalItems}
        pageSize={filters?.limit || 10}
        onPageChange={(page) => onPageChange && onPageChange(page)}
      />
    </div>
  );
}