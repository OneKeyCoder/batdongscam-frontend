'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Eye, Download, Printer, Send, Building, User, Calendar, DollarSign } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import Link from 'next/link';
import { contractService } from '@/lib/api/services/contract.service';

type ContractStatus = 'Draft' | 'Pending Signature' | 'Active' | 'Completed' | 'Cancelled';
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
  customerPhone: string;
  ownerName: string;
  startDate: string;
  endDate: string;
  totalValue: string;
  commission: string;
  createdAt: string;
}

// Removed mock data - using real API

const statusVariants: Record<ContractStatus, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  Draft: 'default',
  'Pending Signature': 'warning',
  Active: 'info',
  Completed: 'success',
  Cancelled: 'danger',
};

export default function AgentContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      const data = await contractService.getAgentContracts();
      const mappedData: Contract[] = data.map((item: any) => ({
        id: item.id,
        contractNumber: item.id,
        propertyName: item.propertyTitle || 'Untitled',
        propertyImage: '',
        propertyAddress: item.propertyAddress || '',
        contractType: item.contractType === 'SALE' ? 'Sale' : 'Rental',
        status: mapStatus(item.status),
        customerName: item.customerName || 'Unknown',
        customerPhone: '',
        ownerName: item.ownerName || 'Unknown',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        totalValue: item.price ? `$${item.price.toLocaleString()}` : 'N/A',
        commission: 'N/A',
        createdAt: item.createdAt || ''
      }));
      setContracts(mappedData);
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mapStatus = (apiStatus: string): ContractStatus => {
    switch (apiStatus) {
      case 'ACTIVE': return 'Active';
      case 'PENDING': return 'Pending Signature';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return 'Draft';
    }
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? c.status === 'Active' :
      filter === 'pending' ? (c.status === 'Draft' || c.status === 'Pending Signature') :
      filter === 'completed' ? (c.status === 'Completed' || c.status === 'Cancelled') :
      true;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const totalActive = contracts.filter(c => c.status === 'Active').length;
  const totalPending = contracts.filter(c => c.status === 'Draft' || c.status === 'Pending Signature').length;
  const totalCommission = contracts
    .filter(c => c.status === 'Active' || c.status === 'Completed')
    .reduce((sum, c) => sum + parseFloat(c.commission.replace(/[^0-9.]/g, '')), 0);

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
            Manage your contracts and commissions
          </p>
        </div>
        <Link
          href="/agent/contracts/new"
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
              <p className="text-2xl font-bold text-green-600 mt-1">${totalCommission.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
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
            placeholder="Search contracts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {(['all', 'active', 'pending', 'completed'] as const).map((f) => (
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
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Contract</th>
                <th className="px-6 py-4 font-medium">Property</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Value</th>
                <th className="px-6 py-4 font-medium">Commission</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{contract.contractNumber}</p>
                    <Badge variant={contract.contractType === 'Sale' ? 'sale' : 'rental'}>
                      {contract.contractType}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={contract.propertyImage}
                        alt={contract.propertyName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{contract.propertyName}</p>
                        <p className="text-xs text-gray-500">{contract.propertyAddress}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{contract.customerName}</p>
                    <p className="text-xs text-gray-500">{contract.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{contract.totalValue}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-green-600">{contract.commission}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariants[contract.status]}>
                      {contract.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedContract(contract)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {contract.status === 'Draft' && (
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Send for Signature"
                        >
                          <Send className="w-4 h-4" />
                        </button>
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

      {/* Contract Details Modal */}
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
                className="w-20 h-20 rounded-lg object-cover"
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

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Customer
                </p>
                <p className="font-medium text-gray-900">{selectedContract.customerName}</p>
                <p className="text-xs text-gray-500">{selectedContract.customerPhone}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  Owner
                </p>
                <p className="font-medium text-gray-900">{selectedContract.ownerName}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Start Date
                </p>
                <p className="font-medium text-gray-900">{selectedContract.startDate || 'TBD'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  End Date
                </p>
                <p className="font-medium text-gray-900">{selectedContract.endDate || 'TBD'}</p>
              </div>
            </div>

            {/* Financial */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Financial Summary</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Contract Value</p>
                  <p className="font-bold text-gray-900 text-lg">{selectedContract.totalValue}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Your Commission</p>
                  <p className="font-bold text-green-600 text-lg">{selectedContract.commission}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
