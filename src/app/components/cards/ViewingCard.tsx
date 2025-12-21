'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, User, Eye } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

export interface ViewingCardProps {
  id: number | string;
  propertyName: string;
  propertyImage: string;
  propertyAddress: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  agentName?: string;
  onViewDetails?: (id: number | string) => void;
}

const statusVariants: Record<ViewingCardProps['status'], 'warning' | 'info' | 'success' | 'danger'> = {
  Pending: 'warning',
  Confirmed: 'info',
  Completed: 'success',
  Cancelled: 'danger',
};

export default function ViewingCard({
  id,
  propertyName,
  propertyImage,
  propertyAddress,
  date,
  time,
  status,
  agentName,
  onViewDetails,
}: ViewingCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="flex">
        {/* Property Image */}
        <div className="w-32 h-32 shrink-0">
          <img
            src={propertyImage}
            alt={propertyName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
                {propertyName}
              </h3>
              <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                <MapPin className="w-3 h-3" />
                <span className="line-clamp-1">{propertyAddress}</span>
              </div>
            </div>
            <Badge variant={statusVariants[status]}>{status}</Badge>
          </div>

          {/* Schedule Info */}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-red-500" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-red-500" />
              <span>{time}</span>
            </div>
          </div>

          {/* Agent & Action */}
          <div className="flex items-center justify-between mt-3">
            {agentName && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <User className="w-3 h-3" />
                <span>Agent: {agentName}</span>
              </div>
            )}
            <button
              onClick={() => onViewDetails?.(id)}
              className="ml-auto flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
