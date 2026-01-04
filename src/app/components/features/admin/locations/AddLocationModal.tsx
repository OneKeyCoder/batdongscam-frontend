'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, ChevronDown } from 'lucide-react';
import { locationService, CreateLocationRequest } from '@/lib/api/services/location.service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const mapToArray = (mapData: Map<string, string>) => {
    return Array.from(mapData, ([id, name]) => ({ id, name }));
};

export default function AddLocationModal({ isOpen, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [fetchingParents, setFetchingParents] = useState(false);

    const [formData, setFormData] = useState<Partial<CreateLocationRequest>>({
        locationTypeEnum: 'CITY',
        isActive: true,
        parentId: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [cities, setCities] = useState<{ id: string, name: string }[]>([]);
    const [districts, setDistricts] = useState<{ id: string, name: string }[]>([]);
    const [selectedCityId, setSelectedCityId] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            setFormData({ locationTypeEnum: 'CITY', isActive: true, parentId: '' });
            setImageFile(null);
            setSelectedCityId('');
            setCities([]);
            setDistricts([]);
            fetchCities();
        }
    }, [isOpen]);

    const fetchCities = async () => {
        try {
            const map = await locationService.getChildLocations('CITY');
            setCities(mapToArray(map));
        } catch (error) {
            console.error("Failed to fetch cities", error);
        }
    };

    const fetchDistricts = async (cityId: string) => {
        if (!cityId) {
            setDistricts([]);
            return;
        }
        setFetchingParents(true);
        try {
            const map = await locationService.getChildLocations('DISTRICT', cityId);
            setDistricts(mapToArray(map));
        } catch (error) {
            console.error("Failed to fetch districts", error);
        } finally {
            setFetchingParents(false);
        }
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value as 'CITY' | 'DISTRICT' | 'WARD';
        setFormData(prev => ({
            ...prev,
            locationTypeEnum: type,
            parentId: ''
        }));
        setSelectedCityId('');
        setDistricts([]);
    };

    const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityId = e.target.value;
        setSelectedCityId(cityId);

        if (formData.locationTypeEnum === 'DISTRICT') {
            setFormData(prev => ({ ...prev, parentId: cityId }));
        } else if (formData.locationTypeEnum === 'WARD') {
            setFormData(prev => ({ ...prev, parentId: '' }));
            fetchDistricts(cityId);
        }
    };

    const handleDistrictSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const districtId = e.target.value;
        setFormData(prev => ({ ...prev, parentId: districtId }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!formData.name) {
                alert("Please enter location name");
                setLoading(false);
                return;
            }
            if (formData.locationTypeEnum !== 'CITY' && !formData.parentId) {
                alert(`Please select a parent ${formData.locationTypeEnum === 'DISTRICT' ? 'City' : 'District'}`);
                setLoading(false);
                return;
            }

            const area = Number(formData.totalArea) || 0;
            const population = Number(formData.population) || 0;
            const price = Number(formData.avg_land_price) || 0;

            if (area < 0 || population < 0 || price < 0) {
                alert("Area, Population, and Price must be positive numbers.");
                setLoading(false);
                return;
            }

            const payload: CreateLocationRequest = {
                name: formData.name,
                locationTypeEnum: formData.locationTypeEnum as any,
                description: formData.description,
                totalArea: area,
                population: population,
                avg_land_price: price,
                isActive: formData.isActive,
                parentId: formData.parentId || undefined,
                image: imageFile || undefined
            };

            await locationService.createLocation(payload);
            onSuccess();
        } catch (error) {
            console.error("Failed to create location", error);
            alert("Failed to create location.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-bold text-gray-900">Add New Location</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">Type</label>
                            <div className="relative">
                                <select
                                    name="locationTypeEnum"
                                    value={formData.locationTypeEnum}
                                    onChange={handleTypeChange}
                                    className="w-full appearance-none p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none text-sm bg-white"
                                >
                                    <option value="CITY">City (Tỉnh/Thành phố)</option>
                                    <option value="DISTRICT">District (Quận/Huyện)</option>
                                    <option value="WARD">Ward (Phường/Xã)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">Name <span className="text-red-500">*</span></label>
                            <input
                                type="text" name="name" required
                                placeholder={`e.g. ${formData.locationTypeEnum === 'CITY' ? 'Hồ Chí Minh' : formData.locationTypeEnum === 'DISTRICT' ? 'Quận 1' : 'Phường Bến Nghé'}`}
                                value={formData.name || ''} onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none text-sm"
                            />
                        </div>
                    </div>

                    {formData.locationTypeEnum === 'DISTRICT' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">Belongs to City <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    value={selectedCityId}
                                    onChange={handleCitySelect}
                                    className="w-full appearance-none p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none text-sm bg-white"
                                >
                                    <option value="">-- Select City --</option>
                                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {formData.locationTypeEnum === 'WARD' && (
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Step 1: Filter City</label>
                                <div className="relative">
                                    <select
                                        value={selectedCityId}
                                        onChange={handleCitySelect}
                                        className="w-full appearance-none p-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                                    >
                                        <option value="">-- Select City --</option>
                                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Step 2: Select District (Parent) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        value={formData.parentId}
                                        onChange={handleDistrictSelect}
                                        disabled={!selectedCityId || fetchingParents}
                                        className="w-full appearance-none p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400"
                                    >
                                        <option value="">-- Select District --</option>
                                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                    {fetchingParents ? (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500 animate-spin" />
                                    ) : (
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1.5">Description</label>
                        <textarea
                            name="description" rows={3}
                            value={formData.description || ''} onChange={handleChange}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none text-sm resize-none"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Area (km²)</label>
                            <input
                                type="number" min="0" step="0.01"
                                name="totalArea"
                                value={formData.totalArea !== undefined ? formData.totalArea : ''}
                                onChange={handleChange}
                                className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Population</label>
                            <input
                                type="number" min="0"
                                name="population"
                                value={formData.population !== undefined ? formData.population : ''}
                                onChange={handleChange}
                                className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Avg Price (VNĐ)</label>
                            {/* [FIX] Thêm min="0" */}
                            <input
                                type="number" min="0" step="1000"
                                name="avg_land_price"
                                value={formData.avg_land_price !== undefined ? formData.avg_land_price : ''}
                                onChange={handleChange}
                                className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Image</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500 font-medium">{imageFile ? imageFile.name : 'Click to upload image'}</p>
                            <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox" id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">Active status</label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Location
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}