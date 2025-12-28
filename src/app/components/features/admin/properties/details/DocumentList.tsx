'use client'; 

import React from 'react';
import { FileText, Download, Eye } from 'lucide-react';

interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  url: string;
}

interface DocumentListProps {
  documents?: Document[];
}

export default function DocumentList({ documents }: DocumentListProps) {
  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Attached Documents</h2>
      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate" title={doc.name}>{doc.name}</p>
                <p className="text-sm text-gray-500">
                  {doc.type} • {doc.size}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Nút Xem (Mắt) - Mở tab mới */}
              <button 
                onClick={() => window.open(doc.url, '_blank', 'noopener,noreferrer')}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Preview"
              >
                <Eye className="w-5 h-5" />
              </button>
               
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}