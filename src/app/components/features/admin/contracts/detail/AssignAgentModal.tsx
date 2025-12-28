'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, Star, Briefcase } from 'lucide-react';
import { assignmentService, FreeAgentListItem, FreeAgentFilters } from '@/lib/api/services/assignment.service';
import Badge from '@/app/components/ui/Badge';

interface AssignAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (agent: FreeAgentListItem) => void;
}

export default function AssignAgentModal({ isOpen, onClose, onSelect }: AssignAgentModalProps) {
    const [agents, setAgents] = useState<FreeAgentListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchFreeAgents();
        }
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen) fetchFreeAgents();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchFreeAgents = async () => {
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Assign Sales Agent</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or employee code..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>
                    ) : agents.length > 0 ? (
                        agents.map((agent) => (
                            <div key={agent.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer group" onClick={() => onSelect(agent)}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 border border-gray-300 overflow-hidden">
                                        {agent.avatarUrl ? <img src={agent.avatarUrl} className="w-full h-full object-cover" /> : agent.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-900 text-sm">{agent.fullName}</p>
                                            <Badge variant="default" className="text-[10px]">{agent.employeeCode}</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            {agent.tier && <Badge variant="pink" className="text-[10px] py-0">{agent.tier}</Badge>}
                                            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> Handling: {agent.currentlyHandling || 0}</span>
                                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-orange-500" /> Rank: {agent.ranking}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-lg group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-colors">
                                    Select
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500">No available agents found.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-100">Cancel</button>
                </div>
            </div>
        </div>
    );
}