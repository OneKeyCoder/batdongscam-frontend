import React from 'react';
import { Phone, MessageCircle, ExternalLink } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import InfoCard from '@/app/components/InfoCard'; 

interface ContactCardProps {
  title: string;
  name: string;
  avatar?: string;
  tier: string;
  phone: string;
}

export default function ContactCard({ title, name, avatar, tier, phone }: ContactCardProps) {
  return (
    <InfoCard title={title}>
      <div className="flex items-center gap-3 mb-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
            {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover"/> : null}
        </div>
        
        {/* Info */}
        <div>
            <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900">{name}</p>
                <Badge variant={tier === 'PLATINUM' ? 'pink' : 'gold'}>{tier}</Badge>
            </div>
            <button className="text-xs text-red-600 hover:underline flex items-center gap-1 mt-0.5">
                View account <ExternalLink className="w-3 h-3" />
            </button>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            Contact Zalo
        </button>
        <button className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" />
            {phone}
            <span className="font-normal opacity-80 text-xs ml-1">View all</span>
        </button>
      </div>
    </InfoCard>
  );
}