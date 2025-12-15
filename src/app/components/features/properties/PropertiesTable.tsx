import React from 'react';
import Link from 'next/link';
import { Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Badge from '@/app/components/ui/Badge'; 

// Mock data 
const mockProperties = Array(10).fill(null).map((_, index) => ({
    id: index + 1,
    image: 'https://placehold.co/60x60/e2e8f0/e2e8f0', 
    name: "Property's Name",
    area: '120 m²',
    price: '541,00.00 $',
    address: 'District 7, Tân Phú Ward',
    type: 'House',
    transaction: 'Sale',
    status: 'Sold',
    location: 'Hồ Chí Minh',
    owner: { name: 'Nguyễn Văn A', tier: 'GOLD' },
    agent: index % 2 === 0 ? { name: 'Nguyễn Văn A', tier: 'GOLD' } : null, 
}));


export default function PropertiesTable() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">Property</th>
              <th scope="col" className="px-6 py-4 font-medium">Type</th>
              <th scope="col" className="px-6 py-4 font-medium">Transaction</th>
              <th scope="col" className="px-6 py-4 font-medium">Status</th>
              <th scope="col" className="px-6 py-4 font-medium">Location</th>
              <th scope="col" className="px-6 py-4 font-medium">Owner</th>
              <th scope="col" className="px-6 py-4 font-medium">Sales Agent</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockProperties.map((item) => (
              <tr key={item.id} className="bg-white hover:bg-gray-50 transition-colors">
                {/* Property Info Col */}
                <td className="px-6 py-4 flex items-center gap-4">
                  <img src={item.image} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-200" />
                  <div>
                    <p className="font-bold text-gray-900 mb-0.5">{item.name}</p>
                    <p className="text-xs mb-0.5">{item.area}</p>
                    <p className="text-red-600 font-bold mb-0.5">{item.price}</p>
                    <p className="text-xs text-gray-400">{item.address}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900">{item.type}</td>
                <td className="px-6 py-4">
                  <Badge variant="danger">{item.transaction}</Badge>
                </td>
                 <td className="px-6 py-4">
                  <Badge variant="success">{item.status}</Badge>
                </td>
                <td className="px-6 py-4 text-gray-900 font-medium">{item.location}</td>
                {/* Owner Col */}
                <td className="px-6 py-4">
                    <p className="text-gray-900 font-medium">{item.owner.name}</p>
                    <Badge variant="gold" className="mt-1">{item.owner.tier}</Badge>
                </td>
                 {/* Agent Col */}
                <td className="px-6 py-4">
                    {item.agent ? (
                        <>
                            <p className="text-gray-900 font-medium">{item.agent.name}</p>
                            <Badge variant="gold" className="mt-1">{item.agent.tier}</Badge>
                        </>
                    ) : (
                        <span className="text-gray-400">---</span>
                    )}

                </td>
                <td className="px-6 py-4 text-right">
                    <Link href={`/admin/properties/${item.id}`} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg inline-flex items-center justify-center transition-colors" title="View Details">
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