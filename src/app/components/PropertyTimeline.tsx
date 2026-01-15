'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Calendar, Info, Loader2 } from 'lucide-react';
import { propertyService, PropertyContractHistoryDatapoint } from '@/lib/api/services/property.service';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PropertyTimelineProps {
    propertyId: string;
}

export default function PropertyTimeline({ propertyId }: PropertyTimelineProps) {
    const [historyData, setHistoryData] = useState<PropertyContractHistoryDatapoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!propertyId) return;
            try {
                const data = await propertyService.getPropertyContractHistory(propertyId, true);
                setHistoryData(data);
            } catch (error) {
                console.error("Failed to fetch contract history", error);
                setHistoryData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [propertyId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
            case 'RENTED':
                return '#dc2626'; 
            case 'COMPLETED':
            case 'EXPIRED':
            case 'LIQUIDATED':
                return '#94a3b8'; 
            case 'DEPOSITED':
            case 'WAITING_OFFICIAL':
                return '#f97316'; 
            default:
                return '#3b82f6'; 
        }
    };

    const getStatusTailwindColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
            case 'RENTED':
                return 'bg-red-600';
            case 'COMPLETED':
            case 'EXPIRED':
            case 'LIQUIDATED':
                return 'bg-gray-400';
            case 'DEPOSITED':
            case 'WAITING_OFFICIAL':
                return 'bg-orange-500';
            default:
                return 'bg-blue-500';
        }
    };

    const series = [
        {
            name: 'Contracts',
            data: historyData.map(item => ({
                x: 'Occupancy',
                y: [
                    new Date(item.startDate).getTime(),
                    new Date(item.endDate).getTime()
                ],
                fillColor: getStatusColor(item.status),
                meta: item 
            }))
        }
    ];

    const options: ApexCharts.ApexOptions = {
        chart: {
            type: 'rangeBar',
            height: 180,
            fontFamily: 'inherit',
            animations: { enabled: true },
            zoom: { enabled: false }, 
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '50%',
                rangeBarGroupRows: true,
                borderRadius: 6
            }
        },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeFormatter: {
                    year: 'yyyy',
                    month: "MMM",
                    day: 'dd MMM',
                },
                style: { colors: '#64748b', fontSize: '12px' }
            },
            tooltip: { enabled: false },
        },
        yaxis: { show: false },
        grid: {
            borderColor: '#f1f5f9',
            padding: { top: 0, right: 0, bottom: 0, left: 10 }
        },
        fill: { type: 'solid', opacity: 1 },
        tooltip: {
            // [QUAN TRỌNG] Tooltip custom: Bỏ tên, chỉ hiện Status + Time
            custom: function ({ series, session, seriesIndex, dataPointIndex, w }) {
                const data = w.config.series[seriesIndex].data[dataPointIndex];
                const meta = data.meta as PropertyContractHistoryDatapoint;

                const start = new Date(meta.startDate).toLocaleDateString('vi-VN');
                const end = new Date(meta.endDate).toLocaleDateString('vi-VN');
                const statusClass = getStatusTailwindColor(meta.status);

                return `
          <div class="px-4 py-3 bg-white border border-gray-100 shadow-xl rounded-xl text-sm min-w-[180px]">
            <div class="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full ${statusClass}"></span>
              <span>${meta.status}</span>
            </div>
            <div class="text-gray-600 pt-2 border-t border-gray-100 flex items-center gap-2 text-xs">
              <span class="font-medium text-gray-900">${start}</span>
              <span class="text-gray-400">→</span>
              <span class="font-medium text-gray-900">${end}</span>
            </div>
          </div>
        `;
            }
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[240px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-red-600" />
                    Rental Timeline
                </h2>

                <div className="flex gap-4 text-xs font-medium text-gray-600">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Past
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Active
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Future
                    </div>
                </div>
            </div>

            {/* Container cuộn ngang và ẩn thanh cuộn */}
            <div className="relative w-full overflow-x-auto pb-2 scrollbar-hide">
                <div className="min-w-[600px] md:min-w-full">
                    {historyData.length > 0 ? (
                        <Chart
                            options={options}
                            series={series}
                            type="rangeBar"
                            height={160}
                            width="100%"
                        />
                    ) : (
                        <div className="h-[160px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <p className="text-gray-500 flex items-center gap-2 text-sm">
                                <Info className="w-4 h-4" />
                                No rental history available
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}