'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, Filter, Loader2, UserCheck, MoreVertical, ChevronRight } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import apiClient from '@/lib/api/client';
import { getFullUrl } from '@/lib/utils/urlUtils';
import { accountService, SaleAgentListItem } from '@/lib/api/services/account.service';

export default function PropertyAgentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: propertyId } = use(params);
  const router = useRouter();

  // State
  const [agents, setAgents] = useState<SaleAgentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await accountService.getAllSaleAgents({
        page: currentPage,
        limit: itemsPerPage,
        name: searchTerm, 
      });

      setAgents(res.data);
      
      // Xử lý total items từ response paging
      if (res.paging) {
        setTotalItems(res.paging.total);
      } else if ((res as any).meta) {
        setTotalItems((res as any).meta.total);
      }
    } catch (error) {
      console.error("Failed to fetch agents", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchAgents(), 500);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm]);

  // --- ASSIGN AGENT ---
  const handleAssignAgent = async (agentId: string) => {
    if (confirm("Are you sure you want to assign this agent to the property?")) {
      try {
        await apiClient.put(`/properties/${propertyId}/assign-agent/${agentId}`);
        alert("Agent assigned successfully!");
        router.push(`/admin/properties/${propertyId}`);
      } catch (error) {
        console.error("Assign failed", error);
        alert("Failed to assign agent.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      
      {/* Back Button */}
      <Link 
        href={`/admin/properties/${propertyId}`} 
        className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors font-medium text-sm"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Property
      </Link>

      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-gray-900">Select Sales Agent</h2>
        <p className="text-sm text-gray-500">Choose a qualified agent to manage this property.</p>
      </div>

      <div className="space-y-3">
          <div className="flex gap-4">
             {/* Search Input */}
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search agent by name..."
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                    onClick={fetchAgents}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
                >
                    Search
                </button>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 rounded-lg bg-white text-gray-700 font-medium text-sm transition-colors whitespace-nowrap">
                <Filter className="w-4 h-4" />
                Advanced Search
            </button>
          </div>
      </div>

      {/* Agent Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 font-medium">Agent</th>
                        <th className="px-6 py-4 font-medium">Tier</th>
                        <th className="px-6 py-4 font-medium text-center">Appointments</th>
                        <th className="px-6 py-4 font-medium text-center">Properties</th>
                        <th className="px-6 py-4 font-medium text-center">Rating</th>
                        <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={6} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600"/></td></tr>
                    ) : agents.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-10 text-gray-400">No agents found matching your search.</td></tr>
                    ) : (
                        agents.map((agent) => (
                            <tr key={agent.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0 overflow-hidden border border-gray-100">
                                            <img 
                                                src={getFullUrl(agent.avatarUrl) || `https://ui-avatars.com/api/?name=${agent.firstName}+${agent.lastName}`} 
                                                alt={agent.firstName} 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{agent.firstName} {agent.lastName}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-red-600 font-bold">{agent.employeeCode || '---'}</p>
                                                {/* <span className="text-[10px] text-gray-400">|</span> */}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={agent.tier === 'PLATINUM' ? 'pink' : 'gold'}>{agent.tier || 'MEMBER'}</Badge>
                                </td>
                                
                                {/* Real Stats from SaleAgentListItem */}
                                <td className="px-6 py-4 text-gray-900 font-medium text-center pl-10">
                                    {agent.appointmentsAssigned || 0}
                                </td>
                                <td className="px-6 py-4 text-gray-900 font-medium text-center pl-10">
                                    {agent.propertiesAssigned || 0}
                                </td>
                                <td className="px-6 py-4 text-gray-900 font-medium text-center pl-10">
                                    {agent.rating ? `${agent.rating}/5` : '-'}
                                </td>
                                
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleAssignAgent(agent.id)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                                    >
                                        <UserCheck className="w-3.5 h-3.5" /> Select
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
             <span className="text-sm text-gray-600">
                Showing {agents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
             </span>
             <div className="flex items-center gap-2">
                 <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                 >
                     <ChevronLeft className="w-4 h-4" />
                 </button>
                 <span className="text-sm font-medium px-2 bg-white border border-gray-200 rounded py-1 min-w-[32px] text-center">
                    {currentPage}
                 </span>
                 <button 
                    onClick={() => setCurrentPage(prev => (prev * itemsPerPage < totalItems ? prev + 1 : prev))}
                    disabled={currentPage * itemsPerPage >= totalItems}
                    className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                 >
                     <ChevronRight className="w-4 h-4" />
                 </button>
             </div>
        </div>
      </div>
    </div>
  );
}