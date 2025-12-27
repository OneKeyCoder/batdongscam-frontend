import React from 'react';
import Link from 'next/link';
import { Eye, Loader2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { SaleAgentListItem } from '@/lib/api/services/account.service';
import { getFullUrl } from '@/lib/utils/urlUtils';

interface AgentsTableProps {
  data: SaleAgentListItem[];
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function AgentsTable({ data, loading, currentPage, itemsPerPage, totalItems, onPageChange }: AgentsTableProps) {

  if (loading) {
    return <div className="bg-white border border-gray-200 rounded-xl p-10 flex justify-center"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900">Sale Agent</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-center">Point</th>
              <th className="px-6 py-4 font-bold text-gray-900">Tier</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-center">Assigns</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-center">Contracts</th>
              <th className="px-6 py-4 font-bold text-gray-900">Rating</th>
              <th className="px-6 py-4 font-bold text-gray-900">Hired date</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8">No agents found.</td></tr>
            ) : data.map((agent) => (
              <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                      <img
                        src={getFullUrl(agent.avatarUrl)}
                        alt={agent.firstName}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${agent.firstName}+${agent.lastName}` }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">{agent.firstName} {agent.lastName}</p>
                      <p className="text-[10px] text-red-600 font-bold mt-0.5">{agent.employeeCode || '---'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-red-600 text-center">{agent.point ?? 0}</td>
                <td className="px-6 py-4">
                  <Badge variant={agent.tier === 'PLATINUM' ? 'pink' : 'gold'}>{agent.tier || 'MEMBER'}</Badge>
                </td>
                <td className="px-6 py-4 font-bold text-gray-700 text-center">{agent.totalAssignments ?? 0}</td>
                <td className="px-6 py-4 font-bold text-gray-700 text-center">{agent.totalContracts ?? 0}</td>
                <td className="px-6 py-4">
                  <span className="font-bold text-red-600">{agent.rating ?? 0}</span>
                  <span className="text-gray-400 text-xs ml-1">({agent.totalRates ?? 0})</span>
                </td>
                <td className="px-6 py-4 text-gray-900">{agent.hiredDate ? new Date(agent.hiredDate).toLocaleDateString() : '---'}</td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/agents/${agent.id}`}
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
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={itemsPerPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}