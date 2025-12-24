'use client';

import React from 'react';
import { ChevronRight, Users, Building2, Heart, Home, ShieldAlert, Wallet } from 'lucide-react';
import Link from 'next/link';

const reports = [
  {
    id: 1,
    title: "Agent Performance Report",
    description: "Get to know your team and their achievements — track agent productivity, conversion rates, and how they drive your business success.",
    icon: Users,
    color: "bg-blue-500",
    barColor: "bg-blue-500",
    hoverBgColor: "hover:bg-blue-50",
    hoverTextColor: "group-hover:text-blue-600",
    href: "/admin/reports/agent-performance", 
  },
  {
    id: 2,
    title: "Property Owner Contribution Report",
    description: "Discover which property owners contribute most to your portfolio's growth — monitor their revenues, activities, and overall impact.",
    icon: Building2,
    color: "bg-purple-500",
    barColor: "bg-purple-500",
    hoverBgColor: "hover:bg-purple-50",
    hoverTextColor: "group-hover:text-purple-600",
    href: "/admin/reports/property-owner",
  },
  {
    id: 3,
    title: "Customer Analytics Report",
    description: "Understand your customers like never before — uncover insights about preferences, satisfaction, and engagement over time.",
    icon: Heart,
    color: "bg-orange-500",
    barColor: "bg-orange-500",
    hoverBgColor: "hover:bg-orange-50",
    hoverTextColor: "group-hover:text-orange-600",
    href: "/admin/reports/customer-analytics",
  },
  {
    id: 4,
    title: "Property Statistics Report",
    description: "Dive deep into property performance — explore occupancy trends, rental yields, and how your listings perform across markets.",
    icon: Home,
    color: "bg-green-500",
    barColor: "bg-green-500",
    hoverBgColor: "hover:bg-green-50",
    hoverTextColor: "group-hover:text-green-600",
    href: "/admin/reports/property-statistics",
  },
  {
    id: 5,
    title: "Violation Reports",
    description: "Stay ahead of compliance risks — review property violations, track resolution progress, and maintain a trustworthy ecosystem.",
    icon: ShieldAlert,
    color: "bg-red-600",
    barColor: "bg-red-600",
    hoverBgColor: "hover:bg-red-50",
    hoverTextColor: "group-hover:text-red-600",
    href: "/admin/reports/violation",
  },
  {
    id: 6,
    title: "Financial Report",
    description: "Get a clear picture of your business finances — analyze revenue streams, operational costs, and profit margins across all assets.",
    icon: Wallet,
    color: "bg-indigo-600",
    barColor: "bg-indigo-600",
    hoverBgColor: "hover:bg-indigo-50",
    hoverTextColor: "group-hover:text-indigo-600",
    href: "/admin/reports/financial", 
  },
];

export default function StatisticReportsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Statistic Reports</h2>
        <p className="text-sm text-gray-500">Comprehensive insights into property management performance.</p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((item) => (
          <div
            key={item.id}
            className={`group relative bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden ${item.hoverBgColor}`}
          >
            <div className="flex gap-5">
              {/* Icon Box */}
              <div className={`w-12 h-12 rounded-lg shrink-0 flex items-center justify-center text-white ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>

              <Link href={item.href} className="flex-1">
                <div>
                  <h3 className={`text-base font-bold text-gray-900 mb-2 transition-colors ${item.hoverTextColor}`}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* View Report Link */}
                  <div className="flex justify-end">
                    <span className={`text-xs font-bold text-gray-400 flex items-center gap-1 group-hover:underline transition-colors ${item.hoverTextColor}`}>
                      View Report <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* --- HOVER EFFECT BAR (Bottom Line) --- */}
            <div
              className={`absolute bottom-0 left-0 w-full h-1.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${item.barColor}`}
            ></div>
          </div>
        ))}
      </div>

      {/* Bottom Banner Image */}
      <div className="w-full h-64 rounded-xl overflow-hidden shadow-sm relative">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
          alt="City Landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
    </div>
  );
}