'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Save, Loader2, Search, Check, AlertCircle } from 'lucide-react';
import { propertyService, PropertyTypeResponse, CreatePropertyRequest } from '@/lib/api/services/property.service';
import { locationService } from '@/lib/api/services/location.service';
import { accountService, PropertyOwnerListItem } from '@/lib/api/services/account.service';

interface AddPropertyFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function AddPropertyForm({ onSuccess, onCancel }: AddPropertyFormProps) {
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');

    // Validation Errors State
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Refs để scroll đến field bị lỗi
    const titleRef = useRef<HTMLDivElement>(null);
    const typeRef = useRef<HTMLDivElement>(null);
    const ownerRef = useRef<HTMLDivElement>(null);
    const wardRef = useRef<HTMLDivElement>(null);

    // Data Sources
    const [propertyTypes, setPropertyTypes] = useState<PropertyTypeResponse[]>([]);
    const [cities, setCities] = useState<Map<string, string>>(new Map());
    const [districts, setDistricts] = useState<Map<string, string>>(new Map());
    const [wards, setWards] = useState<Map<string, string>>(new Map());

    // --- OWNER SELECTION STATE ---
    const [ownerSearchQuery, setOwnerSearchQuery] = useState('');
    const [foundOwners, setFoundOwners] = useState<PropertyOwnerListItem[]>([]);
    const [selectedOwner, setSelectedOwner] = useState<PropertyOwnerListItem | null>(null);
    const [isSearchingOwner, setIsSearchingOwner] = useState(false);
    const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);

    // --- FORM STATE ---
    const [formData, setFormData] = useState<CreatePropertyRequest>({
        title: '',
        description: '',
        propertyTypeId: '',
        transactionType: 'SALE',
        priceAmount: 0,
        area: 0,
        fullAddress: '',
        wardId: '',
        ownerId: '',
        rooms: 0,
        bathrooms: 0,
        bedrooms: 0,
        floors: 0,
        houseOrientation: undefined,
        balconyOrientation: undefined,
    });

    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // 1. Initial Load
    useEffect(() => {
        const initData = async () => {
            try {
                const [types, cityMap] = await Promise.all([
                    propertyService.getPropertyTypes(),
                    locationService.getChildLocations('CITY')
                ]);
                setPropertyTypes(types);
                setCities(cityMap);
            } catch (err) {
                console.error("Failed to load init data", err);
            }
        };
        initData();
    }, []);

    // 2. Owner Search Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (ownerSearchQuery.length >= 2) {
                setIsSearchingOwner(true);
                try {
                    const response = await accountService.getAllPropertyOwners({
                        name: ownerSearchQuery,
                        page: 1,
                        limit: 5
                    });
                    const owners = (response as any).data || (response as any).content || [];
                    setFoundOwners(owners);
                    setShowOwnerDropdown(true);
                } catch (error) {
                    console.error("Search owner failed", error);
                } finally {
                    setIsSearchingOwner(false);
                }
            } else {
                setFoundOwners([]);
                setShowOwnerDropdown(false);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [ownerSearchQuery]);

    const handleSelectOwner = (owner: PropertyOwnerListItem) => {
        setSelectedOwner(owner);
        setFormData(prev => ({ ...prev, ownerId: owner.id }));
        setOwnerSearchQuery('');
        setShowOwnerDropdown(false);
        setFieldErrors(prev => ({ ...prev, ownerId: '' }));
    };

    const handleRemoveOwner = () => {
        setSelectedOwner(null);
        setFormData(prev => ({ ...prev, ownerId: '' }));
    };

    // 3. Location Logic
    const handleCityChange = async (cityId: string) => {
        setSelectedCity(cityId);
        setSelectedDistrict('');
        setFormData(prev => ({ ...prev, wardId: '' }));
        setDistricts(new Map());
        setWards(new Map());
        if (cityId) {
            const dists = await locationService.getChildLocations('DISTRICT', cityId);
            setDistricts(dists);
        }
    };

    const handleDistrictChange = async (districtId: string) => {
        setSelectedDistrict(districtId);
        setFormData(prev => ({ ...prev, wardId: '' }));
        setWards(new Map());
        if (districtId) {
            const w = await locationService.getChildLocations('WARD', districtId);
            setWards(w);
        }
    };

    // 4. Input Handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (value && fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }

        setFormData(prev => {
            const newData = { ...prev } as any;
            if (['priceAmount', 'area', 'rooms', 'bathrooms', 'bedrooms', 'floors'].includes(name)) {
                newData[name] = Number(value);
            } else if (name === 'houseOrientation' || name === 'balconyOrientation') {
                newData[name] = value === "" ? undefined : value;
            } else {
                newData[name] = value;
            }
            return newData as CreatePropertyRequest;
        });
    };

    // 5. Image Handler
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedImages(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    // 6. Validate & Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setGeneralError('');

        const errors: Record<string, string> = {};
        let firstErrorRef: React.RefObject<HTMLDivElement | null> | null = null;

        if (!formData.title.trim()) {
            errors.title = "Property Title is required.";
            if (!firstErrorRef) firstErrorRef = titleRef;
        }
        if (!formData.propertyTypeId) {
            errors.propertyTypeId = "Property Type is required.";
            if (!firstErrorRef) firstErrorRef = typeRef;
        }
        if (!formData.ownerId) {
            errors.ownerId = "Property Owner is required.";
            if (!firstErrorRef) firstErrorRef = ownerRef;
        }
        if (!formData.wardId) {
            errors.wardId = "Location (Ward) is required.";
            if (!firstErrorRef) firstErrorRef = wardRef;
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setLoading(false);
            if (firstErrorRef && firstErrorRef.current) {
                firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        try {
            await propertyService.createProperty(formData, selectedImages);
            onSuccess();
        } catch (err: any) {
            console.error("Create failed", err);
            setGeneralError(err.response?.data?.message || "Failed to create property.");
        } finally {
            setLoading(false);
        }
    };

    // CSS Helper: Đổi focus ring sang Red
    const getInputClass = (fieldName: string) => `
    w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all 
    ${fieldErrors[fieldName]
            ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500'
            : 'border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-50 bg-white'
        }
  `;

    const getLabelClass = (fieldName: string) => `
    block text-xs font-bold mb-1.5 uppercase tracking-wide 
    ${fieldErrors[fieldName] ? 'text-red-600' : 'text-gray-600'}
  `;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-[65vh] md:h-[70vh]">
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-gray-200
        [&::-webkit-scrollbar-thumb]:rounded-full
        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">

                {generalError && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{generalError}</span>
                    </div>
                )}

                {Object.keys(fieldErrors).length > 0 && (
                    <div className="bg-orange-50 border border-orange-100 text-orange-800 p-4 rounded-xl text-sm flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Please correct the highlighted fields:</p>
                            <ul className="list-disc ml-4 mt-1 space-y-0.5 text-xs">
                                {Object.values(fieldErrors).map((msg, i) => <li key={i}>{msg}</li>)}
                            </ul>
                        </div>
                    </div>
                )}

                {/* SECTION 1: BASIC INFO */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                        <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">1</div>
                        <h3 className="text-sm font-bold text-gray-900">Basic Information</h3>
                    </div>

                    <div ref={titleRef}>
                        <label className={getLabelClass('title')}>Property Title <span className="text-red-500">*</span></label>
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={getInputClass('title')}
                            placeholder="e.g. Luxury Apartment in D1"
                        />
                        {fieldErrors.title && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.title}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div ref={typeRef}>
                            <label className={getLabelClass('propertyTypeId')}>Type <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select name="propertyTypeId" value={formData.propertyTypeId} onChange={handleChange} className={getInputClass('propertyTypeId')}>
                                    <option value="">Select Type</option>
                                    {propertyTypes.map(t => (
                                        <option key={t.id} value={t.id}>{t.typeName}</option>
                                    ))}
                                </select>
                                {fieldErrors.propertyTypeId && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.propertyTypeId}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Transaction <span className="text-red-500">*</span></label>
                            <select name="transactionType" value={formData.transactionType} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all">
                                <option value="SALE">For Sale</option>
                                <option value="RENTAL">For Rent</option>
                            </select>
                        </div>
                    </div>

                    {/* OWNER SELECTION UI */}
                    <div className="relative" ref={ownerRef}>
                        <label className={getLabelClass('ownerId')}>Property Owner <span className="text-red-500">*</span></label>
                        {!selectedOwner ? (
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    {isSearchingOwner ? <Loader2 className="w-5 h-5 animate-spin text-red-500" /> : <Search className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />}
                                </div>
                                <input
                                    type="text"
                                    value={ownerSearchQuery}
                                    onChange={(e) => setOwnerSearchQuery(e.target.value)}
                                    className={`w-full pl-11 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${fieldErrors.ownerId ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'}`}
                                    placeholder="Type to search owner by name..."
                                />
                                {showOwnerDropdown && foundOwners.length > 0 && (
                                    <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                        {foundOwners.map((owner) => (
                                            <div key={owner.id} onClick={() => handleSelectOwner(owner)} className="p-3 hover:bg-red-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0">
                                                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold shrink-0 text-xs">
                                                    {owner.avatarUrl ? <img src={owner.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span>{owner.firstName?.charAt(0)}</span>}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{owner.firstName} {owner.lastName}</p>
                                                    <span className="text-xs text-gray-500">{owner.tier || 'STANDARD'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 border border-green-200 bg-green-50/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white border border-green-100 flex items-center justify-center text-green-600 font-bold">
                                        {selectedOwner.avatarUrl ? <img src={selectedOwner.avatarUrl} alt="" className="w-full h-full object-cover" /> : <Check className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{selectedOwner.firstName} {selectedOwner.lastName}</p>
                                        <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {selectedOwner.id.split('-')[0]}...</p>
                                    </div>
                                </div>
                                <button type="button" onClick={handleRemoveOwner} className="px-3 py-1.5 bg-white border border-gray-200 hover:text-red-600 text-gray-600 text-xs font-bold rounded-lg shadow-sm">Change</button>
                            </div>
                        )}
                        {fieldErrors.ownerId && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.ownerId}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Price (VNĐ)</label>
                            <input type="number" name="priceAmount" value={formData.priceAmount} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all" min="0" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Area (m²)</label>
                            <input type="number" name="area" value={formData.area} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all" min="0" />
                        </div>
                    </div>
                </div>

                {/* SECTION 2: LOCATION */}
                <div className="space-y-5" ref={wardRef}>
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                        <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">2</div>
                        <h3 className={`text-sm font-bold ${fieldErrors.wardId ? 'text-red-600' : 'text-gray-900'}`}>Location</h3>
                    </div>

                    {fieldErrors.wardId && <div className="text-xs text-red-500 font-bold mb-2">Please select City, District, and Ward completely.</div>}

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">City</label>
                            <select value={selectedCity} onChange={(e) => handleCityChange(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm outline-none bg-white focus:border-red-500 focus:ring-2 focus:ring-red-50">
                                <option value="">City...</option>
                                {Array.from(cities.entries()).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">District</label>
                            <select value={selectedDistrict} onChange={(e) => handleDistrictChange(e.target.value)} disabled={!selectedCity} className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-50">
                                <option value="">District...</option>
                                {Array.from(districts.entries()).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={`block text-xs font-bold mb-1.5 ${fieldErrors.wardId ? 'text-red-600' : 'text-gray-600'}`}>Ward <span className="text-red-500">*</span></label>
                            <select
                                name="wardId"
                                value={formData.wardId}
                                onChange={(e) => { handleChange(e); if (e.target.value) setFieldErrors(prev => ({ ...prev, wardId: '' })); }}
                                disabled={!selectedDistrict}
                                className={`w-full border rounded-xl px-3 py-3 text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400 transition-all ${fieldErrors.wardId ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-50'}`}
                            >
                                <option value="">Ward...</option>
                                {Array.from(wards.entries()).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Full Address</label>
                        <input name="fullAddress" value={formData.fullAddress} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all" placeholder="House number, Street name..." />
                    </div>
                </div>

                {/* SECTION 3: DETAILS */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                        <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">3</div>
                        <h3 className="text-sm font-bold text-gray-900">Details & Images</h3>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">Bedrooms</label>
                            <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-50 outline-none text-center" min="0" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">Bathrooms</label>
                            <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-50 outline-none text-center" min="0" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">Floors</label>
                            <input type="number" name="floors" value={formData.floors} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-50 outline-none text-center" min="0" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">Total Rooms</label>
                            <input type="number" name="rooms" value={formData.rooms} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-50 outline-none text-center" min="0" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">House Orientation</label>
                            <select name="houseOrientation" value={formData.houseOrientation || ""} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm bg-white focus:border-red-500 focus:ring-2 focus:ring-red-50 outline-none">
                                <option value="">Unknown</option>
                                <option value="NORTH">North</option>
                                <option value="SOUTH">South</option>
                                <option value="EAST">East</option>
                                <option value="WEST">West</option>
                                <option value="NORTH_EAST">North East</option>
                                <option value="NORTH_WEST">North West</option>
                                <option value="SOUTH_EAST">South East</option>
                                <option value="SOUTH_WEST">South West</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">Balcony Orientation</label>
                            <select name="balconyOrientation" value={formData.balconyOrientation || ""} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm bg-white focus:border-red-500 focus:ring-2 focus:ring-red-50 outline-none">
                                <option value="">Unknown</option>
                                <option value="NORTH">North</option>
                                <option value="SOUTH">South</option>
                                <option value="EAST">East</option>
                                <option value="WEST">West</option>
                                <option value="NORTH_EAST">North East</option>
                                <option value="NORTH_WEST">North West</option>
                                <option value="SOUTH_EAST">South East</option>
                                <option value="SOUTH_WEST">South West</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all resize-none" placeholder="Enter detailed description..." />
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-red-400 transition-all cursor-pointer relative group">
                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-red-500" />
                        </div>
                        <p className="text-sm text-gray-900 font-bold">Click to upload images</p>
                        <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or WEBP (MAX. 5MB)</p>
                    </div>

                    {previewUrls.length > 0 && (
                        <div className="grid grid-cols-4 gap-3">
                            {previewUrls.map((url, idx) => (
                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group shadow-sm">
                                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button type="button" onClick={() => removeImage(idx)} className="bg-white/90 hover:bg-red-50 text-red-600 p-2 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="h-4"></div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-white rounded-b-xl">
                <button type="button" onClick={onCancel} disabled={loading} className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02]">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Create Property
                </button>
            </div>
        </form>
    );
}