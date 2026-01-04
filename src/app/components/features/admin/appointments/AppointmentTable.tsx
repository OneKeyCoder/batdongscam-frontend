'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Loader2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { appointmentService, ViewingListItem, ViewingListFilters } from '@/lib/api/services/appointment.service';

interface AppointmentTableProps {
  filters: ViewingListFilters;
  onFilterChange: React.Dispatch<React.SetStateAction<ViewingListFilters>>;
}

export default function AppointmentTable({ filters, onFilterChange }: AppointmentTableProps) {
  const [data, setData] = useState<ViewingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await appointmentService.getViewingList(filters);
        setData(res.data);
        if (res.paging) {
          setTotalItems(res.paging.total);
        } else if ((res as any).meta) {
          setTotalItems((res as any).meta.total);
        }
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handlePageChange = (pageNumber: number) => {
    onFilterChange(prev => ({ ...prev, page: pageNumber }));
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '---';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      hour: 'numeric', minute: 'numeric',
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'pending';   
      case 'CONFIRMED': return 'blue';    
      case 'COMPLETED': return 'success'; 
      case 'CANCELLED': return 'red';     
      default: return 'gray';
    }
  };

  const getTierVariant = (tier?: string) => {
    switch (tier?.toUpperCase()) {
      case 'PLATINUM': return 'pink';
      case 'GOLD': return 'gold';
      case 'SILVER': return 'default';
      case 'BRONZE': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900">Property</th>
              <th className="px-6 py-4 font-bold text-gray-900">Time</th>
              <th className="px-6 py-4 font-bold text-gray-900">Status</th>
              <th className="px-6 py-4 font-bold text-gray-900">Location</th>
              <th className="px-6 py-4 font-bold text-gray-900">Customer</th>
              <th className="px-6 py-4 font-bold text-gray-900">SalesAgent</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8">No appointments found.</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0 overflow-hidden border border-gray-100">
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-xs font-bold text-gray-400">N/A</div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-xs line-clamp-1 max-w-[150px]" title={item.propertyName}>{item.propertyName}</p>
                        <p className="text-[10px] text-red-600 font-bold mt-0.5">{formatCurrency(item.price)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium text-xs w-[160px]">
                    {formatDate(item.requestedDate)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusVariant(item.status) as any}>{item.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium text-xs max-w-[150px] truncate" title={[item.districtName, item.cityName].filter(Boolean).join(', ')}>
                    {[item.districtName, item.cityName].filter(Boolean).join(', ') || '---'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <p className="font-bold text-gray-900 text-xs">{item.customerName || 'Unknown'}</p>
                      {/* Áp dụng getTierVariant cho Customer */}
                      <Badge variant={getTierVariant(item.customerTier) as any} className="text-[9px] px-1.5 py-0">
                        {item.customerTier || 'MEMBER'}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.salesAgentName ? (
                      <div className="flex flex-col items-start gap-1">
                        <p className="font-bold text-gray-900 text-xs">{item.salesAgentName}</p>
                        {/* Áp dụng getTierVariant cho Sales Agent */}
                        <Badge variant={getTierVariant(item.salesAgentTier) as any} className="text-[9px] px-1.5 py-0">
                          {item.salesAgentTier || 'AGENT'}
                        </Badge>
                      </div>
                    ) : <span className="text-gray-400 italic text-xs">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/appointments/${item.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg inline-flex items-center justify-center transition-colors"
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
      <Pagination
        currentPage={filters.page || 1}
        totalItems={totalItems}
        pageSize={filters.limit || 10}
        onPageChange={handlePageChange}
      />
    </div>
  );
}