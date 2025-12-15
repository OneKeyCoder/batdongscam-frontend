'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart, Home, Map } from 'lucide-react';
import DetailLayout from '@/app/components/DetailLayout';
import DistrictSidebar from '@/app/components/features/locations/DistrictSidebar';

export default function LocationDetailPage() {
  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Breadcrumb */}
      <div className="mb-6">
         <Link 
            href="/admin/locations" 
            className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors text-sm font-medium mb-2"
        >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Locations
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Locations Management</h2>
      </div>

      <DetailLayout
        // Cột phải là danh sách Districts
        sidebar={<DistrictSidebar />}
      >
        {/* Cột trái: Thông tin chi tiết Thành phố */}
        <div className="space-y-6">
            
            {/* Gallery Image */}
            <div className="relative h-96 bg-gray-200 rounded-xl overflow-hidden group">
                <img 
                    src="https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&q=80&w=1000" 
                    alt="Ha Noi" 
                    className="w-full h-full object-cover"
                />
                <button className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"><ChevronLeft className="w-5 h-5"/></button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"><ChevronRight className="w-5 h-5"/></button>
                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">2/3</div>
            </div>

            {/* Main Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="mb-4">
                    <p className="text-xs text-gray-500">For rent / Bắc Giang / Việt Yên / Property Name</p>
                    <h1 className="text-3xl font-bold text-gray-900 mt-1">Hà Nội</h1>
                </div>

                <hr className="border-gray-100 my-4"/>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Average land price</p>
                        <p className="text-lg font-bold text-red-600">1,00.00 $/m²</p>
                    </div>
                     <div>
                        <p className="text-xs text-gray-500 font-medium">Total Area</p>
                        <p className="text-lg font-bold text-red-600">120 m²</p>
                    </div>
                     <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Population</p>
                            <p className="text-lg font-bold text-red-600">123,523</p>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-red-500"><Heart className="w-5 h-5"/></button>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900">Description</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Thủ đô Hà Nội là trung tâm chính trị, văn hóa và du lịch quan trọng của Việt Nam. 
                        Với lịch sử hơn ngàn năm văn hiến, Hà Nội nổi tiếng với khu phố cổ, các di tích lịch sử và kiến trúc thuộc địa Pháp.
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Thành phố đang phát triển mạnh mẽ về cơ sở hạ tầng và bất động sản, thu hút nhiều nhà đầu tư trong và ngoài nước.
                    </p>
                </div>

                 <hr className="border-gray-100 my-6"/>

                 {/* Sub Stats */}
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Home className="w-5 h-5 text-red-600" />
                            <span className="text-sm text-gray-500">Districts</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 pl-7">20</p>
                    </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Home className="w-5 h-5 text-red-600" />
                            <span className="text-sm text-gray-500">Active Properties</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 pl-7">511</p>
                    </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Map className="w-5 h-5 text-red-600" />
                            <span className="text-sm text-gray-500">Wards</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 pl-7">131</p>
                    </div>
                 </div>

                 {/* Dates */}
                 <div className="flex justify-between text-xs text-gray-500 mt-8 pt-4 border-t border-gray-100">
                    <div>
                        <p>Created day</p>
                        <p className="font-bold text-gray-900">9:00AM - 08/10/2025</p>
                    </div>
                     <div>
                        <p>Last updated day</p>
                        <p className="font-bold text-gray-900">9:00AM - 09/10/2025</p>
                    </div>
                 </div>
            </div>
        </div>
      </DetailLayout>
    </div>
  );
}