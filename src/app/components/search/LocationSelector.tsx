'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import { locationService } from '@/lib/api/services/location.service';

interface LocationSelectorProps {
  selectedCities: string[];
  selectedDistricts: string[];
  selectedWards: string[];
  onCitiesChange: (cities: string[]) => void;
  onDistrictsChange: (districts: string[]) => void;
  onWardsChange: (wards: string[]) => void;
}

export default function LocationSelector({
  selectedCities,
  selectedDistricts,
  selectedWards,
  onCitiesChange,
  onDistrictsChange,
  onWardsChange
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState<Map<string, string>>(new Map());
  const [districts, setDistricts] = useState<Map<string, string>>(new Map());
  const [wards, setWards] = useState<Map<string, string>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const citiesMap = await locationService.getChildLocations('CITY');
        setCities(citiesMap);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      }
    };
    fetchCities();
  }, []);

  // Fetch districts when city is selected
  useEffect(() => {
    if (selectedCity) {
      const fetchDistricts = async () => {
        try {
          const districtsMap = await locationService.getChildLocations('DISTRICT', selectedCity);
          setDistricts(prevDistricts => {
            // Merge with existing districts to preserve names of selected districts
            const merged = new Map(prevDistricts);
            districtsMap.forEach((value, key) => merged.set(key, value));
            return merged;
          });
        } catch (error) {
          console.error('Failed to fetch districts:', error);
        }
      };
      fetchDistricts();
    }
    // Don't clear districts when selectedCity is null to preserve names for selected tags
  }, [selectedCity]);

  // Fetch wards when district is selected
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        try {
          const wardsMap = await locationService.getChildLocations('WARD', selectedDistrict);
          setWards(prevWards => {
            // Merge with existing wards to preserve names of selected wards
            const merged = new Map(prevWards);
            wardsMap.forEach((value, key) => merged.set(key, value));
            return merged;
          });
        } catch (error) {
          console.error('Failed to fetch wards:', error);
        }
      };
      fetchWards();
    }
    // Don't clear wards when selectedDistrict is null to preserve names for selected tags
  }, [selectedDistrict]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCity = (cityId: string) => {
    const newCities = selectedCities.includes(cityId)
      ? selectedCities.filter(id => id !== cityId)
      : [...selectedCities, cityId];
    onCitiesChange(newCities);
  };

  const toggleDistrict = (districtId: string) => {
    const newDistricts = selectedDistricts.includes(districtId)
      ? selectedDistricts.filter(id => id !== districtId)
      : [...selectedDistricts, districtId];
    onDistrictsChange(newDistricts);
  };

  const toggleWard = (wardId: string) => {
    const newWards = selectedWards.includes(wardId)
      ? selectedWards.filter(id => id !== wardId)
      : [...selectedWards, wardId];
    onWardsChange(newWards);
  };

  const removeCity = (cityId: string) => {
    onCitiesChange(selectedCities.filter(id => id !== cityId));
  };

  const removeDistrict = (districtId: string) => {
    onDistrictsChange(selectedDistricts.filter(id => id !== districtId));
  };

  const removeWard = (wardId: string) => {
    onWardsChange(selectedWards.filter(id => id !== wardId));
  };

  const getDisplayText = () => {
    const total = selectedCities.length + selectedDistricts.length + selectedWards.length;
    if (total === 0) return 'All Locations';
    
    const parts: string[] = [];
    
    // Add city names
    if (selectedCities.length > 0) {
      const cityNames = selectedCities.map(id => cities.get(id)).filter(Boolean) as string[];
      parts.push(...cityNames);
    }
    
    // Add district names
    if (selectedDistricts.length > 0) {
      const districtNames = selectedDistricts.map(id => districts.get(id)).filter(Boolean) as string[];
      parts.push(...districtNames);
    }
    
    // Add ward names
    if (selectedWards.length > 0) {
      const wardNames = selectedWards.map(id => wards.get(id)).filter(Boolean) as string[];
      parts.push(...wardNames);
    }
    
    // Show first 4 items, then +N for the rest
    if (parts.length > 4) {
      return `${parts.slice(0, 4).join(', ')} +${parts.length - 4}`;
    }
    
    return parts.join(', ') || `${total} selected`;
  };

  const resetAll = () => {
    onCitiesChange([]);
    onDistrictsChange([]);
    onWardsChange([]);
    setSelectedCity(null);
    setSelectedDistrict(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="text-gray-900 truncate">{getDisplayText()}</span>
        <ChevronDown className={`absolute right-4 w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Where do you interested?</h3>
              <div className="flex gap-2">
                <button
                  onClick={resetAll}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Done
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Location's name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            {/* Selected Tags */}
            {(selectedCities.length > 0 || selectedDistricts.length > 0 || selectedWards.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedCities.map(cityId => (
                  <span key={cityId} className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs rounded-lg">
                    {cities.get(cityId)}
                    <button onClick={() => removeCity(cityId)} className="hover:bg-red-100 rounded">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedDistricts.map(districtId => (
                  <span key={districtId} className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs rounded-lg">
                    {districts.get(districtId)}
                    <button onClick={() => removeDistrict(districtId)} className="hover:bg-red-100 rounded">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedWards.map(wardId => (
                  <span key={wardId} className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs rounded-lg">
                    {wards.get(wardId)}
                    <button onClick={() => removeWard(wardId)} className="hover:bg-red-100 rounded">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {!selectedCity && (
              <div className="p-4">
                <div className="text-xs font-medium text-gray-500 mb-2">All cities</div>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from(cities.entries())
                    .filter(([_, name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(([id, name]) => (
                      <button
                        key={id}
                        onClick={() => {
                          toggleCity(id);
                          setSelectedCity(id);
                        }}
                        className={`px-3 py-2 text-sm text-left rounded-lg transition-colors ${
                          selectedCities.includes(id)
                            ? 'bg-red-50 text-red-700 font-medium'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {selectedCity && !selectedDistrict && (
              <div className="p-4">
                <button
                  onClick={() => setSelectedCity(null)}
                  className="flex items-center gap-2 text-sm text-red-600 mb-3 hover:underline"
                >
                  ← City: {cities.get(selectedCity)}
                </button>
                <div className="text-xs font-medium text-gray-500 mb-2">
                  All districts (double click to select wards)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from(districts.entries()).map(([id, name]) => (
                    <button
                      key={id}
                      onClick={() => toggleDistrict(id)}
                      onDoubleClick={() => setSelectedDistrict(id)}
                      className={`px-3 py-2 text-sm text-left rounded-lg transition-colors ${
                        selectedDistricts.includes(id)
                          ? 'bg-red-50 text-red-700 font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedDistrict && (
              <div className="p-4">
                <button
                  onClick={() => setSelectedDistrict(null)}
                  className="flex items-center gap-2 text-sm text-red-600 mb-3 hover:underline"
                >
                  ← District: {districts.get(selectedDistrict)}
                </button>
                <div className="text-xs font-medium text-gray-500 mb-2">All wards</div>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from(wards.entries()).map(([id, name]) => (
                    <button
                      key={id}
                      onClick={() => toggleWard(id)}
                      className={`px-3 py-2 text-sm text-left rounded-lg transition-colors ${
                        selectedWards.includes(id)
                          ? 'bg-red-50 text-red-700 font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
