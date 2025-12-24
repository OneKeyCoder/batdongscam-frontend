'use client';

import React from 'react';
import { Mail, Phone, Star } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

const PartyCard = ({ role, name, phone, email, rating, isAgent = false, isCustomer = false }: any) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col h-full">
        <h4 className="font-bold text-gray-900 text-sm mb-4">{role}</h4>
        
        <div className="flex gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{name}</p>
                <div className="mt-1 mb-2">
                    <Badge variant="pink" className="text-[10px]">PLATINUM</Badge>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 truncate">
                        <Phone className="w-3 h-3" /> {phone}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3" /> {email}
                    </p>
                </div>
            </div>
            
            {rating && (
                <div className="text-right">
                    <p className="text-xs text-gray-400">Rating</p>
                    <div className="flex items-center gap-1 text-orange-500 font-bold text-sm mt-0.5">
                        <Star className="w-4 h-4 fill-orange-500" /> {rating}
                    </div>
                </div>
            )}
        </div>

        <div className="mt-auto flex gap-2">
            {isAgent ? (
                <>
                    <button className="flex-1 py-2 border border-red-200 text-red-600 text-xs font-bold rounded hover:bg-red-50 transition-colors">
                        Remove agent
                    </button>
                    <button className="flex-1 py-2 border border-red-200 text-red-600 text-xs font-bold rounded hover:bg-red-50 transition-colors">
                        Change agent
                    </button>
                    <button className="flex-1 py-2 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors">
                        View Account
                    </button>
                </>
            ) : (
                <button className="w-full py-2 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors">
                    View Account
                </button>
            )}
        </div>
    </div>
)

export default function PartiesTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PartyCard 
            role="Property Owner" 
            name="Phan Đình Minh" 
            phone="0865 8***" 
            email="phandinhminh48@gmail.com" 
        />
        <PartyCard 
            role="Sales Agent - Owner support" 
            name="Phan Đình Minh" 
            phone="0865 8***" 
            email="phandinhminh48@gmail.com"
            rating="4.8 (172)"
            isAgent={true}
        />
        <PartyCard 
            role="Customer" 
            name="Phan Đình Minh" 
            phone="0865 8***" 
            email="phandinhminh48@gmail.com" 
            isCustomer={true}
        />
        <PartyCard 
            role="Sales Agent - Customer support" 
            name="Phan Đình Minh" 
            phone="0865 8***" 
            email="phandinhminh48@gmail.com"
            rating="4.8 (172)"
            isAgent={true}
        />
    </div>
  );
}