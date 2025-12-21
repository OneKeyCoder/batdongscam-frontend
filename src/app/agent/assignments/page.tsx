'use client';

import React, { useState, useEffect } from 'react';
import { Building, MapPin, Eye, Check, X, Calendar, User, DollarSign, Clock, Filter, Search } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import Link from 'next/link';
import { assignmentService } from '@/lib/api/services/assignment.service';

type AssignmentStatus = 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Rejected';

interface Assignment {
  id: number;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  propertyAddress: string;
  propertyPrice: string;
  propertyType: 'Sale' | 'Rent';
  ownerName: string;
  ownerPhone: string;
  status: AssignmentStatus;
  assignedAt: string;
  deadline: string;
  commission: string;
  totalArea?: number;
  numberOfImages?: number;
  ownerTier?: string;
}

// Removed mock data - using real API

const statusVariants: Record<AssignmentStatus, 'warning' | 'info' | 'success' | 'danger' | 'default'> = {
  Pending: 'warning',
  Accepted: 'info',
  'In Progress': 'info',
  Completed: 'success',
  Rejected: 'danger',
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await assignmentService.getMyAssignedProperties();
      
      // Helper function for image URLs
      const getImageUrl = (path?: string) => {
        if (!path) {
          const placeholders = [
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
          ];
          return placeholders[Math.floor(Math.random() * placeholders.length)];
        }
        if (path.startsWith('http')) return path;
        // Fallback for relative paths
        const placeholders = [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
        ];
        const hash = path.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return placeholders[hash % placeholders.length];
      };
      
      // Map API response to component interface
      const mappedData: Assignment[] = (response.data || []).map((item: any) => ({
        id: item.id,
        propertyId: item.id,
        propertyName: item.title || 'Untitled Property',
        propertyImage: getImageUrl(item.thumbnailUrl),
        propertyAddress: item.location || 'Location not available',
        propertyPrice: item.price ? `$${item.price.toLocaleString()}` : 'N/A',
        propertyType: item.transactionType === 'SALE' ? 'Sale' : 'Rent',
        ownerName: `${item.ownerFirstName || ''} ${item.ownerLastName || ''}`.trim() || 'Unknown',
        ownerPhone: item.ownerPhone || 'N/A',
        ownerTier: item.ownerTier || 'BRONZE',
        status: item.status === 'AVAILABLE' ? 'In Progress' : 
                item.status === 'PENDING' ? 'Pending' : 'In Progress',
        assignedAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
        deadline: item.deadline || 'No deadline',
        commission: 'N/A', // API doesn't provide commission
        totalArea: item.totalArea,
        numberOfImages: item.numberOfImages
      }));
      setAssignments(mappedData);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'pending' ? a.status === 'Pending' :
      filter === 'active' ? (a.status === 'Accepted' || a.status === 'In Progress') :
      filter === 'completed' ? (a.status === 'Completed' || a.status === 'Rejected') :
      true;
    return matchesSearch && matchesFilter;
  });

  const handleAccept = (assignment: Assignment) => {
    setAssignments(assignments.map(a =>
      a.id === assignment.id ? { ...a, status: 'Accepted' as AssignmentStatus } : a
    ));
  };

  const handleReject = (assignment: Assignment) => {
    setAssignments(assignments.map(a =>
      a.id === assignment.id ? { ...a, status: 'Rejected' as AssignmentStatus } : a
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-6 h-6 text-red-600" />
            Property Assignments
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your assigned properties
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {(['all', 'pending', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List */}
      <div className="grid gap-4">
        {filteredAssignments.map((assignment) => (
          <div 
            key={assignment.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row">
              {/* Property Image */}
              <div className="w-full lg:w-48 h-40 lg:h-auto shrink-0">
                <img
                  src={assignment.propertyImage}
                  alt={assignment.propertyName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">{assignment.propertyId}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{assignment.propertyName}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {assignment.propertyAddress}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={assignment.propertyType === 'Sale' ? 'sale' : 'rental'}>
                      For {assignment.propertyType}
                    </Badge>
                    <Badge variant={statusVariants[assignment.status]}>
                      {assignment.status}
                    </Badge>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="text-sm font-bold text-red-600 mt-1">{assignment.propertyPrice}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Area</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {assignment.totalArea ? `${assignment.totalArea} m²` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Owner</p>
                    <p className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-400" />
                      {assignment.ownerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Images</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {assignment.numberOfImages || 0} photos
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedAssignment(assignment)}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  
                  {assignment.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleAccept(assignment)}
                        className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(assignment)}
                        className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  
                  {(assignment.status === 'Accepted' || assignment.status === 'In Progress') && (
                    <Link
                      href={`/agent/appointments?property=${assignment.propertyId}`}
                      className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Viewing
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <Building className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedAssignment && (
        <Modal
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          title="Assignment Details"
        >
          <div className="space-y-4">
            {/* Property Info */}
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={selectedAssignment.propertyImage}
                alt={selectedAssignment.propertyName}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div>
                <p className="text-xs text-gray-500">{selectedAssignment.propertyId}</p>
                <h4 className="font-bold text-gray-900">{selectedAssignment.propertyName}</h4>
                <p className="text-sm text-gray-500 mt-1">{selectedAssignment.propertyAddress}</p>
                <p className="font-bold text-red-600 mt-2">{selectedAssignment.propertyPrice}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Status</p>
                <Badge variant={statusVariants[selectedAssignment.status]} className="mt-1">
                  {selectedAssignment.status}
                </Badge>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Transaction Type</p>
                <Badge variant={selectedAssignment.propertyType === 'Sale' ? 'sale' : 'rental'} className="mt-1">
                  For {selectedAssignment.propertyType}
                </Badge>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Area</p>
                <p className="font-medium text-gray-900">
                  {selectedAssignment.totalArea ? `${selectedAssignment.totalArea} m²` : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Images</p>
                <p className="font-medium text-gray-900">
                  {selectedAssignment.numberOfImages || 0} photos
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Assigned Date</p>
                <p className="font-medium text-gray-900">{selectedAssignment.assignedAt}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Deadline</p>
                <p className="font-medium text-gray-900">{selectedAssignment.deadline}</p>
              </div>
            </div>

            {/* Owner Info */}
            <div className="p-4 border rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Property Owner</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{selectedAssignment.ownerName}</p>
                  <p className="text-sm text-gray-500 mt-1">{selectedAssignment.ownerPhone}</p>
                </div>
                {selectedAssignment.ownerTier && (
                  <Badge variant="info" className="text-xs">
                    {selectedAssignment.ownerTier}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
