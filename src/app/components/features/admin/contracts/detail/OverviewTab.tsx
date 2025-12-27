'use client';

import React from 'react';
import { FileText, Calendar, Star, MessageSquare, MapPin, AlertCircle } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import { ContractDetailResponse } from '@/lib/api/services/contract.service';

interface Props {
    data: ContractDetailResponse;
    isEditing?: boolean;
    editData?: any;
    onEditChange?: (data: any) => void;
}

export default function OverviewTab({ data, isEditing, editData, onEditChange }: Props) {

    const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---';
    const formatCurrency = (val?: number) => val ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) : '---';

    return (
        <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6">Contract information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-500 mb-1"><FileText className="w-4 h-4" /> Contract type</label>
                        <p className="font-bold text-gray-900">{data.contractType}</p>
                    </div>

                    {/* EDITABLE: STATUS */}
                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-500 mb-1"><AlertCircle className="w-4 h-4" /> Status</label>
                        {isEditing ? (
                            <select
                                className="border border-gray-300 rounded px-2 py-1.5 text-sm font-bold w-full bg-white focus:border-red-500 outline-none"
                                value={editData?.status}
                                onChange={(e) => onEditChange?.({ ...editData, status: e.target.value })}
                            >
                                <option value="DRAFT">DRAFT</option>
                                <option value="PENDING_SIGNING">PENDING SIGNING</option>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                        ) : (
                            <p className="font-bold text-gray-900">{data.status}</p>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Calendar className="w-4 h-4" /> Start date</label>
                        <p className="font-bold text-gray-900">{formatDate(data.startDate)}</p>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Calendar className="w-4 h-4" /> End date</label>
                        {isEditing ? (
                            <input
                                type="date"
                                className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:border-red-500 outline-none"
                                value={editData?.endDate || ''}
                                onChange={(e) => onEditChange?.({ ...editData, endDate: e.target.value })}
                            />
                        ) : (
                            <p className="font-bold text-gray-900">{formatDate(data.endDate)}</p>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm text-gray-500 mb-2"><FileText className="w-4 h-4" /> Special terms</label>
                    {isEditing ? (
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-red-500 outline-none bg-white"
                            rows={4}
                            value={editData?.specialTerms || ''}
                            onChange={(e) => onEditChange?.({ ...editData, specialTerms: e.target.value })}
                        />
                    ) : (
                        <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 min-h-[60px] whitespace-pre-line">
                            {data.specialTerms || 'No special terms.'}
                        </div>
                    )}
                </div>

                {/* Read-only sections */}
                {data.rating && (
                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Star className="w-4 h-4" /> Rating</label>
                        <div className="flex items-center gap-1 font-bold text-gray-900">{data.rating} <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /></div>
                    </div>
                )}
                {data.comment && (
                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-500 mb-2"><MessageSquare className="w-4 h-4" /> Customer comment</label>
                        <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 min-h-[60px]">{data.comment}</div>
                    </div>
                )}
            </div>

            {/* Property Section (Read-only) */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Property</h3>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden">
                        <MapPin className="w-8 h-8" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">{data.propertyTitle}</h4>
                            <div className="flex gap-2 mt-1 mb-2">
                                <Badge variant="sale">{data.propertyTransactionType}</Badge>
                                <Badge variant="default">{data.propertyType}</Badge>
                            </div>
                            <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.propertyAddress}</p>
                        </div>
                        <div className="flex gap-8 mt-2">
                            <div><span className="text-xs text-gray-500 block">Price</span><span className="font-bold text-red-600">{formatCurrency(data.propertyPrice)}</span></div>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <button onClick={() => window.open(`/admin/properties/${data.propertyId}`, '_blank')} className="w-full bg-red-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-red-700 transition-colors">View property</button>
                </div>
            </div>
        </div>
    );
}