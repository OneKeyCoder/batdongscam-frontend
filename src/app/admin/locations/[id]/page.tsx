'use client';

import React, { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart, Home, Map, Loader2, Calendar, MapPin, Building2, Pencil, Check, X, Upload } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// Components
import DetailLayout from '@/app/components/DetailLayout';
import DistrictSidebar from '@/app/components/features/admin/locations/DistrictSidebar';
import WardSidebar from '@/app/components/features/admin/locations/WardSidebar';

// Services & Types
import { locationService, LocationDetailsResponse, UpdateLocationRequest } from '@/lib/api/services/location.service';
import { favoriteService, LikeType } from '@/lib/api/services/favorite.service';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2613&auto=format&fit=crop";

export default function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const typeParam = (searchParams.get('type') as 'CITY' | 'DISTRICT' | 'WARD') || 'CITY';

    // State Data
    const [location, setLocation] = useState<LocationDetailsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    // State Editing
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<UpdateLocationRequest>>({});
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 3. Fetch Data
    const fetchDetail = async () => {
        setLoading(true);
        try {
            const data = await locationService.getLocationDetails(id, typeParam);
            setLocation(data);
            // Initialize form data
            setFormData({
                id: data.id,
                locationTypeEnum: data.locationTypeEnum,
                name: data.name,
                description: data.description || '',
                totalArea: data.totalArea,
                avg_land_price: data.avgLandPrice,
                population: data.population,
                isActive: data.isActive
            });
            setPreviewImage(data.imgUrl || null);
        } catch (error) {
            console.error("Failed to fetch location details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchDetail();
    }, [id, typeParam]);

    // Handle Edit Actions
    const handleEditToggle = () => {
        if (isEditing) {
            // If cancelling edit, reset form data
            if (location) {
                setFormData({
                    id: location.id,
                    locationTypeEnum: location.locationTypeEnum,
                    name: location.name,
                    description: location.description || '',
                    totalArea: location.totalArea,
                    avg_land_price: location.avgLandPrice,
                    population: location.population,
                    isActive: location.isActive
                });
                setPreviewImage(location.imgUrl || null);
            }
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleConfirmUpdate = async () => {
        if (!formData.id || !formData.locationTypeEnum) return;
        setSaving(true);
        try {
            // Call API Update
            const updatedLocation = await locationService.updateLocation(formData as UpdateLocationRequest);
            setLocation(updatedLocation);
            setIsEditing(false);
            alert("Updated successfully!");
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update location.");
        } finally {
            setSaving(false);
        }
    };

    // Handle Favorite (Giữ nguyên)
    const handleToggleFavorite = async () => {
        if (!location || toggling) return;
        const previousState = location.isFavorite;
        setLocation(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
        setToggling(true);
        try {
            let type = LikeType.CITY;
            if (location.locationTypeEnum === 'DISTRICT') type = LikeType.DISTRICT;
            if (location.locationTypeEnum === 'WARD') type = LikeType.WARD;
            await favoriteService.toggleLike(location.id, type);
        } catch (error) {
            setLocation(prev => prev ? { ...prev, isFavorite: previousState } : null);
        } finally {
            setToggling(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-red-600 animate-spin" /></div>;
    if (!location) return <div className="text-center py-20 text-gray-500 font-medium">Location not found.</div>;

    const isDistrict = typeParam === 'DISTRICT' || location.locationTypeEnum === 'DISTRICT';
    const SidebarComponent = isDistrict ? <WardSidebar parentId={location.id} /> : <DistrictSidebar parentId={location.id} />;
    const displayImage = (previewImage && previewImage.trim() !== '') ? previewImage : DEFAULT_IMAGE;

    return (
        <div className="max-w-7xl mx-auto pb-10 animate-in fade-in duration-500 relative">

            {/* Floating Action Buttons for Edit */}
            <div className="fixed bottom-10 right-10 z-50 flex gap-2">
                {isEditing ? (
                    <>
                        <button
                            onClick={handleEditToggle}
                            className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-full shadow-lg transition-all"
                            disabled={saving}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handleConfirmUpdate}
                            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all flex items-center gap-2"
                            disabled={saving}
                        >
                            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                            <span className="font-bold pr-2">Confirm</span>
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleEditToggle}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all"
                    >
                        <Pencil className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Header / Breadcrumb */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 uppercase tracking-wide font-bold">
                    <Link href="/admin/dashboard" className="hover:text-red-600">Home</Link>
                    <span>/</span>
                    <Link href="/admin/locations" className="hover:text-red-600">Locations</Link>
                    <span>/</span>
                    <span className="text-gray-900">{location.name}</span>
                </div>

                <div className="flex justify-between items-end">
                    <div className="flex-1 mr-4">
                        {/* Inline Edit Name */}
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleInputChange}
                                className="text-3xl font-extrabold text-gray-900 w-full border-b-2 border-blue-500 focus:outline-none bg-transparent"
                                placeholder="Location Name"
                            />
                        ) : (
                            <h1 className="text-3xl font-extrabold text-gray-900">{location.name}</h1>
                        )}

                        <div className="text-gray-500 mt-1 flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded text-white font-bold ${isDistrict ? 'bg-blue-500' : 'bg-red-500'}`}>
                                {isDistrict ? 'DISTRICT' : 'CITY'}
                            </span>
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-red-500" /> Vietnam</span>
                        </div>
                    </div>

                    <button
                        onClick={handleToggleFavorite}
                        disabled={toggling}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all text-sm font-bold shadow-sm
                            ${location.isFavorite
                                ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            } ${toggling ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <Heart className={`w-4 h-4 ${location.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        {location.isFavorite ? 'Favorited' : 'Add to favorites'}
                    </button>
                </div>
            </div>

            <DetailLayout sidebar={SidebarComponent}>
                <div className="space-y-8">

                    {/* Image Hero with Edit Overlay */}
                    <div className="relative h-[450px] w-full rounded-2xl overflow-hidden shadow-lg group bg-gray-900">
                        <img
                            src={displayImage}
                            alt={location.name}
                            className={`w-full h-full object-cover ${!isEditing ? 'animate-ken-burns' : ''}`}
                            style={{
                                animation: !isEditing ? 'kenburns 20s infinite alternate ease-in-out' : 'none',
                                transformOrigin: 'center center'
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                        {/* Image Upload Trigger */}
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-100 transition-all"
                                >
                                    <Upload className="w-5 h-5" /> Change Image
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>
                        )}

                        {/* Navigation Controls (Only show if not editing) */}
                        {!isEditing && (
                            <>
                                <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110">
                                    <ChevronLeft className="w-6 h-6 text-white" />
                                </button>
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110">
                                    <ChevronRight className="w-6 h-6 text-white" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Main Stats (Editable) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-gray-100">
                        {/* Field 1: Avg Land Price */}
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Avg Land Price (VNĐ/m²)</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="avg_land_price"
                                    value={formData.avg_land_price || 0}
                                    onChange={handleInputChange}
                                    className="text-2xl font-bold text-red-600 border border-gray-300 rounded px-2 py-1 w-full"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-red-600">
                                    {location.avgLandPrice ? `${location.avgLandPrice.toLocaleString()} VNĐ/m²` : 'Updating...'}
                                </span>
                            )}
                        </div>

                        {/* Field 2: Total Area */}
                        <div className="flex flex-col border-l border-gray-100 pl-6">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Area (km²)</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="totalArea"
                                    value={formData.totalArea || 0}
                                    onChange={handleInputChange}
                                    className="text-2xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1 w-full"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-gray-900">
                                    {location.totalArea ? `${location.totalArea.toLocaleString()} km²` : 'Updating...'}
                                </span>
                            )}
                        </div>

                        {/* Field 3: Population */}
                        <div className="flex flex-col border-l border-gray-100 pl-6">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Population</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="population"
                                    value={formData.population || 0}
                                    onChange={handleInputChange}
                                    className="text-2xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1 w-full"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-gray-900">
                                    {location.population ? location.population.toLocaleString() : 'Updating...'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description (Editable) */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">About {location.name}</h3>
                        {isEditing ? (
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleInputChange}
                                rows={8}
                                className="w-full p-4 bg-white border border-blue-500 rounded-xl focus:outline-none shadow-sm text-base text-gray-600"
                            />
                        ) : (
                            <div className="text-base text-gray-600 leading-relaxed space-y-4 text-justify bg-gray-50 p-6 rounded-xl border border-gray-100">
                                {location.description
                                    ? location.description.split('\n').map((p, i) => <p key={i}>{p}</p>)
                                    : <p className="italic text-gray-400">No description available.</p>
                                }
                            </div>
                        )}
                    </div>

                    {/* Sub Stats Grid (Read-only as these are calculated fields) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Map className="w-6 h-6" /></div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{isDistrict ? 'Wards' : 'Districts'}</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {isDistrict ? (location.wardCount || 0) : (location.districtCount || 0)}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600"><Home className="w-6 h-6" /></div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Sub-divisions</p>
                                <p className="text-xl font-bold text-gray-900">{location.wardCount || 0}</p>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600"><Building2 className="w-6 h-6" /></div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Active Properties</p>
                                <p className="text-xl font-bold text-gray-900">{location.activeProperties || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-8 text-xs text-gray-400 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Created:
                            <span className="font-semibold text-gray-600">{new Date(location.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Last updated:
                            <span className="font-semibold text-gray-600">{new Date(location.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                </div>
            </DetailLayout>

            {/* Animation CSS */}
            <style jsx>{`
                @keyframes kenburns { 
                    0% { transform: scale(1) translate(0, 0); } 
                    100% { transform: scale(1.1) translate(-1%, -1%); } 
                }
            `}</style>
        </div>
    );
}