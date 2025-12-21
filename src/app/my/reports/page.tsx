'use client';

import React, { useState } from 'react';
import { AlertTriangle, Plus, Eye, FileText, Shield, User, Building, Clock, Check, X, ChevronRight, MessageSquare, Upload } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';

type ReportStatus = 'Pending' | 'Under Review' | 'Resolved' | 'Rejected';
type ReportType = 'Property' | 'User' | 'Agent';

interface Report {
  id: number;
  reportNumber: string;
  type: ReportType;
  targetName: string;
  targetId: string;
  reason: string;
  description: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  hasAppeal: boolean;
  penaltyDetails: string | null;
}

// Mock data
const mockReports: Report[] = [
  {
    id: 1,
    reportNumber: 'RPT-2024-001',
    type: 'Property',
    targetName: 'Fake Luxury Villa Listing',
    targetId: 'PROP-2024-123',
    reason: 'Fraudulent listing',
    description: 'This property listing contains fake images and misleading information about the property size and location.',
    status: 'Under Review',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-18',
    hasAppeal: false,
    penaltyDetails: null,
  },
  {
    id: 2,
    reportNumber: 'RPT-2024-002',
    type: 'User',
    targetName: 'Nguyễn Văn Scammer',
    targetId: 'USR-2024-456',
    reason: 'Scam behavior',
    description: 'This user asked for advance payment outside the platform and provided fake contract documents.',
    status: 'Resolved',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-14',
    hasAppeal: false,
    penaltyDetails: 'Account suspended for 30 days',
  },
  {
    id: 3,
    reportNumber: 'RPT-2024-003',
    type: 'Agent',
    targetName: 'Trần Văn BadAgent',
    targetId: 'AGT-2024-789',
    reason: 'Unprofessional conduct',
    description: 'Agent did not show up for scheduled viewing and was rude when contacted.',
    status: 'Pending',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
    hasAppeal: false,
    penaltyDetails: null,
  },
  {
    id: 4,
    reportNumber: 'RPT-2023-050',
    type: 'Property',
    targetName: 'Overpriced Studio',
    targetId: 'PROP-2023-999',
    reason: 'Price manipulation',
    description: 'Owner keeps changing the price after agreement.',
    status: 'Rejected',
    createdAt: '2023-12-20',
    updatedAt: '2023-12-25',
    hasAppeal: true,
    penaltyDetails: null,
  },
];

const reportTypes = [
  { value: 'Property' as ReportType, label: 'Property', icon: Building },
  { value: 'User' as ReportType, label: 'User (Owner/Customer)', icon: User },
  { value: 'Agent' as ReportType, label: 'Sales Agent', icon: Shield },
];

