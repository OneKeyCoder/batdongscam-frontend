'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building, Search, MapPin, Bed, Bath, Square, Heart, ChevronRight, Star, ArrowRight, Home, Key, Users, Shield, Phone, Mail, ChevronDown, Menu, X, Loader2 } from 'lucide-react';
import NavBar from '@/app/components/layout/NavBar';
import Footer from '@/app/components/layout/Footer';
import { propertyService } from '@/lib/api/services/property.service';
import { PropertyCard } from '@/lib/api/types';

const locations = [
  { name: 'District 1', count: 245, image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400' },
  { name: 'District 7', count: 189, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400' },
  { name: 'Thu Duc City', count: 156, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400' },
  { name: 'Binh Thanh', count: 134, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' },
];

const stats = [
  { value: '10K+', label: 'Properties', icon: Building },
  { value: '8K+', label: 'Happy Customers', icon: Users },
  { value: '500+', label: 'Expert Agents', icon: Shield },
  { value: '15+', label: 'Years Experience', icon: Star },
];

export default function LandingPage() {
  const [searchType, setSearchType] = useState<'buy' | 'rent'>('buy');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Featured properties from API
  const [featuredProperties, setFeaturedProperties] = useState<PropertyCard[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  // Fetch featured properties
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await propertyService.getPropertyCards({
          topK: true,
          limit: 4,
          sortType: 'desc',
          sortBy: 'createdAt',
        });
        setFeaturedProperties(response.data);
      } catch (error) {
        console.error('Failed to fetch featured properties:', error);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    fetchFeatured();
  }, []);

  const formatPrice = (amount: number, transactionType: 'SALE' | 'RENT' | null) => {
    if (transactionType === 'RENT') {
      return `$${amount.toLocaleString()}/month`;
    }
    return `$${amount.toLocaleString()}`;
  };

  // Helper to convert image URLs - only accept absolute URLs
  const getImageUrl = (url: string | null | undefined): string => {
    // Fallback placeholder image
    const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';
    
    // If no URL, use fallback
    if (!url) return fallbackImage;
    
    // Only accept absolute URLs (http:// or https://)
    // Reject relative paths, PDFs, documents, etc.
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return fallbackImage;
    }
    
    // If it's a PDF even with absolute URL, use fallback
    if (url.includes('.pdf')) {
      return fallbackImage;
    }
    
    // Valid absolute URL
    return url;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <NavBar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="max-w-[85%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Find Your Dream
                <span className="text-red-600"> Property </span>
                in Vietnam
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Discover the perfect home, apartment, or investment property. We connect buyers, renters, and owners with trusted listings across Vietnam.
              </p>

              {/* Search Box */}
              <div className="mt-8 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                {/* Type Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSearchType('buy')}
                    className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                      searchType === 'buy' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setSearchType('rent')}
                    className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                      searchType === 'rent' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Rent
                  </button>
                </div>

                {/* Search Input */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by location, property type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-900"
                    />
                  </div>
                  <Link
                    href={`/properties?type=${searchType}&q=${searchQuery}`}
                    className="px-8 py-3.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    <span className="hidden sm:inline">Search</span>
                  </Link>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 flex gap-8">
                {stats.slice(0, 3).map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
                  alt="Beautiful Property"
                  className="rounded-3xl shadow-2xl w-full"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-red-600/10 rounded-3xl -z-10" />
              <div className="absolute -top-8 -right-8 w-48 h-48 bg-orange-400/10 rounded-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[85%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
              <p className="text-gray-600 mt-2">Explore our handpicked selection of premium properties</p>
            </div>
            <Link
              href="/properties"
              className="hidden sm:flex items-center gap-2 text-red-600 font-medium hover:text-red-700"
            >
              View All Properties
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoadingFeatured ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(featuredProperties || []).map((property) => (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getImageUrl(property.thumbnailUrl)}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        property.transactionType === 'SALE' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        For {property.transactionType === 'SALE' ? 'Sale' : 'Rent'}
                      </span>
                    </div>
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <Heart className={`w-4 h-4 ${property.favorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-xl font-bold text-red-600">{formatPrice(property.price, property.transactionType)}</p>
                    <h3 className="font-semibold text-gray-900 mt-1 line-clamp-1">{property.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                      <MapPin className="w-3 h-3" />
                      {property.location}
                    </p>

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Square className="w-4 h-4 text-gray-400" />
                        {property.totalArea}m²
                      </span>
                      <span className="text-gray-400">
                        {property.numberOfImages} photos
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="sm:hidden mt-6 text-center">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 text-red-600 font-medium"
            >
              View All Properties
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-16">
        <div className="max-w-[85%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Popular Locations</h2>
            <p className="text-gray-600 mt-2">Explore properties in the most sought-after areas</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {locations.map((location) => (
              <Link
                key={location.name}
                href={`/properties?location=${location.name}`}
                className="group relative h-64 rounded-2xl overflow-hidden"
              >
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{location.name}</h3>
                  <p className="text-sm text-white/80">{location.count} properties</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[85%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose BatDongScam?</h2>
            <p className="text-gray-600 mt-2">We make finding your perfect property easy and safe</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Search</h3>
              <p className="text-sm text-gray-600">Find properties quickly with our powerful search filters</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Verified Listings</h3>
              <p className="text-sm text-gray-600">All properties are verified by our expert team</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Expert Agents</h3>
              <p className="text-sm text-gray-600">Professional agents to guide you every step</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Simple Process</h3>
              <p className="text-sm text-gray-600">Streamlined buying and renting experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600">
        <div className="max-w-[85%] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Find Your Dream Home?</h2>
          <p className="text-red-100 mt-4 max-w-2xl mx-auto">
            Join thousands of happy customers who found their perfect property through BatDongScam
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/properties"
              className="px-8 py-3 bg-white text-red-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Browse Properties
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 bg-red-700 text-white font-medium rounded-lg hover:bg-red-800 transition-colors border border-red-500"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
