'use client';

import React, { useState } from 'react';
import { Search, UserCheck } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import Badge from '@/app/components/ui/Badge';

// Mock data Agent (Thực tế bạn sẽ gọi API getSalesAgents)
const MOCK_AGENTS = [
    { id: '1', name: 'Nguyễn Văn A', code: 'SA001', tier: 'PLATINUM', phone: '0909***', avatar: '' },
    { id: '2', name: 'Trần Thị B', code: 'SA002', tier: 'GOLD', phone: '0912***', avatar: '' },
    { id: '3', name: 'Lê Văn C', code: 'SA003', tier: 'SILVER', phone: '0934***', avatar: '' },
    { id: '4', name: 'Phạm Thị D', code: 'SA004', tier: 'PLATINUM', phone: '0945***', avatar: '' },
    { id: '5', name: 'Hoàng Văn E', code: 'SA005', tier: 'GOLD', phone: '0956***', avatar: '' },
];

interface AgentSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (agentId: string) => void;
}

export default function AgentSelectorModal({ isOpen, onClose, onSelect }: AgentSelectorModalProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAgents = MOCK_AGENTS.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Select Sales Agent">
            <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search by name or code..." 
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* List */}
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2">
                    {filteredAgents.map(agent => (
                        <div key={agent.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                    <img src={`https://ui-avatars.com/api/?name=${agent.name}`} alt={agent.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{agent.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-gray-500">{agent.code}</span>
                                        <Badge variant="gold" className="text-[9px] px-1 py-0">{agent.tier}</Badge>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => onSelect(agent.id)}
                                className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-md hover:bg-red-700 flex items-center gap-1"
                            >
                                <UserCheck className="w-3 h-3" /> Select
                            </button>
                        </div>
                    ))}
                    {filteredAgents.length === 0 && <p className="text-center text-sm text-gray-400 py-4">No agents found.</p>}
                </div>
            </div>
        </Modal>
    );
}