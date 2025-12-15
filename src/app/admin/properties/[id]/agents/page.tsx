'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Search, Filter, MoreVertical, ChevronRight } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

export default function PropertyAgentsPage({ params }: { params: { id: string } }) {
  
  // Mock data agents
  const agents = Array(10).fill(null).map((_, i) => ({
      id: i,
      name: "Agent's Name",
      code: "#1 SA0123",
      tier: "PLATINUM",
      appointments: 13,
      properties: 1,
      maxPerDay: 10,
      handling: 8
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      
      {/* Back Button */}
      <Link 
        href={`/admin/properties/${params.id}`} 
        className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors font-medium text-sm"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Property
      </Link>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                type="text"
                placeholder="Agent's name or code"
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors">
                Search
            </button>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 rounded-lg bg-white text-gray-700 font-medium text-sm">
            <Filter className="w-4 h-4" />
            Advanced Search
            <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">3</span>
        </button>
      </div>

      {/* Agent Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 font-medium">Agent</th>
                        <th className="px-6 py-4 font-medium">Tier</th>
                        <th className="px-6 py-4 font-medium">Appointments</th>
                        <th className="px-6 py-4 font-medium">Properties</th>
                        <th className="px-6 py-4 font-medium">Max properties<br/>per day</th>
                        <th className="px-6 py-4 font-medium">Currently<br/>handling</th>
                        <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {agents.map((agent, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0"></div>
                                    <div>
                                        <p className="font-bold text-gray-900">{agent.name}</p>
                                        <p className="text-xs text-red-600 font-bold">{agent.code}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <Badge variant="pink">{agent.tier}</Badge>
                            </td>
                            <td className="px-6 py-4 text-gray-900 font-medium pl-10">{agent.appointments}</td>
                            <td className="px-6 py-4 text-gray-900 font-medium pl-10">{agent.properties}</td>
                            <td className="px-6 py-4 text-gray-900 font-medium pl-10">{agent.maxPerDay}</td>
                            <td className="px-6 py-4 text-gray-900 font-medium pl-10">{agent.handling}</td>
                            <td className="px-6 py-4 text-right">
                                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
             <span className="text-sm text-gray-600">1-10 of 97</span>
             <div className="flex items-center gap-2">
                 <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                     <ChevronLeft className="w-4 h-4" />
                 </button>
                 <span className="text-sm font-medium px-2">1/10</span>
                 <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50">
                     <ChevronRight className="w-4 h-4" />
                 </button>
             </div>
        </div>
      </div>
    </div>
  );
}