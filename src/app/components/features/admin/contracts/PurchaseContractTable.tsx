'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Loader2, Package } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { contractService, PurchaseContractListItem, PurchaseContractFilters } from '@/lib/api/services/contract.service';

interface Props {
    filters: PurchaseContractFilters;
    onFilterChange: React.Dispatch<React.SetStateAction<PurchaseContractFilters>>;
}

export default function PurchaseContractTable({ filters, onFilterChange }: Props) {
    const [data, setData] = useState<PurchaseContractListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await contractService.getPurchaseContracts(filters);
                setData(res.data);
                if (res.paging) {
                    setTotalItems(res.paging.total);
                }
            } catch (error) {
                console.error("❌ Error fetching purchase contracts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filters]);

    const handlePageChange = (pageNumber: number) => {
        onFilterChange(prev => ({ ...prev, page: pageNumber }));
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

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
            case 'VOIDED': return 'gray';
            case 'WAITING_OFFICIAL': return 'warning';
            case 'PENDING_PAYMENT': return 'pending';
            case 'DRAFT': return 'gray';
            default: return 'default';
        }
    };

    const formatStatusLabel = (status: string) => {
        return status.replace(/_/g, ' ');
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12 bg-white border rounded-xl">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-900 w-[15%]">Contract No.</th>
                            <th className="px-6 py-4 font-bold text-gray-900 w-[25%]">Property</th>
                            <th className="px-6 py-4 font-bold text-gray-900 w-[12%] text-center">Status</th>
                            <th className="px-6 py-4 font-bold text-gray-900 w-[15%]">Start Date</th>
                            <th className="px-6 py-4 font-bold text-gray-900 w-[18%]">Amounts</th>
                            <th className="px-6 py-4 font-bold text-gray-900 w-[10%]">Customer</th>
                            <th className="px-6 py-4 font-bold text-gray-900 w-[5%] text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-gray-500">
                                    No purchase contracts found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                    {/* Contract No & Type */}
                                    <td className="px-6 py-4 align-top">
                                        <p className="font-bold text-gray-900 text-sm">{item.contractNumber}</p>
                                        <div className="mt-1.5 flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-green-600">PURCHASE</span>
                                            {item.hasDepositContract && (
                                                <div className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold">
                                                    <Package className="w-3 h-3" />
                                                    <span>Has Deposit</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Property Info */}
                                    <td className="px-6 py-4 align-top">
                                        <p className="font-bold text-gray-900 text-sm line-clamp-2 mb-1" title={item.propertyTitle}>
                                            {item.propertyTitle}
                                        </p>
                                    </td>

                                    {/* Status Badge */}
                                    <td className="px-6 py-4 align-top text-center">
                                        <Badge
                                            variant={getStatusVariant(item.status) as any}
                                            className="whitespace-nowrap text-[10px] w-[110px] justify-center py-1"
                                        >
                                            {formatStatusLabel(item.status)}
                                        </Badge>
                                    </td>

                                    {/* Start Date */}
                                    <td className="px-6 py-4 align-top">
                                        <span className="text-gray-700 font-medium text-sm">{formatDate(item.startDate)}</span>
                                    </td>

                                    {/* Amounts */}
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex flex-col gap-1 text-xs">
                                            <div>
                                                <span className="text-gray-500 text-[10px]">Property Value:</span>
                                                <p className="font-bold text-green-600">{formatCurrency(item.propertyValue)}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 text-[10px]">Advance:</span>
                                                <p className="font-bold text-gray-900">{formatCurrency(item.advancePaymentAmount)}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 text-[10px]">Commission:</span>
                                                <p className="font-bold text-blue-600">{formatCurrency(item.commissionAmount)}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Customer Info */}
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex items-center gap-2" title="Customer">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold shrink-0 text-xs">
                                                {item.customerName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 truncate max-w-[100px] text-xs">
                                                    {item.customerName}
                                                </p>
                                                <p className="text-[10px] text-gray-400">Buyer</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Action */}
                                    <td className="px-6 py-4 align-top text-right">
                                        <Link
                                            href={`/admin/contracts/purchase/${item.id}`}
                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg inline-flex items-center justify-center transition-colors border border-transparent hover:border-green-100"
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