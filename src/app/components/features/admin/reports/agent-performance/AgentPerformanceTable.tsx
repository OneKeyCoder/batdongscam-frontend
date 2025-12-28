'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Import Link
import { Eye, Loader2 } from 'lucide-react'; 
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { accountService, SaleAgentListItem, SaleAgentFilters } from '@/lib/api/services/account.service';

interface Props {
  externalFilters?: SaleAgentFilters;
}

export default function AgentPerformanceTable({ externalFilters }: Props) {
  const [data, setData] = useState<SaleAgentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SaleAgentFilters>({
    page: 1,
    limit: 10,
    sortType: 'desc',
    sortBy: 'ranking'
  });
  const [totalItems, setTotalItems] = useState(0);

  // Sync external filters
  useEffect(() => {
    if (externalFilters) {
      setFilters(prev => ({ ...prev, ...externalFilters, page: 1 }));
    }
  }, [externalFilters]);

  // Call API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await accountService.getAllSaleAgents(filters);
        setData(res.data);
        if (res.paging) setTotalItems(res.paging.total);
        else if ((res as any).meta) setTotalItems((res as any).meta.total);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getTierVariant = (tier?: string) => {
    switch (tier?.toUpperCase()) {
      case 'PLATINUM': return 'pink';
      case 'GOLD': return 'yellow';
      case 'SILVER': return 'default';
      case 'BRONZE': return 'failed';
      default: return 'default';
    }
  };

  if (loading) return <div className="flex justify-center p-12 bg-white border rounded-xl"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-900 font-bold uppercase border-b border-gray-200 bg-white">
            <tr>
              <th className="px-6 py-4 w-[25%]">Sale Agent</th>
              <th className="px-6 py-4 w-[10%]">Point</th>
              <th className="px-6 py-4 w-[10%]">Tier</th>
              <th className="px-6 py-4 w-[10%]">Assignments</th>
              <th className="px-6 py-4 w-[10%]">Contracts</th>
              <th className="px-6 py-4 w-[15%]">Rating</th>
              <th className="px-6 py-4 w-[15%]">Hired date</th>
              <th className="px-6 py-4 w-[5%] text-right">View Detail</th> 
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8">No agents found.</td></tr>
            ) : (
              data.map((agent, index) => (
                <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                  {/* Sale Agent Column: Avatar + Name + Rank + Code */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-gray-200 shrink-0 overflow-hidden">
                        {agent.avatarUrl ? <img src={agent.avatarUrl} className="w-full h-full object-cover" /> : null}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{agent.firstName} {agent.lastName}</p>
                        <div className="flex items-center gap-1 text-xs mt-0.5">
                          <span className="font-bold text-red-600">#{agent.ranking || ((filters.page! - 1) * filters.limit! + index + 1)}</span>
                          <span className="text-gray-400 font-medium uppercase">{agent.employeeCode}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Point */}
                  <td className="px-6 py-4 font-bold text-red-600 text-sm">{agent.point || 0}</td>

                  {/* Tier */}
                  <td className="px-6 py-4">
                    <Badge variant={getTierVariant(agent.tier) as any} className="uppercase px-2 py-0.5 text-[10px] tracking-wide font-bold">
                      {agent.tier || 'N/A'}
                    </Badge>
                  </td>

                  {/* Assignments */}
                  <td className="px-6 py-4 font-bold text-gray-900">{agent.totalAssignments || 0}</td>

                  {/* Contracts */}
                  <td className="px-6 py-4 font-bold text-red-600">{agent.totalContracts || 0}</td>

                  {/* Rating */}
                  <td className="px-6 py-4">
                    <span className="font-bold text-red-600">{agent.rating || 0}</span>
                    <span className="text-gray-400 font-medium text-xs ml-1">({agent.totalRates || 0})</span>
                  </td>

                  {/* Hired Date */}
                  <td className="px-6 py-4 text-gray-900 text-sm">
                    {formatDate(agent.hiredDate)}
                  </td>

                  {/* Action: Eye Icon linking to Detail in New Tab */}
                  <td className="px-6 py-4 text-right">
                    <Link
                      // Update with your actual detail route
                      href={`/admin/agents/${agent.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                      title="View Details in new tab"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <Pagination
          currentPage={filters.page || 1}
          totalItems={totalItems}
          pageSize={filters.limit || 10}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}