'use client';

import React, { useEffect, useState } from 'react';
import { User, Heart, Loader2, AlertCircle } from 'lucide-react';
import { locationService, LocationCardResponse } from '@/lib/api/services/location.service';
import Link from 'next/link';

interface DistrictSidebarProps {
  parentId?: string; 
}

export default function DistrictSidebar({ parentId }: DistrictSidebarProps) {
  const [districts, setDistricts] = useState<LocationCardResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!parentId) return;
      setLoading(true);
      try {
        const res = await locationService.getLocationCards({
            page: 1,
            limit: 10, 
            locationTypeEnum: 'DISTRICT',
            cityIds: [parentId], 
            sortBy: 'avgLandPrice',
            sortType: 'desc'
        });
        setDistricts(res.data);
      } catch (error) {
        console.error("Failed to fetch district cards", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, [parentId]);

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900 text-lg">Districts</h3>
      
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-red-600 animate-spin" /></div>
      ) : districts.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-400 text-sm">
           <AlertCircle className="w-5 h-5 mx-auto mb-2 opacity-50"/>
           No districts found
        </div>
      ) : (
        <div className="space-y-4">
          {districts.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
               {/* Image */}
               <div className="h-32 bg-gray-200 relative overflow-hidden">
                  <img 
                    src={item.imgUrl || 'https://placehold.co/400x200?text=No+Image'} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
               </div>
               
               {/* Content */}
               <div className="p-3">
                  <h4 className="font-bold text-gray-900 text-sm mb-2">{item.name}</h4>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-xs mb-3">
                      <span className="font-bold text-red-600">
                        {item.avgLandPrice ? item.avgLandPrice.toLocaleString() : '-'} $/m²
                      </span>
                      <span className="font-bold text-red-600 text-right">
                        {item.totalArea ? item.totalArea.toLocaleString() : '-'} m²
                      </span>
                      
                      <div className="flex items-center gap-1 text-gray-500 col-span-2">
                         <User className="w-3 h-3" />
                         <span>{item.population ? item.population.toLocaleString() : '-'}</span>
                      </div>
                  </div>

                  <div className="flex justify-end">
                      <button className="text-gray-400 hover:text-red-500">
                          <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}