'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; 
import { Eye, Loader2, MapPin } from 'lucide-react'; 
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { accountService, PropertyOwnerListItem, PropertyOwnerFilters } from '@/lib/api/services/account.service';

interface Props {
  externalFilters?: PropertyOwnerFilters;
}

export default function OwnerContributionTable({ externalFilters }: Props) {
  const [data, setData] = useState<PropertyOwnerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PropertyOwnerFilters>({
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

  // Fetch API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await accountService.getAllPropertyOwners(filters);
        setData(res.data);
        if (res.paging) setTotalItems(res.paging.total);
        else if ((res as any).meta) setTotalItems((res as any).meta.total);
      } catch (error) {
        console.error("Failed to fetch owners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined) return '0';
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    return val.toLocaleString();
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

  if (loading) return <div className="flex justify-center p-12 bg-white border border-gray-200 rounded-xl"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900">Property Owner</th>
              <th className="px-6 py-4 font-bold text-gray-900">Point</th>
              <th className="px-6 py-4 font-bold text-gray-900">Tier</th>
              <th className="px-6 py-4 font-bold text-gray-900">Contribution Value</th>
              <th className="px-6 py-4 font-bold text-gray-900">Properties</th>
              <th className="px-6 py-4 font-bold text-gray-900">Location</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right">View Detail</th> {/* Sửa header */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8">No property owners found.</td></tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                        {item.avatarUrl && <img src={item.avatarUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{item.firstName} {item.lastName}</p>
                        <p className="text-[10px] text-red-600 font-bold mt-0.5">#{item.ranking || ((filters.page! - 1) * filters.limit! + index + 1)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-red-600">{item.point || 0}</td>
                  <td className="px-6 py-4">
                    <Badge variant={getTierVariant(item.tier) as any} className="text-[10px] uppercase">{item.tier || 'N/A'}</Badge>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(item.totalValue)}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{item.totalProperties || 0}</td>
                  <td className="px-6 py-4 text-gray-900 text-xs">
                    {item.location ? (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" /> {item.location}</span>
                    ) : '---'}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/owners/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                      title="View Details in new tab"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={filters.page || 1}
            totalItems={totalItems}
            pageSize={filters.limit || 10}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}