import React from 'react';
import { Trophy, Target, Home, Calendar, Briefcase, FileSignature, Star, Smile } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, subValue }: any) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between h-full min-h-[90px]">
        <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">{label}</span>
        </div>
        <div>
            <span className="text-lg font-bold text-red-600 block">{value}</span>
            {subValue && <span className="text-xs text-gray-400">({subValue})</span>}
        </div>
    </div>
);

export default function AgentPerformanceTab() {
  return (
    <div className="space-y-8">
        
        {/* SECTION 1: Current Month */}
        <div>
            <h3 className="font-bold text-gray-900 mb-4 text-sm">Current month performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Trophy} label="Performance points" value="95" />
                <StatCard icon={Target} label="Ranking position" value="# 2" />
                <StatCard icon={Home} label="Assigned properties" value="24" />
                <StatCard icon={Calendar} label="Assigned appointments" value="24" />
                <StatCard icon={Briefcase} label="Currently handling" value="3" />
                <StatCard icon={Calendar} label="Appointments completed" value="24" />
                <StatCard icon={FileSignature} label="Signed contracts" value="20" />
                <StatCard icon={Star} label="Average Rating" value="4.8" subValue="172" />
                <StatCard icon={Smile} label="Customer Satisfaction" value="96.2%" />
            </div>
        </div>

        {/* SECTION 2: All Career */}
        <div>
            <h3 className="font-bold text-gray-900 mb-4 text-sm">All career performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <StatCard icon={Trophy} label="Performance points" value="95" />
                <StatCard icon={Target} label="Ranking position" value="# 2" />
                <StatCard icon={Home} label="Assigned properties" value="24" />
                <StatCard icon={Calendar} label="Assigned appointments" value="24" />
                <StatCard icon={Calendar} label="Appointments completed" value="24" />
                <StatCard icon={FileSignature} label="Signed contracts" value="20" />
                <StatCard icon={Star} label="Average Rating" value="4.8" subValue="172" />
                <StatCard icon={Smile} label="Customer Satisfaction" value="96.2%" />
            </div>
        </div>
    </div>
  );
}