'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building, MapPin, ArrowRight, Home, Key, Users, Shield, Loader2, ShoppingBag, MapPinned } from 'lucide-react';
import NavBar from '@/app/components/layout/NavBar';
import Footer from '@/app/components/layout/Footer';
import PropertyCard from '@/app/components/cards/PropertyCard';
import { propertyService } from '@/lib/api/services/property.service';
import { locationService, LocationCardResponse } from '@/lib/api/services/location.service';
import { PropertyCard as PropertyCardType } from '@/lib/api/types';

export default function LandingPage() {
  // Featured properties from API
  const [featuredProperties, setFeaturedProperties] = useState<PropertyCardType[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  // Top cities from API
  const [topCities, setTopCities] = useState<LocationCardResponse[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);

  // Fetch featured properties (using regular endpoint with filters)
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await propertyService.getPropertyCards({
          limit: 4,
          sortType: 'desc',
          statuses: ['AVAILABLE', 'APPROVED'],
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

  // Fetch popular cities (using location cards endpoint)
  useEffect(() => {
    const fetchTopCities = async () => {
      try {
        const response = await locationService.getLocationCards({
          locationTypeEnum: 'CITY',
          limit: 8,
          isActive: true,
        });
        setTopCities(response.data || []);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchTopCities();
  }, []);

  const getImageUrl = (url: string | null | undefined): string => {
    const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';
    if (!url) return fallbackImage;
    if (!url.startsWith('http://') && !url.startsWith('https://')) return fallbackImage;
    if (url.includes('.pdf')) return fallbackImage;
    return url;
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* Hero Section - Reduced padding */}
      <section className="pt-8 pb-12 bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
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

              {/* Action Buttons - Replacing search bar */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/properties?type=sale"
                  className="flex items-center gap-3 px-6 py-4 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <ShoppingBag className="w-6 h-6" />
                  <div className="text-left">
                    <span className="block text-lg font-bold">Buy Property</span>
                    <span className="text-sm text-red-200">Find your dream home</span>
                  </div>
                </Link>
                
                <Link
                  href="/properties?type=rent"
                  className="flex items-center gap-3 px-6 py-4 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl border border-gray-200"
                >
                  <Key className="w-6 h-6 text-red-600" />
                  <div className="text-left">
                    <span className="block text-lg font-bold">Rent Property</span>
                    <span className="text-sm text-gray-500">Find rentals near you</span>
                  </div>
                </Link>

                <Link
                  href="/locations"
                  className="flex items-center gap-3 px-6 py-4 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl border border-gray-200"
                >
                  <MapPinned className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <span className="block text-lg font-bold">View Locations</span>
                    <span className="text-sm text-gray-500">Explore land prices</span>
                  </div>
                </Link>
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
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
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
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No featured properties available</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  image={getImageUrl(property.thumbnailUrl)}
                  title={property.title}
                  price={`${property.price.toLocaleString('vi-VN')} VND`}
                  priceUnit={property.transactionType === 'RENTAL' ? '/tháng' : ''}
                  address={property.location}
                  area={`${property.totalArea}m²`}
                  numberOfImages={property.numberOfImages}
                  type={property.transactionType === 'SALE' ? 'Sale' : 'Rent'}
                  isFavorite={property.favorite}
                  showFavorite={false}
                  variant="profile"
                />
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
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Cities</h2>
              <p className="text-gray-600 mt-2">Explore properties in the most sought-after cities</p>
            </div>
            <Link
              href="/locations"
              className="hidden sm:flex items-center gap-2 text-red-600 font-medium hover:text-red-700"
            >
              View All Locations
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoadingCities ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
          ) : topCities.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No cities available</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topCities.slice(0, 8).map((city) => (
                <Link
                  key={city.id}
                  href={`/locations/${city.id}?type=CITY`}
                  className="group relative h-64 rounded-2xl overflow-hidden"
                >
                  <img
                    src={city.imgUrl || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400'}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold">{city.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-white/80">
                      {city.totalArea && (
                        <span>{city.totalArea.toLocaleString()} km²</span>
                      )}
                      {city.population && (
                        <span>{(city.population / 1000).toFixed(0)}K people</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="sm:hidden mt-6 text-center">
            <Link
              href="/locations"
              className="inline-flex items-center gap-2 text-red-600 font-medium"
            >
              View All Locations
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose BatDongScam?</h2>
            <p className="text-gray-600 mt-2">We make finding your perfect property easy and safe</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-red-600" />
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
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 text-center">
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

      <Footer />
    </div>
  );
}
