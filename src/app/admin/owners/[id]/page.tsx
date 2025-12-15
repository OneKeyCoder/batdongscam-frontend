'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Mail, Phone, MapPin, Calendar, MessageSquare, Edit, Trash2, Trophy, Target, DollarSign, Home, Briefcase, Building2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

const StatItem = ({ icon: Icon, label, value }: any) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col h-full min-h-[90px]">
        <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">{label}</span>
        </div>
        <div>
            <span className="text-lg font-bold text-red-600 block">{value}</span>
        </div>
    </div>
);

export default function OwnerDetailPage() {
  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">
      {/* Back Link */}
      <div>
         <Link href="/admin/customers" className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors text-xs font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Customers & Owners List
         </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative">
          <div className="absolute top-6 right-6 flex gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"><Edit className="w-3 h-3" /> Edit</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors"><Trash2 className="w-3 h-3" /> Delete</button>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="shrink-0"><div className="w-24 h-24 rounded-full p-1 border-2 border-red-500"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200" alt="Avatar" className="w-full h-full object-cover rounded-full"/></div></div>
            <div className="flex-1">
                <div className="mb-4">
                    <h1 className="text-xl font-bold text-gray-900">Phan Đình Minh</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">Active</span>
                        <Badge variant="pink">PLATINUM</Badge>
                        <span className="text-red-600 font-bold text-sm">#1</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
                    <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-500 shrink-0" /><div><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium">phandinhminh48@gmail.com</p></div></div>
                    <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-500 shrink-0" /><div><p className="text-xs text-gray-400">Phone</p><p className="text-sm font-medium">+84 865 832 440</p></div></div>
                    <div className="flex items-center gap-3"><MessageSquare className="w-4 h-4 text-gray-500 shrink-0" /><div><p className="text-xs text-gray-400">Zalo</p><p className="text-sm font-medium">0865832440</p></div></div>
                    <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-1" /><div><p className="text-xs text-gray-400">Location</p><p className="text-sm font-medium">Dai Hong Ward, Dai Loc District</p></div></div>
                    <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-gray-500 shrink-0" /><div><p className="text-xs text-gray-400">Joined at</p><p className="text-sm font-medium">January 2nd, 2022</p></div></div>
                    <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-gray-500 shrink-0" /><div><p className="text-xs text-gray-400">Approved at</p><p className="text-sm font-medium">January 2nd, 2022</p></div></div>
                </div>
            </div>
          </div>
      </div>

      <div className="space-y-8">
          <div>
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Current month contribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatItem icon={Trophy} label="Contribution point" value="95" />
                  <StatItem icon={Target} label="Ranking position" value="# 2" />
                  <StatItem icon={DollarSign} label="Contribution value" value="10.000.000.000" />
                  <StatItem icon={Home} label="Total properties" value="24" />
                  <StatItem icon={Building2} label="Properties for sale" value="24" />
                  <StatItem icon={Building2} label="Properties for rent" value="24" />
                  <StatItem icon={Briefcase} label="Projects" value="24" />
                  <StatItem icon={Home} label="Properties sold" value="24" />
                  <StatItem icon={Home} label="Properties rented" value="24" />
              </div>
          </div>

          <div>
              <h3 className="font-bold text-gray-900 mb-4 text-sm">All contribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatItem icon={Trophy} label="Contribution point" value="95" />
                  <StatItem icon={Target} label="Ranking position" value="# 2" />
                  <StatItem icon={DollarSign} label="Contribution value" value="10.000.000.000" />
                  <StatItem icon={Home} label="Total properties" value="24" />
                  <StatItem icon={Building2} label="Properties for sale" value="24" />
                  <StatItem icon={Building2} label="Properties for rent" value="24" />
                  <StatItem icon={Briefcase} label="Projects" value="24" />
                  <StatItem icon={Home} label="Properties sold" value="24" />
                  <StatItem icon={Home} label="Properties rented" value="24" />
              </div>
          </div>
      </div>
    </div>
  );
}