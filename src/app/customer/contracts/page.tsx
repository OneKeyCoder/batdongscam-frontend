'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Eye, Printer, X, Download, Star, AlertCircle, Loader2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import StarRating from '@/app/components/ui/StarRating';
import Skeleton from '@/app/components/ui/Skeleton';
import { 
  contractService, 
  DepositContractListItem, 
  PurchaseContractListItem,
  RentalContractListItem,
  DepositContractDetailResponse,
  PurchaseContractDetailResponse,
  RentalContractDetailResponse,
  ContractStatusEnum,
  CancelDepositContractRequest,
  CancelPurchaseContractRequest,
  CancelRentalContractRequest
} from '@/lib/api/services/contract.service';

type ContractType = 'DEPOSIT' | 'PURCHASE' | 'RENTAL';

interface UnifiedContract {
  id: string;
  contractNumber?: string;
  propertyTitle: string;
  propertyAddress?: string;
  contractType: ContractType;
  status: ContractStatusEnum;
  startDate: string;
  endDate?: string;
  totalValue: number;
  agentName?: string;
  createdAt: string;
  mainContractType?: string;
  rating?: number;
  comment?: string;
}

const statusVariants: Record<ContractStatusEnum, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  DRAFT: 'default',
  WAITING_OFFICIAL: 'warning',
  PENDING_PAYMENT: 'warning',
  ACTIVE: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const statusLabels: Record<ContractStatusEnum, string> = {
  DRAFT: 'Draft',
  WAITING_OFFICIAL: 'Waiting Official',
  PENDING_PAYMENT: 'Pending Payment',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function CustomerContractsPage() {
  const [depositContracts, setDepositContracts] = useState<DepositContractListItem[]>([]);
  const [purchaseContracts, setPurchaseContracts] = useState<PurchaseContractListItem[]>([]);
  const [rentalContracts, setRentalContracts] = useState<RentalContractListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositContractDetailResponse | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseContractDetailResponse | null>(null);
  const [selectedRental, setSelectedRental] = useState<RentalContractDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'purchase' | 'rental'>('all');
  
  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingContract, setRatingContract] = useState<UnifiedContract | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  
  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelContract, setCancelContract] = useState<UnifiedContract | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      // Load customer's own contracts using role-specific endpoints
      const [depositResponse, purchaseResponse, rentalResponse] = await Promise.all([
        contractService.getMyDepositContracts(),
        contractService.getMyPurchaseContracts(),
        contractService.getMyRentalContracts()
      ]);
      setDepositContracts(depositResponse.data || []);
      setPurchaseContracts(purchaseResponse.data || []);
      setRentalContracts(rentalResponse.data || []);
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Combine into unified list
  const unifiedContracts: UnifiedContract[] = [
    ...depositContracts.map(d => ({
      id: d.id,
      contractNumber: d.contractNumber,
      propertyTitle: d.propertyTitle,
      contractType: 'DEPOSIT' as ContractType,
      status: d.status,
      startDate: d.startDate,
      endDate: d.endDate,
      totalValue: d.depositAmount,
      agentName: d.agentName,
      createdAt: d.createdAt,
      mainContractType: d.mainContractType,
    })),
    ...purchaseContracts.map(p => ({
      id: p.id,
      contractNumber: p.contractNumber,
      propertyTitle: p.propertyTitle,
      contractType: 'PURCHASE' as ContractType,
      status: p.status,
      startDate: p.startDate,
      totalValue: p.propertyValue,
      agentName: p.agentName,
      createdAt: p.createdAt,
    })),
    ...rentalContracts.map(r => ({
      id: r.id,
      contractNumber: r.contractNumber,
      propertyTitle: r.propertyTitle,
      contractType: 'RENTAL' as ContractType,
      status: r.status,
      startDate: r.startDate,
      endDate: r.endDate,
      totalValue: r.monthlyRentAmount * (r.monthCount || 1),
      agentName: r.agentName,
      createdAt: r.createdAt,
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter contracts
  const filteredContracts = unifiedContracts.filter(c => {
    const matchesStatus = 
      filter === 'all' ? true :
      filter === 'active' ? (c.status === 'ACTIVE' || c.status === 'PENDING_PAYMENT' || c.status === 'WAITING_OFFICIAL') :
      filter === 'completed' ? (c.status === 'COMPLETED' || c.status === 'CANCELLED') :
      true;
    
    const matchesType = 
      typeFilter === 'all' ? true :
      typeFilter === 'deposit' ? c.contractType === 'DEPOSIT' :
      typeFilter === 'purchase' ? c.contractType === 'PURCHASE' :
      typeFilter === 'rental' ? c.contractType === 'RENTAL' :
      true;

    return matchesStatus && matchesType;
  });

  const handleViewDetail = async (contract: UnifiedContract) => {
    setLoadingDetail(true);
    try {
      if (contract.contractType === 'DEPOSIT') {
        const detail = await contractService.getDepositContractById(contract.id);
        setSelectedDeposit(detail);
      } else if (contract.contractType === 'PURCHASE') {
        const detail = await contractService.getPurchaseContractById(contract.id);
        setSelectedPurchase(detail);
      } else if (contract.contractType === 'RENTAL') {
        const detail = await contractService.getRentalContractById(contract.id);
        setSelectedRental(detail);
      }
    } catch (error) {
      console.error('Failed to load contract details:', error);
      alert('Failed to load contract details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRate = (contract: UnifiedContract) => {
    setRatingContract(contract);
    setNewRating(0);
    setRatingComment('');
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!ratingContract || newRating === 0) return;
    setIsSubmitting(true);
    try {
      if (ratingContract.contractType === 'DEPOSIT') {
        await contractService.rateDepositContract(ratingContract.id, newRating, ratingComment || undefined);
      } else {
        await contractService.ratePurchaseContract(ratingContract.id, newRating, ratingComment || undefined);
      }
      await loadContracts();
      setShowRatingModal(false);
      setRatingContract(null);
    } catch (error) {
      console.error('Failed to rate contract:', error);
      alert('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestCancel = (contract: UnifiedContract) => {
    setCancelContract(contract);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const submitCancel = async () => {
    if (!cancelContract || !cancelReason.trim()) return;
    setIsSubmitting(true);
    try {
      if (cancelContract.contractType === 'DEPOSIT') {
        await contractService.cancelDepositContract(cancelContract.id, { cancellationReason: cancelReason });
      } else {
        await contractService.cancelPurchaseContract(cancelContract.id, { cancellationReason: cancelReason });
      }
      await loadContracts();
      setShowCancelModal(false);
      setCancelContract(null);
    } catch (error) {
      console.error('Failed to cancel contract:', error);
      alert('Failed to cancel contract. Please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  // Check if contract can be cancelled by customer
  const canCancel = (contract: UnifiedContract) => {
    // Can only cancel ACTIVE or earlier states (not COMPLETED or CANCELLED)
    // For purchase, cannot cancel after final payment
    return contract.status === 'ACTIVE' || 
           contract.status === 'PENDING_PAYMENT' || 
           contract.status === 'WAITING_OFFICIAL';
  };

  // Check if contract can be rated
  const canRate = (contract: UnifiedContract) => {
    return contract.status === 'COMPLETED' && !contract.rating;
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
            {unifiedContracts.length} contracts total ({depositContracts.length} deposits, {purchaseContracts.length} purchases)
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {(['all', 'deposit', 'purchase'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                  typeFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                  filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.map((contract) => (
          <div
            key={`${contract.contractType}-${contract.id}`}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">{contract.contractNumber || 'No number'}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{contract.propertyTitle}</h3>
                {contract.mainContractType && (
                  <p className="text-sm text-gray-500 mt-1">For: {contract.mainContractType}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={contract.contractType === 'DEPOSIT' ? 'warning' : 'sale'}>
                  {contract.contractType}
                </Badge>
                <Badge variant={statusVariants[contract.status]}>
                  {statusLabels[contract.status]}
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
                <p className="text-xs text-gray-500">{contract.contractType === 'DEPOSIT' ? 'Deposit Amount' : 'Property Value'}</p>
                <p className="text-sm font-bold text-red-600 mt-1">{formatAmount(contract.totalValue)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Agent</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {contract.agentName || 'TBA'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(contract.createdAt)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleViewDetail(contract)}
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
              
              {/* Rate Button for completed contracts */}
              {canRate(contract) && (
                <button
                  onClick={() => handleRate(contract)}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors"
                >
                  <Star className="w-4 h-4" />
                  Rate
                </button>
              )}
              
              {/* Cancel Button */}
              {canCancel(contract) && (
                <button
                  onClick={() => handleRequestCancel(contract)}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Request Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredContracts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
          <p className="text-gray-500 text-sm">Try changing your filter</p>
        </div>
      )}

      {/* Deposit Details Modal */}
      {selectedDeposit && (
        <Modal
          isOpen={!!selectedDeposit}
          onClose={() => setSelectedDeposit(null)}
          title="Deposit Contract Details"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Property - Navigatable */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">{selectedDeposit.contractNumber || 'No number'}</p>
              <a 
                href={`/property/${selectedDeposit.property.id}`}
                className="font-bold text-gray-900 hover:text-red-600 transition-colors inline-flex items-center gap-1"
              >
                {selectedDeposit.property.title}
                <Eye className="w-3 h-3" />
              </a>
              <p className="text-sm text-gray-500 mt-1">{selectedDeposit.property.fullAddress}</p>
              <div className="flex gap-2 mt-2 items-center">
                <Badge variant="warning">DEPOSIT</Badge>
                <Badge variant={statusVariants[selectedDeposit.status]}>
                  {statusLabels[selectedDeposit.status]}
                </Badge>
              </div>
              {/* Property Price */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-500">Property Price: </span>
                <span className="font-bold text-red-600">{formatAmount(selectedDeposit.property.priceAmount)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Deposit Amount</p>
                <p className="font-bold text-red-600">{formatAmount(selectedDeposit.depositAmount)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Agreed Price</p>
                <p className="font-medium text-gray-900">{formatAmount(selectedDeposit.agreedPrice)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Main Contract Type</p>
                <p className="font-medium text-gray-900">{selectedDeposit.mainContractType}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Expires</p>
                <p className="font-medium text-gray-900">{formatDate(selectedDeposit.endDate)}</p>
              </div>
            </div>

            {/* Parties - Navigatable */}
            <div className="grid grid-cols-2 gap-4">
              <a 
                href={`/profile/${selectedDeposit.owner.id}`}
                className="p-3 bg-green-50 rounded-lg border border-green-100 hover:border-green-300 transition-colors block"
              >
                <p className="text-xs text-green-600">Property Owner</p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  {selectedDeposit.owner.firstName} {selectedDeposit.owner.lastName}
                  <Eye className="w-3 h-3 text-green-600" />
                </p>
                <p className="text-xs text-gray-500">{selectedDeposit.owner.phone}</p>
              </a>
              {selectedDeposit.agent && (
                <a 
                  href={`/profile/${selectedDeposit.agent.id}`}
                  className="p-3 bg-purple-50 rounded-lg border border-purple-100 hover:border-purple-300 transition-colors block"
                >
                  <p className="text-xs text-purple-600">Sales Agent</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    {selectedDeposit.agent.firstName} {selectedDeposit.agent.lastName}
                    <Eye className="w-3 h-3 text-purple-600" />
                  </p>
                  <p className="text-xs text-gray-500">{selectedDeposit.agent.phone}</p>
                </a>
              )}
            </div>

            {/* Linked Purchase Contract */}
            {selectedDeposit.linkedPurchaseContractId && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-xs text-emerald-700 font-medium mb-2">Linked Purchase Contract</p>
                <button 
                  onClick={async () => {
                    setSelectedDeposit(null);
                    const purchase = await contractService.getPurchaseContractById(selectedDeposit.linkedPurchaseContractId!);
                    setSelectedPurchase(purchase);
                  }}
                  className="font-medium text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
                >
                  View Purchase Contract
                  <Eye className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Rating */}
            {selectedDeposit.rating && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-700">Your Rating:</span>
                <StarRating rating={selectedDeposit.rating} size="sm" />
                {selectedDeposit.comment && (
                  <span className="text-sm text-gray-500 ml-2">"{selectedDeposit.comment}"</span>
                )}
              </div>
            )}

            {/* Payments */}
            {selectedDeposit.payments.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Payments</h5>
                <div className="space-y-2">
                  {selectedDeposit.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{p.paymentType}</p>
                        <p className="text-xs text-gray-500">Due: {formatDate(p.dueDate)}</p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-bold text-gray-900">{formatAmount(p.amount)}</p>
                          <Badge variant={p.status === 'SUCCESS' ? 'success' : p.status === 'PENDING' ? 'warning' : 'default'}>
                            {p.status}
                          </Badge>
                        </div>
                        {p.status === 'PENDING' && p.checkoutUrl && (
                          <a 
                            href={p.checkoutUrl} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            Pay Now
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Terms */}
            {selectedDeposit.specialTerms && (
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Special Terms</h5>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedDeposit.specialTerms}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Purchase Details Modal */}
      {selectedPurchase && (
        <Modal
          isOpen={!!selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
          title="Purchase Contract Details"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Property - Navigatable */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">{selectedPurchase.contractNumber || 'No number'}</p>
              <a 
                href={`/property/${selectedPurchase.property.id}`}
                className="font-bold text-gray-900 hover:text-red-600 transition-colors inline-flex items-center gap-1"
              >
                {selectedPurchase.property.title}
                <Eye className="w-3 h-3" />
              </a>
              <p className="text-sm text-gray-500 mt-1">{selectedPurchase.property.fullAddress}</p>
              <div className="flex gap-2 mt-2 items-center">
                <Badge variant="sale">PURCHASE</Badge>
                <Badge variant={statusVariants[selectedPurchase.status]}>
                  {statusLabels[selectedPurchase.status]}
                </Badge>
              </div>
              {/* Property Price */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-500">Property Price: </span>
                <span className="font-bold text-red-600">{formatAmount(selectedPurchase.property.priceAmount)}</span>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Financial Summary</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Property Value</p>
                  <p className="font-bold text-red-600 text-lg">{formatAmount(selectedPurchase.propertyValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Advance Payment</p>
                  <p className="font-medium text-gray-900">{formatAmount(selectedPurchase.advancePaymentAmount || 0)}</p>
                </div>
              </div>
            </div>

            {/* Linked Deposit - Clickable */}
            {selectedPurchase.depositContractId && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700 font-medium mb-2">Linked Deposit Contract</p>
                <button 
                  onClick={async () => {
                    setSelectedPurchase(null);
                    const deposit = await contractService.getDepositContractById(selectedPurchase.depositContractId!);
                    setSelectedDeposit(deposit);
                  }}
                  className="font-medium text-amber-800 hover:text-amber-900 flex items-center gap-1"
                >
                  View Deposit Contract
                  <Eye className="w-3 h-3" />
                </button>
                <Badge variant={selectedPurchase.depositContractStatus === 'COMPLETED' ? 'success' : selectedPurchase.depositContractStatus === 'ACTIVE' ? 'info' : 'warning'} className="mt-2">
                  Deposit: {selectedPurchase.depositContractStatus}
                </Badge>
              </div>
            )}

            {/* Parties - Navigatable */}
            <div className="grid grid-cols-2 gap-4">
              <a 
                href={`/profile/${selectedPurchase.owner.id}`}
                className="p-3 bg-green-50 rounded-lg border border-green-100 hover:border-green-300 transition-colors block"
              >
                <p className="text-xs text-green-600">Seller (Property Owner)</p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  {selectedPurchase.owner.firstName} {selectedPurchase.owner.lastName}
                  <Eye className="w-3 h-3 text-green-600" />
                </p>
                <p className="text-xs text-gray-500">{selectedPurchase.owner.phone}</p>
              </a>
              {selectedPurchase.agent && (
                <a 
                  href={`/profile/${selectedPurchase.agent.id}`}
                  className="p-3 bg-purple-50 rounded-lg border border-purple-100 hover:border-purple-300 transition-colors block"
                >
                  <p className="text-xs text-purple-600">Sales Agent</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    {selectedPurchase.agent.firstName} {selectedPurchase.agent.lastName}
                    <Eye className="w-3 h-3 text-purple-600" />
                  </p>
                  <p className="text-xs text-gray-500">{selectedPurchase.agent.phone}</p>
                </a>
              )}
            </div>

            {/* Rating */}
            {selectedPurchase.rating && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-700">Your Rating:</span>
                <StarRating rating={selectedPurchase.rating} size="sm" />
                {selectedPurchase.comment && (
                  <span className="text-sm text-gray-500 ml-2">"{selectedPurchase.comment}"</span>
                )}
              </div>
            )}

            {/* Payments */}
            {selectedPurchase.payments.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Payments</h5>
                <div className="space-y-2">
                  {selectedPurchase.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{p.paymentType}</p>
                        <p className="text-xs text-gray-500">Due: {formatDate(p.dueDate)}</p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-bold text-gray-900">{formatAmount(p.amount)}</p>
                          <Badge variant={p.status === 'SUCCESS' ? 'success' : p.status === 'PENDING' ? 'warning' : 'default'}>
                            {p.status}
                          </Badge>
                        </div>
                        {p.status === 'PENDING' && p.checkoutUrl && (
                          <a 
                            href={p.checkoutUrl} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            Pay Now
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Rating Modal */}
      {showRatingModal && ratingContract && (
        <Modal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          title="Rate Your Contract Experience"
        >
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-4">
                How was your overall experience with this {ratingContract.contractType.toLowerCase()} contract?
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

      {/* Cancel Confirmation Modal */}
      {showCancelModal && cancelContract && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Contract"
        >
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Warning: Contract Cancellation</p>
                <p className="text-xs text-red-700 mt-1">
                  {cancelContract.contractType === 'DEPOSIT' 
                    ? 'If you cancel this deposit contract, you will lose the deposit amount.'
                    : 'Cancelling this purchase contract may have financial implications.'
                  }
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Reason *</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                placeholder="Please provide a reason for cancellation..."
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Keep Contract
              </button>
              <button
                onClick={submitCancel}
                disabled={!cancelReason.trim() || isSubmitting}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
