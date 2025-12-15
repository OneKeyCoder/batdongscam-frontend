import React from 'react';
import { FileText, Download } from 'lucide-react';
import InfoCard from '@/app/components/InfoCard'; 

export default function DocumentList() {
    const docs = [1, 2, 3, 4, 5]; // Mock data sau :)))))
    
    return (
        <InfoCard title="Attached Documents">
            <div className="space-y-2">
                {docs.map((i) => (
                    <div key={i} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-5 h-5 text-red-500 shrink-0" />
                            <span className="text-xs text-gray-600 truncate">Giấy phép kinh doanh.pdf</span>
                        </div>
                        <button className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-gray-600 hover:text-red-600 transition-colors">
                            <Download className="w-3 h-3" /> Tải xuống
                        </button>
                    </div>
                ))}
            </div>
        </InfoCard>
    )
}