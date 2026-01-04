// path: app/components/features/admin/locations/WardSidebar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { User, Heart, Loader2, AlertCircle, MapPin } from 'lucide-react';
import { locationService, LocationCardResponse } from '@/lib/api/services/location.service';
import { favoriteService, LikeType } from '@/lib/api/services/favorite.service'; 

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2670&auto=format&fit=crop";

interface WardSidebarProps {
  parentId?: string; // Đây là districtId
}

export default function WardSidebar({ parentId }: WardSidebarProps) {
  const [wards, setWards] = useState<LocationCardResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Wards
  useEffect(() => {
    const fetchWards = async () => {
      if (!parentId) return;
      setLoading(true);
      try {
        const res = await locationService.getLocationCards({
          page: 1,
          limit: 20, 
          locationTypeEnum: 'WARD', 
          districtIds: [parentId],  
          sortBy: 'avgLandPrice',
          sortType: 'desc'
        });
        setWards(res.data);
      } catch (error) {
        console.error("Failed to fetch ward cards", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWards();
  }, [parentId]);

  const handleToggleFavorite = async (e: React.MouseEvent, item: LocationCardResponse) => {
    e.preventDefault(); 
    e.stopPropagation();

    const updatedList = wards.map(d =>
      d.id === item.id ? { ...d, isFavorite: !d.isFavorite } : d
    );
    setWards(updatedList);

    try {
      await favoriteService.toggleLike(item.id, LikeType.WARD);
    } catch (error) {
      console.error("Failed to toggle like", error);
      setWards(wards); 
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-lg">Wards & Communes</h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{wards.length} found</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-red-600 animate-spin" /></div>
      ) : wards.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
          <AlertCircle className="w-8 h-8 opacity-20" />
          <p>No wards found for this district.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[800px] overflow-y-auto pr-1 custom-scrollbar pb-10">
          {wards.map((item) => {
            const imageUrl = (item.imgUrl && item.imgUrl.trim() !== '') ? item.imgUrl : DEFAULT_IMAGE;

            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                {/* Image Area */}
                <div className="h-32 bg-gray-100 relative overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
                  <div className="absolute bottom-2 left-3 right-3 text-white">
                    <h4 className="font-bold text-sm line-clamp-1 shadow-sm">{item.name}</h4>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 flex-1 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-y-1 text-xs text-gray-600">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-gray-400 font-bold">Avg Price</span>
                      <span className="font-bold text-red-600">
                        {item.avgLandPrice ? `${(item.avgLandPrice / 1000000).toFixed(1)}M` : '-'}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] uppercase text-gray-400 font-bold">Area</span>
                      <span className="font-bold text-gray-900">
                        {item.totalArea ? item.totalArea.toLocaleString() : '-'} km²
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <User className="w-3 h-3" />
                    <span>{item.population ? item.population.toLocaleString() : 'N/A'} people</span>
                  </div>

                  <div className="flex justify-between items-center mt-2">

                    <button
                      onClick={(e) => handleToggleFavorite(e, item)}
                      className={`p-1.5 rounded-full transition-colors ${item.isFavorite
                          ? 'bg-red-50 text-red-500'
                          : 'text-gray-400 hover:bg-gray-100 hover:text-red-500'
                        }`}
                    >
                      <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}