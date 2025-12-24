'use client';

import React from 'react';
import DetailLayout from '@/app/components/DetailLayout';
import ContactCard from '@/app/components/features/admin/properties/details/ContactCard'; 
import DocumentList from '@/app/components/features/admin/properties/details/DocumentList';
import Link from 'next/link';
import { ChevronLeft, MapPin, Share2 } from 'lucide-react';

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
         <div>
            <Link 
                href="/admin/properties" 
                className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors text-sm font-medium mb-2"
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Properties
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
         </div>
         <div className="flex gap-2">
             <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                <Share2 className="w-5 h-5"/>
             </button>
         </div>
      </div>

      {/* --- SHARED DETAIL LAYOUT --- */}
      <DetailLayout
        // CỘT BÊN PHẢI (SIDEBAR)
        sidebar={
            <>
                <ContactCard 
                    title="Property Owner"
                    name="Phan Đình Minh"
                    tier="PLATINUM"
                    phone="0865 8***"
                    avatar="https://i.pravatar.cc/150?u=owner"
                />
                 <ContactCard 
                    title="Sales Agent"
                    name="Nguyễn Văn A"
                    tier="GOLD"
                    phone="0909 1***"
                    avatar="https://i.pravatar.cc/150?u=agent"
                />
                <DocumentList />
                
                {/* Meta info text */}
                <div className="flex justify-between text-xs text-gray-500 px-1 pt-2">
                    <span>Created: <strong>09/10/2025</strong></span>
                    <span>Updated: <strong>Today</strong></span>
                </div>
            </>
        }
      >
        {/* CỘT BÊN TRÁI (MAIN CONTENT) */}
        <div className="space-y-6">
            {/* Gallery Demo */}
            <div className="h-80 bg-gray-200 rounded-xl w-full flex items-center justify-center text-gray-400">
                Gallery Component Here
            </div>

            {/* Main Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Luxury Villa District 7</h1>
                        <p className="text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-4 h-4" /> Ho Chi Minh City
                        </p>
                    </div>
                    <span className="text-2xl font-bold text-red-600">541,000 $</span>
                 </div>
                 <hr className="my-4 border-gray-100"/>
                 <p className="text-gray-600 leading-relaxed">
                    Description contents...
                 </p>
            </div>
             
             {/* Agents List Link Block */}
             <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-blue-900 text-lg">Agents Management</h3>
                    <p className="text-sm text-blue-600 mt-1">View list of agents handling this property</p>
                </div>
                <Link 
                    href={`/admin/properties/${params.id}/agents`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition-colors"
                >
                    View Agents
                </Link>
             </div>
        </div>
      </DetailLayout>
    </div>
  );
}