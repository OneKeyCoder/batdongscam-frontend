'use client';

import React, { useState, useEffect } from 'react';
import { locationService, City, District, Ward } from '@/lib/api/services/location.service';
import { ChevronDown } from 'lucide-react';

interface LocationSelectorProps {
  onLocationChange: (wardId: string, districtId: string, cityId: string) => void;
  defaultValues?: {
    cityId?: string;
    districtId?: string;
    wardId?: string;
  };
  required?: boolean;
}

export default function LocationSelector({ 
  onLocationChange, 
  defaultValues,
  required = false 
}: LocationSelectorProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  
  const [selectedCityId, setSelectedCityId] = useState(defaultValues?.cityId || '');
  const [selectedDistrictId, setSelectedDistrictId] = useState(defaultValues?.districtId || '');
  const [selectedWardId, setSelectedWardId] = useState(defaultValues?.wardId || '');
  
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // Load cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const citiesData = await locationService.getCities();
        setCities(citiesData);
      } catch (error) {
        console.error('Failed to load cities:', error);
      } finally {
        setIsLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  // Load districts when city changes
  useEffect(() => {
    if (selectedCityId) {
      const fetchDistricts = async () => {
        setIsLoadingDistricts(true);
        try {
          const districtsData = await locationService.getDistricts(selectedCityId);
          setDistricts(districtsData);
        } catch (error) {
          console.error('Failed to load districts:', error);
        } finally {
          setIsLoadingDistricts(false);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setSelectedDistrictId('');
    }
  }, [selectedCityId]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrictId) {
      const fetchWards = async () => {
        setIsLoadingWards(true);
        try {
          const wardsData = await locationService.getWards(selectedDistrictId);
          setWards(wardsData);
        } catch (error) {
          console.error('Failed to load wards:', error);
        } finally {
          setIsLoadingWards(false);
        }
      };
      fetchWards();
    } else {
      setWards([]);
      setSelectedWardId('');
    }
  }, [selectedDistrictId]);

  // Notify parent when ward changes
  useEffect(() => {
    if (selectedWardId && selectedDistrictId && selectedCityId) {
      onLocationChange(selectedWardId, selectedDistrictId, selectedCityId);
    }
  }, [selectedWardId, selectedDistrictId, selectedCityId, onLocationChange]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCityId(e.target.value);
    setSelectedDistrictId('');
    setSelectedWardId('');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrictId(e.target.value);
    setSelectedWardId('');
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWardId(e.target.value);
  };

  return (
    <div className="space-y-4">
      {/* City Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          City/Province {required && '*'}
        </label>
        <div className="relative">
          <select
            value={selectedCityId}
            onChange={handleCityChange}
            required={required}
            disabled={isLoadingCities}
            className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 appearance-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {isLoadingCities ? 'Loading cities...' : 'Select city/province'}
            </option>
            {cities.map((city) => (
              <option key={city.cityId} value={city.cityId}>
                {city.cityName}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* District Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          District {required && '*'}
        </label>
        <div className="relative">
          <select
            value={selectedDistrictId}
            onChange={handleDistrictChange}
            required={required}
            disabled={!selectedCityId || isLoadingDistricts}
            className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 appearance-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {isLoadingDistricts ? 'Loading districts...' : 'Select district'}
            </option>
            {districts.map((district) => (
              <option key={district.districtId} value={district.districtId}>
                {district.districtName}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Ward Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ward/Commune {required && '*'}
        </label>
        <div className="relative">
          <select
            value={selectedWardId}
            onChange={handleWardChange}
            required={required}
            disabled={!selectedDistrictId || isLoadingWards}
            className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 appearance-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {isLoadingWards ? 'Loading wards...' : 'Select ward/commune'}
            </option>
            {wards.map((ward) => (
              <option key={ward.wardId} value={ward.wardId}>
                {ward.wardName}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
