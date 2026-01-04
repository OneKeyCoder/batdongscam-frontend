'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, MapPin, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { LocationCardResponse, locationService } from '@/lib/api/services/location.service';

interface LocationsTableProps {
  data: LocationCardResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void; 
}

export default function LocationsTable({
  data, isLoading, totalItems, currentPage, itemsPerPage, onPageChange, onRefresh
}: LocationsTableProps) {

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleDelete = async (id: string, type: 'CITY' | 'DISTRICT' | 'WARD') => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    setProcessingId(id);
    try {
      await locationService.deleteLocation(id, type);
      onRefresh(); 
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Failed to delete location");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (location: LocationCardResponse) => {
    setProcessingId(location.id);
    try {
      await locationService.updateLocation({
        id: location.id,
        locationTypeEnum: location.locationTypeEnum,
        isActive: !location.isActive 
      });
      onRefresh(); 
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const renderImage = (url?: string, name?: string) => {
    if (url && url.trim() !== '') {
      return <img src={url} alt={name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200" />;
    }
    return (
      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center border border-red-100">
        <MapPin className="w-5 h-5 text-red-400" />
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900 w-[30%]">Name</th>
              <th className="px-6 py-4 font-bold text-gray-900">Area (km²)</th>
              <th className="px-6 py-4 font-bold text-gray-900">Population</th>
              <th className="px-6 py-4 font-bold text-gray-900">Status</th>
              <th className="px-6 py-4 font-bold text-gray-900">Avg land price</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-20 text-gray-400">Loading data...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-20 text-gray-400">No locations found.</td></tr>
            ) : (
              data.map((loc) => (
                <tr key={loc.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {renderImage(loc.imgUrl, loc.name)}
                      <span className="font-bold text-gray-900 line-clamp-1" title={loc.name}>{loc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{loc.totalArea ? loc.totalArea.toLocaleString() : '---'}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{loc.population ? loc.population.toLocaleString() : '---'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(loc)}
                      disabled={processingId === loc.id}
                      className="focus:outline-none"
                      title="Click to toggle status"
                    >
                      {processingId === loc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      ) : (
                        <Badge variant={loc.isActive ? 'success' : 'danger'} className="uppercase text-[10px] cursor-pointer hover:opacity-80">
                          {loc.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {loc.avgLandPrice ? `${loc.avgLandPrice.toLocaleString()} VNĐ/m²` : '---'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* View Detail */}
                      <Link
                        href={`/admin/locations/${loc.id}?type=${loc.locationTypeEnum}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Toggle Active Button (Quick Action) */}
                      <button
                        onClick={() => handleToggleStatus(loc)}
                        disabled={processingId === loc.id}
                        className={`p-2 rounded-lg transition-colors ${loc.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                        title={loc.isActive ? "Deactivate" : "Activate"}
                      >
                        {loc.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(loc.id, loc.locationTypeEnum)}
                        disabled={processingId === loc.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        {processingId === loc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={itemsPerPage}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}