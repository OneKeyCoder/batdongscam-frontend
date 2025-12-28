'use client';
import React from 'react';
import { Eye, Download, FileText } from 'lucide-react';
import { ViolationAdminDetails } from '@/lib/api/services/violation.service';

interface Props {
    data: ViolationAdminDetails;
}

const ImageCard = ({ src }: any) => (
    <div className="bg-white border border-gray-200 rounded-xl p-3">
        <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
            <img src={src} className="w-full h-full object-cover" alt="Evidence" />
        </div>
        <div className="grid grid-cols-2 gap-2">
            <a href={src} target="_blank" className="flex items-center justify-center gap-1 py-1.5 border border-gray-300 rounded text-[10px] font-bold text-gray-600 hover:bg-gray-50"><Eye className="w-3 h-3" /> View</a>
        </div>
    </div>
)

const DocItem = ({ url }: any) => (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded text-red-600"><FileText className="w-4 h-4" /></div>
            <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{url.split('/').pop()}</span>
        </div>
        <a href={url} target="_blank" className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-600 hover:bg-gray-50"><Download className="w-3 h-3" /> Download</a>
    </div>
)

export default function ViolationEvidenceTab({ data }: Props) {
    return (
        <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-4">Images ({data.imageUrls?.length || 0})</h3>
                {data.imageUrls?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {data.imageUrls.map((url, i) => <ImageCard key={i} src={url} />)}
                    </div>
                ) : <p className="text-sm text-gray-500 italic">No images provided.</p>}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-4">Documents ({data.documentUrls?.length || 0})</h3>
                <div className="space-y-3">
                    {data.documentUrls?.length > 0 ? (
                        data.documentUrls.map((url, i) => <DocItem key={i} url={url} />)
                    ) : <p className="text-sm text-gray-500 italic">No documents provided.</p>}
                </div>
            </div>
        </div>
    );
}