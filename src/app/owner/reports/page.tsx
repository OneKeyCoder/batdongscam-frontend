'use client';

import React, { useState } from 'react';
import { AlertTriangle, Eye, Building, Clock, Check, X, Search, MessageSquare } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';

type ReportStatus = 'Pending' | 'Under Review' | 'Resolved' | 'Rejected';

interface Report {
  id: number;
  reportNumber: string;
  propertyName: string;
  propertyId: string;
  reporterName: string;
  reporterType: 'Customer' | 'Agent';
  reason: string;
  description: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt: string | null;
  adminNotes: string | null;
}

// Mock data
const mockReports: Report[] = [
  {
    id: 1,
    reportNumber: 'RPT-2024-001',
    propertyName: 'Modern Villa with Pool',
    propertyId: 'PROP-2024-001',
    reporterName: 'Nguyễn Văn Khách',
    reporterType: 'Customer',
    reason: 'Misleading information',
    description: 'The listing states the property has 4 bedrooms but during viewing only 3 bedrooms were present.',
    status: 'Resolved',
    createdAt: '2024-01-10',
    resolvedAt: '2024-01-15',
    adminNotes: 'Property listing has been updated to reflect accurate information.',
  },
  {
    id: 2,
    reportNumber: 'RPT-2024-002',
    propertyName: 'Luxury Apartment Downtown',
    propertyId: 'PROP-2024-002',
    reporterName: 'Trần Văn Agent',
    reporterType: 'Agent',
    reason: 'Property condition',
    description: 'The property has maintenance issues that were not disclosed in the listing.',
    status: 'Under Review',
    createdAt: '2024-01-18',
    resolvedAt: null,
    adminNotes: null,
  },
  {
    id: 3,
    reportNumber: 'RPT-2024-003',
    propertyName: 'Cozy Studio Near Park',
    propertyId: 'PROP-2024-003',
    reporterName: 'Lê Thị Customer',
    reporterType: 'Customer',
    reason: 'Price discrepancy',
    description: 'The actual price discussed was different from the listed price.',
    status: 'Pending',
    createdAt: '2024-01-20',
    resolvedAt: null,
    adminNotes: null,
  },
];

const statusVariants: Record<ReportStatus, 'warning' | 'info' | 'success' | 'danger'> = {
  Pending: 'warning',
  'Under Review': 'info',
  Resolved: 'success',
  Rejected: 'danger',
};

const statusIcons: Record<ReportStatus, typeof Clock> = {
  Pending: Clock,
  'Under Review': Eye,
  Resolved: Check,
  Rejected: X,
};

export default function OwnerReportsPage() {
  const [reports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.reporterName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'pending' ? (r.status === 'Pending' || r.status === 'Under Review') :
      filter === 'resolved' ? (r.status === 'Resolved' || r.status === 'Rejected') :
      true;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const totalPending = reports.filter(r => r.status === 'Pending' || r.status === 'Under Review').length;
  const totalResolved = reports.filter(r => r.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          Property Reports
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          View reports submitted about your properties
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{reports.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{totalPending}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{totalResolved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {(['all', 'pending', 'resolved'] as const).map((f) => (
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

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => {
          const StatusIcon = statusIcons[report.status];
          return (
            <div 
              key={report.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-gray-500">{report.reportNumber}</span>
                    <Badge variant={statusVariants[report.status]}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {report.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-gray-900">{report.propertyName}</h3>
                  <p className="text-sm text-gray-500 mt-1">{report.reason}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{report.description}</p>
                </div>

                <div className="flex flex-col lg:items-end gap-2">
                  <p className="text-xs text-gray-500">
                    Reported by: <span className="font-medium text-gray-700">{report.reporterName}</span>
                  </p>
                  <p className="text-xs text-gray-400">{report.createdAt}</p>
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="mt-2 inline-flex items-center gap-1 px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <AlertTriangle className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
          <p className="text-gray-500 text-sm">Your properties have no reports at this time</p>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title="Report Details"
        >
          <div className="space-y-4">
            {/* Status Banner */}
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              selectedReport.status === 'Resolved' ? 'bg-green-50 border border-green-200' :
              selectedReport.status === 'Rejected' ? 'bg-red-50 border border-red-200' :
              selectedReport.status === 'Under Review' ? 'bg-blue-50 border border-blue-200' :
              'bg-yellow-50 border border-yellow-200'
            }`}>
              {React.createElement(statusIcons[selectedReport.status], {
                className: `w-5 h-5 ${
                  selectedReport.status === 'Resolved' ? 'text-green-600' :
                  selectedReport.status === 'Rejected' ? 'text-red-600' :
                  selectedReport.status === 'Under Review' ? 'text-blue-600' :
                  'text-yellow-600'
                }`
              })}
              <div>
                <p className={`font-medium ${
                  selectedReport.status === 'Resolved' ? 'text-green-800' :
                  selectedReport.status === 'Rejected' ? 'text-red-800' :
                  selectedReport.status === 'Under Review' ? 'text-blue-800' :
                  'text-yellow-800'
                }`}>
                  {selectedReport.status}
                </p>
                {selectedReport.resolvedAt && (
                  <p className="text-sm text-green-700">Resolved on {selectedReport.resolvedAt}</p>
                )}
              </div>
            </div>

            {/* Report Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Report Number</p>
                <p className="font-medium text-gray-900">{selectedReport.reportNumber}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Date Reported</p>
                <p className="font-medium text-gray-900">{selectedReport.createdAt}</p>
              </div>
            </div>

            {/* Property */}
            <div className="p-4 border rounded-lg">
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <Building className="w-3 h-3" />
                Property
              </p>
              <p className="font-medium text-gray-900">{selectedReport.propertyName}</p>
              <p className="text-xs text-gray-500">{selectedReport.propertyId}</p>
            </div>

            {/* Reporter */}
            <div className="p-4 border rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Reported By</p>
              <p className="font-medium text-gray-900">{selectedReport.reporterName}</p>
              <Badge variant={selectedReport.reporterType === 'Customer' ? 'info' : 'default'}>
                {selectedReport.reporterType}
              </Badge>
            </div>

            {/* Reason & Description */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Reason</p>
              <p className="font-medium text-gray-900">{selectedReport.reason}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedReport.description}</p>
            </div>

            {/* Admin Notes */}
            {selectedReport.adminNotes && (
              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Admin Response
                </p>
                <p className="text-sm text-gray-600 p-3 bg-green-50 border border-green-200 rounded-lg">
                  {selectedReport.adminNotes}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
