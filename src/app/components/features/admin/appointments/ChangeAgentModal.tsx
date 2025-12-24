'use client';

import React, { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import Badge from '@/app/components/ui/Badge';
import AgentsAdvancedSearch from '@/app/components/features/admin/agents/AgentsAdvancedSearch'; 

interface ChangeAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const agents = Array(5).fill(null).map((_, i) => ({
    id: i + 1, name: "Agent's Name", code: "#1 SA0123", point: "95", tier: "PLATINUM",
    assignments: "16", contracts: "15", rating: "4.8"
}));

export default function ChangeAgentModal({ isOpen, onClose }: ChangeAgentModalProps) {
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Sales Agent">
       <div className="space-y-4">
           {/* Search Bar trong Modal */}
           <div className="flex gap-2">
               <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                   <input type="text" placeholder="Agent's name or code" className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500"/>
               </div>
               <button 
                  onClick={() => setIsAdvSearchOpen(!isAdvSearchOpen)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 text-sm"
               >
                   Advanced Search
               </button>
               <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">Search</button>
           </div>

           {isAdvSearchOpen && (
               <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 h-60 overflow-y-auto">
                   <AgentsAdvancedSearch 
                        onOpenLocationPicker={() => {}} 
                        onApply={() => {}} 
                        onReset={() => {}} 
                   />
               </div>
           )}

           {/* Table Select Agent */}
           <div className="border border-gray-200 rounded-lg overflow-hidden">
               <table className="w-full text-sm text-left text-gray-500">
                   <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                       <tr>
                           <th className="px-4 py-3">Agent</th>
                           <th className="px-4 py-3">Tier</th>
                           <th className="px-4 py-3">Assignments</th>
                           <th className="px-4 py-3 text-right">Action</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                       {agents.map((agent) => (
                           <tr key={agent.id} className="hover:bg-gray-50">
                               <td className="px-4 py-3">
                                   <p className="font-bold text-gray-900">{agent.name}</p>
                                   <p className="text-[10px] text-red-600">{agent.code}</p>
                               </td>
                               <td className="px-4 py-3"><Badge variant="pink">{agent.tier}</Badge></td>
                               <td className="px-4 py-3 font-bold text-red-600">{agent.assignments}</td>
                               <td className="px-4 py-3 text-right">
                                   <button 
                                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors"
                                      onClick={() => {
                                          console.log("Selected Agent:", agent.id);
                                          onClose();
                                      }}
                                   >
                                       Select
                                   </button>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       </div>
    </Modal>
  );
}