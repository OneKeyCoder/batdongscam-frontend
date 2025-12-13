import React from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

const violations = Array(10).fill(null).map((_, i) => ({
    id: i + 1,
    reporter: "User's Name",
    reported: i % 2 === 0 ? "User's Name" : "Property's Name",
    type: i === 0 ? "SCAM ATTEMPT" : "SPAM OR DUPLICATE LISTING",
    status: i === 0 ? "Reported" : "Resolved",
    desc: "Hello 123 123 123...",
    date: "7:00 PM January 2nd, 2025"
}));

export default function ViolationTable() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900">Reporter</th>
              <th className="px-6 py-4 font-bold text-gray-900">Reported</th>
              <th className="px-6 py-4 font-bold text-gray-900">Violation type</th>
              <th className="px-6 py-4 font-bold text-gray-900">Status</th>
              <th className="px-6 py-4 font-bold text-gray-900">Description</th>
              <th className="px-6 py-4 font-bold text-gray-900">Reported at</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {violations.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-200 shrink-0"></div>
                        <span className="font-medium text-gray-900">{item.reporter}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-200 shrink-0"></div>
                        <span className="font-medium text-gray-900">{item.reported}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <Badge variant={item.type === 'SCAM ATTEMPT' ? 'scam' : 'spam'}>
                        {item.type}
                    </Badge>
                </td>
                <td className="px-6 py-4">
                    <Badge variant={item.status === 'Reported' ? 'reported' : 'resolved'}>
                        {item.status}
                    </Badge>
                </td>
                <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">{item.desc}</td>
                <td className="px-6 py-4 text-gray-900 font-medium w-[180px]">{item.date}</td>
                <td className="px-6 py-4 text-right">
                    <Link 
                        href={`/admin/violations/${item.id}`} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg inline-flex items-center justify-center transition-colors"
                    >
                        <Eye className="w-5 h-5" />
                    </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white text-sm text-gray-500 flex justify-between items-center">
          <span>1-10 of 97</span>
          <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center border rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center border rounded-lg bg-white text-gray-600 font-medium">1/10</button>
              <button className="w-8 h-8 flex items-center justify-center border rounded-lg bg-white text-gray-600 hover:bg-gray-50">&gt;</button>
          </div>
      </div>
    </div>
  );
}