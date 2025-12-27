'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, User, Briefcase, Loader2, Star, UserPlus } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import { ContractDetailResponse } from '@/lib/api/services/contract.service';
import { assignmentService, FreeAgentListItem } from '@/lib/api/services/assignment.service';
import AssignAgentModal from './AssignAgentModal';

interface Props {
    data: ContractDetailResponse;
    onReload?: () => void;
}

// Interface thống nhất cho việc hiển thị Agent trên Card
interface AgentDisplayState {
    id: string;
    fullName: string;
    employeeCode: string;
    phone: string;
    tier?: string;
    rating?: number;
}

export default function PartiesTab({ data, onReload }: Props) {
    const router = useRouter();

    // State quản lý Agent hiển thị
    // Nếu null -> Hiện nút Assign
    // Nếu có object -> Hiện thông tin Agent
    const [currentAgent, setCurrentAgent] = useState<AgentDisplayState | null>(null);

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    // 1. Sync dữ liệu từ API vào State khi mới load trang
    useEffect(() => {
        if (data.agentId) {
            setCurrentAgent({
                id: data.agentId,
                fullName: `${data.agentFirstName} ${data.agentLastName}`,
                employeeCode: data.agentEmployeeCode,
                phone: data.agentPhone || '---',
            });
        } else {
            setCurrentAgent(null);
        }
    }, [data]);

    // --- ACTIONS ---

    const handleViewAccount = (role: 'AGENT' | 'CUSTOMER' | 'OWNER', id: string) => {
        if (!id) return;
        if (role === 'AGENT') router.push(`/admin/agents/${id}`);
        else if (role === 'OWNER') router.push(`/admin/property-owners/${id}`);
        else router.push(`/admin/customers/${id}`);
    };

    // 2. Remove Agent
    const handleRemoveAgent = async () => {
        if (!confirm("Are you sure you want to remove this agent?")) return;

        setLoadingAction(true);
        try {
            await assignmentService.assignAgent(null, data.propertyId, 'PROPERTY' as any);

            setCurrentAgent(null);

            await new Promise(r => setTimeout(r, 500));
            alert("Agent removed successfully.");

        } catch (error) {
            console.error(error);
            alert("Failed to remove agent.");
        } finally {
            setLoadingAction(false);
        }
    };

    // 3. Select/Change Agent
    const handleSelectAgent = async (agent: FreeAgentListItem) => {
        setLoadingAction(true);
        try {
            await assignmentService.assignAgent(agent.id, data.propertyId, 'PROPERTY' as any);

            setCurrentAgent({
                id: agent.id,
                fullName: agent.fullName,
                employeeCode: agent.employeeCode || '---',
                phone: 'Updating...',
                tier: agent.tier,
                rating: agent.ranking 
            });

            setIsAssignModalOpen(false);
            await new Promise(r => setTimeout(r, 500));
            alert(`Assigned ${agent.fullName} successfully!`);

        } catch (error) {
            console.error(error);
            alert("Failed to assign agent.");
        } finally {
            setLoadingAction(false);
        }
    };

    // --- CARD COMPONENT ---
    const PartyCard = ({ title, roleType, user, isAgent = false }: any) => {
        if (isAgent && !user) {
            return (
                <div className="bg-gray-50 border border-gray-300 border-dashed rounded-xl p-6 flex flex-col items-center justify-center h-full text-center min-h-[200px] hover:border-red-300 hover:bg-red-50 transition-all group">
                    <div className="w-14 h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-3 group-hover:border-red-200 transition-colors">
                        <UserPlus className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
                    <p className="text-xs text-gray-500 mb-4 mt-1">No agent assigned.</p>
                    <button
                        onClick={() => setIsAssignModalOpen(true)}
                        disabled={loadingAction}
                        className="px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                        {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                        Assign Agent
                    </button>
                </div>
            );
        }

        const displayName = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
        const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

        return (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col h-full hover:border-red-200 transition-all relative">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        {isAgent ? <Briefcase className="w-4 h-4 text-gray-500" /> : <User className="w-4 h-4 text-gray-500" />}
                        {title}
                    </h4>
                    {isAgent && (
                        <div className="flex items-center gap-1 text-orange-500 font-bold text-xs bg-orange-50 px-2 py-1 rounded-full">
                            <Star className="w-3 h-3 fill-orange-500" /> {user?.rating || '4.8'}
                        </div>
                    )}
                </div>

                {/* Info Body */}
                <div className="flex gap-4 mb-4 items-start">
                    <div className="w-14 h-14 rounded-full bg-gray-100 shrink-0 overflow-hidden border border-gray-200 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-500">{initial}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate mb-1" title={displayName}>
                            {displayName}
                        </p>
                        {user?.employeeCode && <Badge variant="default" className="text-[10px] mb-2">{user.employeeCode}</Badge>}
                        {user?.tier && <Badge variant="pink" className="text-[10px] mb-2 ml-2">{user.tier}</Badge>}

                        <div className="space-y-1.5">
                            <p className="text-xs text-gray-500 flex items-center gap-2 truncate">
                                <Phone className="w-3 h-3 text-gray-400" /> {user?.phone || '---'}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-2 truncate" title={user?.email}>
                                <Mail className="w-3 h-3 text-gray-400" /> {user?.email || '---'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-auto pt-4 border-t border-gray-50 flex gap-2">
                    {isAgent ? (
                        <>
                            <button
                                onClick={handleRemoveAgent}
                                disabled={loadingAction}
                                className="flex-1 py-1.5 border border-red-200 text-red-600 text-[10px] font-bold rounded hover:bg-red-50 transition-colors flex justify-center items-center gap-1 whitespace-nowrap"
                            >
                                {loadingAction ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Remove'}
                            </button>
                            <button
                                onClick={() => setIsAssignModalOpen(true)}
                                disabled={loadingAction}
                                className="flex-1 py-1.5 border border-red-200 text-red-600 text-[10px] font-bold rounded hover:bg-red-50 transition-colors whitespace-nowrap"
                            >
                                Change
                            </button>
                            <button
                                onClick={() => handleViewAccount('AGENT', user?.id)}
                                className="flex-1 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded hover:bg-red-700 transition-colors whitespace-nowrap"
                            >
                                View
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => handleViewAccount(roleType, user?.id)}
                            className="w-full py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
                        >
                            View Account
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. PROPERTY OWNER */}
                <PartyCard
                    title="Property Owner"
                    roleType="OWNER"
                    user={{
                        id: data.ownerId,
                        firstName: data.ownerFirstName,
                        lastName: data.ownerLastName,
                        phone: data.ownerPhone,
                    }}
                />

                {/* 2. CUSTOMER */}
                <PartyCard
                    title="Customer"
                    roleType="CUSTOMER"
                    user={{
                        id: data.customerId,
                        firstName: data.customerFirstName,
                        lastName: data.customerLastName,
                        phone: data.customerPhone,
                        email: data.customerEmail
                    }}
                />

                {/* 3. SALES AGENT */}
                <PartyCard
                    title="Sales Agent"
                    roleType="AGENT"
                    isAgent={true}
                    user={currentAgent}
                />
            </div>

            {/* Modal Selection */}
            <AssignAgentModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onSelect={handleSelectAgent}
            />
        </>
    );
}