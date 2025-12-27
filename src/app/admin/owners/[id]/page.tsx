'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Mail, Phone, MapPin, Calendar, MessageSquare, Edit, Trash2, Trophy, Target, DollarSign, Home, Briefcase, Building2, Save, X, Loader2, CheckCircle } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import { accountService, UserProfile, UpdateAccountRequest } from '@/lib/api/services/account.service';
import { rankingService, IndividualPropertyOwnerContributionMonth, IndividualPropertyOwnerContributionAll } from '@/lib/api/services/ranking.service';

const StatItem = ({ icon: Icon, label, value }: any) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col h-full min-h-[90px]">
        <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">{label}</span>
        </div>
        <div>
            <span className="text-lg font-bold text-red-600 block">{value}</span>
        </div>
    </div>
);

export default function OwnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [monthStats, setMonthStats] = useState<IndividualPropertyOwnerContributionMonth | null>(null);
    const [allStats, setAllStats] = useState<IndividualPropertyOwnerContributionAll | null>(null);
    const [loading, setLoading] = useState(true);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<UpdateAccountRequest>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentMonth = new Date().getMonth() + 1;
                const currentYear = new Date().getFullYear();

                const [userData, mStats, aStats] = await Promise.all([
                    accountService.getUserById(id),
                    rankingService.getOwnerMonthlyContribution(id, currentMonth, currentYear),
                    rankingService.getOwnerAllTimeContribution(id)
                ]);

                setProfile(userData);
                setMonthStats(mStats);
                setAllStats(aStats);

                setEditData({
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phoneNumber: userData.phoneNumber,
                    zaloContract: userData.zaloContact,
                    wardId: userData.wardId
                });

            } catch (error) {
                console.error("Error fetching owner detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updatedProfile = await accountService.updateUserById(id, editData);
            setProfile(updatedProfile);
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this owner? This action cannot be undone.")) return;
        try {
            await accountService.deleteAccountById(id);
            alert("Owner deleted successfully.");
            router.push('/admin/customers');
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete owner.");
        }
    };

    const handleApprove = async () => {
        if (!confirm("Approve this owner account?")) return;
        try {
            await accountService.approveAccount(id, true);
            alert("Account approved!");
            const updated = await accountService.getUserById(id);
            setProfile(updated);
        } catch (error) {
            console.error(error);
            alert("Failed to approve.");
        }
    };

    const formatCurrency = (val?: number) => val ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val) : '0 ₫';
    const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString() : '---';

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;
    if (!profile) return <div className="text-center py-20">Owner not found.</div>;

    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-6">
            <div>
                <Link href="/admin/customers" className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors text-xs font-medium">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Customers & Owners List
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative">
                <div className="absolute top-6 right-6 flex gap-3">
                    {profile.status === 'PENDING_APPROVAL' && (
                        <button onClick={handleApprove} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors"><CheckCircle className="w-3 h-3" /> Approve</button>
                    )}
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} disabled={saving} className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 flex items-center gap-1">
                                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3" /> Save</>}
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"><Edit className="w-3 h-3" /> Edit</button>
                            <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors"><Trash2 className="w-3 h-3" /> Delete</button>
                        </>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="shrink-0">
                        <div className="w-24 h-24 rounded-full p-1 border-2 border-red-500">
                            {profile.avatarUrl ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" /> :
                                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-2xl">{profile.firstName.charAt(0)}</div>}
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="mb-4">
                            {isEditing ? (
                                <div className="flex gap-2 mb-2">
                                    <input className="border rounded p-1 text-lg font-bold w-1/3" value={editData.firstName} onChange={e => setEditData({ ...editData, firstName: e.target.value })} placeholder="First Name" />
                                    <input className="border rounded p-1 text-lg font-bold w-1/3" value={editData.lastName} onChange={e => setEditData({ ...editData, lastName: e.target.value })} placeholder="Last Name" />
                                </div>
                            ) : (
                                <h1 className="text-xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h1>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${profile.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{profile.status}</span>
                                <Badge variant="pink">{profile.tier || 'MEMBER'}</Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
                            <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-500 shrink-0" /><div><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium">{profile.email}</p></div></div>

                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                                <div><p className="text-xs text-gray-400">Phone</p>
                                    {isEditing ? <input className="border rounded px-1 text-sm w-full" value={editData.phoneNumber} onChange={e => setEditData({ ...editData, phoneNumber: e.target.value })} /> : <p className="text-sm font-medium">{profile.phoneNumber || '---'}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-4 h-4 text-gray-500 shrink-0" />
                                <div><p className="text-xs text-gray-400">Zalo</p>
                                    {isEditing ? <input className="border rounded px-1 text-sm w-full" value={editData.zaloContract} onChange={e => setEditData({ ...editData, zaloContract: e.target.value })} /> : <p className="text-sm font-medium">{profile.zaloContact || '---'}</p>}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-1" />
                                <div><p className="text-xs text-gray-400">Location</p><p className="text-sm font-medium">{profile.wardName}, {profile.districtName}, {profile.cityName}</p></div>
                            </div>

                            <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-gray-500 shrink-0" /><div><p className="text-xs text-gray-400">Joined at</p><p className="text-sm font-medium">{formatDate(profile.createdAt)}</p></div></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="font-bold text-gray-900 mb-4 text-sm">Current month contribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatItem icon={Trophy} label="Contribution point" value={monthStats?.contributionPoint || 0} />
                        <StatItem icon={Target} label="Ranking position" value={`# ${monthStats?.rankingPosition || '-'}`} />
                        <StatItem icon={DollarSign} label="Contribution value" value={formatCurrency(monthStats?.monthContributionValue)} />
                        <StatItem icon={Home} label="Total properties" value={monthStats?.monthTotalProperties || 0} />
                        <StatItem icon={Building2} label="Properties for sale" value={monthStats?.monthTotalForSales || 0} />
                        <StatItem icon={Building2} label="Properties for rent" value={monthStats?.monthTotalForRents || 0} />
                        <StatItem icon={Home} label="Properties sold" value={monthStats?.monthTotalPropertiesSold || 0} />
                        <StatItem icon={Home} label="Properties rented" value={monthStats?.monthTotalPropertiesRented || 0} />
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-gray-900 mb-4 text-sm">All contribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatItem icon={Trophy} label="Contribution point" value={allStats?.contributionPoint || 0} />
                        <StatItem icon={Target} label="Ranking position" value={`# ${allStats?.rankingPosition || '-'}`} />
                        <StatItem icon={DollarSign} label="Contribution value" value={formatCurrency(allStats?.contributionValue)} />
                        <StatItem icon={Home} label="Total properties" value={allStats?.totalProperties || 0} />
                        <StatItem icon={Home} label="Properties sold" value={allStats?.totalPropertiesSold || 0} />
                        <StatItem icon={Home} label="Properties rented" value={allStats?.totalPropertiesRented || 0} />
                    </div>
                </div>
            </div>
        </div>
    );
}