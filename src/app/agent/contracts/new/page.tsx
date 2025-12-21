'use client';

import React, { useState } from 'react';
import { ArrowLeft, FileText, Building, User, Calendar, DollarSign, Check, Search, Users } from 'lucide-react';
import Link from 'next/link';

// Mock data for dropdowns
const mockProperties = [
  { id: 'PROP-2024-001', name: 'Modern Villa with Pool', address: 'District 7, Ho Chi Minh City', price: '$850,000', type: 'Sale' },
  { id: 'PROP-2024-002', name: 'Luxury Apartment Downtown', address: 'District 1, Ho Chi Minh City', price: '$1,200/month', type: 'Rent' },
  { id: 'PROP-2024-003', name: 'Family House with Garden', address: 'Thu Duc City, Ho Chi Minh', price: '$650,000', type: 'Sale' },
];

const mockCustomers = [
  { id: 'CUS-2024-001', name: 'Nguyễn Văn Khách', phone: '0909123456', email: 'khach@email.com' },
  { id: 'CUS-2024-002', name: 'Lê Thị Customer', phone: '0909654321', email: 'customer@email.com' },
  { id: 'CUS-2024-003', name: 'Trần Văn Buyer', phone: '0909111222', email: 'buyer@email.com' },
];

interface ContractForm {
  propertyId: string;
  customerId: string;
  contractType: 'Sale' | 'Rental';
  startDate: string;
  endDate: string;
  totalValue: string;
  depositAmount: string;
  paymentTerms: string;
  specialConditions: string;
}

export default function CreateContractPage() {
  const [formData, setFormData] = useState<ContractForm>({
    propertyId: '',
    customerId: '',
    contractType: 'Sale',
    startDate: '',
    endDate: '',
    totalValue: '',
    depositAmount: '',
    paymentTerms: 'monthly',
    specialConditions: '',
  });

  const selectedProperty = mockProperties.find(p => p.id === formData.propertyId);
  const selectedCustomer = mockCustomers.find(c => c.id === formData.customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating contract:', formData);
    alert('Contract created successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/agent/contracts"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Contracts
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-red-600" />
          Create New Contract
        </h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to create a new contract</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Selection */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-red-600" />
            Property
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Property</label>
            <select
              value={formData.propertyId}
              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              required
            >
              <option value="">-- Select a property --</option>
              {mockProperties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name} - {property.address}
                </option>
              ))}
            </select>
          </div>

          {selectedProperty && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Selected Property</p>
              <p className="font-medium text-gray-900">{selectedProperty.name}</p>
              <p className="text-sm text-gray-600">{selectedProperty.address}</p>
              <p className="text-sm font-bold text-red-600 mt-1">{selectedProperty.price}</p>
            </div>
          )}
        </div>

        {/* Customer Selection */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-red-600" />
            Customer
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              required
            >
              <option value="">-- Select a customer --</option>
              {mockCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Selected Customer</p>
              <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
              <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
              <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
            </div>
          )}
        </div>

        {/* Contract Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-red-600" />
            Contract Details
          </h2>

          {/* Contract Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Contract Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, contractType: 'Sale' })}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  formData.contractType === 'Sale'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="w-6 h-6 mx-auto mb-2" />
                <span className="font-medium">Sale</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, contractType: 'Rental' })}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  formData.contractType === 'Rental'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-6 h-6 mx-auto mb-2" />
                <span className="font-medium">Rental</span>
              </button>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                required
              />
            </div>
          </div>

          {/* Financial */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Value</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.totalValue}
                  onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                  placeholder="850,000"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.depositAmount}
                  onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                  placeholder="85,000"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
            <select
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="full">Full Payment</option>
              <option value="monthly">Monthly Installments</option>
              <option value="quarterly">Quarterly Installments</option>
              <option value="custom">Custom Schedule</option>
            </select>
          </div>

          {/* Special Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Conditions (Optional)</label>
            <textarea
              value={formData.specialConditions}
              onChange={(e) => setFormData({ ...formData, specialConditions: e.target.value })}
              placeholder="Any special terms or conditions..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/agent/contracts"
            className="flex-1 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Create Contract
          </button>
        </div>
      </form>
    </div>
  );
}
