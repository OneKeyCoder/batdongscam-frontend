'use client';

import React from 'react';
import { Building, FileText, Users, Calendar, TrendingUp, DollarSign, Clock, CheckCircle, Star, ArrowUpRight, Eye, ArrowRight } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Link from 'next/link';

// Mock stats data
const stats = [
  { label: 'Active Assignments', value: '5', icon: Building, change: '+2', color: 'blue' },
  { label: 'Pending Appointments', value: '3', icon: Calendar, change: 'Today', color: 'orange' },
  { label: 'Contracts This Month', value: '8', icon: FileText, change: '+3', color: 'green' },
  { label: 'Commission Earned', value: '$12,500', icon: DollarSign, change: '+15%', color: 'purple' },
];

// Mock upcoming appointments
const upcomingAppointments = [
  {
    id: 1,
    customerName: 'Nguyễn Văn Khách',
    propertyName: 'Modern Villa with Pool',
    date: '2024-01-20',
    time: '10:00 AM',
    status: 'Confirmed',
  },
  {
    id: 2,
    customerName: 'Lê Thị Customer',
    propertyName: 'Luxury Apartment Downtown',
    date: '2024-01-20',
    time: '02:30 PM',
    status: 'Pending',
  },
  {
    id: 3,
    customerName: 'Trần Văn Buyer',
    propertyName: 'Family House with Garden',
    date: '2024-01-21',
    time: '09:00 AM',
    status: 'Confirmed',
  },
];

// Mock recent contracts
const recentContracts = [
  {
    id: 1,
    contractNumber: 'CTR-2024-001',
    propertyName: 'Modern Villa with Pool',
    customerName: 'Nguyễn Văn Khách',
    value: '$850,000',
    status: 'Active',
  },
  {
    id: 2,
    contractNumber: 'CTR-2024-002',
    propertyName: 'Luxury Apartment Downtown',
    customerName: 'Lê Thị Customer',
    value: '$14,400/year',
    status: 'Pending',
  },
];

// Mock performance
const performance = {
  rating: 4.8,
  totalReviews: 45,
  closedDeals: 23,
  successRate: '92%',
};

export default function AgentDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, Trần Văn Agent! Here's your work overview.
          </p>
        </div>
        <Link
          href="/agent/contracts/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
        >
          <FileText className="w-4 h-4" />
          Create Contract
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                stat.color === 'blue' ? 'bg-blue-100' :
                stat.color === 'green' ? 'bg-green-100' :
                stat.color === 'purple' ? 'bg-purple-100' :
                'bg-orange-100'
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  'text-orange-600'
                }`} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              Upcoming Appointments
            </h2>
            <Link href="/agent/appointments" className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{apt.customerName}</p>
                    <p className="text-sm text-gray-500">{apt.propertyName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{apt.date}</p>
                  <p className="text-xs text-gray-500">{apt.time}</p>
                  <Badge 
                    variant={apt.status === 'Confirmed' ? 'success' : 'warning'}
                    className="mt-1"
                  >
                    {apt.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Performance
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-4xl font-bold text-gray-900">{performance.rating}</span>
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-sm text-gray-500 mt-1">Based on {performance.totalReviews} reviews</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{performance.closedDeals}</p>
                <p className="text-xs text-gray-500">Closed Deals</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{performance.successRate}</p>
                <p className="text-xs text-gray-500">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Contracts */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            Recent Contracts
          </h2>
          <Link href="/agent/contracts" className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Contract</th>
                <th className="px-6 py-3 font-medium">Property</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Value</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{contract.contractNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{contract.propertyName}</td>
                  <td className="px-6 py-4 text-gray-600">{contract.customerName}</td>
                  <td className="px-6 py-4 font-bold text-red-600">{contract.value}</td>
                  <td className="px-6 py-4">
                    <Badge variant={contract.status === 'Active' ? 'success' : 'warning'}>
                      {contract.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/agent/contracts/${contract.id}`}
                      className="text-red-600 hover:text-red-700 font-medium text-xs inline-flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
