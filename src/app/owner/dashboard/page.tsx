'use client';

import React from 'react';
import { Building, FileText, Wallet, TrendingUp, TrendingDown, Calendar, Eye, Users, DollarSign, Clock, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Link from 'next/link';

// Mock stats data
const stats = [
  { label: 'Total Properties', value: '8', icon: Building, change: '+2', trend: 'up', color: 'blue' },
  { label: 'Active Contracts', value: '5', icon: FileText, change: '+1', trend: 'up', color: 'green' },
  { label: 'Monthly Revenue', value: '$12,500', icon: DollarSign, change: '+15%', trend: 'up', color: 'purple' },
  { label: 'Pending Payments', value: '3', icon: Clock, change: '-1', trend: 'down', color: 'orange' },
];

// Mock recent activities
const recentActivities = [
  { id: 1, type: 'viewing', message: 'New viewing request for Modern Villa', time: '2 hours ago', icon: Eye },
  { id: 2, type: 'contract', message: 'Contract CTR-2024-001 signed by customer', time: '5 hours ago', icon: FileText },
  { id: 3, type: 'payment', message: 'Payment of $85,000 received', time: '1 day ago', icon: Wallet },
  { id: 4, type: 'report', message: 'Property report resolved successfully', time: '2 days ago', icon: AlertCircle },
];

// Mock properties summary
const propertiesSummary = [
  { id: 1, name: 'Modern Villa with Pool', status: 'Active', views: 125, inquiries: 8, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400' },
  { id: 2, name: 'Luxury Apartment Downtown', status: 'Rented', views: 89, inquiries: 5, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400' },
  { id: 3, name: 'Family House with Garden', status: 'Active', views: 67, inquiries: 3, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400' },
];

export default function OwnerDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, Nguyễn Văn Owner! Here's an overview of your properties.
          </p>
        </div>
        <Link
          href="/owner/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
        >
          <Building className="w-4 h-4" />
          Add New Property
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
              {stat.trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Properties Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Properties Overview</h2>
            <Link href="/owner/properties" className="text-sm text-red-600 hover:text-red-700 font-medium">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {propertiesSummary.map((property) => (
              <div key={property.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <img 
                  src={property.image} 
                  alt={property.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{property.name}</h3>
                  <Badge 
                    variant={property.status === 'Active' ? 'success' : 'info'} 
                    className="mt-1"
                  >
                    {property.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Eye className="w-4 h-4" />
                    {property.views} views
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                    <Users className="w-4 h-4" />
                    {property.inquiries} inquiries
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  activity.type === 'viewing' ? 'bg-blue-100' :
                  activity.type === 'contract' ? 'bg-green-100' :
                  activity.type === 'payment' ? 'bg-purple-100' :
                  'bg-orange-100'
                }`}>
                  <activity.icon className={`w-4 h-4 ${
                    activity.type === 'viewing' ? 'text-blue-600' :
                    activity.type === 'contract' ? 'text-green-600' :
                    activity.type === 'payment' ? 'text-purple-600' :
                    'text-orange-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link 
          href="/owner/properties/new"
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:border-red-200 group"
        >
          <Building className="w-8 h-8 text-red-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-medium text-gray-900">Add Property</h3>
          <p className="text-xs text-gray-500 mt-1">List a new property</p>
        </Link>
        <Link 
          href="/owner/contracts"
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:border-red-200 group"
        >
          <FileText className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-medium text-gray-900">View Contracts</h3>
          <p className="text-xs text-gray-500 mt-1">Manage active contracts</p>
        </Link>
        <Link 
          href="/owner/payments"
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:border-red-200 group"
        >
          <Wallet className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-medium text-gray-900">Payments</h3>
          <p className="text-xs text-gray-500 mt-1">Track income & payments</p>
        </Link>
        <Link 
          href="/owner/reports"
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:border-red-200 group"
        >
          <AlertCircle className="w-8 h-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-medium text-gray-900">Reports</h3>
          <p className="text-xs text-gray-500 mt-1">View property reports</p>
        </Link>
      </div>
    </div>
  );
}
