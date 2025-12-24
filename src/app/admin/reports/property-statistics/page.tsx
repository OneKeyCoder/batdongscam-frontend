'use client';

import React from 'react';
import { LogOut, ChevronDown, Building2, TrendingUp, X, Plus, FilePlus, ShoppingCart, Key } from 'lucide-react';

export default function PropertyStatisticsPage() {
  
  const stats = [
    { title: "Active properties", value: "10.000B", trend: "+12.5%", icon: Building2 },
    { title: "New properties this month", value: "10%", trend: "+1.2%", icon: FilePlus },
    { title: "Total sold", value: "9.000B", trend: "+12.5%", icon: ShoppingCart },
    { title: "Total rented", value: "3.9 (15k)", trend: "+12.5%", icon: Key },
  ];

  const targets = [
    { label: "Quận Gò Vấp, Hồ Chí Minh", color: "bg-yellow-100 text-yellow-800" },
    { label: "Quận Bình Thạnh, Hồ Chí Minh", color: "bg-blue-100 text-blue-800" },
    { label: "Căn hộ hạng trung", color: "bg-orange-100 text-orange-800" },
    { label: "Thành phố Đà Lạt", color: "bg-yellow-300 text-yellow-900" },
  ];

  return (
    <div className="space-y-6 pb-10">
      
      {/* 1. Header Section */}
      <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Property Statistics Report</h2>
            <p className="text-sm text-gray-500">Dive deep into property performance — explore occupancy trends, rental yields, and how your listings perform across markets.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 transition-colors shadow-sm">
              <LogOut className="w-4 h-4" /> Export to file
          </button>
      </div>

      {/* 2. Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative">
                  <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-600">{stat.title}</span>
                      <stat.icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                      <span className="text-xs font-medium text-green-600 mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> {stat.trend}
                      </span>
                  </div>
              </div>
          ))}
      </div>

      {/* 3. Year Filter */}
      <div className="flex justify-end">
          <button className="flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 min-w-[100px] shadow-sm">
              2025
              <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
      </div>

      {/* 4. Charts Grid */}
      <div className="space-y-6">
          
          {/* Row 1: Total Properties */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full border border-gray-400 inline-block"></span> Total properties
              </h3>
              <div className="h-64 bg-gray-100 rounded-lg w-full"></div> {/* Placeholder Chart */}
          </div>

          {/* Row 2: Two Columns (Sold & Rented) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Total Sold */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full border border-gray-400 inline-block"></span> Total sold
                  </h3>
                  <div className="h-48 bg-gray-100 rounded-lg w-full"></div>
              </div>

              {/* Total Rented */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full border border-gray-400 inline-block"></span> Total rented
                  </h3>
                  <div className="h-48 bg-gray-100 rounded-lg w-full"></div>
              </div>
          </div>

          {/* Row 3: Specific Searched Target */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full border border-gray-400 inline-block"></span> Specific searched target
                  </h3>
                  <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors">
                      Add participant
                  </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                  {/* Chart Area */}
                  <div className="flex-1 h-48 bg-gray-100 rounded-lg"></div>

                  {/* Tags List */}
                  <div className="w-full md:w-64 flex flex-col gap-2 relative">
                      <div className="absolute left-[-12px] top-4 bottom-4 w-[2px] bg-gray-200 hidden md:block"></div>
                      {targets.map((tag, idx) => (
                          <div key={idx} className={`relative px-3 py-2 rounded-lg text-xs font-medium ${tag.color} pr-8 group cursor-pointer`}>
                              {tag.label}
                              <button className="absolute right-1 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-3 h-3" />
                              </button>
                              <button className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-red-100 text-red-500 md:hidden">
                                  <X className="w-2 h-2" />
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Row 4: Specific Favorited Target (Layout tương tự Row 3) */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full border border-gray-400 inline-block"></span> Specific favorited target
                  </h3>
                  <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors">
                      Add participant
                  </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                  {/* Chart Area */}
                  <div className="flex-1 h-48 bg-gray-100 rounded-lg"></div>

                  {/* Tags List */}
                  <div className="w-full md:w-64 flex flex-col gap-2 relative">
                      <div className="absolute left-[-12px] top-4 bottom-4 w-[2px] bg-gray-200 hidden md:block"></div>
                      {targets.map((tag, idx) => (
                          <div key={idx} className={`relative px-3 py-2 rounded-lg text-xs font-medium ${tag.color} pr-8 group cursor-pointer`}>
                              {tag.label}
                              <button className="absolute right-1 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-3 h-3" />
                              </button>
                              <button className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-red-100 text-red-500 md:hidden">
                                  <X className="w-2 h-2" />
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
}