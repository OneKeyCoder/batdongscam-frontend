'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, Filter, Loader2, UserCheck, RotateCcw, Check, ChevronDown, ChevronRight } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import apiClient from '@/lib/api/client';
import { getFullUrl } from '@/lib/utils/urlUtils';
import Modal from '@/app/components/ui/Modal'; 
import { accountService, SaleAgentListItem, SaleAgentFilters } from '@/lib/api/services/account.service';

export default function PropertyAgentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: propertyId } = use(params);
  const router = useRouter();

  const [agents, setAgents] = useState<SaleAgentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SaleAgentFilters>({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [isAdvModalOpen, setIsAdvModalOpen] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await accountService.getAllSaleAgents({
        page: currentPage,
        limit: itemsPerPage,
        name: searchTerm,
        ...filters 
      });

      setAgents(res.data);
      if (res.paging) setTotalItems(res.paging.total);
      else if ((res as any).meta) setTotalItems((res as any).meta.total);

    } catch (error) {
      console.error("Failed to fetch agents", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchAgents(), 500);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, filters]);

  const handleAssignAgent = async (agentId: string) => {
    if (confirm("Assign this agent to the property?")) {
      try {
        await apiClient.put(`/properties/${propertyId}/assign-agent/${agentId}`);
        router.push(`/admin/properties/${propertyId}`); 
      } catch (error) {
        alert("Failed to assign agent.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      
      <div className="mb-2">
        <Link href={`/admin/properties/${propertyId}`} className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors font-medium text-sm">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Property
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-gray-900">Select Sales Agent</h2>
        <p className="text-sm text-gray-500">Choose a qualified agent to manage this property.</p>
      </div>

      <div className="space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search agent by name..." className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button onClick={fetchAgents} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-6 py-1.5 rounded-md transition-colors">Search</button>
          </div>
          <div className="flex justify-start">
              <button onClick={() => setIsAdvModalOpen(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg bg-white text-gray-700 font-medium text-sm transition-colors shadow-sm">
                 <Filter className="w-4 h-4" /> Advanced Search
              </button>
          </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 font-medium">Agent</th>
                        <th className="px-6 py-4 font-medium">Tier</th>
                        <th className="px-6 py-4 font-medium text-center">Assignments</th>
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
                                            <img src={getFullUrl(agent.avatarUrl)} alt={agent.firstName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${agent.firstName}+${agent.lastName}`}} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{agent.firstName} {agent.lastName}</p>
                                            <p className="text-xs text-red-600 font-bold">{agent.employeeCode || '---'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4"><Badge variant={agent.tier === 'PLATINUM' ? 'pink' : 'gold'}>{agent.tier || 'null'}</Badge></td>
                                <td className="px-6 py-4 text-gray-900 font-medium text-center pl-10">{agent.totalAssignments || 0}</td>
                                <td className="px-6 py-4 text-gray-900 font-medium text-center pl-10">{agent.propertiesAssigned || 0}</td>
                                <td className="px-6 py-4 text-gray-900 font-medium text-center pl-10">{agent.rating ? `${agent.rating}/5` : '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleAssignAgent(agent.id)} className="inline-flex items-center gap-1 px-4 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm">
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
             <span className="text-sm text-gray-600">Showing {agents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries</span>
             <div className="flex items-center gap-2">
                 <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                 <span className="text-sm font-medium px-2">{currentPage}</span>
                 <button onClick={() => setCurrentPage(prev => (prev * itemsPerPage < totalItems ? prev + 1 : prev))} disabled={currentPage * itemsPerPage >= totalItems} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
             </div>
        </div>

        <Modal isOpen={isAdvModalOpen} onClose={() => setIsAdvModalOpen(false)} title="Agent Advanced Search">
            <AgentAdvancedSearchForm 
                onApply={(newFilters) => {
                    setFilters(newFilters);
                    setCurrentPage(1); 
                    setIsAdvModalOpen(false);
                }}
                onReset={() => {
                    setFilters({});
                    setSearchTerm('');
                    setCurrentPage(1);
                }}
            />
        </Modal>
      </div>
    </div>
  );
}

// --- COMPONENT ADVANCED SEARCH FORM  ---
function AgentAdvancedSearchForm({ onApply, onReset }: { onApply: (f: SaleAgentFilters) => void, onReset: () => void }) {
    const [tier, setTier] = useState('');
    const [minRating, setMinRating] = useState('');
    const [maxRanking, setMaxRanking] = useState('');

    const handleApply = () => {
        const f: SaleAgentFilters = {};
        
        if (tier && tier !== "") {
            f.agentTiers = [tier]; 
        }
        
        if (minRating) {
            const val = Number(minRating);
            if (!isNaN(val) && val >= 0) f.minAvgRating = val;
        }
        
        if (maxRanking) {
            const val = Number(maxRanking);
            if (!isNaN(val) && val > 0) f.maxRanking = val;
        }
        
        onApply(f);
    };

    const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
        const val = e.target.value;
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            setter(val);
        }
    };

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Agent Tier</label>
                    <div className="relative">
                        <select 
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm appearance-none focus:border-red-500 outline-none bg-gray-50 cursor-pointer"
                            value={tier}
                            onChange={(e) => setTier(e.target.value)}
                        >
                            <option value="">All Tiers</option>
                            <option value="PLATINUM">Platinum</option>
                            <option value="GOLD">Gold</option>
                            <option value="SILVER">Silver</option>
                            <option value="MEMBER">Member</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"/>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Min Rating (0-5)</label>
                    <input 
                        type="text"                   
                        placeholder="e.g. 4.0" 
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-500 outline-none"
                        value={minRating}
                        onChange={(e) => handleNumberInput(e, setMinRating)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Max Ranking</label>
                    <input 
                        type="text" 
                        placeholder="e.g. 10" 
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-500 outline-none"
                        value={maxRanking}
                        onChange={(e) => handleNumberInput(e, setMaxRanking)}
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                    onClick={() => {
                        setTier(''); setMinRating(''); setMaxRanking('');
                        onReset();
                    }}
                    className="px-4 py-2 border border-gray-300 bg-white text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                    <RotateCcw className="w-3 h-3" /> Reset
                </button>
                <button 
                    onClick={handleApply}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 flex items-center gap-2 shadow-sm transition-colors"
                >
                    <Check className="w-3 h-3" /> Apply
                </button>
            </div>
        </div>
    );
}