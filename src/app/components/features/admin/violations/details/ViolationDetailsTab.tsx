'use client';
import React from 'react';
import { AlertTriangle, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import { ViolationAdminDetails } from '@/lib/api/services/violation.service';

interface Props {
    data: ViolationAdminDetails;
}

export default function ViolationDetailsTab({ data }: Props) {
    const formatDate = (str: string) => new Date(str).toLocaleString();

    return (
        <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Violation information</h3>
                <div className="grid grid-cols-2 gap-8 mb-6">
                    <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Violation type</p>
                        <p className="font-bold text-gray-900">{data.violationType.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Reported at</p>
                        <p className="font-bold text-gray-900">{formatDate(data.reportedAt)}</p>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2 font-bold">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{data.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reporter Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-bold text-gray-900 mb-4 text-sm">Reporter</h3>
                    <div className="flex gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xl text-gray-500">
                            {/* Vì ViolationUser thiếu avatarUrl nên dùng Initials */}
                            {data.reporter.fullName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{data.reporter.fullName}</p>
                            <Badge variant="pink" className="mt-1">{data.reporter.role}</Badge>
                            <div className="mt-2 space-y-1 text-xs text-gray-500">
                                <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {data.reporter.phoneNumber || '---'}</p>
                                <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {data.reporter.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reported Target */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-bold text-gray-900 mb-4 text-sm">Reported Target</h3>
                    {data.reportedProperty ? (
                        <div className="flex gap-4 mb-4">
                            <div className="w-24 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                                {data.reportedProperty.thumbnailUrl ? <img src={data.reportedProperty.thumbnailUrl} className="w-full h-full object-cover" /> : null}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm line-clamp-1">{data.reportedProperty.title}</p>
                                <div className="flex gap-1 my-1">
                                    <Badge variant="sale">{data.reportedProperty.transactionType}</Badge>
                                    <Badge variant="default">{data.reportedProperty.propertyTypeName}</Badge>
                                </div>
                                <p className="text-[10px] text-gray-500 flex items-center gap-1 line-clamp-1"><MapPin className="w-3 h-3" /> {data.reportedProperty.location}</p>
                            </div>
                        </div>
                    ) : data.reportedUser ? (
                        <div className="flex gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xl text-gray-500">
                                {data.reportedUser.fullName.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{data.reportedUser.fullName}</p>
                                <Badge variant="default" className="mt-1">{data.reportedUser.role}</Badge>
                                <p className="text-xs text-gray-500 mt-1">{data.reportedUser.email}</p>
                            </div>
                        </div>
                    ) : <p className="text-sm text-gray-500">Target information not available</p>}
                </div>
            </div>
        </div>
    );
}