const reportReasons: Record<ReportType, string[]> = {
  Property: ['Fraudulent listing', 'Misleading information', 'Price manipulation', 'Unavailable property', 'Other'],
  User: ['Scam behavior', 'Fake identity', 'Payment fraud', 'Harassment', 'Other'],
  Agent: ['Unprofessional conduct', 'No-show', 'Misleading information', 'Bribery request', 'Other'],
};

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

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  
  // Form state
  const [newReport, setNewReport] = useState<{
    type: ReportType;
    targetId: string;
    reason: string;
    description: string;
  }>({
    type: 'Property',
    targetId: '',
    reason: '',
    description: '',
  });
  const [appealText, setAppealText] = useState('');

  const filteredReports = reports.filter(r => {
    if (filter === 'pending') return r.status === 'Pending' || r.status === 'Under Review';
    if (filter === 'resolved') return r.status === 'Resolved' || r.status === 'Rejected';
    return true;
  });

  const handleCreateReport = () => {
    const newReportItem: Report = {
      id: reports.length + 1,
      reportNumber: `RPT-2024-${String(reports.length + 1).padStart(3, '0')}`,
      type: newReport.type,
      targetName: `Target ${newReport.targetId}`,
      targetId: newReport.targetId,
      reason: newReport.reason,
      description: newReport.description,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      hasAppeal: false,
      penaltyDetails: null,
    };
    setReports([newReportItem, ...reports]);
    setShowCreateModal(false);
    setNewReport({ type: 'Property', targetId: '', reason: '', description: '' });
  };

  const handleSubmitAppeal = () => {
    if (selectedReport) {
      setReports(reports.map(r => 
        r.id === selectedReport.id ? { ...r, hasAppeal: true } : r
      ));
      setShowAppealModal(false);
      setAppealText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            Violation Reports
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Report violations and track their status
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Report
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            filter === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            filter === 'resolved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          }`}
        >
          Closed
        </button>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Report</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Target</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReports.map((report) => {
                const StatusIcon = statusIcons[report.status];
                return (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{report.reportNumber}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{report.reason}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {report.type === 'Property' && <Building className="w-4 h-4 text-gray-400" />}
                        {report.type === 'User' && <User className="w-4 h-4 text-gray-400" />}
                        {report.type === 'Agent' && <Shield className="w-4 h-4 text-gray-400" />}
                        <span className="text-gray-900">{report.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{report.targetName}</p>
                      <p className="text-xs text-gray-500">{report.targetId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariants[report.status]}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {report.status}
                      </Badge>
                      {report.hasAppeal && (
                        <p className="text-xs text-blue-600 mt-1">Appeal submitted</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600">{report.createdAt}</p>
                      <p className="text-xs text-gray-400">Updated: {report.updatedAt}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500 text-sm">You haven't submitted any reports yet</p>
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Violation Report"
        >
          <form onSubmit={(e) => { e.preventDefault(); handleCreateReport(); }} className="space-y-4">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What are you reporting?</label>
              <div className="grid grid-cols-3 gap-2">
                {reportTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setNewReport({ ...newReport, type: type.value as any, reason: '' })}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      newReport.type === type.value
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <type.icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {newReport.type} ID
              </label>
              <input
                type="text"
                value={newReport.targetId}
                onChange={(e) => setNewReport({ ...newReport, targetId: e.target.value })}
                placeholder={`Enter ${newReport.type.toLowerCase()} ID or URL`}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
                required
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <select
                value={newReport.reason}
                onChange={(e) => setNewReport({ ...newReport, reason: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
                required
              >
                <option value="">Select a reason</option>
                {reportReasons[newReport.type].map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                placeholder="Provide detailed information about the violation..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm resize-none"
                required
              />
            </div>

            {/* Evidence Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Evidence (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click or drag files to upload</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Submit Report
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Report Details Modal */}
      {selectedReport && !showAppealModal && (
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
                <p className="font-medium text-gray-900">{selectedReport.status}</p>
                <p className="text-xs text-gray-600 mt-0.5">Last updated: {selectedReport.updatedAt}</p>
              </div>
            </div>

            {/* Report Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Report Number</p>
                <p className="font-medium text-gray-900">{selectedReport.reportNumber}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Report Type</p>
                <p className="font-medium text-gray-900">{selectedReport.type}</p>
              </div>
            </div>

            {/* Target */}
            <div className="p-4 border rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Reported Target</p>
              <p className="font-medium text-gray-900">{selectedReport.targetName}</p>
              <p className="text-sm text-gray-500">{selectedReport.targetId}</p>
            </div>

            {/* Reason & Description */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Reason</p>
              <p className="font-medium text-gray-900 mb-3">{selectedReport.reason}</p>
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedReport.description}</p>
            </div>

            {/* Penalty Details */}
            {selectedReport.penaltyDetails && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 font-medium mb-1">Penalty Applied</p>
                <p className="text-sm text-red-800">{selectedReport.penaltyDetails}</p>
              </div>
            )}

            {/* Appeal Section */}
            {selectedReport.status === 'Rejected' && !selectedReport.hasAppeal && (
              <div className="pt-4 border-t">
                <button
                  onClick={() => setShowAppealModal(true)}
                  className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Submit Appeal
                </button>
              </div>
            )}

            {selectedReport.hasAppeal && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Appeal has been submitted and is under review
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Appeal Modal */}
      {showAppealModal && selectedReport && (
        <Modal
          isOpen={showAppealModal}
          onClose={() => setShowAppealModal(false)}
          title="Submit Appeal"
        >
          <form onSubmit={(e) => { e.preventDefault(); handleSubmitAppeal(); }} className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                You are appealing the decision on report <strong>{selectedReport.reportNumber}</strong>. 
                Please provide additional information to support your case.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Appeal Reason</label>
              <textarea
                value={appealText}
                onChange={(e) => setAppealText(e.target.value)}
                placeholder="Explain why you believe the decision should be reconsidered..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAppealModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Submit Appeal
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
