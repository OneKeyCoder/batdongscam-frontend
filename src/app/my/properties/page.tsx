'use client';

import React, { useState } from 'react';
import { Building, Plus, Search, Eye, Edit, Trash2, Grid, List } from 'lucide-react';
import PropertyCard from '@/app/components/ui/PropertyCard';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import Link from 'next/link';

type PropertyStatus = 'Active' | 'Pending' | 'Rented' | 'Sold' | 'Inactive';
type PropertyType = 'Sale' | 'Rent';

interface Property {
  id: number;
  title: string;
  image: string;
  location: string;
  city?: string;
  price: string;
  type: PropertyType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  area: string;
  views: number;
  inquiries: number;
  createdAt: string;
}

// Mock data
const mockProperties: Property[] = [
  {
    id: 1,
    title: 'Modern Villa with Pool',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    location: 'District 7',
    city: 'Ho Chi Minh City',
    price: '$850,000',
    type: 'Sale',
    status: 'Active',
    bedrooms: 4,
    bathrooms: 3,
    area: '280 m²',
    views: 125,
    inquiries: 8,
    createdAt: '2024-01-10',
  },
  {
    id: 2,
    title: 'Luxury Apartment Downtown',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    location: 'District 1',
    city: 'Ho Chi Minh City',
    price: '$1,200/month',
    type: 'Rent',
    status: 'Rented',
    bedrooms: 2,
    bathrooms: 2,
    area: '120 m²',
    views: 89,
    inquiries: 5,
    createdAt: '2024-01-05',
  },
  {
    id: 3,
    title: 'Family House with Garden',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
    location: 'Thu Duc City',
    city: 'Ho Chi Minh',
    price: '$650,000',
    type: 'Sale',
    status: 'Active',
    bedrooms: 5,
    bathrooms: 4,
    area: '350 m²',
    views: 67,
    inquiries: 3,
    createdAt: '2024-01-15',
  },
  {
    id: 4,
    title: 'Cozy Studio Near Park',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    location: 'Binh Thanh District',
    price: '$450/month',
    type: 'Rent',
    status: 'Active',
    bedrooms: 1,
    bathrooms: 1,
    area: '45 m²',
    views: 45,
    inquiries: 2,
    createdAt: '2024-01-18',
  },
  {
    id: 5,
    title: 'Penthouse with City View',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
    location: 'District 3',
    city: 'Ho Chi Minh City',
    price: '$2,500,000',
    type: 'Sale',
    status: 'Pending',
    bedrooms: 3,
    bathrooms: 3,
    area: '200 m²',
    views: 234,
    inquiries: 15,
    createdAt: '2024-01-12',
  },
];

const statusVariants: Record<PropertyStatus, 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  Active: 'success',
  Pending: 'warning',
  Rented: 'info',
  Sold: 'default',
  Inactive: 'danger',
};

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'Sale' | 'Rent'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PropertyStatus>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteModal, setDeleteModal] = useState<Property | null>(null);

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filter === 'all' || p.type === filter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDelete = (property: Property) => {
    setDeleteModal(property);
  };

  const confirmDelete = () => {
    if (deleteModal) {
      setProperties(properties.filter(p => p.id !== deleteModal.id));
      setDeleteModal(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-6 h-6 text-red-600" />
            My Properties
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {properties.length} properties listed
          </p>
        </div>
        <Link
          href="/owner/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Property
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          />
        </div>
        
        <div className="flex items-center gap-3">
          {/* Type Filter */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('Sale')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === 'Sale' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              For Sale
            </button>
            <button
              onClick={() => setFilter('Rent')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === 'Rent' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              For Rent
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-sm"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Rented">Rented</option>
            <option value="Sold">Sold</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Properties Grid - 4 per row */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              {/* Property Card - without border */}
              <PropertyCard
                id={property.id}
                title={property.title}
                image={property.image}
                price={property.price}
                type={property.type}
                location={property.location}
                city={property.city}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                area={property.area}
                noBorder={true}
              />
              
              {/* Status, Stats and Actions Row - with horizontal divider */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                {/* Left: Status + Stats */}
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariants[property.status]}>
                    {property.status}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{property.views} views</span>
                    <span>·</span>
                    <span>{property.inquiries} inquiries</span>
                  </div>
                </div>
                
                {/* Right: Action Buttons */}
                <div className="flex items-center gap-1">
                  <Link
                    href={`/property/${property.id}`}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/owner/properties/${property.id}/edit`}
                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(property);
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Property</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Views</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={property.image} 
                          alt={property.title}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-gray-900">{property.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {property.location}{property.city ? `, ${property.city}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={property.type === 'Sale' ? 'sale' : 'rental'}>
                        {property.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariants[property.status]}>
                        {property.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-red-600">{property.price}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{property.views}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/property/${property.id}`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/owner/properties/${property.id}/edit`}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(property)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <Building className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500 text-sm mb-4">Try adjusting your search or add a new property</p>
          <Link
            href="/owner/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Property
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <Modal
          isOpen={!!deleteModal}
          onClose={() => setDeleteModal(null)}
          title="Delete Property"
        >
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                Are you sure you want to delete <strong>{deleteModal.title}</strong>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Property
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
