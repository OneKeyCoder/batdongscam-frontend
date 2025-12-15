import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

// Mock data 
const locations = [
    { id: 1, name: 'Hồ Chí Minh', area: '2,061', pop: '8,993,082', status: 'Active', price: '120.000.000', img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=100' },
    { id: 2, name: 'Hà Nội', area: '3,358', pop: '8,053,663', status: 'Active', price: '110.000.000', img: 'https://images.unsplash.com/photo-1555921015-5532091f6026?w=100' },
    { id: 3, name: 'Đà Nẵng', area: '1,285', pop: '1,134,310', status: 'Inactive', price: '65.000.000', img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=100' },
    { id: 4, name: 'Bình Dương', area: '2,694', pop: '2,426,561', status: 'Inactive', price: '45.000.000', img: 'https://images.unsplash.com/photo-1623866205929-7c8a666324d4?w=100' },
    { id: 5, name: 'Cần Thơ', area: '1,439', pop: '1,235,171', status: 'Active', price: '35.000.000', img: 'https://placehold.co/100x100?text=CT' },
    { id: 6, name: 'Hải Phòng', area: '1,561', pop: '2,028,514', status: 'Active', price: '50.000.000', img: 'https://placehold.co/100x100?text=HP' },
];

export default function LocationsTable() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Area (km²)</th>
              <th className="px-6 py-4 font-medium">Population</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Average land price (VNĐ/m²)</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {locations.map((loc) => (
              <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <img src={loc.img} alt={loc.name} className="w-10 h-10 rounded-lg object-cover bg-gray-200" />
                        <span className="font-bold text-gray-900">{loc.name}</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-gray-900">{loc.area}</td>
                <td className="px-6 py-4 text-gray-900">{loc.pop}</td>
                <td className="px-6 py-4">
                    <Badge variant={loc.status === 'Active' ? 'success' : 'danger'}>{loc.status}</Badge>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">{loc.price}</td>
                <td className="px-6 py-4 text-right">
                    <Link href={`/admin/locations/${loc.id}`} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg inline-flex items-center justify-center transition-colors">
                        <Eye className="w-5 h-5" />
                    </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">1-10</span> of <span className="font-medium">97</span>
          </p>
          <div className="flex items-center gap-2">
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                 <button className="p-2 border border-gray-300 rounded-lg hover:bg-white text-gray-700 font-medium">
                    1/10
                </button>
                 <button className="p-2 border border-gray-300 rounded-lg hover:bg-white">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
          </div>
      </div>
    </div>
  );
}