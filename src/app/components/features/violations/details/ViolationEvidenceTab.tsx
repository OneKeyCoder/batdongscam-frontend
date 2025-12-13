import React from 'react';
import { Eye, Download, FileText } from 'lucide-react';

const ImageCard = ({ title, src }: any) => (
    <div className="bg-white border border-gray-200 rounded-xl p-3">
        <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
            {/* Placeholder Image Icon */}
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <p className="text-xs font-bold text-gray-900 mb-3 truncate">{title}</p>
        <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-1 py-1.5 border border-gray-300 rounded text-[10px] font-bold text-gray-600 hover:bg-gray-50"><Eye className="w-3 h-3"/> View</button>
            <button className="flex items-center justify-center gap-1 py-1.5 border border-gray-300 rounded text-[10px] font-bold text-gray-600 hover:bg-gray-50"><Download className="w-3 h-3"/> Download</button>
        </div>
    </div>
)

const DocItem = ({ name }: any) => (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded text-red-600"><FileText className="w-4 h-4"/></div>
            <span className="text-sm font-medium text-gray-700">{name}</span>
        </div>
        <div className="flex gap-2">
             <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-600 hover:bg-gray-50"><Eye className="w-3 h-3"/> View</button>
             <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-600 hover:bg-gray-50"><Download className="w-3 h-3"/> Download</button>
        </div>
    </div>
)

export default function ViolationEvidenceTab() {
  return (
    <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ImageCard title="Fake listing photo - Ocean view" />
                <ImageCard title="Actual property photo - No ocean" />
                <ImageCard title="Advertised interior with marble" />
                <ImageCard title="Actual interior with old tiles" />
            </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">Document</h3>
            <div className="space-y-3">
                <DocItem name="Evidence1.pdf" />
                <DocItem name="Evidence1.pdf" />
                <DocItem name="Evidence1.pdf" />
            </div>
        </div>
    </div>
  );
}