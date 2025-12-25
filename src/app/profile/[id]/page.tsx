'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, Phone, Calendar, MapPin, Shield, Star, 
  Building, ArrowLeft, Loader2, AlertCircle, AlertOctagon
} from 'lucide-react';
import NavBar from '@/app/components/layout/NavBar';
import Footer from '@/app/components/layout/Footer';
import PropertyCard from '@/app/components/cards/PropertyCard';
import { accountService, UserProfile } from '@/lib/api/services/account.service';
import { propertyService } from '@/lib/api/services/property.service';
import { PropertyCard as PropertyCardType } from '@/lib/api/types';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [properties, setProperties] = useState<PropertyCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError('');

      try {
        const data = await accountService.getPublicProfile(userId);
        setProfile(data);

        // Fetch properties based on role
        if (data.role === 'PROPERTY_OWNER' || data.role === 'SALESAGENT') {
          fetchProperties(data.role, userId);
        }
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        if (err.response?.status === 404) {
          setError('User not found');
        } else {
          setError('Failed to load profile. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const fetchProperties = async (role: string, id: string) => {
    setIsLoadingProperties(true);
    try {
      const filters = role === 'PROPERTY_OWNER' 
        ? { ownerId: id, page: 1, limit: 24 }
        : { agentId: id, page: 1, limit: 24 };

      const response = await propertyService.getPropertyCards(filters);
      setProperties(response.data || []);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">{error || 'Profile not found'}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getTierColor = (tier: string | undefined) => {
    switch (tier?.toUpperCase()) {
      case 'PLATINUM':
        return 'bg-gradient-to-r from-gray-400 to-gray-600';
      case 'GOLD':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'SILVER':
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      default:
        return 'bg-gradient-to-r from-orange-600 to-orange-800';
    }
  };

  const getStatsForRole = () => {
    if (profile.role === 'PROPERTY_OWNER' && profile.propertyProfile) {
      return {
        totalListings: profile.propertyProfile.totalListings || 0,
        solds: profile.propertyProfile.totalSolds || 0,
        rentals: profile.propertyProfile.totalRentals || 0,
      };
    } else if (profile.role === 'SALESAGENT' && profile.profile) {
      return {
        totalListings: profile.profile.totalAssignedProperties || 0,
        solds: profile.profile.totalSuccessfulDeals || 0,
        rentals: 0,
      };
    }
    return { totalListings: 0, solds: 0, rentals: 0 };
  };

  const stats = getStatsForRole();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* Profile Header - Full Red Background */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-red-600 py-6">
        <div className="max-w-[90%] mx-auto">
          <div className="flex items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-4xl font-bold">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </div>
                )}
              </div>
              {/* Tier Badge */}
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 text-white text-sm font-bold rounded-full shadow uppercase ${getTierColor(profile.tier)}`}>
                {profile.tier || 'MEMBER'}
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-white">{profile.firstName} {profile.lastName}</h1>
                {profile.status === 'ACTIVE' && (
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded">
                    Verified
                  </span>
                )}
              </div>
              <div className="space-y-2 text-white">
                <p className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  <span className="text-base">{profile.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-base">
                    Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </span>
                </p>
                {(profile.wardName || profile.districtName || profile.cityName) && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-base">
                      {[profile.wardName, profile.districtName, profile.cityName]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </p>
                )}
              </div>
              <div className="flex gap-3 mt-5">
                {profile.zaloContact && (
                  <button className="px-6 py-2.5 bg-white text-red-600 text-base font-medium rounded-lg hover:bg-gray-100 transition-colors">
                    Contact Zalo
                  </button>
                )}
                {profile.phoneNumber && (
                  <button className="px-6 py-2.5 border-2 border-white text-white text-base font-medium rounded-lg hover:bg-red-700 transition-colors">
                    Call {profile.phoneNumber.substring(0, 4) + ' ' + profile.phoneNumber.substring(4, 8).replace(/./g, '*')}
                  </button>
                )}
              </div>
            </div>

            {/* Stats - Vertical layout on the right (only for Property Owners) */}
            {profile.role === 'PROPERTY_OWNER' && (
              <div className="bg-red-700 rounded-xl p-6 min-w-[180px]">
                <div className="flex flex-col gap-4">
                  <div className="text-center border-b border-red-600 pb-4">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Building className="w-6 h-6 text-white" />
                      <p className="text-4xl font-bold text-white">{stats.totalListings}</p>
                    </div>
                    <p className="text-sm text-red-200">Total Listings</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-white" />
                    <span className="font-semibold text-white text-base">{stats.solds}</span>
                    <span className="text-red-200 text-base">Solds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-white" />
                    <span className="font-semibold text-white text-base">{stats.rentals}</span>
                    <span className="text-red-200 text-base">Rentals</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Report User Button */}
          <div className="mt-4 text-sm text-white italic flex items-center gap-2">
            <span>If something feels off, let us know.</span>
            <button className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors">
              <AlertOctagon className="w-4 h-4" />
              Report User
            </button>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="max-w-[90%] mx-auto py-8">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white">
            <option>All status</option>
            <option>Available</option>
            <option>Sold</option>
            <option>Rented</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white">
            <option>All types</option>
            <option>For Sale</option>
            <option>For Rent</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white">
            <option>All locations</option>
          </select>
        </div>

        {/* Properties Count */}
        <p className="text-gray-900 font-semibold mb-6">Found: {properties.length}</p>

        {/* Properties Grid */}
        {isLoadingProperties ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                image={property.thumbnailUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'}
                title={property.title}
                price={`${property.price.toLocaleString('vi-VN')} VND`}
                priceUnit={property.transactionType === 'RENTAL' ? '/tháng' : ''}
                address={property.location}
                area={`${property.totalArea}m²`}
                numberOfImages={property.numberOfImages}
                type={property.transactionType === 'SALE' ? 'Sale' : 'Rent'}
                status={property.status === 'AVAILABLE' ? 'Available' : property.status === 'SOLD' ? 'Sold' : property.status === 'RENTED' ? 'Rented' : 'Pending'}
                isFavorite={property.favorite}
                showFavorite={true}
                variant="profile"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No properties found</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
