import React from 'react';
import { AlertTriangle, Calendar, Save, XCircle } from 'lucide-react';

export default function ViolationResolutionTab() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-6">Resolution details</h3>
        
        <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
                <label className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Current status</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm font-medium">
                    <option>UNDER REVIEW</option>
                    <option>RESOLVED</option>
                    <option>DISMISSED</option>
                </select>
            </div>
            <div>
                <label className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3"/> Last modified at</label>
                <p className="font-bold text-gray-900 py-2">January 2nd, 2022 - 7:00PM</p>
            </div>
        </div>

        <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea 
                className="w-full h-32 border border-gray-300 rounded-xl p-4 bg-gray-50 text-sm focus:outline-none focus:border-red-500 resize-none"
                placeholder="I am very sorry for the ...."
            ></textarea>
        </div>

        <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">
                <Save className="w-4 h-4" /> Save
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg transition-colors">
                <XCircle className="w-4 h-4" /> Dismiss
            </button>
        </div>
    </div>
  );
}