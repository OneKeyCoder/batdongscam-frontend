'use client';

import React, { useState } from 'react';
import { Users, Search, Phone, Mail, MapPin, Eye, Calendar, FileText, Star, DollarSign, Filter } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import Link from 'next/link';

type CustomerStatus = 'Active' | 'Prospect' | 'Closed' | 'Inactive';

interface Customer {
  id: number;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
  status: CustomerStatus;
  totalTransactions: number;
  totalValue: string;
  lastActivity: string;
  joinedAt: string;
  interests: string[];
  viewings: number;
  contracts: number;
}

// Mock data
const mockCustomers: Customer[] = [
  {
    id: 1,
    customerId: 'CUS-2024-001',
    name: 'Nguyễn Văn Khách',
    email: 'khach@email.com',
    phone: '0909123456',
    address: 'District 7, Ho Chi Minh City',
    status: 'Active',
    totalTransactions: 2,
    totalValue: '$900,000',
    lastActivity: '2024-01-18',
    joinedAt: '2023-06-15',
    interests: ['Villa', 'Apartment'],
    viewings: 5,
    contracts: 2,
  },
  {
    id: 2,
    customerId: 'CUS-2024-002',
    name: 'Lê Thị Customer',
    email: 'customer@email.com',
    phone: '0909654321',
    address: 'District 1, Ho Chi Minh City',
    status: 'Prospect',
    totalTransactions: 0,
    totalValue: '$0',
    lastActivity: '2024-01-20',
    joinedAt: '2024-01-10',
    interests: ['Apartment', 'Studio'],
    viewings: 3,
    contracts: 0,
  },
  {
    id: 3,
    customerId: 'CUS-2024-003',
    name: 'Trần Văn Buyer',
    email: 'buyer@email.com',
    phone: '0909111222',
    address: 'Thu Duc City, Ho Chi Minh',
    status: 'Active',
    totalTransactions: 1,
    totalValue: '$650,000',
    lastActivity: '2024-01-15',
    joinedAt: '2023-08-20',
    interests: ['House', 'Villa'],
    viewings: 8,
    contracts: 1,
  },
  {
    id: 4,
    customerId: 'CUS-2023-050',
    name: 'Phạm Văn Investor',
    email: 'investor@email.com',
    phone: '0909333444',
    address: 'Phu Nhuan District',
    status: 'Closed',
    totalTransactions: 3,
    totalValue: '$2,500,000',
    lastActivity: '2023-12-01',
    joinedAt: '2022-03-10',
    interests: ['Commercial', 'Land'],
    viewings: 15,
    contracts: 3,
  },
];

const statusVariants: Record<CustomerStatus, 'success' | 'info' | 'warning' | 'danger'> = {
  Active: 'success',
  Prospect: 'info',
  Closed: 'warning',
  Inactive: 'danger',
};

export default function CustomersPage() {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [filter, setFilter] = useState<'all' | CustomerStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.phone.includes(searchTerm);
    const matchesFilter = filter === 'all' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-red-600" />
            Customer Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {customers.length} customers total
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {(['all', 'Active', 'Prospect', 'Closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Activity</th>
                <th className="px-6 py-4 font-medium">Value</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.customerId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-600 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {customer.email}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {customer.phone}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariants[customer.status]}>
                      {customer.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="flex items-center gap-1 text-xs">
                        <Eye className="w-3 h-3" />
                        {customer.viewings} viewings
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <FileText className="w-3 h-3" />
                        {customer.contracts} contracts
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Last: {customer.lastActivity}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{customer.totalValue}</p>
                    <p className="text-xs text-gray-500">{customer.totalTransactions} transactions</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title="Customer Details"
        >
          <div className="space-y-4">
            {/* Profile Header */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {selectedCustomer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{selectedCustomer.name}</h4>
                <p className="text-sm text-gray-500">{selectedCustomer.customerId}</p>
                <Badge variant={statusVariants[selectedCustomer.status]} className="mt-2">
                  {selectedCustomer.status}
                </Badge>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </p>
                <p className="font-medium text-gray-900 text-sm mt-1">{selectedCustomer.email}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Phone
                </p>
                <p className="font-medium text-gray-900 text-sm mt-1">{selectedCustomer.phone}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Address
                </p>
                <p className="font-medium text-gray-900 text-sm mt-1">{selectedCustomer.address}</p>
              </div>
            </div>

            {/* Interests */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Property Interests</p>
              <div className="flex flex-wrap gap-2">
                {selectedCustomer.interests.map((interest) => (
                  <span key={interest} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{selectedCustomer.viewings}</p>
                <p className="text-xs text-gray-500">Viewings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{selectedCustomer.contracts}</p>
                <p className="text-xs text-gray-500">Contracts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{selectedCustomer.totalValue}</p>
                <p className="text-xs text-gray-500">Total Value</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Link
                href={`/agent/appointments?customer=${selectedCustomer.id}`}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Schedule Viewing
              </Link>
              <Link
                href={`/agent/contracts/new?customer=${selectedCustomer.id}`}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Create Contract
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
