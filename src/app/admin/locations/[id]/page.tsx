'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart, Home, Map, Loader2, Calendar } from 'lucide-react';
import DetailLayout from '@/app/components/DetailLayout';
import DistrictSidebar from '@/app/components/features/admin/locations/DistrictSidebar';
import { locationService, LocationDetailsResponse } from '@/lib/api/services/location.service';

export default function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [location, setLocation] = useState<LocationDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await locationService.getLocationDetails(id, 'CITY');
        setLocation(data);
      } catch (error) {
        console.error("Failed to fetch location details", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;
  if (!location) return <div className="text-center py-10">Location not found</div>;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-4">
         <h2 className="text-2xl font-bold text-gray-900">Locations Management</h2>
         <p className="text-sm text-gray-500">Manage all your Locations</p>
      </div>

      <DetailLayout
        sidebar={<DistrictSidebar parentId={location.id} />}
      >
        <div className="space-y-6">
            
            {/* 1. Gallery Slider */}
            <div className="relative h-[400px] bg-gray-100 rounded-xl overflow-hidden group">
                <img 
                    src={location.imgUrl || 'https://placehold.co/800x400?text=No+Image'} 
                    alt={location.name} 
                    className="w-full h-full object-cover"
                />
                
                {/* Navigation Controls */}
                <button className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft className="w-5 h-5 text-gray-700"/>
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-gray-700"/>
                </button>
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    1/1
                </div>
            </div>

            {/* Breadcrumb Mock */}
            <div className="text-xs text-gray-500">
                Vietnam / {location.name} / Overview
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900">{location.name}</h1>

            <hr className="border-gray-200" />

            {/* 2. Key Stats Row (Giống thiết kế) */}
            <div className="flex items-start justify-between">
                <div className="flex gap-12">
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Average land price</p>
                        <p className="text-lg font-bold text-red-600">
                            {location.avgLandPrice ? location.avgLandPrice.toLocaleString() : 'N/A'} $/m²
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Total Area</p>
                        <p className="text-lg font-bold text-red-600">
                            {location.totalArea ? location.totalArea.toLocaleString() : 'N/A'} m²
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Population</p>
                        <p className="text-lg font-bold text-red-600">
                            {location.population ? location.population.toLocaleString() : 'N/A'}
                        </p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-red-500">
                    <Heart className={`w-6 h-6 ${location.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
            </div>

            {/* 3. Description */}
            <div>
                <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                <div className="text-sm text-gray-600 leading-relaxed space-y-4 text-justify">
                    {location.description ? (
                        location.description.split('\n').map((para, i) => (
                            <p key={i}>{para}</p>
                        ))
                    ) : (
                        <p className="italic text-gray-400">No description available.</p>
                    )}
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* 4. Sub Stats (Icons) */}
            <div className="space-y-4">
                {/* Districts Count */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Home className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-gray-600 font-medium">Districts</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 pl-6">{location.districtCount || 0}</p>
                </div>

                {/* Active Properties */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Home className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-gray-600 font-medium">Active Properties</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 pl-6">{location.activeProperties || 511}</p>
                </div>

                {/* Wards Count */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Home className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-gray-600 font-medium">Wards</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 pl-6">{location.wardCount || 0}</p>
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* 5. Footer Dates */}
            <div className="flex gap-12 text-xs text-gray-500">
                <div>
                    <p className="mb-1">Created day</p>
                    <p className="font-bold text-gray-900">
                        {new Date(location.createdAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                </div>
                <div>
                    <p className="mb-1">Last updated day</p>
                    <p className="font-bold text-gray-900">
                        {new Date(location.updatedAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                </div>
            </div>

        </div>
      </DetailLayout>
    </div>
  );
}