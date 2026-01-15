'use client';

import React from 'react';
import Link from 'next/link'; 
import { Phone, MessageCircle, ExternalLink, RefreshCw } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import InfoCard from '@/app/components/InfoCard'; 

interface ContactCardProps {
    title: string;
    name: string;
    userId?: string; 
    avatar?: string;
    tier: string;
    phone: string;
    isAgent?: boolean; 
    onChange?: () => void;
    onRemove?: () => void;
}

export default function ContactCard({ 
    title, name, userId, avatar, tier, phone, 
    isAgent = false, onChange, onRemove 
}: ContactCardProps) {

    const accountLink = isAgent 
        ? `/admin/agents/${userId}` 
        : `/admin/owners/${userId}`;

    return (
        <InfoCard title={title}>
            <div className="flex items-center gap-3 mb-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
                    <img 
                        src={avatar || `https://ui-avatars.com/api/?name=${name}&background=random`} 
                        alt={name} 
                        className="w-full h-full object-cover"
                    />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
                        <Badge variant={tier === 'PLATINUM' ? 'pink' : 'gold'} className="text-[10px] px-1.5 py-0">
                            {tier}
                        </Badge>
                    </div>
                    
                    {/* Link View Account */}
                    {userId ? (
                        <Link 
                            href={accountLink} 
                            className="text-xs text-red-600 hover:underline flex items-center gap-1 mt-0.5 font-medium w-fit"
                        >
                            View account <ExternalLink className="w-3 h-3" />
                        </Link>
                    ) : (
                        <span className="text-xs text-gray-400 mt-0.5 block">No account linked</span>
                    )}
                </div>
            </div>

            {/* Contact Buttons */}
            <div className="space-y-2">
                <button className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    Contact Zalo
                </button>
                <button className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors">
                    <Phone className="w-4 h-4" />
                    {phone}
                    <span className="font-normal opacity-80 text-xs ml-1">View all</span>
                </button>

                {/* --- AGENT ACTIONS (Change Agent) --- */}
                {isAgent && (
                    <div className="flex gap-2 mt-2 pt-3 border-t border-gray-100">
                        <button 
                            onClick={onChange}
                            className="flex-1 py-1.5 px-2 bg-blue-50 text-blue-700 rounded-md text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-100 transition-colors"
                        >
                            <RefreshCw className="w-3 h-3" /> Change
                        </button>
                    </div>
                )}
            </div>
        </InfoCard>
    );
}