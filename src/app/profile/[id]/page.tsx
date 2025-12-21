'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Building, MapPin, Mail, Calendar, Phone, Filter, Grid, List } from 'lucide-react';
import Footer from '@/app/components/layout/Footer';

// Mock user data - in real app, fetch based on ID
const mockUser = {
  id: '1',
  firstName: 'Minh',
  lastName: 'Phan Đình',
  email: 'phandinhminh48@gmail.com',
  phone: '0865 8***',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  address: 'Ward 3, Gò Vấp District, Hồ Chí Minh city',
  memberSince: 'January 2nd, 2023',
  verified: true,
  tier: 'PLATINUM',
  role: 'owner', // 'owner' or 'agent'
  stats: {
    totalListings: 24,
    solds: 8,
    rentals: 8,
    projects: 8,
  },
};

// Mock properties
const mockProperties = Array(24).fill(null).map((_, i) => ({
  id: i + 1,
  title: 'Lorem ipsum dolor sit amet',
  location: 'Gò Vấp, Hồ Chí Minh',
  price: '541,00.00 $',
  area: '120 m²',
  images: 5,
  image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
  postedDate: 'Today',
}));

export default function PublicProfilePage() {
  const params = useParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-[95%] mx-auto">
          <div className="flex items-center justify-between h-16 px-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">
                BatDong<span className="text-red-600">Scam</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              <Link href="/properties?type=rent" className="text-sm font-bold text-gray-900 hover:text-gray-700">Rent</Link>
              <Link href="/properties?type=sale" className="text-sm font-bold text-gray-900 hover:text-gray-700">Buy</Link>
              <Link href="/projects" className="text-sm font-bold text-gray-900 hover:text-gray-700">Projects</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-bold text-gray-900 hover:text-gray-700">Login</Link>
              <Link href="/register" className="text-sm font-bold text-gray-900 hover:text-gray-700">Sign up</Link>
              <Link href="/owner/properties/new" className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                Post new listing
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Profile Header - Full width red background */}
        <div className="bg-red-600 py-6">
          <div className="max-w-[90%] mx-auto">
            <div className="flex items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden">
                  <img src={mockUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
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
                    <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded">Verified</span>
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
                    Call {mockUser.phone}
                  </button>
                </div>
              </div>

              {/* Stats */}
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
                    <span className="font-semibold text-white text-base">{mockUser.stats.solds}</span>
                    <span className="text-red-200 text-base">Solds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-white" />
                    <span className="font-semibold text-white text-base">{mockUser.stats.rentals}</span>
                    <span className="text-red-200 text-base">Rentals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-white" />
                    <span className="font-semibold text-white text-base">{mockUser.stats.projects}</span>
                    <span className="text-red-200 text-base">Projects</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Report User Button */}
            <div className="mt-4">
              <p className="text-white text-sm italic mb-2">If something feels off, let us know.</p>
              <button className="px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center">⚠</span>
                Report User
              </button>
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className="max-w-[85%] mx-auto px-4 py-8">
          {/* Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              >
                <option value="all">All status</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              >
                <option value="all">All types</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
              </select>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              >
                <option value="all">All locations</option>
                <option value="district1">District 1</option>
                <option value="district7">District 7</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Found count */}
          <p className="text-gray-900 font-semibold mb-4">Found: {mockProperties.length}</p>

          {/* Properties Grid */}
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {mockProperties.map((property) => (
              <Link
                key={property.id}
                href={`/property/${property.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48">
                  <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    📷 {property.images}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-red-600 font-bold">{property.price}</p>
                    <p className="text-sm text-gray-600">{property.area}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">{property.postedDate}</p>
                    <button className="text-gray-400 hover:text-red-600">
                      ♡
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Extend button */}
          <div className="text-center mt-8">
            <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Extend
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
