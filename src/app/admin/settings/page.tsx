'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    User, Lock, CreditCard, ShieldCheck,
    Loader2, Save, Camera, AlertTriangle, RefreshCw
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

    // Dùng đúng type UserProfile gốc
    const [user, setUser] = useState<UserProfile | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form States
    const [profileForm, setProfileForm] = useState<UpdateProfileRequest>({});
    const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({ currentPassword: '', newPassword: '' });
    const [bankForm, setBankForm] = useState<UpdateBankRequest>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- FETCH DATA ---
    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await accountService.getMe();
            if (!data) throw new Error("Không tìm thấy dữ liệu.");

            setUser(data);

            // 1. Map Profile Form
            setProfileForm({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                phoneNumber: data.phoneNumber || '',
                // Xử lý ngày tháng để hiện đúng trên input date (YYYY-MM-DD)
                dayOfBirth: data.dayOfBirth ? String(data.dayOfBirth).split('T')[0] : '',
                gender: data.gender || 'OTHER',
                wardId: data.wardId || ''
            });

            // 2. Map Bank Form
            // Vì UserProfile gốc không có field bank, ta dùng 'as any' để lấy nếu backend có trả về
            // Nếu backend chưa trả về thì form sẽ rỗng
            const rawData = data as any;
            setBankForm({
                bankAccountName: rawData.bankAccountName || '',
                bankAccountNumber: rawData.bankAccountNumber || '',
                bankBin: rawData.bankBin || ''
            });

        } catch (err: any) {
            console.error(err);
            const msg = err?.response?.data?.message || err.message || "Lỗi tải dữ liệu.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUserData(); }, []);

    // --- HANDLERS ---

    // Update Profile
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Dùng updateProfile (PATCH /account/me)
            await accountService.updateProfile(profileForm);
            alert("✅ Cập nhật hồ sơ thành công!");
            await fetchUserData();
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message;
            alert("❌ Lỗi: " + msg);
        } finally {
            setSaving(false);
        }
    };

    // Change Password
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await accountService.changePassword(passwordForm);
            alert("✅ Đổi mật khẩu thành công!");
            setPasswordForm({ currentPassword: '', newPassword: '' });
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message;
            alert("❌ Lỗi: " + msg);
        } finally {
            setSaving(false);
        }
    };

    // Update Bank
    const handleBankUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await accountService.updateBank(bankForm);
            alert("✅ Cập nhật ngân hàng thành công!");
            await fetchUserData();
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message;
            alert("❌ Lỗi: " + msg);
        } finally {
            setSaving(false);
        }
    };

    // Update Avatar
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm("Bạn có chắc muốn đổi ảnh đại diện?")) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        try {
            setLoading(true);
            await accountService.updateAvatar(file);
            alert("✅ Đổi avatar thành công!");
            await fetchUserData();
        } catch (error: any) {
            alert("❌ Lỗi upload ảnh: " + error.message);
            setLoading(false);
        }
    };

    // --- RENDER ---

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-red-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Không thể tải thông tin</h3>
                <p className="text-gray-500 mt-2 mb-6 max-w-md">{error}</p>
                <button
                    onClick={fetchUserData}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex items-center gap-2 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Thử lại
                </button>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Cài đặt tài khoản</h1>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* SIDEBAR */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-1">
                    {[
                        { id: 'profile', label: 'Thông tin cá nhân', icon: User },
                        { id: 'security', label: 'Bảo mật', icon: Lock },
                        { id: 'bank', label: 'Tài khoản ngân hàng', icon: CreditCard },
                        { id: 'kyc', label: 'Định danh (KYC)', icon: ShieldCheck },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === item.id
                                    ? 'bg-red-50 text-red-700 shadow-sm border border-red-100'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-red-600' : 'text-gray-400'}`} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* CONTENT */}
                <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 shadow-sm min-h-[500px]">

                    {/* TAB 1: PROFILE */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileUpdate} className="space-y-8 animate-in fade-in duration-300">
                            <div className="flex items-center gap-6 pb-8 border-b border-gray-100">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-lg ring-1 ring-gray-200">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold text-2xl">
                                                {user.firstName?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                </div>

                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 mb-1">{user.firstName} {user.lastName}</h3>
                                    <p className="text-sm text-gray-500 mb-3">{user.email}</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Họ (First Name)" value={profileForm.firstName} onChange={(v: any) => setProfileForm({ ...profileForm, firstName: v })} />
                                <InputGroup label="Tên (Last Name)" value={profileForm.lastName} onChange={(v: any) => setProfileForm({ ...profileForm, lastName: v })} />
                                <InputGroup label="Số điện thoại" value={profileForm.phoneNumber} onChange={(v: any) => setProfileForm({ ...profileForm, phoneNumber: v })} />
                                <InputGroup label="Ngày sinh" type="date" value={profileForm.dayOfBirth || ''} onChange={(v: any) => setProfileForm({ ...profileForm, dayOfBirth: v })} />

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Giới tính</label>
                                    <div className="relative">
                                        <select
                                            value={profileForm.gender || 'OTHER'}
                                            onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="MALE">Nam</option>
                                            <option value="FEMALE">Nữ</option>
                                            <option value="OTHER">Khác</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-end">
                                <button type="submit" disabled={saving} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB 2: SECURITY */}
                    {activeTab === 'security' && (
                        <form onSubmit={handlePasswordChange} className="space-y-8 max-w-lg animate-in fade-in duration-300">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900 mb-2">Đổi mật khẩu</h3>
                                <p className="text-sm text-gray-500">Bảo vệ tài khoản bằng mật khẩu mạnh.</p>
                            </div>

                            <div className="space-y-5">
                                <InputGroup
                                    label="Mật khẩu hiện tại" type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(v: any) => setPasswordForm({ ...passwordForm, currentPassword: v })} required
                                />
                                <InputGroup
                                    label="Mật khẩu mới" type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(v: any) => setPasswordForm({ ...passwordForm, newPassword: v })} required
                                />
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={saving} className="px-8 py-3 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-70">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Cập nhật mật khẩu
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB 3: BANK */}
                    {activeTab === 'bank' && (
                        <form onSubmit={handleBankUpdate} className="space-y-8 max-w-lg animate-in fade-in duration-300">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900 mb-2">Thông tin ngân hàng</h3>
                                <p className="text-sm text-gray-500">Dùng để nhận thanh toán hoa hồng.</p>
                            </div>

                            <div className="space-y-5 bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <InputGroup label="Tên ngân hàng" placeholder="Ví dụ: MB Bank, VCB..." value={bankForm.bankAccountName} onChange={(v: any) => setBankForm({ ...bankForm, bankAccountName: v })} />
                                <InputGroup label="Số tài khoản" placeholder="Ví dụ: 0333..." value={bankForm.bankAccountNumber} onChange={(v: any) => setBankForm({ ...bankForm, bankAccountNumber: v })} />
                                <InputGroup label="Chi nhánh (BIN)" placeholder="Không bắt buộc" value={bankForm.bankBin} onChange={(v: any) => setBankForm({ ...bankForm, bankBin: v })} />
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={saving} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-70">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Lưu thông tin ngân hàng
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB 4: KYC */}
                    {activeTab === 'kyc' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900 mb-2">Định danh (KYC)</h3>
                                <p className="text-sm text-gray-500">Thông tin cá nhân đã được xác thực.</p>
                            </div>

                            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                <ReadOnlyField label="CCCD/CMND" value={user.identificationNumber} />
                                <ReadOnlyField label="Ngày cấp" value={user.issueDate ? String(user.issueDate).split('T')[0] : ''} />
                                <ReadOnlyField label="Nơi cấp" value={user.issuingAuthority} />
                                <ReadOnlyField label="Quốc tịch" value={user.nation} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Mặt trước</span>
                                    <div className="aspect-video bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                                        {user.frontIdPicturePath ? (
                                            <img src={user.frontIdPicturePath} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Front ID" />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <span className="text-xs">Chưa có ảnh</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Mặt sau</span>
                                    <div className="aspect-video bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                                        {user.backIdPicturePath ? (
                                            <img src={user.backIdPicturePath} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Back ID" />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <span className="text-xs">Chưa có ảnh</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg flex items-center gap-2">
                                <InfoIcon className="w-4 h-4 flex-shrink-0" />
                                Vui lòng liên hệ Admin để cập nhật lại thông tin định danh nếu có sai sót.
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

// --- HELPER COMPONENTS ---

const InputGroup = ({ label, value, onChange, type = "text", placeholder, required }: any) => (
    <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 ml-1">{label} {required && <span className="text-red-500">*</span>}</label>
        <input
            type={type}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow placeholder:text-gray-400"
            placeholder={placeholder}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            required={required}
        />
    </div>
);

const ReadOnlyField = ({ label, value }: any) => (
    <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{label}</label>
        <p className="text-sm font-semibold text-gray-900">{value || 'N/A'}</p>
    </div>
);

const InfoIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);