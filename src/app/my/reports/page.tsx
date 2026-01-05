'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Plus, Eye, Shield, User, Building, Clock, Check, X, MessageSquare, Upload, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import { violationService, ViolationUserItem, ViolationUserDetails, ViolationCreateRequest } from '@/lib/api/services/violation.service';

type ReportStatus = 'PENDING' | 'REPORTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
type ViolationType = 'FRAUDULENT_LISTING' | 'MISREPRESENTATION_OF_PROPERTY' | 'SPAM_OR_DUPLICATE_LISTING' |
  'INAPPROPRIATE_CONTENT' | 'NON_COMPLIANCE_WITH_TERMS' | 'FAILURE_TO_DISCLOSE_INFORMATION' |
  'HARASSMENT' | 'SCAM_ATTEMPT';
type ReportedType = 'CUSTOMER' | 'PROPERTY' | 'SALES_AGENT' | 'PROPERTY_OWNER';

type UIReportType = 'Property' | 'User' | 'Agent';

const reportTypes: { value: UIReportType; label: string; icon: React.ElementType; backendType: ReportedType }[] = [
  { value: 'Property', label: 'Property', icon: Building, backendType: 'PROPERTY' },
  { value: 'User', label: 'User (Owner/Customer)', icon: User, backendType: 'CUSTOMER' },
  { value: 'Agent', label: 'Sales Agent', icon: Shield, backendType: 'SALES_AGENT' },
];

