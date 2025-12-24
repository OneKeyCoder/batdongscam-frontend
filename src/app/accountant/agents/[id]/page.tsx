'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Mail, Phone, MapPin, Calendar, Wallet, ChevronDown } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

const SalaryCard = ({ title, value, icon: Icon, isPositive = false }: any) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between h-full">
        <div className="flex items-center gap-2 text-gray-500 mb-2">
            {Icon && <Icon className="w-4 h-4" />}
            <span className="text-xs font-bold uppercase">{title}</span>
        </div>
        <p className={`text-xl font-bold ${isPositive ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
    </div>
);

export default function AccountantAgentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Back Link */}
      <Link href="/accountant/agents" className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors text-sm font-medium">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Agents List
      </Link>

      {/* Profile Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <div className="shrink-0 flex flex-col items-center md:items-start">
              <div className="w-32 h-32 rounded-full border-4 border-red-500 p-0.5 mb-4 overflow-hidden">
                  <img src="https://i.pravatar.cc/300?u=sa0123" alt="Avatar" className="w-full h-full object-cover rounded-full" />
              </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 space-y-4">
              <div>
                  <h2 className="text-2xl font-bold text-gray-900">Phan Đình Minh</h2>
                  <p className="text-sm text-gray-500 font-medium">Code: SA0120949</p>
                  <div className="flex gap-2 mt-2">
                      <Badge variant="success">Active</Badge>
                      <Badge variant="pink">PLATINUM</Badge>
                      <span className="text-red-600 font-bold text-sm flex items-center">#1</span>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                  <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-bold text-gray-900">phandinhminh48@gmail.com</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-bold text-gray-900">+84 865 832 440</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold text-xs border border-gray-300 rounded">Z</div>
                      <div>
                          <p className="text-xs text-gray-500">Zalo</p>
                          <p className="text-sm font-bold text-gray-900">0865832440</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm font-bold text-gray-900">Dai Hong Ward, Dai Loc District, Quang Nam City</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                          <p className="text-xs text-gray-500">Hired Date</p>
                          <p className="text-sm font-bold text-gray-900">January 2nd, 2022</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-gray-400" />
                      <div>
                          <p className="text-xs text-gray-500">Max Properties per day</p>
                          <p className="text-sm font-bold text-gray-900">8 properties</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Salary Section */}
      <div className="space-y-6">
          <div className="flex justify-end">
              <div className="relative">
                  <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 min-w-[140px] justify-between">
                      October, 2025
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
              </div>
          </div>

          {/* Current Month Salary */}
          <div>
              <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-900">Current month salary</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 transition-colors shadow-sm">
                      <Wallet className="w-4 h-4" /> Pay
                  </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <SalaryCard title="Total salary" value="45.000.000 VNĐ" isPositive />
                  <SalaryCard title="Paid" value="0.000 VNĐ" isPositive />
                  <SalaryCard title="Unpaid" value="45.000.000 VNĐ" isPositive />
                  <SalaryCard title="Bonus" value="0.000 VNĐ" isPositive />
              </div>
          </div>

          {/* All Career Salary */}
          <div>
              <h3 className="font-bold text-gray-900 mb-3">All career salary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <SalaryCard title="Total salary" value="890.000.000 VNĐ" isPositive />
                  <SalaryCard title="Paid" value="835.000.000 VNĐ" isPositive />
                  <SalaryCard title="Unpaid" value="45.000.000 VNĐ" isPositive />
                  <SalaryCard title="Bonus" value="20.000.000 VNĐ" isPositive />
              </div>
          </div>
      </div>
    </div>
  );
}