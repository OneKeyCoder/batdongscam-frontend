'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, Calendar, MapPin, Eye, EyeOff, Edit2, Building, DollarSign, Zap } from 'lucide-react';

// Mock user data matching the design
const mockUser = {
  firstName: 'Minh',
  lastName: 'Phan Đình',
  email: 'phandinhminh48@gmail.com',
  phone: '0865 8***',
  password: '******************',
  memberSince: 'January 2nd, 2023',
  address: 'Ward 3, Gò Vấp District, Hồ Chí Minh city',
  tier: 'PLANTINUM',
  verified: true,
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
  stats: {
    totalListings: 24,
    bought: 8,
    rented: 8,
    invested: 8,
  },
  propertiesStats: {
    totalTransactions: 22,
    bought: 10,
    rented: 20,
    renting: 2,
  },
  billings: {
    customerTier: 'PLANTINUM',
    totalTransactions: 10,
    totalSpending: 20000.45,
    currentMonthSpending: 1010.00,
    totalPurchases: 5,
    currentMonthPurchases: 2,
    totalRentals: 5,
    currentMonthRentals: 2,
    paymentScheduleThisMonth: 3,
    nextPaymentSchedule: '8:00 - 27/10/2025',
    lastPaymentAt: '8:00 - 27/10/2025',
  },
};

const tabs = [
  { key: 'properties', label: 'Properties', href: '/customer/properties' },
  { key: 'favorites', label: 'Favorites', href: '/customer/favorites' },
  { key: 'profile', label: 'My Profile', href: '/customer/profile' },
  { key: 'viewings', label: 'Viewings', href: '/customer/viewings' },
  { key: 'payments', label: 'Payments', href: '/customer/payments' },
  { key: 'reports', label: 'Violation Reports', href: '/customer/reports' },
  { key: 'notifications', label: 'Notifications', href: '/customer/notifications' },
];

export default function CustomerProfilePage() {
  const pathname = usePathname();
  const [isEditing, setIsEditing] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: mockUser.firstName,
    lastName: mockUser.lastName,
    phone: mockUser.phone,
    email: mockUser.email,
    password: mockUser.password,
  });

  return (
    <div className="space-y-0">
      {/* Profile Header - Full Red Background spanning full viewport width */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-red-600 -mt-8 mb-6 py-6">
        {/* Content wrapper with 90% width */}
        <div className="max-w-[90%] mx-auto">
          <div className="flex items-center gap-8">
            {/* Avatar - 95% of header height */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden">
                <img
                  src={mockUser.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Tier Badge - with proper colors */}
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 text-white text-sm font-bold rounded-full shadow uppercase ${
                mockUser.tier === 'PLATINUM' ? 'bg-gradient-to-r from-pink-400 to-pink-600' :
                mockUser.tier === 'GOLD' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                'bg-gradient-to-r from-orange-600 to-orange-800'
              }`}>
                {mockUser.tier}
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-white">{mockUser.lastName} {mockUser.firstName}</h1>
                {mockUser.verified && (
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded">
                    Verified
                  </span>
                )}
              </div>
              <div className="space-y-2 text-white">
                <p className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  <span className="text-base">{mockUser.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-base">Member since {mockUser.memberSince}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-base">{mockUser.address}</span>
                </p>
              </div>
              <div className="flex gap-3 mt-5">
                <button className="px-6 py-2.5 bg-white text-red-600 text-base font-medium rounded-lg hover:bg-gray-100 transition-colors">
                  Contact Zalo
                </button>
                <button className="px-6 py-2.5 border-2 border-white text-white text-base font-medium rounded-lg hover:bg-red-700 transition-colors">
                  Call 0865 8***
                </button>
              </div>
            </div>

            {/* Stats - Vertical layout on the right with darker red background */}
            <div className="bg-red-700 rounded-xl p-6 min-w-[180px]">
              <div className="flex flex-col gap-4">
                <div className="text-center border-b border-red-600 pb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Building className="w-6 h-6 text-white" />
                    <p className="text-4xl font-bold text-white">{mockUser.stats.totalListings}</p>
                  </div>
                  <p className="text-sm text-red-200">Total Listings</p>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-white" />
                  <span className="font-semibold text-white text-base">{mockUser.stats.bought}</span>
                  <span className="text-red-200 text-base">Bought</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-white" />
                  <span className="font-semibold text-white text-base">{mockUser.stats.rented}</span>
                  <span className="text-red-200 text-base">Rented</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-white" />
                  <span className="font-semibold text-white text-base">{mockUser.stats.invested}</span>
                  <span className="text-red-200 text-base">Invested</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6 -mx-4 px-4">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                pathname === tab.href
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Basic Information */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic information</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Modify
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">First name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              ) : (
                <p className="text-gray-900 font-medium">{formData.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Last name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              ) : (
                <p className="text-gray-900 font-medium">{formData.lastName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Phone number</label>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{showPhone ? '0865 8123456' : formData.phone}</p>
                )}
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  {showPhone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              ) : (
                <p className="text-gray-900 font-medium">{formData.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Password</label>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{formData.password}</p>
                )}
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Member Since</label>
              <p className="text-gray-900 font-medium">{mockUser.memberSince}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Statistic Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Properties Statistic Infomation</h2>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total transactions</p>
              <p className="text-2xl font-bold text-gray-900">{mockUser.propertiesStats.totalTransactions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Bought</p>
              <p className="text-2xl font-bold text-gray-900">{mockUser.propertiesStats.bought}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Rented</p>
              <p className="text-2xl font-bold text-gray-900">{mockUser.propertiesStats.rented}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Renting</p>
              <p className="text-2xl font-bold text-gray-900">{mockUser.propertiesStats.renting}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Billings */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Billings</h2>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            {/* Row 1 */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Customer tier</p>
              <p className="font-bold text-gray-900">{mockUser.billings.customerTier}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total transactions</p>
              <p className="font-bold text-gray-900">{mockUser.billings.totalTransactions}</p>
            </div>
            <div className="md:col-span-2"></div>

            {/* Row 2 */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Total spending</p>
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">{mockUser.billings.totalSpending.toLocaleString()}</p>
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Current month spending</p>
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">{mockUser.billings.currentMonthSpending.toLocaleString()}</p>
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="md:col-span-2"></div>

            {/* Row 3 */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Total purchases</p>
              <p className="font-bold text-gray-900">{mockUser.billings.totalPurchases}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Current month purchases</p>
              <p className="font-bold text-gray-900">{mockUser.billings.currentMonthPurchases}</p>
            </div>
            <div className="md:col-span-2"></div>

            {/* Row 4 */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Total rentals</p>
              <p className="font-bold text-gray-900">{mockUser.billings.totalRentals}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Current month rentals</p>
              <p className="font-bold text-gray-900">{mockUser.billings.currentMonthRentals}</p>
            </div>
            <div className="md:col-span-2"></div>

            {/* Row 5 */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Payment Schedule this month</p>
              <p className="font-bold text-gray-900">{mockUser.billings.paymentScheduleThisMonth}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Next Payment Schedule at</p>
              <p className="font-bold text-gray-900">{mockUser.billings.nextPaymentSchedule}</p>
            </div>
            <div className="md:col-span-2"></div>

            {/* Row 6 */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Last Payment at</p>
              <p className="font-bold text-gray-900">{mockUser.billings.lastPaymentAt}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
