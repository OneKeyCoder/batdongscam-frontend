'use client';

import React, { useState } from 'react';
import { FileText, Calendar, DollarSign, Eye, Download, Search, Filter, Building, Users } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import Link from 'next/link';

type ContractStatus = 'Draft' | 'Pending' | 'Active' | 'Completed' | 'Cancelled';
type ContractType = 'Sale' | 'Rental';

interface Contract {
  id: number;
  contractNumber: string;
  propertyName: string;
  propertyImage: string;
  propertyAddress: string;
  contractType: ContractType;
  status: ContractStatus;
  customerName: string;
  agentName: string;
  startDate: string;
  endDate: string;
  totalValue: string;
  receivedAmount: string;
  pendingAmount: string;
  commission: string;
}

// Mock data
const mockContracts: Contract[] = [
  {
    id: 1,
    contractNumber: 'CTR-2024-001',
    propertyName: 'Modern Villa with Pool',
    propertyImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    propertyAddress: 'District 7, Ho Chi Minh City',
    contractType: 'Sale',
    status: 'Active',
    customerName: 'Nguyễn Văn Khách',
    agentName: 'Trần Văn Agent',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    totalValue: '$850,000',
    receivedAmount: '$255,000',
    pendingAmount: '$595,000',
    commission: '$17,000',
  },
  {
    id: 2,
    contractNumber: 'CTR-2024-002',
    propertyName: 'Luxury Apartment Downtown',
    propertyImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    propertyAddress: 'District 1, Ho Chi Minh City',
    contractType: 'Rental',
    status: 'Active',
    customerName: 'Lê Thị Customer',
    agentName: 'Phạm Thị Agent',
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    totalValue: '$14,400/year',
    receivedAmount: '$2,400',
    pendingAmount: '$12,000',
    commission: '$1,200',
  },
  {
    id: 3,
    contractNumber: 'CTR-2023-015',
    propertyName: 'Cozy Studio Near Park',
    propertyImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    propertyAddress: 'Binh Thanh District',
    contractType: 'Rental',
    status: 'Completed',
    customerName: 'Phạm Văn Tenant',
    agentName: 'Vũ Văn Agent',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    totalValue: '$5,400/year',
    receivedAmount: '$5,400',
    pendingAmount: '$0',
    commission: '$540',
  },
];

const statusVariants: Record<ContractStatus, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  Draft: 'default',
  Pending: 'warning',
  Active: 'info',
  Completed: 'success',
  Cancelled: 'danger',
};

export default function OwnerContractsPage() {
  const [contracts] = useState<Contract[]>(mockContracts);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? (c.status === 'Active' || c.status === 'Pending') :
      filter === 'completed' ? (c.status === 'Completed' || c.status === 'Cancelled') :
      true;
    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const totalActive = contracts.filter(c => c.status === 'Active').length;
  const totalRevenue = contracts
    .filter(c => c.status !== 'Cancelled')
    .reduce((sum, c) => sum + parseFloat(c.receivedAmount.replace(/[^0-9.]/g, '')), 0);
  const totalPending = contracts
    .filter(c => c.status === 'Active' || c.status === 'Pending')
    .reduce((sum, c) => sum + parseFloat(c.pendingAmount.replace(/[^0-9.]/g, '')), 0);

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
              <p className="text-sm text-gray-500">Total Received</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${totalRevenue.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-orange-600 mt-1">${totalPending.toLocaleString()}</p>
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
        {filteredContracts.map((contract) => (
          <div 
            key={contract.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row">
              {/* Property Image */}
              <div className="w-full lg:w-48 h-40 lg:h-auto shrink-0">
                <img
                  src={contract.propertyImage}
                  alt={contract.propertyName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">{contract.contractNumber}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{contract.propertyName}</h3>
                    <p className="text-sm text-gray-500 mt-1">{contract.propertyAddress}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={contract.contractType === 'Sale' ? 'sale' : 'rental'}>
                      {contract.contractType}
                    </Badge>
                    <Badge variant={statusVariants[contract.status]}>
                      {contract.status}
                    </Badge>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Customer</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3 text-gray-400" />
                      {contract.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Value</p>
                    <p className="text-sm font-bold text-red-600 mt-1">{contract.totalValue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Received</p>
                    <p className="text-sm font-medium text-green-600 mt-1">{contract.receivedAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="text-sm font-medium text-orange-600 mt-1">{contract.pendingAmount}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedContract(contract)}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
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
            </div>
          </div>
        ))}
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
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={selectedContract.propertyImage}
                alt={selectedContract.propertyName}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div>
                <p className="text-xs text-gray-500">{selectedContract.contractNumber}</p>
                <h4 className="font-bold text-gray-900">{selectedContract.propertyName}</h4>
                <p className="text-sm text-gray-500 mt-1">{selectedContract.propertyAddress}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={selectedContract.contractType === 'Sale' ? 'sale' : 'rental'}>
                    {selectedContract.contractType}
                  </Badge>
                  <Badge variant={statusVariants[selectedContract.status]}>
                    {selectedContract.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">{selectedContract.customerName}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Agent</p>
                <p className="font-medium text-gray-900">{selectedContract.agentName}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="font-medium text-gray-900">{selectedContract.startDate}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">End Date</p>
                <p className="font-medium text-gray-900">{selectedContract.endDate}</p>
              </div>
            </div>

            {/* Financial Info */}
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Financial Summary</h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total Value</p>
                  <p className="font-bold text-red-600">{selectedContract.totalValue}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Received</p>
                  <p className="font-bold text-green-600">{selectedContract.receivedAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Your Commission</p>
                  <p className="font-bold text-purple-600">{selectedContract.commission}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
