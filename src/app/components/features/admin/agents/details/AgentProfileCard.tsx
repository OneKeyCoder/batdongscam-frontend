'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Calendar, Briefcase, Edit, Trash2, MessageSquare, Check, X, Save } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import { UserProfile, UpdateAccountRequest } from '@/lib/api/services/account.service';
import { getFullUrl } from '@/lib/utils/urlUtils';
import LocationPicker, { LocationSelection } from '@/app/components/LocationPicker'; // Import LocationPicker

interface AgentProfileCardProps {
    profile?: UserProfile;
    onDelete?: () => void;
    onSave?: (data: UpdateAccountRequest) => Promise<void>;
    isSaving?: boolean;
}

export default function AgentProfileCard({ profile, onDelete, onSave, isSaving = false }: AgentProfileCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLocPickerOpen, setIsLocPickerOpen] = useState(false); // State cho modal location

    // State lưu dữ liệu form
    const [formData, setFormData] = useState<UpdateAccountRequest>({});

    // State hiển thị tên địa điểm tạm thời khi user chọn mới (vì formData chỉ lưu ID)
    const [tempLocationName, setTempLocationName] = useState<string>('');

    useEffect(() => {
        if (profile) {
            setFormData({
                firstName: profile.firstName,
                lastName: profile.lastName,
                phoneNumber: profile.phoneNumber,
                zaloContract: profile.zaloContact,
                identificationNumber: profile.identificationNumber, // Bind Identity Number
                wardId: profile.wardId, // Bind Ward ID hiện tại
            });
            // Reset tên hiển thị
            setTempLocationName([profile.wardName, profile.districtName, profile.cityName].filter(Boolean).join(', '));
        }
    }, [profile, isEditing]);

    if (!profile) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý khi chọn xong địa điểm từ Modal
    const handleLocationConfirm = (locs: LocationSelection[]) => {
        // Chỉ lấy item cuối cùng được chọn và phải là WARD (để đảm bảo đủ cấp hành chính)
        const selected = locs[locs.length - 1];

        if (selected) {
            if (selected.type !== 'WARD') {
                alert("Please select a specific Ward (Phường/Xã) for the address.");
                return;
            }
            // Cập nhật ID để gửi backend
            setFormData(prev => ({ ...prev, wardId: selected.id }));
            // Cập nhật tên hiển thị
            setTempLocationName(selected.name);
        }
        setIsLocPickerOpen(false);
    };

    const handleSaveClick = async () => {
        if (onSave) {
            await onSave(formData);
            setIsEditing(false);
        }
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        // Reset lại tên địa điểm về ban đầu
        setTempLocationName([profile.wardName, profile.districtName, profile.cityName].filter(Boolean).join(', '));
    };

    // Helper render UI
    const renderField = (
        label: string,
        icon: any,
        name: keyof UpdateAccountRequest,
        value: string | undefined | null,
        isLocationField: boolean = false
    ) => {
        return (
            <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0 text-gray-500">{icon}</div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>

                    {isEditing ? (
                        isLocationField ? (
                            // Giao diện chọn Location
                            <div
                                onClick={() => setIsLocPickerOpen(true)}
                                className="w-full text-sm font-medium text-gray-900 border-b border-gray-300 hover:border-red-500 py-0.5 cursor-pointer flex justify-between items-center group"
                            >
                                <span className="truncate">{tempLocationName || 'Select location...'}</span>
                                <Edit className="w-3 h-3 text-gray-400 group-hover:text-red-500" />
                            </div>
                        ) : (
                            // Giao diện Input thường
                            <input
                                type="text"
                                name={name}
                                value={formData[name] as string || ''}
                                onChange={handleInputChange}
                                className="w-full text-sm font-medium text-gray-900 border-b border-gray-300 focus:border-red-500 focus:outline-none py-0.5"
                            />
                        )
                    ) : (
                        // Chế độ xem
                        <p className="text-sm font-medium text-gray-900 truncate" title={value || ''}>
                            {isLocationField ? tempLocationName : (value || '---')}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative">
                <div className="absolute top-6 right-6 flex gap-3 z-10">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSaveClick}
                                disabled={isSaving}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isSaving ? <Save className="w-3 h-3 animate-pulse" /> : <Check className="w-3 h-3" />} Confirm
                            </button>
                            <button
                                onClick={handleCancelClick}
                                disabled={isSaving}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-bold rounded-lg transition-colors"
                            >
                                <X className="w-3 h-3" /> Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                            >
                                <Edit className="w-4 h-4" /> Edit
                            </button>
                            <button
                                onClick={onDelete}
                                className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="shrink-0">
                        <div className="w-28 h-28 rounded-full p-1 border-[3px] border-red-500 overflow-hidden relative group">
                            <img
                                src={getFullUrl(profile.avatarUrl)}
                                alt={profile.firstName}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}` }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 pt-2">
                        <div className="mb-6 pr-32">
                            {isEditing ? (
                                <div className="flex gap-2 mb-2">
                                    <input type="text" name="firstName" placeholder="First Name" value={formData.firstName || ''} onChange={handleInputChange} className="text-xl font-bold text-gray-900 border-b border-gray-300 focus:border-red-500 focus:outline-none w-1/3" />
                                    <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName || ''} onChange={handleInputChange} className="text-xl font-bold text-gray-900 border-b border-gray-300 focus:border-red-500 focus:outline-none w-1/3" />
                                </div>
                            ) : (
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.firstName} {profile.lastName}</h1>
                            )}

                            <p className="text-sm text-gray-500 mb-3">Code: <span className="font-mono font-medium">{profile.profile?.employeeCode || '---'}</span></p>

                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded ${profile.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {profile.status}
                                </span>
                                <Badge variant="pink">{profile.tier || 'MEMBER'}</Badge>
                                {profile.statisticMonth?.rankingPosition && (
                                    <span className="text-red-600 font-bold text-base ml-1">#{profile.statisticMonth.rankingPosition}</span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-5 gap-x-10">
                            <div className="flex items-start gap-3">
                                <Mail className="w-4 h-4 text-gray-500 shrink-0 mt-1" />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                                    <p className="text-sm font-medium text-gray-900 truncate" title={profile.email}>{profile.email}</p>
                                </div>
                            </div>

                            {renderField("Phone", <Phone className="w-4 h-4" />, "phoneNumber", profile.phoneNumber)}

                            {renderField("Zalo", <MessageSquare className="w-4 h-4" />, "zaloContract", profile.zaloContact)}

                            {/* FIELD LOCATION - Đã kích hoạt Edit */}
                            {renderField("Location", <MapPin className="w-4 h-4 mt-1" />, "wardId", profile.wardId, true)}

                            <div className="flex items-start gap-3">
                                <Calendar className="w-4 h-4 text-gray-500 shrink-0 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Hired Date</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '---'}
                                    </p>
                                </div>
                            </div>

                            {/* FIELD IDENTITY NUMBER - Đã kích hoạt Edit */}
                            {renderField("Identity Number", <Briefcase className="w-4 h-4 mt-1" />, "identificationNumber", profile.identificationNumber)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Location Picker Modal */}
            <LocationPicker
                isOpen={isLocPickerOpen}
                onClose={() => setIsLocPickerOpen(false)}
                onConfirm={handleLocationConfirm}
            />
        </>
    );
}