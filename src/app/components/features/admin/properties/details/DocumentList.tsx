'use client'; 

import React from 'react';
import { FileText, Download } from 'lucide-react';

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

  const handleDownload = (doc: Document) => {
    // Create a temporary anchor to force download
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.name || 'document';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Attached Documents</h2>
      <div className="space-y-3">
        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={() => handleDownload(doc)}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50/50 transition-colors cursor-pointer text-left"
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
            
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-xs text-gray-500">Click to download</span>
              <Download className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}