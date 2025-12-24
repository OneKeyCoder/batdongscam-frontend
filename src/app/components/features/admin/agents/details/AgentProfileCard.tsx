import React from 'react';
import { Mail, Phone, MapPin, Calendar, Briefcase, Edit, Trash2, MessageSquare } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

export default function AgentProfileCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative">
      {/* Header Actions */}
      <div className="absolute top-6 right-6 flex gap-3">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors">
            <Edit className="w-3 h-3" /> Edit
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors">
            <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="shrink-0">
             <div className="w-24 h-24 rounded-full p-1 border-2 border-red-500">
                <img 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200" 
                    alt="Agent" 
                    className="w-full h-full object-cover rounded-full"
                />
             </div>
        </div>

        {/* Info */}
        <div className="flex-1">
            <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-900">Phan Đình Minh</h1>
                <p className="text-sm text-gray-500 mb-2">Code: SA0120949</p>
                <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">Active</span>
                    <Badge variant="pink">PLATINUM</Badge>
                    <span className="text-red-600 font-bold text-sm">#1</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                    <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-900">phandinhminh48@gmail.com</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                    <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="text-sm font-medium text-gray-900">+84 865 832 440</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-gray-500 shrink-0" />
                    <div>
                        <p className="text-xs text-gray-400">Zalo</p>
                        <p className="text-sm font-medium text-gray-900">0865832440</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-1" />
                    <div>
                        <p className="text-xs text-gray-400">Location</p>
                        <p className="text-sm font-medium text-gray-900">Dai Hong Ward, Dai Loc District, Quang Nam City</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                    <div>
                        <p className="text-xs text-gray-400">Hired Date</p>
                        <p className="text-sm font-medium text-gray-900">January 2nd, 2022</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-gray-500 shrink-0" />
                    <div>
                        <p className="text-xs text-gray-400">Max Properties per day</p>
                        <p className="text-sm font-medium text-gray-900">8 properties</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}