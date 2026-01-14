'use client';
import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Calendar, Phone, Mail, MapPin, ExternalLink, User, Building } from 'lucide-react';
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
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            Reporter
                        </h3>
                        {data.reporter.id && (
                            <Link
                                href={`/profile/${data.reporter.id}`}
                                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                                View Profile
                            </Link>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xl text-red-600">
                            {data.reporter.fullName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <Link
                                href={`/profile/${data.reporter.id}`}
                                className="font-bold text-gray-900 hover:text-red-600 transition-colors"
                            >
                                {data.reporter.fullName}
                            </Link>
                            <div className="flex flex-wrap gap-1 mt-1">
                                <Badge variant="pink">{data.reporter.role?.replace(/_/g, ' ')}</Badge>
                                {data.reporter.userTier && (
                                    <Badge variant="default">{data.reporter.userTier}</Badge>
                                )}
                            </div>
                            <div className="mt-2 space-y-1 text-xs text-gray-500">
                                <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {data.reporter.phoneNumber || '---'}</p>
                                <p className="flex items-center gap-2 truncate"><Mail className="w-3 h-3" /> {data.reporter.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reported Target */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            {data.reportedProperty ? (
                                <><Building className="w-4 h-4 text-gray-400" /> Reported Property</>
                            ) : (
                                <><User className="w-4 h-4 text-gray-400" /> Reported User</>
                            )}
                        </h3>
                        {data.reportedProperty?.id && (
                            <Link
                                href={`/property/${data.reportedProperty.id}`}
                                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                                View Property
                            </Link>
                        )}
                        {data.reportedUser?.id && !data.reportedProperty && (
                            <Link
                                href={`/profile/${data.reportedUser.id}`}
                                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                                View Profile
                            </Link>
                        )}
                    </div>
                    {data.reportedProperty ? (
                        <Link href={`/property/${data.reportedProperty.id}`} className="block group">
                            <div className="flex gap-4">
                                <div className="w-24 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                                    {data.reportedProperty.thumbnailUrl ? (
                                        <img src={data.reportedProperty.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Building className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-red-600 transition-colors">{data.reportedProperty.title}</p>
                                    <div className="flex gap-1 my-1">
                                        <Badge variant={data.reportedProperty.transactionType === 'SALE' ? 'sale' : 'rental'}>
                                            {data.reportedProperty.transactionType}
                                        </Badge>
                                        <Badge variant="default">{data.reportedProperty.propertyTypeName}</Badge>
                                    </div>
                                    <p className="text-[10px] text-gray-500 flex items-center gap-1 line-clamp-1"><MapPin className="w-3 h-3" /> {data.reportedProperty.location}</p>
                                    <p className="text-xs font-semibold text-red-600 mt-1">
                                        ${data.reportedProperty.price?.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ) : data.reportedUser ? (
                        <Link href={`/profile/${data.reportedUser.id}`} className="block group">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xl text-gray-500">
                                    {data.reportedUser.fullName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">{data.reportedUser.fullName}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <Badge variant="default">{data.reportedUser.role?.replace(/_/g, ' ')}</Badge>
                                        {data.reportedUser.userTier && (
                                            <Badge variant="pink">{data.reportedUser.userTier}</Badge>
                                        )}
                                    </div>
                                    <div className="mt-2 space-y-1 text-xs text-gray-500">
                                        {data.reportedUser.phoneNumber && (
                                            <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {data.reportedUser.phoneNumber}</p>
                                        )}
                                        <p className="flex items-center gap-2 truncate"><Mail className="w-3 h-3" /> {data.reportedUser.email}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto mb-2 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">Target information not available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}