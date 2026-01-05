'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Calendar, DollarSign, Eye, Download, Search, Building, Loader2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import Link from 'next/link';
import { contractService, ContractListItem, ContractDetailResponse } from '@/lib/api/services/contract.service';
import Skeleton from '@/app/components/ui/Skeleton';

type ContractStatus = 'DRAFT' | 'PENDING_SIGNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

const statusVariants: Record<ContractStatus, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  DRAFT: 'default',
  PENDING_SIGNING: 'warning',
  ACTIVE: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const statusLabels: Record<ContractStatus, string> = {
  DRAFT: 'Draft',
  PENDING_SIGNING: 'Pending',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function OwnerContractsPage() {
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<ContractDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      const response = await contractService.getMyOwnerContracts();
      setContracts(response.data || []);
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          `${c.customerFirstName} ${c.customerLastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? (c.status === 'ACTIVE' || c.status === 'PENDING_SIGNING') :
      filter === 'completed' ? (c.status === 'COMPLETED' || c.status === 'CANCELLED') :
      true;
    return matchesSearch && matchesFilter;
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

  // Calculate stats
  const totalActive = contracts.filter(c => c.status === 'ACTIVE').length;
  const totalRevenue = contracts
    .filter(c => c.status === 'COMPLETED' || c.status === 'ACTIVE')
    .reduce((sum, c) => sum + (c.totalContractAmount || 0), 0);
  const totalPending = contracts
    .filter(c => c.status === 'ACTIVE' || c.status === 'PENDING_SIGNING')
    .reduce((sum, c) => sum + (c.totalContractAmount || 0), 0);

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
        <Skeleton height={120} />
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
            Manage contracts for your properties
          </p>
        </div>
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
              <p className="text-sm text-gray-500">Total Contract Value</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatAmount(totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Amount</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{formatAmount(totalPending)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
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

              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {`${contract.customerFirstName || ''} ${contract.customerLastName || ''}`.trim() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Value</p>
                  <p className="text-sm font-bold text-red-600 mt-1">{formatAmount(contract.totalContractAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {formatDate(contract.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(contract.endDate)}</p>
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
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <Link
                  href="/owner/payments"
                  className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                  View Payments
                </Link>
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
          <p className="text-gray-500 text-sm">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedContract && (
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

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">{`${selectedContract.customerFirstName} ${selectedContract.customerLastName}`}</p>
                <p className="text-xs text-gray-500">{selectedContract.customerPhone}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Agent</p>
                <p className="font-medium text-gray-900">{`${selectedContract.agentFirstName} ${selectedContract.agentLastName}`}</p>
                <p className="text-xs text-gray-500">{selectedContract.agentPhone}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedContract.startDate)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">End Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedContract.endDate)}</p>
              </div>
            </div>

            {/* Financial Info */}
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Financial Summary</h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total Value</p>
                  <p className="font-bold text-red-600">{formatAmount(selectedContract.totalContractAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Deposit</p>
                  <p className="font-bold text-green-600">{formatAmount(selectedContract.depositAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Remaining</p>
                  <p className="font-bold text-orange-600">{formatAmount(selectedContract.remainingAmount)}</p>
                </div>
              </div>
            </div>

            {/* Special Terms */}
            {selectedContract.specialTerms && (
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Special Terms</h5>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedContract.specialTerms}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
