'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, MapPin, Building, Bed, Bath, Square, DollarSign, Tag, Home, Image as ImageIcon, X, Check, Camera, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { propertyService, CreatePropertyRequest } from '@/lib/api/services/property.service';
import { locationService, PropertyType as PropertyTypeData } from '@/lib/api/services/location.service';

type TransactionType = 'Sale' | 'Rent';

interface PropertyForm {
  title: string;
  description: string;
  type: TransactionType;
  propertyTypeId: string;
  price: string;
  priceUnit: string;
  rentPeriod?: string;
  address: string;
  cityId: string;
  districtId: string;
  wardId: string;
  bedrooms: number;
  bathrooms: number;
  rooms?: number;
  floors?: number;
  area: string;
  yearBuilt: string;
  houseOrientation?: string;
  balconyOrientation?: string;
  features: string[];
  images: File[];
  documents: File[];
}

const availableFeatures = [
  'Swimming Pool', 'Garden', 'Garage', 'Air Conditioning', 'Security System',
  'Gym', 'Elevator', 'Balcony', 'Fireplace', 'Smart Home', 'Solar Panels', 'Pet Friendly'
];

export default function CreatePropertyPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<PropertyForm>({
    title: '',
    description: '',
    type: 'Sale',
    propertyTypeId: '',
    price: '',
    priceUnit: 'USD',
    address: '',
    cityId: '',
    districtId: '',
    wardId: '',
    bedrooms: 0,
    bathrooms: 0,
    area: '',
    yearBuilt: '',
    features: [],
    images: [],
    documents: [],
  });
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [documentNames, setDocumentNames] = useState<string[]>([]);
  
  // Location and property type data
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeData[]>([]);
  const [cities, setCities] = useState<Map<string, string>>(new Map());
  const [districts, setDistricts] = useState<Map<string, string>>(new Map());
  const [wards, setWards] = useState<Map<string, string>>(new Map());
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  // Fetch property types and cities on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [typesData, citiesData] = await Promise.all([
          locationService.getPropertyTypes(),
          locationService.getCities()
        ]);
        setPropertyTypes(typesData);
        setCities(citiesData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch districts when city changes
  useEffect(() => {
    if (formData.cityId) {
      setIsLoadingLocations(true);
      locationService.getDistricts(formData.cityId)
        .then(districtsData => {
          setDistricts(districtsData);
          setWards(new Map());
          setFormData(prev => ({ ...prev, districtId: '', wardId: '' }));
        })
        .catch(error => console.error('Error fetching districts:', error))
        .finally(() => setIsLoadingLocations(false));
    } else {
      setDistricts(new Map());
      setWards(new Map());
    }
  }, [formData.cityId]);

  // Fetch wards when district changes
  useEffect(() => {
    if (formData.districtId) {
      setIsLoadingLocations(true);
      locationService.getWards(formData.districtId)
        .then(wardsData => {
          setWards(wardsData);
          setFormData(prev => ({ ...prev, wardId: '' }));
        })
        .catch(error => console.error('Error fetching wards:', error))
        .finally(() => setIsLoadingLocations(false));
    } else {
      setWards(new Map());
    }
  }, [formData.districtId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setFormData({ ...formData, images: [...formData.images, ...newFiles] });
      
      // Create previews
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagesPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
    setImagesPreviews(imagesPreviews.filter((_, i) => i !== index));
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setFormData({ ...formData, documents: [...formData.documents, ...newFiles] });
      setDocumentNames(prev => [...prev, ...newFiles.map(f => f.name)]);
    }
  };

  const removeDocument = (index: number) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((_, i) => i !== index)
    });
    setDocumentNames(documentNames.filter((_, i) => i !== index));
  };

  const toggleFeature = (feature: string) => {
    if (formData.features.includes(feature)) {
      setFormData({
        ...formData,
        features: formData.features.filter(f => f !== feature)
      });
    } else {
      setFormData({
        ...formData,
        features: [...formData.features, feature]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.wardId) {
        alert('Please select a ward (city, district, and ward are required)');
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.propertyTypeId) {
        alert('Please select a property type');
        setIsSubmitting(false);
        return;
      }

      const propertyData: CreatePropertyRequest = {
        title: formData.title,
        description: formData.description,
        transactionType: formData.type === 'Sale' ? 'SALE' : 'RENTAL',
        fullAddress: formData.address,
        area: parseFloat(formData.area),
        priceAmount: parseFloat(formData.price.replace(/,/g, '')),
        bedrooms: formData.bedrooms || undefined,
        bathrooms: formData.bathrooms || undefined,
        rooms: formData.rooms,
        floors: formData.floors,
        houseOrientation: formData.houseOrientation as any,
        balconyOrientation: formData.balconyOrientation as any,
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : undefined,
        amenities: formData.features.join(', '),
        propertyTypeId: formData.propertyTypeId,
        wardId: formData.wardId,
      };

      await propertyService.createProperty(
        propertyData,
        formData.images,
        formData.documents
      );

      alert('Property created successfully!');
      router.push('/my/properties');
    } catch (error: any) {
      console.error('Error creating property:', error);
      alert(error.response?.data?.message || 'Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Validation for Step 1
    if (step === 1) {
      if (!formData.title || !formData.description || !formData.type || 
          !formData.propertyTypeId || !formData.price) {
        alert('Please fill in all required fields');
        return;
      }
    }
    // Validation for Step 2
    if (step === 2) {
      if (!formData.area || !formData.address || !formData.wardId) {
        alert('Please fill in all required fields including address and location');
        return;
      }
    }
    setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/my/properties"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Property</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to list your property</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              step >= s ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              step >= s ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {s === 1 ? 'Basic Info' : s === 2 ? 'Details' : 'Images & Docs'}
            </span>
            {s < 3 && <div className={`flex-1 h-1 mx-4 rounded ${step > s ? 'bg-red-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Home className="w-5 h-5 text-red-600" />
              Basic Information
            </h2>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Listing Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'Sale' })}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    formData.type === 'Sale'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-900'
                  }`}
                >
                  <DollarSign className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-medium">For Sale</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'Rent' })}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    formData.type === 'Rent'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-900'
                  }`}
                >
                  <Home className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-medium">For Rent</span>
                </button>
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                value={formData.propertyTypeId}
                onChange={(e) => setFormData({ ...formData, propertyTypeId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-900"
                required
              >
                <option value="">Select property type</option>
                {propertyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.typeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Modern Villa with Swimming Pool"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your property in detail..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                required
              />
            </div>

            {/* Price */}
            <div className={`grid ${formData.type === 'Rent' ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.price ? Number(formData.price).toLocaleString() : ''}
                    onChange={(e) => {
                      // Remove all non-digit characters
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, price: value });
                    }}
                    onKeyPress={(e) => {
                      // Only allow digits
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="850,000"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={formData.priceUnit}
                  onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  <option value="USD">USD</option>
                  <option value="VND">VND</option>
                </select>
              </div>
              {formData.type === 'Rent' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                  <select
                    value={formData.rentPeriod || 'month'}
                    onChange={(e) => setFormData({ ...formData, rentPeriod: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="month">Month</option>
                    <option value="week">Week</option>
                    <option value="year">Year</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.title || !formData.description || !formData.type || 
                         !formData.propertyTypeId || !formData.price}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Property Details */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-red-600" />
              Property Details
            </h2>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <select
                  value={formData.cityId}
                  onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-900"
                  required
                  disabled={isLoadingLocations}
                >
                  <option value="">Select city</option>
                  {Array.from(cities.entries()).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <select
                  value={formData.districtId}
                  onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-900"
                  required
                  disabled={!formData.cityId || isLoadingLocations}
                >
                  <option value="">Select district</option>
                  {Array.from(districts.entries()).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ward</label>
                <select
                  value={formData.wardId}
                  onChange={(e) => setFormData({ ...formData, wardId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-900"
                  required
                  disabled={!formData.districtId || isLoadingLocations}
                >
                  <option value="">Select ward</option>
                  {Array.from(wards.entries()).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                <div className="relative">
                  <Bed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                <div className="relative">
                  <Bath className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Area (m²)</label>
                <div className="relative">
                  <Square className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="280"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year Built</label>
                <input
                  type="text"
                  value={formData.yearBuilt}
                  onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                  placeholder="2020"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rooms</label>
                <input
                  type="number"
                  min="0"
                  value={formData.rooms || ''}
                  onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) || undefined })}
                  placeholder="Total rooms"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Floors</label>
                <input
                  type="number"
                  min="0"
                  value={formData.floors || ''}
                  onChange={(e) => setFormData({ ...formData, floors: parseInt(e.target.value) || undefined })}
                  placeholder="Number of floors"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">House Orientation</label>
                <select
                  value={formData.houseOrientation || ''}
                  onChange={(e) => setFormData({ ...formData, houseOrientation: e.target.value || undefined })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-900"
                >
                  <option value="">Select orientation</option>
                  <option value="NORTH">North</option>
                  <option value="SOUTH">South</option>
                  <option value="EAST">East</option>
                  <option value="WEST">West</option>
                  <option value="NORTHEAST">Northeast</option>
                  <option value="NORTHWEST">Northwest</option>
                  <option value="NORTH_EAST">North East</option>
                  <option value="NORTH_WEST">North West</option>
                  <option value="SOUTHEAST">Southeast</option>
                  <option value="SOUTHWEST">Southwest</option>
                  <option value="SOUTH_EAST">South East</option>
                  <option value="SOUTH_WEST">South West</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Balcony Orientation</label>
                <select
                  value={formData.balconyOrientation || ''}
                  onChange={(e) => setFormData({ ...formData, balconyOrientation: e.target.value || undefined })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-900"
                >
                  <option value="">Select orientation</option>
                  <option value="NORTH">North</option>
                  <option value="SOUTH">South</option>
                  <option value="EAST">East</option>
                  <option value="WEST">West</option>
                  <option value="NORTHEAST">Northeast</option>
                  <option value="NORTHWEST">Northwest</option>
                  <option value="NORTH_EAST">North East</option>
                  <option value="NORTH_WEST">North West</option>
                  <option value="SOUTHEAST">Southeast</option>
                  <option value="SOUTHWEST">Southwest</option>
                  <option value="SOUTH_EAST">South East</option>
                  <option value="SOUTH_WEST">South West</option>
                </select>
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Features & Amenities</label>
              <div className="flex flex-wrap gap-2">
                {availableFeatures.map((feature) => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      formData.features.includes(feature)
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Images */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-red-600" />
              Images & Documents
            </h2>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-red-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">Click to upload images</p>
                <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 10MB each</p>
              </label>
            </div>

            {/* Image Previews */}
            {imagesPreviews.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Uploaded Images ({imagesPreviews.length})</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagesPreviews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-red-600 text-white text-xs rounded font-medium">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents Section */}
            <div className="pt-6 border-t">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-red-600" />
                Property Documents
              </h3>
              
              {/* Document Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  multiple
                  onChange={handleDocumentUpload}
                  className="hidden"
                  id="document-upload"
                />
                <label htmlFor="document-upload" className="cursor-pointer">
                  <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium">Upload documents</p>
                  <p className="text-sm text-gray-500 mt-1">Contracts, certificates, blueprints, etc.</p>
                  <p className="text-xs text-gray-400 mt-2">PDF, DOC, DOCX, TXT up to 10MB each</p>
                </label>
              </div>

              {/* Document List */}
              {documentNames.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Uploaded Documents ({documentNames.length})</p>
                  <div className="space-y-2">
                    {documentNames.map((name, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-red-600" />
                          <span className="text-sm text-gray-700 font-medium">{name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="w-6 h-6 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-xl transition-colors font-medium flex items-center gap-2 ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Create Property
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
