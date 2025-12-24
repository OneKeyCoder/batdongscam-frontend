'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, MoreVertical, Trash2, CheckCircle, XCircle, UserPlus, Edit } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { PropertyCard } from '@/lib/api/types'; 
import { propertyService } from '@/lib/api/services/property.service';

interface PropertiesTableProps {
  data: PropertyCard[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function PropertiesTable({ 
  data, isLoading, totalItems, currentPage, itemsPerPage, onPageChange, onRefresh 
}: PropertiesTableProps) {
  
  const [actionOpenId, setActionOpenId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      try {
        await propertyService.deleteProperty(id);
        onRefresh();
      } catch (error) {
        console.error("Delete failed", error);
        alert("Failed to delete property");
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
        await propertyService.updatePropertyStatus(id, { status });
        onRefresh();
    } catch (error) {
        console.error("Update status failed", error);
    }
  };

  // Helper render Badge Status
  const getStatusVariant = (status: string) => {
      switch(status) {
          case 'APPROVED': return 'success';
          case 'PENDING': return 'warning';
          case 'REJECTED': return 'danger';
          case 'SOLD': return 'blue';
          case 'RENTED': return 'info'; 
          default: return 'default';
      }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900">Property</th>
              {/* <th className="px-6 py-4 font-bold text-gray-900">Type</th> // Tạm ẩn vì PropertyCard thiếu field này */}
              <th className="px-6 py-4 font-bold text-gray-900">Trans.</th>
              <th className="px-6 py-4 font-bold text-gray-900">Status</th>
              <th className="px-6 py-4 font-bold text-gray-900">Location</th>
              <th className="px-6 py-4 font-bold text-gray-900">Owner</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Loading...</td></tr>
            ) : data.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10">No properties found.</td></tr>
            ) : (
                data.map((item) => (
                <tr key={item.id} className="bg-white hover:bg-gray-50 transition-colors">
                    {/* Property Info */}
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                            <img 
                                src={item.thumbnailUrl || 'https://placehold.co/60x60/e2e8f0/e2e8f0?text=No+Img'} 
                                alt="" 
                                className="w-14 h-14 rounded-lg object-cover bg-gray-200 border border-gray-100" 
                            />
                            <div className="max-w-[200px]">
                                <p className="font-bold text-gray-900 mb-0.5 truncate" title={item.title}>
                                    {item.title}
                                </p>
                                <p className="text-xs mb-0.5">{item.totalArea} m²</p>
                                <p className="text-red-600 font-bold mb-0.5">
                                    {item.price.toLocaleString()} VND
                                </p>
                            </div>
                        </div>
                    </td>
                    
                    {/* Transaction Type */}
                    <td className="px-6 py-4">
                        <Badge variant={item.transactionType === 'SALE' ? 'danger' : 'info'}>
                            {item.transactionType || 'N/A'}
                        </Badge>
                    </td>
                    
                    {/* Status */}
                    <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                    </td>
                    
                    {/* Location */}
                    <td className="px-6 py-4 text-gray-900 font-medium text-xs max-w-[150px] truncate" title={item.location}>
                        {item.location}
                    </td>
                    
                    {/* Owner Info (Sửa lại theo fields rời) */}
                    <td className="px-6 py-4">
                        <p className="text-gray-900 font-bold text-xs">
                            {item.ownerFirstName} {item.ownerLastName}
                        </p>
                        {item.ownerTier && (
                            <Badge variant="gold" className="mt-1 scale-90 origin-left">
                                {item.ownerTier}
                            </Badge>
                        )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-right relative">
                        <div className="flex justify-end items-center gap-2">
                            <Link 
                                href={`/admin/properties/${item.id}`} 
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <Eye className="w-5 h-5" />
                            </Link>

                            <button 
                                onClick={() => setActionOpenId(actionOpenId === item.id ? null : item.id)}
                                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Dropdown Menu Logic (Giữ nguyên) */}
                        {actionOpenId === item.id && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setActionOpenId(null)}></div>
                                <div className="absolute right-8 top-12 z-20 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 animate-in fade-in zoom-in-95 duration-100">
                                    {item.status === 'PENDING' && (
                                        <>
                                            <button 
                                                onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                                                className="w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Approve
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" /> Reject
                                            </button>
                                        </>
                                    )}
                                    <button onClick={() => handleDelete(item.id)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </td>
                </tr>
                ))
            )}
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