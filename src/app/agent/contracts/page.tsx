'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Eye, Send, Building, User, Calendar, DollarSign, CheckCircle, CreditCard, Loader2, ListFilter, Edit2, Trash2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Skeleton from '@/app/components/ui/Skeleton';
import { 
  contractService, 
  DepositContractListItem, 
  PurchaseContractListItem,
  RentalContractListItem,
  DepositContractDetailResponse,
  PurchaseContractDetailResponse,
  RentalContractDetailResponse,
  ContractStatusEnum
} from '@/lib/api/services/contract.service';

type ContractType = 'DEPOSIT' | 'PURCHASE' | 'RENTAL';

interface UnifiedContract {
  id: string;
  contractNumber?: string;
  propertyTitle: string;
  contractType: ContractType;
  status: ContractStatusEnum;
  customerName: string;
  startDate: string;
  endDate?: string;
  totalValue: number;
  commissionAmount?: number;
  agentName?: string;
  createdAt: string;
  // Additional fields for display
  mainContractType?: string; // For deposits: RENTAL or PURCHASE
  linkedToMainContract?: boolean;
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

export default function AgentContractsPage() {
  const router = useRouter();
  const [depositContracts, setDepositContracts] = useState<DepositContractListItem[]>([]);
  const [purchaseContracts, setPurchaseContracts] = useState<PurchaseContractListItem[]>([]);
  const [rentalContracts, setRentalContracts] = useState<RentalContractListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositContractDetailResponse | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseContractDetailResponse | null>(null);
  const [selectedRental, setSelectedRental] = useState<RentalContractDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'purchase' | 'rental'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      // Load agent's assigned contracts using role-specific endpoints
      const [depositResponse, purchaseResponse, rentalResponse] = await Promise.all([
        contractService.getMyAssignedDepositContracts(),
        contractService.getMyAssignedPurchaseContracts(),
        contractService.getMyAssignedRentalContracts()
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
      customerName: d.customerName,
      startDate: d.startDate,
      endDate: d.endDate,
      totalValue: d.depositAmount,
      agentName: d.agentName,
      createdAt: d.createdAt,
      mainContractType: d.mainContractType,
      linkedToMainContract: d.linkedToMainContract,
    })),
    ...purchaseContracts.map(p => ({
      id: p.id,
      contractNumber: p.contractNumber,
      propertyTitle: p.propertyTitle,
      contractType: 'PURCHASE' as ContractType,
      status: p.status,
      customerName: p.customerName,
      startDate: p.startDate,
      totalValue: p.propertyValue,
      commissionAmount: p.commissionAmount,
      agentName: p.agentName,
      createdAt: p.createdAt,
    })),
    ...rentalContracts.map(r => ({
      id: r.id,
      contractNumber: r.contractNumber,
      propertyTitle: r.propertyTitle,
      contractType: 'RENTAL' as ContractType,
      status: r.status,
      customerName: r.customerName,
      startDate: r.startDate,
      endDate: r.endDate,
      totalValue: r.monthlyRentAmount * (r.monthCount || 1),
      commissionAmount: r.commissionAmount,
      agentName: r.agentName,
      createdAt: r.createdAt,
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter contracts
  const filteredContracts = unifiedContracts.filter(c => {
    const matchesSearch = c.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filter === 'all' ? true :
                        filter === 'deposit' ? c.contractType === 'DEPOSIT' :
                        filter === 'purchase' ? c.contractType === 'PURCHASE' :
                        filter === 'rental' ? c.contractType === 'RENTAL' :
                        true;
    
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? c.status === 'ACTIVE' :
      statusFilter === 'pending' ? (c.status === 'DRAFT' || c.status === 'WAITING_OFFICIAL' || c.status === 'PENDING_PAYMENT') :
      statusFilter === 'completed' ? (c.status === 'COMPLETED' || c.status === 'CANCELLED') :
      true;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats
  const totalActive = unifiedContracts.filter(c => c.status === 'ACTIVE').length;
  const totalPending = unifiedContracts.filter(c => c.status === 'DRAFT' || c.status === 'WAITING_OFFICIAL' || c.status === 'PENDING_PAYMENT').length;
  const totalCommission = purchaseContracts
    .filter(c => c.status === 'ACTIVE' || c.status === 'COMPLETED')
    .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

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
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleApprove = async (contract: UnifiedContract) => {
    if (!confirm('Are you sure you want to approve this contract?')) return;
    setIsProcessing(true);
    try {
      if (contract.contractType === 'DEPOSIT') {
        await contractService.approveDepositContract(contract.id);
      } else {
        await contractService.approvePurchaseContract(contract.id);
      }
      await loadContracts();
    } catch (error) {
      console.error('Failed to approve contract:', error);
      alert('Failed to approve contract');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreatePayment = async (contractId: string) => {
    if (!confirm('Create payment for this contract?')) return;
    setIsProcessing(true);
    try {
      await contractService.createDepositPayment(contractId);
      await loadContracts();
    } catch (error) {
      console.error('Failed to create payment:', error);
      alert('Failed to create payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompletePaperwork = async (contract: UnifiedContract) => {
    if (!confirm('Mark paperwork as complete?')) return;
    setIsProcessing(true);
    try {
      if (contract.contractType === 'DEPOSIT') {
        await contractService.completeDepositPaperwork(contract.id);
      } else {
        await contractService.completePurchasePaperwork(contract.id);
      }
      await loadContracts();
    } catch (error) {
      console.error('Failed to complete paperwork:', error);
      alert('Failed to complete paperwork');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (contract: UnifiedContract) => {
    if (!confirm(`Are you sure you want to delete this ${contract.contractType.toLowerCase()} contract? This action cannot be undone.`)) return;
    setDeletingId(contract.id);
    try {
      if (contract.contractType === 'DEPOSIT') {
        await contractService.deleteDepositContract(contract.id);
      } else if (contract.contractType === 'PURCHASE') {
        await contractService.deletePurchaseContract(contract.id);
      } else if (contract.contractType === 'RENTAL') {
        await contractService.deleteRentalContract(contract.id);
      }
      await loadContracts();
    } catch (error) {
      console.error('Failed to delete contract:', error);
      alert('Failed to delete contract. Only DRAFT contracts can be deleted.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (contract: UnifiedContract) => {
    // For agents, just open the detail modal - edit functionality is done through the modal
    // Do NOT navigate to admin routes - agents don't have access
    handleViewDetail(contract);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton height={100} />
          <Skeleton height={100} />
          <Skeleton height={100} />
        </div>
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
            Contracts
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage deposit and purchase contracts
          </p>
        </div>
        <Link
          href="/contracts/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Contract
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Contracts</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{totalActive}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{totalPending}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Commission</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatAmount(totalCommission)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contracts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
          />
        </div>
        
        {/* Type Filter */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {(['all', 'deposit', 'purchase'] as const).map((f) => (
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

        {/* Status Filter */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {(['all', 'pending', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                statusFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Contract</th>
                <th className="px-6 py-4 font-medium">Property</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Value</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContracts.map((contract) => (
                <tr key={`${contract.contractType}-${contract.id}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{contract.contractNumber || 'No Number'}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant={contract.contractType === 'DEPOSIT' ? 'warning' : 'sale'}>
                        {contract.contractType}
                      </Badge>
                      {contract.mainContractType && (
                        <span className="text-xs text-gray-500">for {contract.mainContractType}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{contract.propertyTitle}</p>
                    <p className="text-xs text-gray-500">{formatDate(contract.startDate)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{contract.customerName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{formatAmount(contract.totalValue)}</p>
                    {contract.commissionAmount && (
                      <p className="text-xs text-green-600">+{formatAmount(contract.commissionAmount)} commission</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariants[contract.status]}>
                      {statusLabels[contract.status]}
                    </Badge>
                    {contract.linkedToMainContract && (
                      <p className="text-xs text-green-600 mt-1">Linked</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      <button
                        onClick={() => handleViewDetail(contract)}
                        disabled={loadingDetail}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        title="View Details"
                      >
                        {loadingDetail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                      </button>
                      
                      {/* Draft Actions */}
                      {contract.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => handleEdit(contract)}
                            disabled={isProcessing}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Edit Contract"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApprove(contract)}
                            disabled={isProcessing}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve Contract"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contract)}
                            disabled={isProcessing || deletingId === contract.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Contract"
                          >
                            {deletingId === contract.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </>
                      )}
                      
                      {/* Waiting Official Actions */}
                      {contract.status === 'WAITING_OFFICIAL' && (
                        <>
                          {contract.contractType === 'DEPOSIT' && (
                            <button
                              onClick={() => handleCreatePayment(contract.id)}
                              disabled={isProcessing}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Create Payment"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleCompletePaperwork(contract)}
                            disabled={isProcessing}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Complete Paperwork"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredContracts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Deposit Contract Details Modal */}
      {selectedDeposit && (
        <Modal
          isOpen={!!selectedDeposit}
          onClose={() => setSelectedDeposit(null)}
          title="Deposit Contract Details"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Property Info - Navigatable */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">{selectedDeposit.contractNumber || 'No contract number'}</p>
              <Link 
                href={`/property/${selectedDeposit.property.id}`}
                className="font-bold text-gray-900 hover:text-red-600 transition-colors inline-flex items-center gap-1"
                onClick={() => setSelectedDeposit(null)}
              >
                {selectedDeposit.property.title}
                <Eye className="w-3 h-3" />
              </Link>
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

            {/* Contract Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Main Contract Type</p>
                <p className="font-medium text-gray-900">{selectedDeposit.mainContractType}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Deposit Amount</p>
                <p className="font-bold text-red-600">{formatAmount(selectedDeposit.depositAmount)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Agreed Price</p>
                <p className="font-medium text-gray-900">{formatAmount(selectedDeposit.agreedPrice)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">End Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedDeposit.endDate)}</p>
              </div>
            </div>

            {/* Parties - Navigatable */}
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href={`/profile/${selectedDeposit.customer.id}`}
                className="p-3 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-300 transition-colors block"
                onClick={() => setSelectedDeposit(null)}
              >
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Customer
                </p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  {selectedDeposit.customer.firstName} {selectedDeposit.customer.lastName}
                  <Eye className="w-3 h-3 text-blue-600" />
                </p>
                <p className="text-xs text-gray-500">{selectedDeposit.customer.phone}</p>
              </Link>
              <Link 
                href={`/profile/${selectedDeposit.owner.id}`}
                className="p-3 bg-green-50 rounded-lg border border-green-100 hover:border-green-300 transition-colors block"
                onClick={() => setSelectedDeposit(null)}
              >
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  Owner
                </p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  {selectedDeposit.owner.firstName} {selectedDeposit.owner.lastName}
                  <Eye className="w-3 h-3 text-green-600" />
                </p>
                <p className="text-xs text-gray-500">{selectedDeposit.owner.phone}</p>
              </Link>
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
                  {selectedDeposit.linkedPurchaseContractId.slice(0, 8)}...
                  <Eye className="w-3 h-3" />
                </button>
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
                        <p className="text-xs text-gray-500">{formatDate(p.dueDate)}</p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-bold text-gray-900">{formatAmount(p.amount)}</p>
                          <Badge variant={p.status === 'SUCCESS' ? 'success' : p.status === 'PENDING' ? 'warning' : 'default'}>
                            {p.status}
                          </Badge>
                        </div>
                        {/* Show payment link status for agents (they can share with customer) */}
                        {p.status === 'PENDING' && p.checkoutUrl && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            Payment link ready
                          </span>
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

      {/* Purchase Contract Details Modal */}
      {selectedPurchase && (
        <Modal
          isOpen={!!selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
          title="Purchase Contract Details"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Property Info - Navigatable */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">{selectedPurchase.contractNumber || 'No contract number'}</p>
              <Link 
                href={`/property/${selectedPurchase.property.id}`}
                className="font-bold text-gray-900 hover:text-red-600 transition-colors inline-flex items-center gap-1"
                onClick={() => setSelectedPurchase(null)}
              >
                {selectedPurchase.property.title}
                <Eye className="w-3 h-3" />
              </Link>
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

            {/* Financial Summary */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Financial Summary</h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Property Value</p>
                  <p className="font-bold text-gray-900">{formatAmount(selectedPurchase.propertyValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Advance Payment</p>
                  <p className="font-medium text-gray-900">{formatAmount(selectedPurchase.advancePaymentAmount || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Commission</p>
                  <p className="font-bold text-green-600">{formatAmount(selectedPurchase.commissionAmount)}</p>
                </div>
              </div>
            </div>

            {/* Linked Deposit - Fetch full details */}
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
                  {selectedPurchase.depositContractId.slice(0, 8)}...
                  <Eye className="w-3 h-3" />
                </button>
                <Badge variant={selectedPurchase.depositContractStatus === 'COMPLETED' ? 'success' : selectedPurchase.depositContractStatus === 'ACTIVE' ? 'info' : 'warning'} className="mt-2">
                  Deposit: {selectedPurchase.depositContractStatus}
                </Badge>
              </div>
            )}

            {/* Parties - Navigatable */}
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href={`/profile/${selectedPurchase.customer.id}`}
                className="p-3 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-300 transition-colors block"
                onClick={() => setSelectedPurchase(null)}
              >
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Buyer
                </p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  {selectedPurchase.customer.firstName} {selectedPurchase.customer.lastName}
                  <Eye className="w-3 h-3 text-blue-600" />
                </p>
                <p className="text-xs text-gray-500">{selectedPurchase.customer.phone}</p>
              </Link>
              <Link 
                href={`/profile/${selectedPurchase.owner.id}`}
                className="p-3 bg-green-50 rounded-lg border border-green-100 hover:border-green-300 transition-colors block"
                onClick={() => setSelectedPurchase(null)}
              >
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  Seller
                </p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  {selectedPurchase.owner.firstName} {selectedPurchase.owner.lastName}
                  <Eye className="w-3 h-3 text-green-600" />
                </p>
                <p className="text-xs text-gray-500">{selectedPurchase.owner.phone}</p>
              </Link>
            </div>

            {/* Payments */}
            {selectedPurchase.payments.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Payments</h5>
                <div className="space-y-2">
                  {selectedPurchase.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{p.paymentType}</p>
                        <p className="text-xs text-gray-500">{formatDate(p.dueDate)}</p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-bold text-gray-900">{formatAmount(p.amount)}</p>
                          <Badge variant={p.status === 'SUCCESS' ? 'success' : p.status === 'PENDING' ? 'warning' : 'default'}>
                            {p.status}
                          </Badge>
                        </div>
                        {/* Show payment link status for agents (they can share with customer) */}
                        {p.status === 'PENDING' && p.checkoutUrl && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            Payment link ready
                          </span>
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
    </div>
  );
}
