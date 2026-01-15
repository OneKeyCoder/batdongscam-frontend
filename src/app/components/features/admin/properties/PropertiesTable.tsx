'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, MoreVertical, Trash2, CheckCircle, XCircle, AlertTriangle, AlertCircle } from 'lucide-react'; // Đã thêm icon
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { PropertyCard } from '@/lib/api/types';
import { propertyService } from '@/lib/api/services/property.service';
import { getFullUrl } from '@/lib/utils/urlUtils';

interface PropertiesTableProps {
    data: PropertyCard[];
    isLoading: boolean;
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onRefresh: () => void;
}

interface EnrichedProperty extends PropertyCard {
    realTransactionType?: string;
    realPropertyTypeName?: string;
}

export default function PropertiesTable({
    data, isLoading, totalItems, currentPage, itemsPerPage, onPageChange, onRefresh
}: PropertiesTableProps) {

    const [actionOpenId, setActionOpenId] = useState<string | null>(null);
    const [enrichedData, setEnrichedData] = useState<EnrichedProperty[]>([]);
    const [isHydrating, setIsHydrating] = useState(false);

    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showNotify = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
    };

    useEffect(() => {
        const enrichData = async () => {
            if (!data || data.length === 0) {
                setEnrichedData([]);
                return;
            }

            setIsHydrating(true);

            const promises = data.map(async (item) => {
                try {
                    const detail = await propertyService.getPropertyDetails(item.id);
                    return {
                        ...item,
                        realTransactionType: detail.transactionType,
                        realPropertyTypeName: detail.propertyTypeName
                    };
                } catch (error) {
                    console.error(`Failed to fetch detail for ${item.id}`, error);
                    return item;
                }
            });

            const results = await Promise.all(promises);
            setEnrichedData(results);
            setIsHydrating(false);
        };

        enrichData();
    }, [data]);

    const handleDelete = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa bất động sản này?')) {
            try {
                await propertyService.deleteProperty(id);
                showNotify('success', 'Xóa bất động sản thành công!'); 
                onRefresh();
            } catch (error) {
                console.error("Xóa thất bại", error);
                showNotify('error', 'Xóa thất bại. Vui lòng thử lại.'); 
            }
        }
    };

    const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await propertyService.updatePropertyStatus(id, { status });
            const actionText = status === 'APPROVED' ? 'Duyệt' : 'Từ chối';
            showNotify('success', `Đã ${actionText} bất động sản thành công!`);

            onRefresh();
        } catch (error) {
            console.error("Cập nhật trạng thái thất bại", error);
            showNotify('error', 'Cập nhật trạng thái thất bại.');
        } finally {
            setActionOpenId(null); 
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'PENDING': return 'warning';
            case 'REJECTED': return 'danger';
            case 'SOLD': return 'blue';
            case 'RENTED': return 'info';
            default: return 'default';
        }
    };

    const getTransactionVariant = (type?: string) => {
        if (!type) return 'default';
        if (type === 'SALE') return 'sale';
        if (type === 'RENTAL') return 'rental';
        return 'gray';
    };

    const getPropertyTypeVariant = (typeName?: string) => {
        if (!typeName) return 'default';
        const name = typeName.toLowerCase();

        if (name.includes('villa')) return 'purple';
        if (name.includes('apartment')) return 'blue';
        if (name.includes('house')) return 'success';
        if (name.includes('land')) return 'warning';
        if (name.includes('office')) return 'gray';
        if (name.includes('studio')) return 'pink';

        return 'info';
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px] relative">
            {notification && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-10 duration-300 ${notification.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <div>
                        <p className="text-sm font-bold">{notification.type === 'success' ? 'Thành công' : 'Lỗi'}</p>
                        <p className="text-xs opacity-90">{notification.message}</p>
                    </div>
                    <button onClick={() => setNotification(null)} className="ml-2 hover:bg-black/5 p-1 rounded-full"><XCircle className="w-4 h-4" /></button>
                </div>
            )}

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-900 w-[30%]">Property</th>
                            <th className="px-6 py-4 font-bold text-gray-900 w-[10%]">Type</th>
                            <th className="px-6 py-4 font-bold text-gray-900 w-[10%]">Trans.</th>
                            <th className="px-6 py-4 font-bold text-gray-900 w-[10%]">Status</th>
                            <th className="px-6 py-4 font-bold text-gray-900 w-[15%]">Location</th>
                            <th className="px-6 py-4 font-bold text-gray-900 w-[15%]">Owner</th>
                            <th className="px-6 py-4 font-bold text-gray-900 w-[5%] text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={7} className="text-center py-10"><div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div></div></td></tr>
                        ) : enrichedData.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-10 text-gray-400">Không tìm thấy bất động sản nào.</td></tr>
                        ) : (
                            enrichedData.map((item) => (
                                <tr key={item.id} className="bg-white hover:bg-gray-50 transition-colors">
                                    {/* Property Info */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                                                <img
                                                    src={getFullUrl(item.thumbnailUrl || '')}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/e2e8f0/94a3b8?text=No+Image' }}
                                                />
                                            </div>
                                            <div className="max-w-[220px]">
                                                <p className="font-bold text-gray-900 mb-1 line-clamp-2 leading-tight" title={item.title}>
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mb-1">{item.totalArea} m²</p>
                                                <p className="text-red-600 font-bold text-sm">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        {isHydrating ? (
                                            <span className="animate-pulse bg-gray-200 h-5 w-16 block rounded"></span>
                                        ) : (
                                            <Badge
                                                variant={getPropertyTypeVariant(item.realPropertyTypeName) as any}
                                                className="whitespace-nowrap"
                                            >
                                                {item.realPropertyTypeName || 'N/A'}
                                            </Badge>
                                        )}
                                    </td>

                                    {/* Transaction Type */}
                                    <td className="px-6 py-4">
                                        {isHydrating ? (
                                            <span className="animate-pulse bg-gray-200 h-5 w-16 block rounded"></span>
                                        ) : (
                                            <Badge variant={getTransactionVariant(item.realTransactionType) as any}>
                                                {item.realTransactionType || 'N/A'}
                                            </Badge>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <Badge variant={getStatusVariant(item.status) as any}>{item.status}</Badge>
                                    </td>

                                    {/* Location */}
                                    <td className="px-6 py-4 text-gray-600 text-xs font-medium max-w-[150px] truncate" title={item.location}>
                                        {item.location}
                                    </td>

                                    {/* Owner Info */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 font-bold text-xs truncate max-w-[120px]" title={`${item.ownerFirstName} ${item.ownerLastName}`}>
                                                {item.ownerFirstName} {item.ownerLastName}
                                            </span>
                                            {item.ownerTier && (
                                                <Badge variant="gold" className="mt-1 w-fit text-[9px] px-1.5 py-0">
                                                    {item.ownerTier}
                                                </Badge>
                                            )}
                                        </div>
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="px-6 py-4 text-right relative">
                                        <div className="flex justify-end items-center gap-1">
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

                                        {/* Dropdown Menu */}
                                        {actionOpenId === item.id && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setActionOpenId(null)}></div>
                                                <div className="absolute right-12 top-10 z-20 w-40 bg-white rounded-lg shadow-xl border border-gray-100 py-1 animate-in fade-in zoom-in-95 duration-100">
                                                    {item.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                                                                className="w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 font-medium"
                                                            >
                                                                <CheckCircle className="w-4 h-4" /> Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                                                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                                            >
                                                                <XCircle className="w-4 h-4" /> Reject
                                                            </button>
                                                            <div className="h-px bg-gray-100 my-1"></div>
                                                        </>
                                                    )}
                                                    <button onClick={() => handleDelete(item.id)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 flex items-center gap-2">
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