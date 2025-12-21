'use client';

import React, { useState } from 'react';
import { FileText, Calendar, DollarSign, Eye, Printer, PenLine, X, Download, ChevronLeft, ChevronRight, Star, AlertCircle, Check } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import StarRating from '@/app/components/ui/StarRating';

type ContractStatus = 'Draft' | 'Pending' | 'Active' | 'Completed' | 'Cancelled' | 'Expired';
type ContractType = 'Sale' | 'Rental';

interface Contract {
  id: number;
  contractNumber: string;
  propertyName: string;
  propertyImage: string;
  propertyAddress: string;
  contractType: ContractType;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  totalValue: string;
  paidAmount: string;
  remainingAmount: string;
  owner: { name: string; phone: string };
  agent: { name: string; phone: string };
  terms: string;
  rating: number | null;
}

// Mock data
const mockContracts: Contract[] = [
  {
    id: 1,
    contractNumber: 'CTR-2024-001',
    propertyName: 'Modern Villa with Pool',
    propertyImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    propertyAddress: 'District 7, Ho Chi Minh City',
    contractType: 'Sale' as const,
    status: 'Active' as const,
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    totalValue: '$850,000',
    paidAmount: '$255,000',
    remainingAmount: '$595,000',
    owner: { name: 'Nguyễn Văn Owner', phone: '0909111111' },
    agent: { name: 'Trần Văn Agent', phone: '0909222222' },
    terms: 'Monthly installment payment over 12 months',
    rating: null,
  },
  {
    id: 2,
    contractNumber: 'CTR-2024-002',
    propertyName: 'Luxury Apartment Downtown',
    propertyImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    propertyAddress: 'District 1, Ho Chi Minh City',
    contractType: 'Rental' as const,
    status: 'Pending' as const,
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    totalValue: '$14,400/year',
    paidAmount: '$0',
    remainingAmount: '$14,400',
    owner: { name: 'Lê Văn Owner', phone: '0909333333' },
    agent: { name: 'Phạm Thị Agent', phone: '0909444444' },
    terms: 'Monthly rent payment',
    rating: null,
  },
  {
    id: 3,
    contractNumber: 'CTR-2023-015',
    propertyName: 'Cozy Studio Near Park',
    propertyImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    propertyAddress: 'Binh Thanh District',
    contractType: 'Rental' as const,
    status: 'Completed' as const,
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    totalValue: '$5,400/year',
    paidAmount: '$5,400',
    remainingAmount: '$0',
    owner: { name: 'Hoàng Văn Owner', phone: '0909555555' },
    agent: { name: 'Vũ Văn Agent', phone: '0909666666' },
    terms: 'Monthly rent payment',
    rating: 5,
  },
];

const statusVariants: Record<ContractStatus, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  Draft: 'default',
  Pending: 'warning',
  Active: 'info',
  Completed: 'success',
  Cancelled: 'danger',
  Expired: 'default',
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingContract, setRatingContract] = useState<Contract | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredContracts = contracts.filter(c => {
    if (filter === 'active') return c.status === 'Active' || c.status === 'Pending';
    if (filter === 'completed') return c.status === 'Completed' || c.status === 'Cancelled';
    return true;
  });

  const handleSign = (contract: Contract) => {
    setSelectedContract(contract);
    setShowSignModal(true);
  };

  const confirmSign = () => {
    if (selectedContract) {
      setContracts(contracts.map(c => 
        c.id === selectedContract.id ? { ...c, status: 'Active' as ContractStatus } : c
      ));
      setShowSignModal(false);
      setSelectedContract(null);
    }
  };

  const handleRate = (contract: Contract) => {
    setRatingContract(contract);
    setNewRating(0);
    setShowRatingModal(true);
  };

  const submitRating = () => {
    if (ratingContract) {
      setContracts(contracts.map(c => 
        c.id === ratingContract.id ? { ...c, rating: newRating } : c
      ));
      setShowRatingModal(false);
    }
  };

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
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'completed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            Completed
          </button>
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

                {/* Contract Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Contract Period</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {contract.startDate}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">to {contract.endDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Value</p>
                    <p className="text-sm font-bold text-red-600 mt-1">{contract.totalValue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Paid</p>
                    <p className="text-sm font-medium text-green-600 mt-1">{contract.paidAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Remaining</p>
                    <p className="text-sm font-medium text-orange-600 mt-1">{contract.remainingAmount}</p>
                  </div>
                </div>

                {/* Rating */}
                {contract.status === 'Completed' && contract.rating && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-gray-500">Your Rating:</span>
                    <StarRating rating={contract.rating} size="sm" />
                  </div>
                )}

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
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  {contract.status === 'Pending' && (
                    <button
                      onClick={() => handleSign(contract)}
                      className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      <PenLine className="w-4 h-4" />
                      Sign Contract
                    </button>
                  )}
                  {contract.status === 'Completed' && !contract.rating && (
                    <button
                      onClick={() => handleRate(contract)}
                      className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors"
                    >
                      <Star className="w-4 h-4" />
                      Rate
                    </button>
                  )}
                  {(contract.status === 'Active' || contract.status === 'Pending') && (
                    <button className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                      <X className="w-4 h-4" />
                      Request Cancel
                    </button>
                  )}
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

            {/* Contract Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="font-medium text-gray-900">{selectedContract.startDate}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">End Date</p>
                <p className="font-medium text-gray-900">{selectedContract.endDate}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Total Value</p>
                <p className="font-bold text-red-600">{selectedContract.totalValue}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Paid Amount</p>
                <p className="font-medium text-green-600">{selectedContract.paidAmount}</p>
              </div>
            </div>

            {/* Parties */}
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-2">Contract Parties</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-gray-500">Property Owner</p>
                  <p className="font-medium text-gray-900">{selectedContract.owner.name}</p>
                  <p className="text-xs text-gray-500">{selectedContract.owner.phone}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-gray-500">Sales Agent</p>
                  <p className="font-medium text-gray-900">{selectedContract.agent.name}</p>
                  <p className="text-xs text-gray-500">{selectedContract.agent.phone}</p>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-2">Payment Terms</h5>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedContract.terms}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Sign Confirmation Modal */}
      {showSignModal && selectedContract && (
        <Modal
          isOpen={showSignModal}
          onClose={() => setShowSignModal(false)}
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
              <p className="text-sm mt-1"><strong>Property:</strong> {selectedContract.propertyName}</p>
              <p className="text-sm mt-1"><strong>Total Value:</strong> <span className="text-red-600 font-bold">{selectedContract.totalValue}</span></p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowSignModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSign}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirm & Sign
              </button>
            </div>
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
                How was your overall experience with contract <strong>{ratingContract.contractNumber}</strong>?
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

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                disabled={newRating === 0}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
