'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Loader2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { accountService, CustomerListItem, CustomerFilters } from '@/lib/api/services/account.service';
import { rankingService } from '@/lib/api/services/ranking.service';
import { getFullUrl } from '@/lib/utils/urlUtils';

interface Props {
  filters: CustomerFilters;
  onFilterChange: React.Dispatch<React.SetStateAction<CustomerFilters>>;
}

export default function CustomersTable({ filters, onFilterChange }: Props) {
  const [data, setData] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await accountService.getAllCustomers({
          ...filters,
          page: filters.page || 1,
          limit: filters.limit || 10,
          sortType: filters.sortType || 'desc',
          sortBy: filters.sortBy || 'createdAt'
        });

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Fetch Tier bổ sung
        const customersWithTier = await Promise.all(
          res.data.map(async (customer) => {
            if (customer.tier) return customer;
            try {
              const rankData = await rankingService.getCustomerMonthlyPotential(customer.id, currentMonth, currentYear);
              return {
                ...customer,
                tier: rankData.customerTier || 'MEMBER',
                point: rankData.leadScore || customer.point
              };
            } catch (err) {
              return { ...customer, tier: 'MEMBER' };
            }
          })
        );

        let finalData = customersWithTier;
        if (filters.customerTiers && filters.customerTiers.length > 0) {
          const targetTiers = filters.customerTiers.map(t => t.toUpperCase());
          finalData = finalData.filter(c => c.tier && targetTiers.includes(c.tier.toUpperCase()));
        }

        setData(finalData);

        if (res.paging) setTotalItems(res.paging.total);
        else if ((res as any).meta) setTotalItems((res as any).meta.total);

      } catch (error) {
        console.error("Error fetching customers:", error);
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
      case 'SILVER': return 'default';
      case 'BRONZE': return 'warning';
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
              <th className="px-6 py-4 font-bold text-gray-900">Customer</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-center">Score</th>
              <th className="px-6 py-4 font-bold text-gray-900">Tier</th>
              <th className="px-6 py-4 font-bold text-gray-900">Spending</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-center">Viewings</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-center">Contracts</th>
              <th className="px-6 py-4 font-bold text-gray-900">Joined at</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8">No customers found matching filters.</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                        <img
                          src={getFullUrl(item.avatarUrl)}
                          className="w-full h-full object-cover"
                          alt={item.firstName}
                          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}&background=random` }}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{item.firstName} {item.lastName}</p>
                        <p className="text-[10px] text-red-600 font-bold mt-0.5">#{item.ranking || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-red-600 text-center">{item.point || 0}</td>
                  <td className="px-6 py-4">
                    <Badge variant={getTierVariant(item.tier) as any} className="text-[10px] px-2">
                      {item.tier || 'MEMBER'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">{formatCurrency(item.totalSpending)}</td>
                  <td className="px-6 py-4 font-bold text-gray-700 text-center">{item.totalViewings || 0}</td>
                  <td className="px-6 py-4 font-bold text-gray-700 text-center">{item.totalContracts || 0}</td>
                  <td className="px-6 py-4 text-gray-900">{formatDate(item.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/customers/${item.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg inline-flex items-center justify-center transition-colors">
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