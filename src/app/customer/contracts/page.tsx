'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Eye, Printer, PenLine, X, Download, Star, AlertCircle, Check, Loader2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import StarRating from '@/app/components/ui/StarRating';
import { contractService, ContractListItem, ContractDetailResponse } from '@/lib/api/services/contract.service';
import { paymentService } from '@/lib/api/services/payment.service';
import Skeleton from '@/app/components/ui/Skeleton';

type ContractStatus = 'DRAFT' | 'PENDING_SIGNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
type ContractType = 'PURCHASE' | 'RENTAL';

const statusVariants: Record<ContractStatus, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  DRAFT: 'default',
  PENDING_SIGNING: 'warning',
  ACTIVE: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const statusLabels: Record<ContractStatus, string> = {
  DRAFT: 'Draft',
  PENDING_SIGNING: 'Pending Signature',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function CustomerContractsPage() {
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<ContractDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingContractId, setRatingContractId] = useState<string | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      const response = await contractService.getMyContracts();
      setContracts(response.data || []);
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContracts = contracts.filter(c => {
    if (filter === 'active') return c.status === 'ACTIVE' || c.status === 'PENDING_SIGNING';
    if (filter === 'completed') return c.status === 'COMPLETED' || c.status === 'CANCELLED';
    return true;
  });

  const handleViewDetail = async (contractId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await contractService.getContractById(contractId);
      setSelectedContract(detail);
    } catch (error) {
      console.error('Failed to load contract details:', error);
      alert('Failed to load contract details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSign = (contract: ContractListItem) => {
    handleViewDetail(contract.id);
    setShowSignModal(true);
  };

  const confirmSign = async () => {
    if (!selectedContract) return;
    setIsSubmitting(true);
    try {
      await contractService.signContract(selectedContract.id);
      await loadContracts();
      setShowSignModal(false);
      setSelectedContract(null);
    } catch (error) {
      console.error('Failed to sign contract:', error);
      alert('Failed to sign contract');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRate = (contractId: string) => {
    setRatingContractId(contractId);
    setNewRating(0);
    setRatingComment('');
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!ratingContractId || newRating === 0) return;
    setIsSubmitting(true);
    try {
      await contractService.rateContract(ratingContractId, newRating, ratingComment || undefined);
      await loadContracts();
      setShowRatingModal(false);
      setRatingContractId(null);
    } catch (error) {
      console.error('Failed to rate contract:', error);
      alert('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayContract = async (contractId: string) => {
    try {
      const checkout = await paymentService.createContractCheckout(contractId);
      window.location.href = checkout.checkoutUrl;
    } catch (error) {
      console.error('Failed to create payment:', error);
      alert('Failed to initiate payment');
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton height={60} />
        <Skeleton height={400} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-600" />
            My Contracts
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {contracts.length} contracts total
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {(['all', 'active', 'completed'] as const).map((f) => (
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

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.map((contract) => {
          const status = contract.status as ContractStatus;
          return (
            <div
              key={contract.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">{contract.contractNumber}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{contract.propertyTitle}</h3>
                  <p className="text-sm text-gray-500 mt-1">{contract.propertyAddress}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={contract.contractType === 'PURCHASE' ? 'sale' : 'rental'}>
                    {contract.contractType === 'PURCHASE' ? 'Sale' : 'Rental'}
                  </Badge>
                  <Badge variant={statusVariants[status]}>
                    {statusLabels[status] || status}
                  </Badge>
                </div>
              </div>

              {/* Contract Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Contract Period</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {formatDate(contract.startDate)}
                  </p>
                  {contract.endDate && <p className="text-xs text-gray-500 mt-0.5">to {formatDate(contract.endDate)}</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Value</p>
                  <p className="text-sm font-bold text-red-600 mt-1">{formatAmount(contract.totalContractAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Agent</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {`${contract.agentFirstName || ''} ${contract.agentLastName || ''}`.trim() || 'TBA'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Signed</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(contract.signedAt)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleViewDetail(contract.id)}
                  disabled={loadingDetail}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingDetail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  View Details
                </button>
                <button className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                {status === 'PENDING_SIGNING' && (
                  <button
                    onClick={() => handleSign(contract)}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <PenLine className="w-4 h-4" />
                    Sign Contract
                  </button>
                )}
                {status === 'COMPLETED' && (
                  <button
                    onClick={() => handleRate(contract.id)}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    Rate
                  </button>
                )}
                {(status === 'ACTIVE' || status === 'PENDING_SIGNING') && (
                  <button className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                    Request Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredContracts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
          <p className="text-gray-500 text-sm">Try changing your filter</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedContract && !showSignModal && (
        <Modal
          isOpen={!!selectedContract}
          onClose={() => setSelectedContract(null)}
          title="Contract Details"
        >
          <div className="space-y-4">
            {/* Property Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">{selectedContract.contractNumber}</p>
              <h4 className="font-bold text-gray-900">{selectedContract.propertyTitle}</h4>
              <p className="text-sm text-gray-500 mt-1">{selectedContract.propertyAddress}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={selectedContract.contractType === 'PURCHASE' ? 'sale' : 'rental'}>
                  {selectedContract.contractType === 'PURCHASE' ? 'Sale' : 'Rental'}
                </Badge>
                <Badge variant={statusVariants[selectedContract.status as ContractStatus]}>
                  {statusLabels[selectedContract.status as ContractStatus] || selectedContract.status}
                </Badge>
              </div>
            </div>

            {/* Contract Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedContract.startDate)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">End Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedContract.endDate)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Total Value</p>
                <p className="font-bold text-red-600">{formatAmount(selectedContract.totalContractAmount)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Remaining</p>
                <p className="font-medium text-orange-600">{formatAmount(selectedContract.remainingAmount)}</p>
              </div>
            </div>

            {/* Parties */}
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-2">Contract Parties</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-gray-500">Property Owner</p>
                  <p className="font-medium text-gray-900">{`${selectedContract.ownerFirstName} ${selectedContract.ownerLastName}`}</p>
                  <p className="text-xs text-gray-500">{selectedContract.ownerPhone}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-gray-500">Sales Agent</p>
                  <p className="font-medium text-gray-900">{`${selectedContract.agentFirstName} ${selectedContract.agentLastName}`}</p>
                  <p className="text-xs text-gray-500">{selectedContract.agentPhone}</p>
                </div>
              </div>
            </div>

            {/* Rating */}
            {selectedContract.rating && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-700">Your Rating:</span>
                <StarRating rating={selectedContract.rating} size="sm" />
                {selectedContract.comment && (
                  <span className="text-sm text-gray-500 ml-2">"{selectedContract.comment}"</span>
                )}
              </div>
            )}

            {/* Terms */}
            {selectedContract.specialTerms && (
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Special Terms</h5>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedContract.specialTerms}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Sign Confirmation Modal */}
      {showSignModal && selectedContract && (
        <Modal
          isOpen={showSignModal}
          onClose={() => { setShowSignModal(false); setSelectedContract(null); }}
          title="Sign Contract"
        >
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Please review carefully</p>
                <p className="text-xs text-yellow-700 mt-1">
                  By signing this contract, you agree to all terms and conditions. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm"><strong>Contract:</strong> {selectedContract.contractNumber}</p>
              <p className="text-sm mt-1"><strong>Property:</strong> {selectedContract.propertyTitle}</p>
              <p className="text-sm mt-1"><strong>Total Value:</strong> <span className="text-red-600 font-bold">{formatAmount(selectedContract.totalContractAmount)}</span></p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => { setShowSignModal(false); setSelectedContract(null); }}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={confirmSign}
                disabled={isSubmitting}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Confirm & Sign
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rating Modal */}
      {showRatingModal && ratingContractId && (
        <Modal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          title="Rate Your Contract Experience"
        >
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-4">
                How was your overall experience with this contract?
              </p>
              <div className="flex justify-center">
                <StarRating
                  rating={newRating}
                  size="lg"
                  interactive
                  onChange={setNewRating}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment (Optional)</label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                disabled={newRating === 0 || isSubmitting}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Rating
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
