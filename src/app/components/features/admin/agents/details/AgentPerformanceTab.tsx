import React, { useEffect, useState } from 'react';
import { Trophy, Target, Home, Calendar, Briefcase, FileSignature, Star, Smile, Loader2 } from 'lucide-react';
import { rankingService, IndividualSalesAgentPerformanceMonth, IndividualSalesAgentPerformanceCareer } from '@/lib/api/services/ranking.service';

const StatCard = ({ icon: Icon, label, value, subValue }: any) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between h-full min-h-[90px]">
        <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">{label}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-red-600">{value}</span>
            {subValue && <span className="text-xs text-gray-400 font-medium">{subValue}</span>}
        </div>
    </div>
);

export default function AgentPerformanceTab({ agentId, month, year }: { agentId: string, month: number, year: number }) {
    const [monthData, setMonthData] = useState<IndividualSalesAgentPerformanceMonth | null>(null);
    const [careerData, setCareerData] = useState<IndividualSalesAgentPerformanceCareer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [mData, cData] = await Promise.all([
                    rankingService.getAgentMonthlyPerformance(agentId, month, year).catch(() => null),
                    rankingService.getAgentCareerPerformance(agentId).catch(() => null)
                ]);
                setMonthData(mData);
                setCareerData(cData);
            } catch (error) {
                console.error("Failed to fetch performance", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [agentId, month, year]);

    if (loading) return <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 text-red-600 animate-spin" /></div>;

    const formatSatisfaction = (val?: number) => {
        const num = val || 0;
        return num > 10 ? `${num.toFixed(1)}%` : `${num.toFixed(1)}/5`;
    };

    return (
        <div className="space-y-8">
            {/* Current Month */}
            <div>
                <h3 className="font-bold text-gray-900 mb-4 text-sm">Performance for {month}/{year}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Trophy} label="Performance points" value={monthData?.performancePoint || 0} />
                    <StatCard icon={Target} label="Ranking position" value={`# ${monthData?.rankingPosition || '-'}`} />
                    <StatCard icon={Home} label="Assigned properties" value={monthData?.monthPropertiesAssigned || 0} />
                    <StatCard icon={Calendar} label="Assigned appointments" value={monthData?.monthAppointmentsAssigned || 0} />
                    <StatCard icon={Briefcase} label="Handling Properties" value={monthData?.handlingProperties || 0} />
                    <StatCard icon={Calendar} label="Appointments completed" value={monthData?.monthAppointmentsCompleted || 0} />
                    <StatCard icon={FileSignature} label="Signed contracts" value={monthData?.monthContracts || 0} />
                    <StatCard
                        icon={Star}
                        label="Avg Rating"
                        value={monthData?.avgRating?.toFixed(1) || 0}
                        subValue={`(${monthData?.monthRates || 0} rates)`}
                    />

                    <StatCard
                        icon={Smile}
                        label="Customer Satisfaction"
                        value={formatSatisfaction(monthData?.monthCustomerSatisfactionAvg)}
                    />
                </div>
            </div>

            {/* Career */}
            <div>
                <h3 className="font-bold text-gray-900 mb-4 text-sm">All career performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Trophy} label="Total Points" value={careerData?.performancePoint || 0} />
                    <StatCard icon={Target} label="Career Ranking" value={`# ${careerData?.careerRanking || '-'}`} />
                    <StatCard icon={Home} label="Properties Assigned" value={careerData?.propertiesAssigned || 0} />
                    <StatCard icon={Calendar} label="Appointments Assigned" value={careerData?.appointmentAssigned || 0} />
                    <StatCard icon={Calendar} label="Appointments Completed" value={careerData?.appointmentCompleted || 0} />
                    <StatCard icon={FileSignature} label="Total Contracts" value={careerData?.totalContracts || 0} />

                    <StatCard
                        icon={Star}
                        label="Avg Rating"
                        value={careerData?.avgRating?.toFixed(1) || 0}
                        subValue={`(${careerData?.totalRates || 0} rates)`}
                    />

                    <StatCard
                        icon={Smile}
                        label="Avg Satisfaction"
                        value={formatSatisfaction(careerData?.customerSatisfactionAvg)}
                    />
                </div>
            </div>
        </div>
    );
}