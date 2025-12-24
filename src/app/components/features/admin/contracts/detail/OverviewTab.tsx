'use client';

import React from 'react';
import { FileText, Calendar, Star, MessageSquare, MapPin } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

export default function OverviewTab() {
  return (
    <div className="space-y-6">
        {/* Section 1: Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Contract information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                    <label className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <FileText className="w-4 h-4" /> Contract type
                    </label>
                    <p className="font-bold text-gray-900">SALE</p>
                </div>
                <div>
                    <label className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Calendar className="w-4 h-4" /> Start date
                    </label>
                    <p className="font-bold text-gray-900">January 2nd, 2022 - 7:00PM</p>
                </div>
                <div>
                    <label className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Calendar className="w-4 h-4" /> End date
                    </label>
                    <p className="font-bold text-gray-900">January 2nd, 2022 - 8:12 PM</p>
                </div>
            </div>

            {/* Special Terms */}
            <div className="mb-6">
                <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <FileText className="w-4 h-4" /> Special terms
                </label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 min-h-[80px]">
                    Standard contract terms and conditions apply.
                </div>
            </div>

            {/* Rating & Comment */}
            <div className="mb-6">
                <label className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Star className="w-4 h-4" /> Rating
                </label>
                <p className="font-bold text-gray-900">4.8</p>
            </div>

            <div>
                <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MessageSquare className="w-4 h-4" /> Customer comment
                </label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 min-h-[80px]">
                    No comments yet.
                </div>
            </div>
        </div>

        {/* Section 2: Property */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Property</h3>
            <div className="flex flex-col md:flex-row gap-4">
                <img 
                    src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=300&h=200" 
                    alt="Property" 
                    className="w-full md:w-48 h-32 object-cover rounded-lg"
                />
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">Apartment hello 123</h4>
                            <div className="flex gap-2 mt-1 mb-2">
                                <Badge variant="red" className="text-[10px]">Sale</Badge>
                                <Badge variant="default" className="text-[10px] bg-orange-100 text-orange-700">Apartment</Badge>
                            </div>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> 123 Main Street, 12 District, NY City
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-8 mt-2">
                        <div>
                            <span className="text-xs text-gray-500 block">Price</span>
                            <span className="font-bold text-red-600">541k $</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 block">Area</span>
                            <span className="font-bold text-gray-900">120 m²</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-4">
                <button className="w-full bg-red-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-red-700 transition-colors">
                    View property
                </button>
            </div>
        </div>
    </div>
  );
}