const violationTypes: { value: ViolationType; label: string }[] = [
  { value: 'FRAUDULENT_LISTING', label: 'Fraudulent Listing' },
  { value: 'MISREPRESENTATION_OF_PROPERTY', label: 'Misrepresentation of Property' },
  { value: 'SPAM_OR_DUPLICATE_LISTING', label: 'Spam or Duplicate Listing' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content' },
  { value: 'NON_COMPLIANCE_WITH_TERMS', label: 'Non-Compliance with Terms' },
  { value: 'FAILURE_TO_DISCLOSE_INFORMATION', label: 'Failure to Disclose Information' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'SCAM_ATTEMPT', label: 'Scam Attempt' },
];

const statusConfig: Record<ReportStatus, { label: string; variant: 'warning' | 'info' | 'success' | 'danger'; icon: React.ElementType }> = {
  PENDING: { label: 'Pending', variant: 'warning', icon: Clock },
  REPORTED: { label: 'Reported', variant: 'warning', icon: AlertTriangle },
  UNDER_REVIEW: { label: 'Under Review', variant: 'info', icon: Eye },
  RESOLVED: { label: 'Resolved', variant: 'success', icon: Check },
  DISMISSED: { label: 'Dismissed', variant: 'danger', icon: X },
};

const formatViolationType = (type: string): string => {
  return type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface ReportsContentProps {
  initialType?: UIReportType;
  initialTargetId?: string;
}

function ReportsContent({ initialType, initialTargetId }: ReportsContentProps) {
  const [reports, setReports] = useState<ViolationUserItem[]>([]);
  const [selectedReportDetails, setSelectedReportDetails] = useState<ViolationUserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  const [newReport, setNewReport] = useState<{
    type: UIReportType;
    targetId: string;
    violationType: ViolationType | '';
    description: string;
  }>({
    type: initialType || 'Property',
    targetId: initialTargetId || '',
    violationType: '',
    description: '',
  });
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialType && initialTargetId) {
      setShowCreateModal(true);
    }
  }, [initialType, initialTargetId]);

  useEffect(() => {
    fetchReports();
  }, [currentPage]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await violationService.getMyViolations({
        page: currentPage,
        limit: pageSize,
        sortType: 'desc',
        sortBy: 'createdAt',
      });
      setReports(response.data);
      setTotalPages(response.paging?.totalPages || 1);
      setTotalItems(response.paging?.total || 0);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReportDetails = async (id: string) => {
    try {
      setDetailsLoading(true);
      setSelectedReportId(id);
      const details = await violationService.getMyViolationDetails(id);
      setSelectedReportDetails(details);
    } catch (err) {
      console.error('Error fetching report details:', err);
      setError('Failed to load report details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!newReport.violationType || !newReport.targetId || !newReport.description) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const reportedType = reportTypes.find(t => t.value === newReport.type)?.backendType || 'PROPERTY';

      const request: ViolationCreateRequest = {
        violationType: newReport.violationType as ViolationType,
        description: newReport.description,
        violationReportedType: reportedType,
        reportedId: newReport.targetId,
      };

      await violationService.createViolationReport(request, evidenceFiles.length > 0 ? evidenceFiles : undefined);

      setNewReport({ type: 'Property', targetId: '', violationType: '', description: '' });
      setEvidenceFiles([]);
      setShowCreateModal(false);

      setCurrentPage(1);
      fetchReports();
    } catch (err) {
      console.error('Error creating report:', err);
      setError('Failed to create report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setEvidenceFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const closeDetailsModal = () => {
    setSelectedReportId(null);
    setSelectedReportDetails(null);
  };

  const filteredReports = reports.filter(r => {
    if (filter === 'pending') return r.status === 'PENDING' || r.status === 'REPORTED' || r.status === 'UNDER_REVIEW';
    if (filter === 'resolved') return r.status === 'RESOLVED' || r.status === 'DISMISSED';
    return true;
  });

  return (
    <div className="space-y-6">
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

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

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

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Violation Type</th>
                    <th className="px-6 py-4 font-medium">Target</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReports.map((report) => {
                    const status = statusConfig[report.status as ReportStatus] || statusConfig.PENDING;
                    const StatusIcon = status.icon;
                    return (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{formatViolationType(report.violationType)}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{report.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900 font-medium">{report.targetName}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={status.variant}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-600">{formatDate(report.reportedAt)}</p>
                          {report.resolvedAt && (
                            <p className="text-xs text-gray-400">Resolved: {formatDate(report.resolvedAt)}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => fetchReportDetails(report.id)}
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

            {filteredReports.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertTriangle className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                <p className="text-gray-500 text-sm">You haven't submitted any reports yet</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} reports
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Violation Report"
        >
          <form onSubmit={(e) => { e.preventDefault(); handleCreateReport(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What are you reporting?</label>
              <div className="grid grid-cols-3 gap-2">
                {reportTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setNewReport({ ...newReport, type: type.value })}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      newReport.type === type.value
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <type.icon className={`w-5 h-5 mx-auto mb-1 ${newReport.type === type.value ? 'text-red-600' : 'text-gray-500'}`} />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {newReport.type} ID
              </label>
              <input
                type="text"
                value={newReport.targetId}
                onChange={(e) => setNewReport({ ...newReport, targetId: e.target.value })}
                placeholder={`Enter ${newReport.type.toLowerCase()} ID`}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Violation Type</label>
              <select
                value={newReport.violationType}
                onChange={(e) => setNewReport({ ...newReport, violationType: e.target.value as ViolationType })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm text-gray-900"
                required
              >
                <option value="">Select a violation type</option>
                {violationTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (10-1000 characters)</label>
              <textarea
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                placeholder="Provide detailed information about the violation..."
                rows={4}
                minLength={10}
                maxLength={1000}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm resize-none text-gray-900"
                required
              />
              <p className="text-xs text-gray-500 mt-1">{newReport.description.length}/1000 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Evidence (Optional)</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click or drag files to upload</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              {evidenceFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {evidenceFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !newReport.violationType || !newReport.targetId || newReport.description.length < 10}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Report
              </button>
            </div>
          </form>
        </Modal>
      )}

      {selectedReportId && (
        <Modal
          isOpen={!!selectedReportId}
          onClose={closeDetailsModal}
          title="Report Details"
        >
          {detailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
          ) : selectedReportDetails ? (
            <div className="space-y-4">
              {(() => {
                const status = statusConfig[selectedReportDetails.status as ReportStatus] || statusConfig.PENDING;
                const StatusIcon = status.icon;
                return (
                  <div className={`p-4 rounded-lg flex items-center gap-3 ${
                    status.variant === 'success' ? 'bg-green-50 border border-green-200' :
                    status.variant === 'danger' ? 'bg-red-50 border border-red-200' :
                    status.variant === 'info' ? 'bg-blue-50 border border-blue-200' :
                    'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <StatusIcon className={`w-5 h-5 ${
                      status.variant === 'success' ? 'text-green-600' :
                      status.variant === 'danger' ? 'text-red-600' :
                      status.variant === 'info' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{status.label}</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Reported: {formatDate(selectedReportDetails.reportedAt)}
                        {selectedReportDetails.resolvedAt && ` • Resolved: ${formatDate(selectedReportDetails.resolvedAt)}`}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Violation Type</p>
                  <p className="font-medium text-gray-900">{formatViolationType(selectedReportDetails.violationType)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Target</p>
                  <p className="font-medium text-gray-900">{selectedReportDetails.targetName}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedReportDetails.description}</p>
              </div>

              {selectedReportDetails.evidenceUrls && selectedReportDetails.evidenceUrls.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Evidence Files</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedReportDetails.evidenceUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <img src={url} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedReportDetails.penaltyApplied && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600 font-medium mb-1">Penalty Applied</p>
                  <p className="text-sm text-red-800">{selectedReportDetails.penaltyApplied.replace(/_/g, ' ')}</p>
                </div>
              )}

              {selectedReportDetails.resolutionNotes && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-600 font-medium mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Resolution Notes
                  </p>
                  <p className="text-sm text-green-800">{selectedReportDetails.resolutionNotes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Failed to load report details.
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function ReportsPageWithParams() {
  const searchParams = useSearchParams();
  
  const typeParam = searchParams.get('type');
  const targetIdParam = searchParams.get('targetId');
  
  let initialType: UIReportType | undefined = undefined;
  if (typeParam && targetIdParam) {
    if (typeParam === 'User' || typeParam === 'CUSTOMER' || typeParam === 'PROPERTY_OWNER') {
      initialType = 'User';
    } else if (typeParam === 'Agent' || typeParam === 'SALES_AGENT') {
      initialType = 'Agent';
    } else {
      initialType = 'Property';
    }
  }

  return (
    <ReportsContent 
      initialType={initialType} 
      initialTargetId={targetIdParam || undefined} 
    />
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    }>
      <ReportsPageWithParams />
    </Suspense>
  );
}
