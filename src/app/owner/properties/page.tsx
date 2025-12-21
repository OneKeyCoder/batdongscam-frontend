'use client';

import React, { useState, useEffect } from 'react';
import { Building, Plus, Search, Eye, Edit, Trash2, MapPin, Bed, Bath, Square, MoreVertical, Grid, List, Filter } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import Link from 'next/link';
import { propertyService } from '@/lib/api/services/property.service';
import { accountService } from '@/lib/api/services/account.service';

type PropertyStatus = 'Active' | 'Pending' | 'Rented' | 'Sold' | 'Inactive';
type PropertyType = 'Sale' | 'Rent';

interface Property {
  id: number;
  title: string;
  image: string;
  address: string;
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

// Removed mock data - using real API

const statusVariants: Record<PropertyStatus, 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  Active: 'success',
  Pending: 'warning',
  Rented: 'info',
  Sold: 'default',
  Inactive: 'danger',
};

export default function OwnerPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'Sale' | 'Rent'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PropertyStatus>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteModal, setDeleteModal] = useState<Property | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      const user = await accountService.getMe();
      const response = await propertyService.getOwnerProperties(user.id);
      const mappedData: Property[] = (response.data || []).map((item: any) => ({
        id: item.id,
        title: item.title || 'Untitled',
        image: item.imageUrl || '',
        address: item.address || '',
        price: item.price ? `$${item.price.toLocaleString()}` : 'N/A',
        type: item.transactionType === 'SALE' ? 'Sale' : 'Rent',
        status: mapStatus(item.status),
        bedrooms: item.bedrooms || 0,
        bathrooms: item.bathrooms || 0,
        area: item.area ? `${item.area} m²` : 'N/A',
        views: 0,
        inquiries: 0,
        createdAt: item.createdAt || ''
      }));
      setProperties(mappedData);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mapStatus = (apiStatus: string): PropertyStatus => {
    switch (apiStatus) {
      case 'AVAILABLE': return 'Active';
      case 'PENDING': return 'Pending';
      case 'RENTED': return 'Rented';
      case 'SOLD': return 'Sold';
      default: return 'Inactive';
    }
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filter === 'all' || p.type === filter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDelete = (property: Property) => {
    setDeleteModal(property);
  };

  const confirmDelete = async () => {
    if (deleteModal) {
      try {
        await propertyService.deleteProperty(deleteModal.id.toString());
        setProperties(properties.filter(p => p.id !== deleteModal.id));
        setDeleteModal(null);
      } catch (error) {
        console.error('Failed to delete property:', error);
        alert('Failed to delete property');
      }
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
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
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
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
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

      {/* Properties Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div 
              key={property.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant={property.type === 'Sale' ? 'sale' : 'rental'}>
                    {property.type}
                  </Badge>
                  <Badge variant={statusVariants[property.status]}>
                    {property.status}
                  </Badge>
                </div>
                {/* Actions */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-lg">
                    <Link
                      href={`/owner/properties/${property.id}`}
                      className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/owner/properties/${property.id}/edit`}
                      className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(property)}
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 truncate">{property.title}</h3>
                <p className="text-red-600 font-bold text-lg mt-1">{property.price}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                  <MapPin className="w-3 h-3" />
                  {property.address}
                </p>

                {/* Features */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4 text-gray-400" />
                    {property.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4 text-gray-400" />
                    {property.bathrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Square className="w-4 h-4 text-gray-400" />
                    {property.area}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span>{property.views} views</span>
                  <span>{property.inquiries} inquiries</span>
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
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {property.address}
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
                          href={`/owner/properties/${property.id}`}
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
