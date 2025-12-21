'use client';

import React, { useState } from 'react';
import { Building, Search, Eye, MapPin, Calendar, Clock } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Link from 'next/link';

// Mock data for search history / viewed properties
const mockProperties = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    title: 'Modern Villa with Pool',
    price: '$850,000',
    address: 'District 7, Ho Chi Minh City',
    type: 'Sale',
    status: 'Available',
    viewedAt: '2024-01-15 14:30',
    viewCount: 3,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    title: 'Luxury Apartment Downtown',
    price: '$1,200/month',
    address: 'District 1, Ho Chi Minh City',
    type: 'Rent',
    status: 'Available',
    viewedAt: '2024-01-14 10:15',
    viewCount: 5,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
    title: 'Family House with Garden',
    price: '$650,000',
    address: 'Thu Duc City, Ho Chi Minh',
    type: 'Sale',
    status: 'Pending',
    viewedAt: '2024-01-13 16:45',
    viewCount: 2,
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    title: 'Cozy Studio Near Park',
    price: '$450/month',
    address: 'Binh Thanh District',
    type: 'Rent',
    status: 'Rented',
    viewedAt: '2024-01-12 09:00',
    viewCount: 1,
  },
];

export default function CustomerPropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'Sale' | 'Rent'>('all');

  const filteredProperties = mockProperties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || p.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building className="w-6 h-6 text-red-600" />
          My Properties
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Properties you've viewed and search history
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('Sale')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'Sale' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            For Sale
          </button>
          <button
            onClick={() => setFilter('Rent')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'Rent' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            For Rent
          </button>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Property</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Last Viewed</th>
                <th className="px-6 py-4 font-medium">Views</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                  {/* Property Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={property.image} 
                        alt={property.title}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{property.title}</p>
                        <p className="text-red-600 font-bold text-sm">{property.price}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {property.address}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={property.type === 'Sale' ? 'danger' : 'info'}>
                      {property.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      variant={
                        property.status === 'Available' ? 'success' : 
                        property.status === 'Pending' ? 'warning' : 
                        'default'
                      }
                    >
                      {property.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <Clock className="w-3 h-3" />
                      {property.viewedAt}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-medium">{property.viewCount}x</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/property/${property.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Building className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filter</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">1-{filteredProperties.length}</span> of <span className="font-medium">{filteredProperties.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-white disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium">
              1
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-white disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
