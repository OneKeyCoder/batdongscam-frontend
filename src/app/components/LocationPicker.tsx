'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, RotateCcw, Check } from 'lucide-react';
import Modal from '@/app/components/ui/Modal'; 

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: string) => void;
}

const POPULAR_CITIES = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Bình Dương', 'Hải Phòng', 'Cần Thơ', 'Huế', 'Nha Trang', 'Vũng Tàu', 'Đà Lạt'];
const ALL_CITIES = Array(30).fill('Hà Nội'); 

export default function LocationPicker({ isOpen, onClose, onSelect }: LocationPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Hồ Chí Minh/Tân Bình', 'Đà Nẵng/All', 'Hồ Chí Minh/Gò Vấp/Hạnh Thông']);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const maxScroll = scrollWidth - clientWidth;
        if (maxScroll > 0) {
            setScrollPercentage((scrollLeft / maxScroll) * 100);
        }
    }
  };

  const handleBarMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

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
      const maxScroll = scrollWidth - clientWidth;
      scrollContainerRef.current.scrollLeft = percentage * maxScroll;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const removeTag = (tag: string) => {
      setSelectedTags(prev => prev.filter(t => t !== tag));
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Where are you interested in?">
      
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
                type="text" 
                placeholder="Enter Location" 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Selected Tags */}
        <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-[11px] font-medium text-gray-700 shadow-sm whitespace-nowrap">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer text-red-500 hover:text-red-700" onClick={() => removeTag(tag)}/>
                </span>
            ))}
        </div>

        <hr className="border-gray-100"/>

        {/* --- CUSTOM SCROLL SECTION: TOP CITIES --- */}
        <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3">Top 10 popular cities</h4>
            
            {/* Scrollable Container (Ẩn thanh scroll native) */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide cursor-grab active:cursor-grabbing"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar CSS
            >
                {POPULAR_CITIES.map((city, idx) => (
                    <div 
                        key={idx}
                        className="min-w-[100px] h-[100px] bg-gray-200 hover:bg-red-50 hover:text-red-600 rounded-lg flex items-end justify-center p-2 cursor-pointer transition-colors shrink-0"
                        onClick={() => onSelect(city)}
                    >
                        <span className="font-medium text-xs pointer-events-none select-none">{city}</span>
                    </div>
                ))}
            </div>

            {/* Custom Interactive Scrollbar (Red Line) */}
            <div className="h-1.5 w-full bg-gray-200 mt-2 rounded-full overflow-hidden relative cursor-pointer group">
                {/* Thumb (Thanh đỏ) */}
                <div 
                    ref={scrollBarRef}
                    onMouseDown={handleBarMouseDown}
                    className="absolute top-0 h-full bg-red-600 rounded-full cursor-grab active:cursor-grabbing transition-colors group-hover:bg-red-700"
                    style={{ 
                        width: '30%', // Độ dài thanh scroll (có thể tính toán dynamic nếu muốn xịn hơn)
                        left: `${scrollPercentage * 0.7}%`, // Nhân 0.7 vì width là 30% (để không chạy quá lề)
                        transition: isDragging ? 'none' : 'left 0.1s ease-out'
                    }}
                ></div>
            </div>
        </div>

        {/* All Cities List */}
        <div>
             <h4 className="text-sm font-medium text-gray-600 mb-3">All cities (double click to select districts)</h4>
             <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-y-2 gap-x-2 max-h-60 overflow-y-auto custom-scrollbar">
                {ALL_CITIES.map((city, idx) => (
                    <button 
                        key={idx} 
                        className="text-left text-xs text-gray-500 hover:text-red-600 hover:font-bold transition-all py-1"
                        onClick={() => onSelect(city)}
                    >
                        {city}
                    </button>
                ))}
             </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
             <button 
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedTags([])}
             >
                <RotateCcw className="w-4 h-4" /> Reset All
             </button>
             <button 
                onClick={onClose} 
                className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors"
             >
                <Check className="w-4 h-4" /> Done
             </button>
        </div>
      </div>
    </Modal>
  );
}