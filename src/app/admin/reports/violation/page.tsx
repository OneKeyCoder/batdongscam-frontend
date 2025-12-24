'use client';

import React from 'react';
import { LogOut, ChevronDown, ShieldAlert, FileText, AlertTriangle, Clock, X, Plus } from 'lucide-react';

export default function ViolationReportPage() {
  
  const stats = [
    { title: "Total violation reports", value: "10.000B", trend: "+12.5%", icon: ShieldAlert },
    { title: "New this month", value: "10%", trend: "+1.2%", icon: FileText },
    { title: "Unsolved", value: "9.000B", trend: "+12.5%", icon: AlertTriangle },
    { title: "Average resolution hour", value: "9.000B", trend: "+12.5%", icon: Clock },
  ];

  const tags = [
    { label: "Fraudulent listing", color: "bg-yellow-100 text-yellow-800" },
    { label: "Misrepresentation of property", color: "bg-blue-100 text-blue-800" },
    { label: "Spam or Duplicate", color: "bg-orange-100 text-orange-800" },
    { label: "Scam attempt", color: "bg-yellow-300 text-yellow-900" },
  ];

  return (
    <div className="space-y-6 pb-10">
      
      {/* 1. Header Section */}
      <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Violation Report</h2>
            <p className="text-sm text-gray-500">Stay ahead of compliance risks — review property violations, track resolution progress, and maintain a trustworthy ecosystem.</p>
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
                          {stat.trend}
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
          
          {/* Row 1: Total Violation Reports */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full border border-gray-400 inline-block"></span> Total violation reports
              </h3>
              <div className="h-64 bg-gray-100 rounded-lg w-full"></div> {/* Placeholder Chart */}
          </div>

          {/* Row 2: Violation Trends (Complex Layout with Tags) */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full border border-gray-400 inline-block"></span> Violation trends
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
                      {tags.map((tag, idx) => (
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

          {/* Row 3: Two Columns (Suspended & Removed) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Total accounts suspended */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full border border-gray-400 inline-block"></span> Total accounts suspended
                  </h3>
                  <div className="h-48 bg-gray-100 rounded-lg w-full"></div>
              </div>

              {/* Total properties removed */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full border border-gray-400 inline-block"></span> Total properties removed
                  </h3>
                  <div className="h-48 bg-gray-100 rounded-lg w-full"></div>
              </div>
          </div>

      </div>
    </div>
  );
}