'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import Badge from '@/app/components/ui/Badge';
import { assignmentService, FreeAgentListItem, FreeAgentFilters } from '@/lib/api/services/assignment.service';
import { getFullUrl } from '@/lib/utils/urlUtils';

interface ChangeAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (agent: FreeAgentListItem) => void;
}

export default function ChangeAgentModal({ isOpen, onClose, onSelect }: ChangeAgentModalProps) {
    // State
    const [agents, setAgents] = useState<FreeAgentListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Debounce search
    useEffect(() => {
        if (!isOpen) return;

        const fetchAgents = async () => {
            setLoading(true);
            try {
                const filters: FreeAgentFilters = {
                    page: 1,
                    limit: 20, 
                    agentNameOrCode: searchTerm,
                    sortType: 'desc',
                    sortBy: 'ranking' 
                };

                const res = await assignmentService.getFreeAgents(filters);
                setAgents(res.data);
            } catch (error) {
                console.error("Failed to fetch free agents", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchAgents, 500); 
        return () => clearTimeout(timer);
    }, [isOpen, searchTerm]);

    const getTierVariant = (tier?: string) => {
        switch (tier?.toUpperCase()) {
            case 'PLATINUM': return 'pink';  
            case 'GOLD': return 'gold';       
            case 'SILVER': return 'default';   
            case 'BRONZE': return 'warning';   
            default: return 'default';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Select Sales Agent">
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search agent by name or code..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Agent List / Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden h-96 flex flex-col">
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="bg-gray-50 text-xs text-gray-700 uppercase sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3">Agent</th>
                                    <th className="px-4 py-3 text-center">Tier</th>
                                    <th className="px-4 py-3 text-center">Assignments</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="py-10 text-center">
                                            <div className="flex justify-center"><Loader2 className="w-6 h-6 text-red-600 animate-spin" /></div>
                                        </td>
                                    </tr>
                                ) : agents.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-10 text-center text-gray-400">No agents found.</td>
                                    </tr>
                                ) : (
                                    agents.map((agent) => (
                                        <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                                        <img
                                                            src={getFullUrl(agent.avatarUrl)}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${agent.fullName}` }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 line-clamp-1">{agent.fullName}</p>
                                                        <p className="text-[10px] text-red-600 font-mono">{agent.employeeCode}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant={getTierVariant(agent.tier) as any} className="text-[10px] px-1.5">{agent.tier || 'MEMBER'}</Badge>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-gray-700 text-center">
                                                {agent.currentlyHandling || 0}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors shadow-sm"
                                                    onClick={() => {
                                                        onSelect(agent); // Trả agent ra ngoài
                                                        onClose();
                                                    }}
                                                >
                                                    Select
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Modal>
    );
}