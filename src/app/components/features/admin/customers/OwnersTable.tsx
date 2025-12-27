'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Loader2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { accountService, PropertyOwnerListItem, PropertyOwnerFilters } from '@/lib/api/services/account.service';

interface Props {
  filters: PropertyOwnerFilters;
  onFilterChange: React.Dispatch<React.SetStateAction<PropertyOwnerFilters>>;
}

export default function OwnersTable({ filters, onFilterChange }: Props) {
  const [data, setData] = useState<PropertyOwnerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await accountService.getAllPropertyOwners({
          ...filters,
          page: filters.page || 1,
          limit: filters.limit || 10,
          sortType: filters.sortType || 'desc',
          sortBy: filters.sortBy || 'createdAt'
        });
        setData(res.data);
        if (res.paging) setTotalItems(res.paging.total);
        else if ((res as any).meta) setTotalItems((res as any).meta.total);
      } catch (error) {
        console.error("Error fetching owners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const handlePageChange = (pageNumber: number) => {
    onFilterChange(prev => ({ ...prev, page: pageNumber }));
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatCurrency = (amount?: number) => amount === undefined ? '0' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  const getTierVariant = (tier?: string) => {
    switch (tier?.toUpperCase()) {
      case 'PLATINUM': return 'pink';
      case 'GOLD': return 'gold';
      case 'SILVER': return 'sale';
      case 'BRONZE': return 'pending';
      default: return 'default';
    }
  };

  if (loading) return <div className="bg-white border border-gray-200 rounded-xl p-12 flex justify-center"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;

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
            {data.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8">No property owners found.</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                        {item.avatarUrl ? <img src={item.avatarUrl} className="w-full h-full object-cover" alt="" /> :
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 font-bold text-gray-400">{item.firstName.charAt(0)}</div>}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{item.firstName} {item.lastName}</p>
                        <p className="text-[10px] text-red-600 font-bold mt-0.5">#{item.ranking || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-red-600">{item.point || 0}</td>
                  <td className="px-6 py-4">
                    <Badge variant={getTierVariant(item.tier) as any}>{item.tier || '---'}</Badge>
                  </td>
                  <td className="px-6 py-4 font-bold text-red-600">{formatCurrency(item.totalValue)}</td>
                  <td className="px-6 py-4 font-bold text-red-600">{item.totalProperties || 0}</td>
                  <td className="px-6 py-4 text-gray-900">{formatDate(item.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/owners/${item.id}`} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg inline-flex items-center justify-center transition-colors">
                      <Eye className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={filters.page || 1}
        totalItems={totalItems}
        pageSize={filters.limit || 10}
        onPageChange={handlePageChange}
      />
    </div>
  );
}