'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, Calendar, MapPin, Eye, EyeOff, Edit2, Building, DollarSign, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { accountService } from '@/lib/api/services/account.service';
import Skeleton from '@/app/components/ui/Skeleton';

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
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  // Update formData when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phoneNumber || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError('');
    
    try {
      const updatedUser = await accountService.updateAvatar(file);
      setUser({ ...updatedUser, role: updatedUser.role as any });
      setSuccess('Avatar updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setError('');
    try {
      const updatedUser = await accountService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phone,
      });
      setUser({ ...updatedUser, role: updatedUser.role as any });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <Skeleton height={200} />
        <Skeleton height={400} />
      </div>
    );
  }

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
                  src={user.avatarUrl || '/default-avatar.png'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Tier Badge - with proper colors */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 text-white text-sm font-bold rounded-full shadow uppercase bg-gradient-to-r from-orange-600 to-orange-800">
                {user.tier || 'MEMBER'}
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-white">{user.lastName} {user.firstName}</h1>
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded">
                  Verified
                </span>
              </div>
              <div className="space-y-2 text-white">
                <p className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  <span className="text-base">{user.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-base">Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Invalid Date'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-base">
                    {user.wardName && user.districtName && user.cityName 
                      ? `${user.wardName}, ${user.districtName}, ${user.cityName}`
                      : 'No address provided'}
                  </span>
                </p>
              </div>
              <div className="flex gap-3 mt-5">
                <button className="px-6 py-2.5 bg-white text-red-600 text-base font-medium rounded-lg hover:bg-gray-100 transition-colors">
                  Contact Zalo
                </button>
                <button className="px-6 py-2.5 border-2 border-white text-white text-base font-medium rounded-lg hover:bg-red-700 transition-colors">
                  Call {user.phoneNumber ? user.phoneNumber.substring(0, 4) + ' ' + user.phoneNumber.substring(4, 8).replace(/./g, '*') : 'N/A'}
                </button>
              </div>
            </div>

            {/* Stats - Vertical layout on the right with darker red background */}
            <div className="bg-red-700 rounded-xl p-6 min-w-[180px]">
              <div className="flex flex-col gap-4">
                <div className="text-center border-b border-red-600 pb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Building className="w-6 h-6 text-white" />
                    <p className="text-4xl font-bold text-white">{user.profile?.totalListings || 0}</p>
                  </div>
                  <p className="text-sm text-red-200">Total Listings</p>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-white" />
                  <span className="font-semibold text-white text-base">{user.profile?.totalSolds || 0}</span>
                  <span className="text-red-200 text-base">Bought</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-white" />
                  <span className="font-semibold text-white text-base">{user.profile?.totalRentals || 0}</span>
                  <span className="text-red-200 text-base">Rented</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-white" />
                  <span className="font-semibold text-white text-base">{user.profile?.totalProjects || 0}</span>
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
                  <p className="text-gray-900 font-medium">
                    {showPhone 
                      ? formData.phone 
                      : formData.phone ? formData.phone.substring(0, 4) + '******' : 'N/A'
                    }
                  </p>
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
              <p className="text-gray-900 font-medium">{formData.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Statistic Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Properties Statistic Infomation</h2>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {user.role === 'PROPERTY_OWNER' ? (
            // Owner Statistics - Show property listings
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{user.statisticAll?.totalProperties || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">For Sale</p>
                <p className="text-2xl font-bold text-gray-900">{user.statisticMonth?.monthTotalForSales || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">For Rent</p>
                <p className="text-2xl font-bold text-gray-900">{user.statisticMonth?.monthTotalForRents || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Sold/Rented</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(user.statisticAll?.totalPropertiesSold || 0) + (user.statisticAll?.totalPropertiesRented || 0)}
                </p>
              </div>
            </div>
          ) : (
            // Customer Statistics - Show transactions
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(user.statisticAll?.totalPurchases || 0) + (user.statisticAll?.totalRentals || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Bought</p>
                <p className="text-2xl font-bold text-gray-900">{user.statisticAll?.totalPurchases || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Rented</p>
                <p className="text-2xl font-bold text-gray-900">{user.statisticAll?.totalRentals || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Renting</p>
                <p className="text-2xl font-bold text-gray-900">{user.statisticMonth?.monthRentals || 0}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Billings */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Billings</h2>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer tier */}
            <div>
              <p className="text-sm text-gray-500 mb-1">{user.role === 'PROPERTY_OWNER' ? 'Owner tier' : 'Customer tier'}</p>
              <p className="font-bold text-gray-900">{user.tier || user.statisticMonth?.contributionTier || 'BRONZE'}</p>
            </div>
            
            {/* Total transactions */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Total transactions</p>
              <p className="font-bold text-gray-900">
                {user.role === 'PROPERTY_OWNER' 
                  ? (user.statisticAll?.totalProperties || 0)
                  : (user.statisticAll?.totalPurchases || 0) + (user.statisticAll?.totalRentals || 0)
                }
              </p>
            </div>

            {/* Total spending / Total Properties */}
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {user.role === 'PROPERTY_OWNER' ? 'Total properties listed' : 'Total spending'}
              </p>
              {user.role === 'PROPERTY_OWNER' ? (
                <p className="font-bold text-gray-900">{user.statisticAll?.totalProperties || 0}</p>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900">
                    ${(user.statisticAll?.spending || 0).toLocaleString()}
                  </p>
                  <DollarSign className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Current month spending / Month Properties */}
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {user.role === 'PROPERTY_OWNER' ? 'Month properties listed' : 'Current month spending'}
              </p>
              {user.role === 'PROPERTY_OWNER' ? (
                <p className="font-bold text-gray-900">{user.statisticMonth?.monthTotalProperties || 0}</p>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900">
                    ${(user.statisticMonth?.monthSpending || 0).toLocaleString()}
                  </p>
                  <DollarSign className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>

            {/* Total purchases / Total Sold */}
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {user.role === 'PROPERTY_OWNER' ? 'Total properties sold' : 'Total purchases'}
              </p>
              <p className="font-bold text-gray-900">
                {user.role === 'PROPERTY_OWNER'
                  ? (user.statisticAll?.totalPropertiesSold || 0)
                  : (user.statisticAll?.totalPurchases || 0)
                }
              </p>
            </div>
            
            {/* Current month purchases / Month Sold */}
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {user.role === 'PROPERTY_OWNER' ? 'Month properties sold' : 'Current month purchases'}
              </p>
              <p className="font-bold text-gray-900">
                {user.role === 'PROPERTY_OWNER' 
                  ? (user.statisticMonth?.monthTotalPropertiesSold || 0)
                  : (user.statisticMonth?.monthPurchases || 0)
                }
              </p>
            </div>

            {/* Total rentals / Total Rented */}
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {user.role === 'PROPERTY_OWNER' ? 'Total properties rented' : 'Total rentals'}
              </p>
              <p className="font-bold text-gray-900">
                {user.role === 'PROPERTY_OWNER'
                  ? (user.statisticAll?.totalPropertiesRented || 0)
                  : (user.statisticAll?.totalRentals || 0)
                }
              </p>
            </div>
            
            {/* Current month rentals / Month Rented */}
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {user.role === 'PROPERTY_OWNER' ? 'Month properties rented' : 'Current month rentals'}
              </p>
              <p className="font-bold text-gray-900">
                {user.role === 'PROPERTY_OWNER'
                  ? (user.statisticMonth?.monthTotalPropertiesRented || 0)
                  : (user.statisticMonth?.monthRentals || 0)
                }
              </p>
            </div>

            {/* Viewings - Only for Customer */}
            {user.role === 'CUSTOMER' && (
              <>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Viewings Requested</p>
                  <p className="font-bold text-gray-900">{user.statisticAll?.viewingsRequested || 0}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Viewings Attended</p>
                  <p className="font-bold text-gray-900">{user.statisticAll?.viewingsAttended || 0}</p>
                </div>
              </>
            )}

            {/* Lead Score */}
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {user.role === 'PROPERTY_OWNER' ? 'Contribution Points' : 'Lead Score'}
              </p>
              <p className="font-bold text-gray-900">
                {user.role === 'PROPERTY_OWNER'
                  ? (user.statisticAll?.contributionPoint || user.statisticMonth?.contributionPoint || 0)
                  : (user.statisticAll?.leadScore || user.statisticMonth?.leadScore || 0)
                }
              </p>
            </div>
            
            {/* Ranking Position */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Ranking Position</p>
              <p className="font-bold text-gray-900">
                {user.role === 'PROPERTY_OWNER'
                  ? (user.statisticAll?.rankingPosition || user.statisticMonth?.rankingPosition 
                      ? `#${user.statisticAll?.rankingPosition || user.statisticMonth?.rankingPosition}` 
                      : '#N/A')
                  : (user.statisticAll?.leadPosition || user.statisticMonth?.leadPosition
                      ? `#${user.statisticAll?.leadPosition || user.statisticMonth?.leadPosition}`
                      : '#N/A')
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
