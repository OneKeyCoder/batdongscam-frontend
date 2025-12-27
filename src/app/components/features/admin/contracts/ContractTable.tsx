'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Loader2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { contractService, ContractListItem, ContractFilters } from '@/lib/api/services/contract.service';

interface Props {
  filters: ContractFilters;
  onFilterChange: React.Dispatch<React.SetStateAction<ContractFilters>>;
}

export default function ContractTable({ filters, onFilterChange }: Props) {
  const [data, setData] = useState<ContractListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('🔍 ContractTable - Fetching with filters:', JSON.stringify(filters, null, 2));
        
        const res = await contractService.getContracts(filters);
        
        console.log('✅ ContractTable - Response:', {
          dataLength: res.data.length,
          pagination: res.paging,
          firstItem: res.data[0]
        });
        
        setData(res.data);
        
        // Fix: Dùng đúng cấu trúc response
        if (res.paging) {
          setTotalItems(res.paging.total);
        }
      } catch (error) {
        console.error("❌ Error fetching contracts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const handlePageChange = (pageNumber: number) => {
    onFilterChange(prev => ({ ...prev, page: pageNumber }));
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';        
      case 'COMPLETED': return 'blue';       
      case 'CANCELLED': return 'failed';      
      case 'PENDING_SIGNING': return 'pending'; 
      case 'DRAFT': return 'gray';            
      default: return 'default';
    }
  };

  const getTypeVariant = (type: string) => {
    return type === 'PURCHASE' ? 'sale' : 'rental'; 
  };

  if (loading) return <div className="flex justify-center p-12 bg-white border rounded-xl"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900 w-[15%]">Contract No.</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[25%]">Property</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[10%]">Status</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[20%]">Duration</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[15%]">Total Amount</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[10%]">Parties</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[5%] text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-500">No contracts found matching your criteria.</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                  {/* Contract No & Type */}
                  <td className="px-6 py-4 align-top">
                    <p className="font-bold text-gray-900 text-sm">{item.contractNumber}</p>
                    <div className="mt-1.5">
                      <Badge variant={getTypeVariant(item.contractType) as any}>
                        {item.contractType}
                      </Badge>
                    </div>
                  </td>

                  {/* Property Info */}
                  <td className="px-6 py-4 align-top">
                    <p className="font-bold text-gray-900 text-sm line-clamp-2 mb-1" title={item.propertyTitle}>
                      {item.propertyTitle}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1" title={item.propertyAddress}>
                      {item.propertyAddress}
                    </p>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4 align-top">
                    <Badge variant={getStatusVariant(item.status) as any}>
                      {item.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>

                  {/* Time (Start / End) */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-bold w-8">Start:</span>
                        <span className="text-gray-700 font-medium">{formatDate(item.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 font-bold w-8">End:</span>
                        <span className="text-gray-700 font-medium">{formatDate(item.endDate)}</span>
                      </div>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4 align-top">
                    <p className="font-bold text-red-600 text-sm">
                      {formatCurrency(item.totalContractAmount)}
                    </p>
                  </td>

                  {/* Customer & Agent Info */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-3 text-xs">
                      {/* Customer */}
                      <div className="flex items-center gap-2" title="Customer">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                          {item.customerFirstName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 truncate max-w-[100px]">{item.customerLastName}</p>
                          <p className="text-[10px] text-gray-400">Customer</p>
                        </div>
                      </div>
                      {/* Agent */}
                      <div className="flex items-center gap-2" title="Agent">
                        <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold shrink-0">
                          {item.agentFirstName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 truncate max-w-[100px]">{item.agentLastName}</p>
                          <p className="text-[10px] text-gray-400">Agent</p>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 align-top text-right">
                    <Link
                      href={`/admin/contracts/${item.id}`}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg inline-flex items-center justify-center transition-colors border border-transparent hover:border-red-100"
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
        pageSize={filters.size || 10}
        onPageChange={handlePageChange}
      />
    </div>
  );
}