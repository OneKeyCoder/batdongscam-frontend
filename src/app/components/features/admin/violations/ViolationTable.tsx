'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Loader2, Home, User, AlertCircle } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { violationService, ViolationAdminItem, AdminViolationFilters } from '@/lib/api/services/violation.service';

interface Props {
  filters: AdminViolationFilters;
  onFilterChange: React.Dispatch<React.SetStateAction<AdminViolationFilters>>;
}

const VIOLATION_DISPLAY_MAP: Record<string, string> = {
  FRAUDULENT_LISTING: 'Fraudulent',
  MISREPRESENTATION_OF_PROPERTY: 'Misrepresentation',
  SPAM_OR_DUPLICATE_LISTING: 'Spam / Duplicate',
  INAPPROPRIATE_CONTENT: 'Inappropriate Content',
  NON_COMPLIANCE_WITH_TERMS: 'Policy Violation',
  FAILURE_TO_DISCLOSE_INFORMATION: 'Hidden Info',
  HARASSMENT: 'Harassment',
  SCAM_ATTEMPT: 'Scam Attempt'
};

export default function ViolationTable({ filters, onFilterChange }: Props) {
  const [data, setData] = useState<ViolationAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await violationService.getAdminViolations(filters);
        setData(res.data);
        if (res.paging) setTotalItems(res.paging.total);
        else if ((res as any).meta) setTotalItems((res as any).meta.total);
      } catch (error) {
        console.error("Error fetching violations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const handlePageChange = (pageNumber: number) => {
    onFilterChange(prev => ({ ...prev, page: pageNumber }));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
    });
  };

  const getShortType = (type: string) => {
    return VIOLATION_DISPLAY_MAP[type] || type.replace(/_/g, ' '); 
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';    
      case 'REPORTED': return 'reported';    
      case 'UNDER_REVIEW': return 'processing';
      case 'RESOLVED': return 'success';    
      case 'DISMISSED': return 'default';    
      default: return 'default';
    }
  };

  const getTypeVariant = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('SCAM') || t.includes('FRAUD')) return 'scam'; 
    if (t.includes('SPAM') || t.includes('HARASSMENT')) return 'spam'; 
    return 'default'; 
  };

  const renderAvatar = (url: string | undefined, name: string, isTarget = false) => {
    if (url) {
      return <img src={url} className="w-full h-full object-cover" alt="" />;
    }
    return (
      <div className={`w-full h-full flex items-center justify-center ${isTarget ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
        {isTarget ? <AlertCircle className="w-5 h-5" /> : <span className="font-bold text-sm">{name?.charAt(0).toUpperCase()}</span>}
      </div>
    );
  };

  if (loading) return <div className="flex justify-center p-12 bg-white border rounded-xl"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900 w-[20%]">Reporter</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[20%]">Reported Target</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[15%]">Violation Type</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[10%]">Status</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[20%]">Description</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[10%] text-right">Date</th>
              <th className="px-6 py-4 font-bold text-gray-900 w-[5%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-500">No reports found matching your criteria.</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                  {/* Reporter Column */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200 shadow-sm">
                        {renderAvatar(item.reporterAvatarUrl, item.reporterName)}
                      </div>
                      <div className="mt-0.5">
                        <p className="font-bold text-gray-900 text-sm line-clamp-1">{item.reporterName}</p>
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Reporter</p>
                      </div>
                    </div>
                  </td>

                  {/* Reported Target Column */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-200 shadow-sm">
                        {renderAvatar(item.reportedAvatarUrl, item.reportedName, true)}
                      </div>
                      <div className="mt-0.5">
                        <p className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight" title={item.reportedName}>
                          {item.reportedName}
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">Target</p>
                      </div>
                    </div>
                  </td>

                  {/* Violation Type Badge */}
                  <td className="px-6 py-4 align-top">
                    <Badge variant={getTypeVariant(item.violationType) as any} className="whitespace-nowrap shadow-sm">
                      {getShortType(item.violationType)}
                    </Badge>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4 align-top">
                    <Badge variant={getStatusVariant(item.status) as any} className="whitespace-nowrap">
                      {item.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4 align-top">
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-2" title={item.description}>
                      {item.description}
                    </p>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 align-top text-right whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">{formatDate(item.reportedAt).split(',')[0]}</p>
                    <p className="text-xs text-gray-400">{formatDate(item.reportedAt).split(',')[1]}</p>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 align-top text-right">
                    <Link
                      href={`/admin/violations/${item.id}`}
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
        pageSize={filters.limit || 10}
        onPageChange={handlePageChange}
      />
    </div>
  );
}