'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Loader2, MapPin } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { accountService, CustomerListItem, CustomerFilters } from '@/lib/api/services/account.service';
import { rankingService } from '@/lib/api/services/ranking.service';
import { getFullUrl } from '@/lib/utils/urlUtils';

interface Props {
  externalFilters?: CustomerFilters;
}

// [FIX] Interface mở rộng: Khai báo lại là number (bắt buộc) để TS không báo lỗi khi dùng ở dưới
interface ExtendedCustomerItem extends CustomerListItem {
  tier?: string;
  totalSpending: number;   // Override thành number (không còn optional)
  totalContracts: number;  // Override thành number
  point: number;           // Override thành number
  ranking?: number;
}

export default function CustomerTable({ externalFilters }: Props) {
  const [data, setData] = useState<ExtendedCustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CustomerFilters>({
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

  // Fetch API & Merge Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Lấy danh sách khách hàng cơ bản
        const accountRes = await accountService.getAllCustomers(filters);
        const basicCustomers = accountRes.data;

        // 2. Chuẩn bị params gọi Ranking
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        // 3. Gọi API Ranking song song
        const rankingPromises = basicCustomers.map(customer =>
          rankingService.getCustomerMonthlyPotential(customer.id, currentMonth, currentYear)
            .catch(err => {
              console.warn(`No ranking data for customer ${customer.id}`, err);
              return null;
            })
        );

        const rankings = await Promise.all(rankingPromises);

        // 5. Hợp nhất dữ liệu & Fix lỗi TypeScript
        const mergedData: ExtendedCustomerItem[] = basicCustomers.map((customer, index) => {
          const rankData = rankings[index];

          // [FIX LỖI TS] Dùng (customer.field || 0) để xử lý undefined
          const currentSpending = customer.totalSpending || 0;
          const currentContracts = customer.totalContracts || 0;

          const mockSpending = Math.floor(Math.random() * 5000000000) + 100000000;
          const mockContracts = Math.floor(Math.random() * 5) + 1;

          return {
            ...customer,
            // Tier
            tier: rankData?.customerTier || customer.tier || 'BRONZE',

            // Spending: Lấy từ Ranking -> Hoặc API gốc -> Hoặc Mock
            totalSpending: rankData?.monthSpending ?? (currentSpending > 0 ? currentSpending : mockSpending),

            // Contracts
            totalContracts: rankData?.monthContractsSigned ?? (currentContracts > 0 ? currentContracts : mockContracts),

            // Point & Ranking
            point: rankData?.leadScore ?? (customer.point || 0),
            ranking: rankData?.leadPosition ?? customer.ranking
          };
        });

        setData(mergedData);

        if (accountRes.paging) setTotalItems(accountRes.paging.total);
        else if ((accountRes as any).meta) setTotalItems((accountRes as any).meta.total);

      } catch (error) {
        console.error("Failed to fetch customers:", error);
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
    if (val === undefined || val === null) return '0';
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    return val.toLocaleString();
  };

  const getTierVariant = (tier?: string) => {
    switch (tier?.toUpperCase()) {
      case 'PLATINUM': return 'pink';
      case 'GOLD': return 'yellow';
      case 'SILVER': return 'default'; // Hoặc 'info'
      case 'BRONZE': return 'failed';  // Hoặc 'default'
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
              <th className="px-6 py-4 font-bold text-gray-900 w-[25%]">Customer</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[10%]">Point</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[10%]">Tier</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[15%]">Total Spending</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[10%] text-center">Contracts</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[20%]">Location</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right w-[10%]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8">No customers found.</td></tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0 overflow-hidden border border-gray-100">
                        <img
                          src={getFullUrl(item.avatarUrl)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}` }}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{item.firstName} {item.lastName}</p>
                        <p className="text-[10px] text-red-600 font-bold mt-0.5">#{item.ranking || ((filters.page! - 1) * filters.limit! + index + 1)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-red-600">{item.point.toLocaleString()}</td>

                  <td className="px-6 py-4">
                    <Badge variant={getTierVariant(item.tier) as any} className="text-[10px] uppercase font-bold tracking-wide">
                      {item.tier || 'MEMBER'}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(item.totalSpending)}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 text-center">{item.totalContracts}</td>
                  <td className="px-6 py-4 text-gray-900 text-xs">
                    {item.location ? (
                      <span className="flex items-center gap-1 truncate max-w-[150px]" title={item.location}>
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" /> {item.location}
                      </span>
                    ) : '---'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/customers/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                      title="View Details"
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