'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, RotateCcw, Check, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import { locationService, LocationCardResponse } from '@/lib/api/services/location.service';
import { removeVietnameseTones } from '@/lib/utils/stringUtils';

export interface LocationSelection {
  id: string;
  name: string;
  type: 'CITY' | 'DISTRICT' | 'WARD';
}

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelected?: LocationSelection[];
  onConfirm: (locations: LocationSelection[]) => void;
}

interface BreadcrumbItem {
  id: string | null;
  name: string;
  type: 'CITY' | 'DISTRICT' | 'WARD';
}

const DEFAULT_SELECTED: LocationSelection[] = [];

export default function LocationPicker({
  isOpen,
  onClose,
  onConfirm,
  initialSelected = DEFAULT_SELECTED 
}: LocationPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedItems, setSelectedItems] = useState<LocationSelection[]>(initialSelected);

  const [topCities, setTopCities] = useState<LocationCardResponse[]>([]);
  const [currentItems, setCurrentItems] = useState<LocationSelection[]>([]);
  const [loading, setLoading] = useState(false);

  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: null, name: 'All Cities', type: 'CITY' }
  ]);

  useEffect(() => {
    if (isOpen) {
      // Reset/Sync state khi mở modal
      setSelectedItems(initialSelected);

      if (topCities.length === 0) fetchTopCities();

      fetchRootCities();
      setBreadcrumbs([{ id: null, name: 'All Cities', type: 'CITY' }]);
      setSearchTerm('');
    }
  }, [isOpen]);

  const fetchTopCities = async () => {
    try {
      const res = await locationService.getTopCities(1, 10);
      setTopCities(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchLocations = async (type: 'CITY' | 'DISTRICT' | 'WARD', parentId?: string) => {
    setLoading(true);
    try {
      const mapData = await locationService.getChildLocations(type, parentId);

      let entries = [];
      if (mapData instanceof Map) {
        entries = Array.from(mapData.entries());
      } else {
        entries = Object.entries(mapData);
      }

      const items: LocationSelection[] = entries.map(([id, name]) => ({
        id,
        name: String(name),
        type
      }));

      items.sort((a, b) => a.name.localeCompare(b.name));
      setCurrentItems(items);

    } catch (error) {
      console.error("Fetch locations failed:", error);
      setCurrentItems([]);
    }
    finally { setLoading(false); }
  };

  const fetchRootCities = () => fetchLocations('CITY');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) setScrollPercentage((scrollLeft / maxScroll) * 100);
    }
  };
  const handleBarMouseDown = () => { setIsDragging(true); };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !scrollBarRef.current || !scrollContainerRef.current) return;
      const trackRect = scrollBarRef.current.parentElement?.getBoundingClientRect();
      if (!trackRect) return;
      const x = e.clientX - trackRect.left;
      const trackWidth = trackRect.width;
      let percentage = x / trackWidth;
      if (percentage < 0) percentage = 0;
      if (percentage > 1) percentage = 1;
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      scrollContainerRef.current.scrollLeft = percentage * (scrollWidth - clientWidth);
    };
    const handleMouseUp = () => { setIsDragging(false); };
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleToggleItem = (item: LocationSelection) => {
    const exists = selectedItems.find(i => i.id === item.id);
    if (exists) {
      setSelectedItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems(prev => prev.filter(i => i.id !== id));
  };

  const handleDrillDown = (item: LocationSelection) => {
    let nextType: 'DISTRICT' | 'WARD' | null = null;
    if (item.type === 'CITY') nextType = 'DISTRICT';
    else if (item.type === 'DISTRICT') nextType = 'WARD';

    if (nextType) {
      setBreadcrumbs(prev => [...prev, { id: item.id, name: item.name, type: nextType! }]);
      fetchLocations(nextType, item.id);
      setSearchTerm('');
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const targetCrumb = breadcrumbs[index];
    setBreadcrumbs(prev => prev.slice(0, index + 1));
    setSearchTerm('');
    if (targetCrumb.id === null) fetchRootCities();
    else fetchLocations(targetCrumb.type, targetCrumb.id || undefined);
  };
  const handleBack = () => { if (breadcrumbs.length > 1) handleBreadcrumbClick(breadcrumbs.length - 2); };

  const filteredItems = useMemo(() => {
    if (!searchTerm) return currentItems;
    const normalizedSearch = removeVietnameseTones(searchTerm);
    return currentItems.filter(item => removeVietnameseTones(item.name).includes(normalizedSearch));
  }, [searchTerm, currentItems]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Where are you interested in?">
      <div className="space-y-4 flex flex-col h-[500px]">

        {/* Selected Tags Display */}
        <div className="flex flex-wrap gap-2 min-h-[32px] content-start">
          {selectedItems.length === 0 && <span className="text-xs text-gray-400 italic py-1">No location selected</span>}
          {selectedItems.map((item) => (
            <span key={item.id} className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-100 rounded text-[11px] font-bold text-red-700 shadow-sm whitespace-nowrap">
              {item.name}
              <X className="w-3 h-3 cursor-pointer hover:text-red-900" onClick={() => handleRemoveItem(item.id)} />
            </span>
          ))}
        </div>

        {/* Top Cities */}
        {breadcrumbs.length === 1 && !searchTerm && (
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3">Popular Cities</h4>
            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide cursor-grab active:cursor-grabbing" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {topCities.map((city) => (
                <div
                  key={city.id}
                  className="min-w-[100px] h-[100px] relative rounded-lg overflow-hidden cursor-pointer shrink-0 group"
                  onClick={() => handleToggleItem({ id: city.id, name: city.name, type: 'CITY' })}
                  onDoubleClick={() => handleDrillDown({ id: city.id, name: city.name, type: 'CITY' })}
                >
                  <div className="absolute inset-0 bg-gray-300 group-hover:scale-110 transition-transform duration-500">
                    {city.imgUrl && <img src={city.imgUrl} alt={city.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center p-2">
                    <span className="font-bold text-xs text-white text-center">{city.name}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-1 w-full bg-gray-100 mt-1 rounded-full overflow-hidden relative">
              <div ref={scrollBarRef} onMouseDown={handleBarMouseDown} className="absolute top-0 h-full bg-red-500 rounded-full transition-all" style={{ width: '20%', left: `${scrollPercentage * 0.8}%` }}></div>
            </div>
            <div className="border-t border-gray-100 my-2"></div>
          </div>
        )}

        {/* Main List */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3">
            {breadcrumbs.length > 1 && <button onClick={handleBack} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600"><ArrowLeft className="w-4 h-4" /></button>}
            <div className="flex-1 flex items-center text-sm overflow-hidden whitespace-nowrap">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-gray-400 mx-1 shrink-0" />}
                  <span onClick={() => handleBreadcrumbClick(idx)} className={`cursor-pointer hover:underline ${idx === breadcrumbs.length - 1 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>{crumb.name}</span>
                </React.Fragment>
              ))}
            </div>
            <div className="relative w-48 shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input type="text" placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs focus:outline-none focus:border-red-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-gray-50/50 rounded-lg border border-gray-100 p-2">
            {loading ? <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-6 h-6 text-red-600 animate-spin" /></div> : (
              <>
                {filteredItems.length === 0 ? <div className="h-full flex items-center justify-center text-gray-400 text-xs">No locations found.</div> : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filteredItems.map((item) => {
                      const isSelected = selectedItems.some(i => i.id === item.id);
                      return (
                        <div
                          key={item.id}
                          className={`group flex items-center justify-between px-3 py-2.5 rounded-md border cursor-pointer transition-all select-none ${isSelected ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-sm'}`}
                          onClick={() => handleToggleItem(item)}
                          onDoubleClick={() => handleDrillDown(item)}
                        >
                          <span className={`text-xs font-medium truncate ${isSelected ? 'text-red-700' : 'text-gray-700 group-hover:text-red-600'}`}>
                            {item.name}
                          </span>
                          {item.type !== 'WARD' && <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-red-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 font-medium" onClick={() => setSelectedItems([])}><RotateCcw className="w-3 h-3" /> Reset Selection</button>
          <button onClick={() => { onConfirm(selectedItems); onClose(); }} className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95"><Check className="w-4 h-4" /> Confirm ({selectedItems.length})</button>
        </div>
      </div>
    </Modal>
  );
}