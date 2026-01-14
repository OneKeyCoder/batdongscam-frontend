'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    User, Lock, CreditCard, ShieldCheck,
    Loader2, Save, Camera, UploadCloud
} from 'lucide-react';
import {
    accountService,
    UserProfile,
    UpdateProfileRequest,
    UpdateBankRequest,
    ChangePasswordRequest
} from '@/lib/api/services/account.service';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'bank' | 'kyc'>('profile');
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form States
    const [profileForm, setProfileForm] = useState<UpdateProfileRequest>({});
    const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({ currentPassword: '', newPassword: '' });
    const [bankForm, setBankForm] = useState<UpdateBankRequest>({});

    // File Upload State
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Fetch User Data
    const fetchUserData = async () => {
        try {
            setLoading(true);
            const data = await accountService.getMe();
            setUser(data);

            // Init Forms
            setProfileForm({
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                dayOfBirth: data.dayOfBirth,
                gender: data.gender,
                wardId: data.wardId 
            });

            setBankForm({
                bankAccountName: '',
                bankAccountNumber: '',
                bankBin: ''
            });

        } catch (error) {
            console.error("Failed to load user:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUserData(); }, []);

    // 2. Handlers
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await accountService.updateProfile(profileForm);
            alert("✅ Cập nhật hồ sơ thành công!");
            fetchUserData(); // Refresh data
        } catch (error: any) {
            alert("❌ Lỗi: " + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await accountService.changePassword(passwordForm);
            alert("✅ Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
            setPasswordForm({ currentPassword: '', newPassword: '' });
        } catch (error: any) {
            alert("❌ Lỗi: " + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleBankUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await accountService.updateBank(bankForm);
            alert("✅ Cập nhật ngân hàng thành công!");
        } catch (error: any) {
            alert("❌ Lỗi: " + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true); // Show loading toàn màn hình hoặc cục bộ
            await accountService.updateAvatar(file);
            alert("✅ Đổi avatar thành công!");
            fetchUserData();
        } catch (error: any) {
            alert("❌ Lỗi upload ảnh: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>;
    if (!user) return <div>User not found.</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

            <div className="flex flex-col md:flex-row gap-8">

                {/* --- LEFT: SIDEBAR TABS --- */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-1">
                    {[
                        { id: 'profile', label: 'Personal Info', icon: User },
                        { id: 'security', label: 'Security', icon: Lock },
                        { id: 'bank', label: 'Bank Details', icon: CreditCard },
                        { id: 'kyc', label: 'Identification (KYC)', icon: ShieldCheck },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* --- RIGHT: CONTENT --- */}
                <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm min-h-[500px]">

                    {/* 1. PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-md">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                                                {user.firstName?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{user.firstName} {user.lastName}</h3>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputGroup label="First Name" value={profileForm.firstName} onChange={(v: any) => setProfileForm({ ...profileForm, firstName: v })} />
                                <InputGroup label="Last Name" value={profileForm.lastName} onChange={(v: any) => setProfileForm({ ...profileForm, lastName: v })} />
                                <InputGroup label="Phone Number" value={profileForm.phoneNumber} onChange={(v: any) => setProfileForm({ ...profileForm, phoneNumber: v })} />
                                <InputGroup label="Date of Birth" type="date" value={profileForm.dayOfBirth?.split('T')[0]} onChange={(v: any) => setProfileForm({ ...profileForm, dayOfBirth: v })} />

                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Gender</label>
                                    <select
                                        value={profileForm.gender}
                                        onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    >
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
                                </button>
                            </div>
                        </form>
                    )}

                    {/* 2. SECURITY TAB */}
                    {activeTab === 'security' && (
                        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                            <h3 className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-2">Change Password</h3>
                            <div className="space-y-4">
                                <InputGroup
                                    label="Current Password" type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(v: any) => setPasswordForm({ ...passwordForm, currentPassword: v })} required
                                />
                                <InputGroup
                                    label="New Password" type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(v: any) => setPasswordForm({ ...passwordForm, newPassword: v })} required
                                />
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Update Password
                                </button>
                            </div>
                        </form>
                    )}

                    {/* 3. BANK TAB */}
                    {activeTab === 'bank' && (
                        <form onSubmit={handleBankUpdate} className="space-y-6 max-w-lg">
                            <h3 className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-2">Banking Information</h3>
                            <p className="text-sm text-gray-500">Used for receiving payouts (Commissions, Contract payments).</p>

                            <div className="space-y-4">
                                <InputGroup label="Bank Name" placeholder="e.g. Vietcombank" value={bankForm.bankAccountName} onChange={(v: any) => setBankForm({ ...bankForm, bankAccountName: v })} />
                                <InputGroup label="Account Number" placeholder="e.g. 1900xxxxxx" value={bankForm.bankAccountNumber} onChange={(v: any) => setBankForm({ ...bankForm, bankAccountNumber: v })} />
                                <InputGroup label="Bank BIN (Optional)" placeholder="Bank Identification Number" value={bankForm.bankBin} onChange={(v: any) => setBankForm({ ...bankForm, bankBin: v })} />
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Bank Info
                                </button>
                            </div>
                        </form>
                    )}

                    {/* 4. KYC TAB (Read-only view for now) */}
                    {activeTab === 'kyc' && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-2">Identification (KYC)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ReadOnlyField label="ID Number" value={user.identificationNumber} />
                                <ReadOnlyField label="Issue Date" value={user.issueDate} />
                                <ReadOnlyField label="Issuing Authority" value={user.issuingAuthority} />
                                <ReadOnlyField label="Nationality" value={user.nation} />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                                    {user.frontIdPicturePath ? <img src={user.frontIdPicturePath} className="w-full h-full object-cover rounded-lg" /> : "Front ID Image"}
                                </div>
                                <div className="aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                                    {user.backIdPicturePath ? <img src={user.backIdPicturePath} className="w-full h-full object-cover rounded-lg" /> : "Back ID Image"}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 italic mt-2">* To update KYC information, please contact administrator support.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

// --- Helper Components ---

const InputGroup = ({ label, value, onChange, type = "text", placeholder, required }: any) => (
    <div className="space-y-1.5">
        <label className="text-sm font-bold text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
        <input
            type={type}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow"
            placeholder={placeholder}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            required={required}
        />
    </div>
);

const ReadOnlyField = ({ label, value }: any) => (
    <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
        <p className="text-sm font-medium text-gray-900 mt-1">{value || 'N/A'}</p>
    </div>
);