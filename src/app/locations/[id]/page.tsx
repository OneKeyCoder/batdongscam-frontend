'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Building, Users, TrendingUp, Home, Heart, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import NavBar from '@/app/components/layout/NavBar';
import Footer from '@/app/components/layout/Footer';
import { locationService, LocationDetailsResponse, LocationCardResponse } from '@/lib/api/services/location.service';
import { propertyService } from '@/lib/api/services/property.service';
import { PropertyCard as PropertyCardType } from '@/lib/api/types';

export default function LocationDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locationId = params.id as string;
  const locationType = (searchParams.get('type') || 'CITY') as 'CITY' | 'DISTRICT' | 'WARD';

  const [location, setLocation] = useState<LocationDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Related properties (only for WARD type)
  const [relatedProperties, setRelatedProperties] = useState<PropertyCardType[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  
  // Child locations (districts for CITY, wards for DISTRICT)
  const [childLocations, setChildLocations] = useState<LocationCardResponse[]>([]);
  const [isLoadingChildLocations, setIsLoadingChildLocations] = useState(true);

  // Fetch location details
  useEffect(() => {
    const fetchLocationDetails = async () => {
      setIsLoading(true);
      try {
        const data = await locationService.getLocationDetails(locationId, locationType);
        setLocation(data);
      } catch (error) {
        console.error('Failed to fetch location details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationDetails();
  }, [locationId, locationType]);

  // Fetch child locations (districts for CITY, wards for DISTRICT)
  useEffect(() => {
    const fetchChildLocations = async () => {
      // Only fetch child locations for CITY and DISTRICT
      if (locationType === 'WARD') {
        setChildLocations([]);
        setIsLoadingChildLocations(false);
        return;
      }
      
      setIsLoadingChildLocations(true);
      try {
        const childType = locationType === 'CITY' ? 'DISTRICT' : 'WARD';
        const filters: any = {
          page: 1,
          limit: 5,
          sortType: 'desc',
          sortBy: 'createdAt',
          locationTypeEnum: childType,
          isActive: true,
        };
        
        if (locationType === 'CITY') {
          filters.cityIds = [locationId];
        } else if (locationType === 'DISTRICT') {
          filters.districtIds = [locationId];
        }
        
        const response = await locationService.getLocationCards(filters);
        setChildLocations(response.data || []);
      } catch (error) {
        console.error('Failed to fetch child locations:', error);
      } finally {
        setIsLoadingChildLocations(false);
      }
    };

    fetchChildLocations();
  }, [locationId, locationType]);

  // Fetch related properties (only for WARD type)
  useEffect(() => {
    const fetchRelatedProperties = async () => {
      // Only fetch properties for WARD type
      if (locationType !== 'WARD') {
        setRelatedProperties([]);
        setIsLoadingProperties(false);
        return;
      }
      
      setIsLoadingProperties(true);
      try {
        const filters: any = {
          page: 1,
          limit: 5,
          sortType: 'desc',
          sortBy: 'createdAt',
          wardIds: [locationId],
        };

        const response = await propertyService.getPropertyCards(filters);
        setRelatedProperties(response.data || []);
      } catch (error) {
        console.error('Failed to fetch related properties:', error);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchRelatedProperties();
  }, [locationId, locationType]);

  const formatNumber = (num: number | undefined) => {
    if (!num) return 'N/A';
    return num.toLocaleString('vi-VN');
  };

  // Format price for locations (avg land price per m²)
  const formatPrice = (price: number | undefined) => {
    if (!price) return 'N/A';
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(2)}B VND/m²`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(2)}M VND/m²`;
    return `${price.toLocaleString('vi-VN')} VND/m²`;
  };

  // Format price for properties (total price, no /m²)
  const formatPropertyPrice = (price: number | undefined, isRental?: boolean) => {
    if (!price) return 'N/A';
    let formatted = '';
    if (price >= 1000000000) {
      formatted = `${(price / 1000000000).toFixed(2)}B VND`;
    } else if (price >= 1000000) {
      formatted = `${(price / 1000000).toFixed(2)}M VND`;
    } else {
      formatted = `${price.toLocaleString('vi-VN')} VND`;
    }
    return isRental ? `${formatted}/tháng` : formatted;
  };

  const getImageUrl = (url: string | null | undefined): string => {
    const fallbackImage = 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800';
    if (!url) return fallbackImage;
    if (!url.startsWith('http://') && !url.startsWith('https://')) return fallbackImage;
    return url;
  };

  // Get image for carousel - use fallback if imgUrl is null
  const locationImage = getImageUrl(location?.imgUrl);
  const images = [locationImage];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-[90%] mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Location not found</h1>
          <Link href="/locations" className="text-red-600 hover:text-red-700">
            Back to Locations
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-[90%] mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-red-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/locations" className="hover:text-red-600">Locations</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{location.name}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Carousel */}
            {images.length > 0 && (
              <div className="relative h-96 rounded-2xl overflow-hidden mb-6 bg-gray-200">
                <img
                  src={getImageUrl(images[currentImageIndex])}
                  alt={location.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-900" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-900" />
                    </button>
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 text-white text-sm rounded-lg">
                      {currentImageIndex + 1}/{images.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Location Name */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{location.name}</h1>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average land price</p>
                <p className="text-xl font-bold text-red-600">{formatPrice(location.avgLandPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Area</p>
                <p className="text-xl font-bold text-gray-900">{formatNumber(location.totalArea)} km²</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Population</p>
                <p className="text-xl font-bold text-gray-900">{formatNumber(location.population)}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {location.description || 'No description available for this location.'}
              </p>
            </div>

            {/* Sub-locations Statistics */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Districts count - only show for CITY */}
              {locationType === 'CITY' && location.districtCount !== undefined && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Districts</p>
                    <p className="text-2xl font-bold text-gray-900">{location.districtCount}</p>
                  </div>
                </div>
              )}
              
              {/* Wards count - show for CITY and DISTRICT (not WARD) */}
              {(locationType === 'CITY' || locationType === 'DISTRICT') && location.wardCount !== undefined && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Wards</p>
                    <p className="text-2xl font-bold text-gray-900">{location.wardCount}</p>
                  </div>
                </div>
              )}
              
              {/* Active Properties - always show */}
              {location.activeProperties !== undefined && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{location.activeProperties}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Child Locations or Properties */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {locationType === 'CITY' ? 'Districts' : locationType === 'DISTRICT' ? 'Wards' : 'Properties'}
              </h3>
              
              {/* Show child locations for CITY and DISTRICT */}
              {locationType !== 'WARD' ? (
                isLoadingChildLocations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                  </div>
                ) : childLocations.length > 0 ? (
                  <div className="space-y-4">
                    {childLocations.map((childLocation) => (
                      <Link
                        key={childLocation.id}
                        href={`/locations/${childLocation.id}?type=${childLocation.locationTypeEnum}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <img
                            src={getImageUrl(childLocation.imgUrl)}
                            alt={childLocation.name}
                            className="w-24 h-24 rounded-lg object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-red-600">
                              {childLocation.name}
                            </h4>
                            <p className="text-red-600 font-bold text-sm mt-1">
                              {formatPrice(childLocation.avgLandPrice)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatNumber(childLocation.totalArea)} km²
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Users className="w-3 h-3" />
                              {formatNumber(childLocation.population)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    
                    <Link
                      href={`/locations?type=${locationType === 'CITY' ? 'DISTRICT' : 'WARD'}&parentId=${locationId}`}
                      className="block text-center py-2 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      View all {locationType === 'CITY' ? 'districts' : 'wards'} →
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-8">
                    No {locationType === 'CITY' ? 'districts' : 'wards'} available
                  </p>
                )
              ) : (
                /* Show properties for WARD */
                isLoadingProperties ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                  </div>
                ) : relatedProperties.length > 0 ? (
                  <div className="space-y-4">
                    {relatedProperties.map((property) => (
                      <Link
                        key={property.id}
                        href={`/property/${property.id}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <img
                            src={getImageUrl(property.thumbnailUrl)}
                            alt={property.title}
                            className="w-24 h-24 rounded-lg object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-red-600">
                              {property.title}
                            </h4>
                            <p className="text-red-600 font-bold text-sm mt-1">
                              {formatPropertyPrice(property.price, property.transactionType === 'RENTAL')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatNumber(property.totalArea)} m²
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Users className="w-3 h-3" />
                              {property.numberOfImages} photos
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    
                    <Link
                      href={`/properties?wardIds=${locationId}`}
                      className="block text-center py-2 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      View all properties →
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-8">
                    No properties available in this ward
                  </p>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
