'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Mail, Phone, Edit, Star, User, MessageSquare, ClipboardList, FileText, Loader2, Save, X, AlertTriangle, CheckCircle } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import { appointmentService, ViewingDetailsAdmin } from '@/lib/api/services/appointment.service';
import { assignmentService, UpdateAppointmentDetailsRequest } from '@/lib/api/services/assignment.service';

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [data, setData] = useState<ViewingDetailsAdmin | null>(null);
    const [loading, setLoading] = useState(true);

    // State Editing
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<UpdateAppointmentDetailsRequest>({});
    const [saving, setSaving] = useState(false);

    // State Cancel Modal
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [canceling, setCanceling] = useState(false);

    // State Complete Loading
    const [completing, setCompleting] = useState(false);

    // State Remove Agent Loading
    const [removingAgent, setRemovingAgent] = useState(false);

    // Helper để lấy message lỗi từ API response
    const getErrorMessage = (error: any) => {
        return error?.response?.data?.message || "An error occurred. Please try again.";
    };

    const fetchDetail = async () => {
        try {
            const res = await appointmentService.getViewingDetailsAdmin(id);
            setData(res);
            setEditData({
                agentNotes: res.agentNotes,
                viewingOutcome: res.viewingOutcome,
                customerInterestLevel: res.customerInterestLevel,
                status: res.status
            });
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDetail(); }, [id]);

    // --- ACTIONS ---

    // 1. Save Edit
    const handleSave = async () => {
        setSaving(true);
        try {
            await assignmentService.updateAppointmentDetails(id, editData);
            alert("Updated successfully!");
            setIsEditing(false);
            fetchDetail();
        } catch (error: any) {
            console.error(error);
            alert(`Update failed: ${getErrorMessage(error)}`);
        } finally {
            setSaving(false);
        }
    };

    // 2. Cancel Appointment
    const handleCancelSubmit = async () => {
        if (!cancelReason.trim()) return alert("Please enter a reason.");
        setCanceling(true);
        try {
            await appointmentService.cancelAppointment(id, cancelReason);
            alert("Appointment cancelled successfully!");
            setIsCancelModalOpen(false);
            fetchDetail();
        } catch (error: any) {
            console.error(error);
            alert(`Failed to cancel: ${getErrorMessage(error)}`);
        } finally {
            setCanceling(false);
        }
    };

    // 3. Complete Appointment (Đã cập nhật hiển thị lỗi chi tiết)
    const handleComplete = async () => {
        if (!confirm("Mark this appointment as completed?")) return;
        setCompleting(true);
        try {
            await appointmentService.completeAppointment(id);
            alert("Appointment completed!");
            fetchDetail();
        } catch (error: any) {
            console.error(error);
            // Hiển thị message lỗi từ server (ví dụ: "Appointment time has not occurred yet")
            alert(`Failed to complete: ${getErrorMessage(error)}`);
        } finally {
            setCompleting(false);
        }
    };

    // 4. Remove Agent
    const handleRemoveAgent = async () => {
        if (!confirm("Remove assigned agent?")) return;
        setRemovingAgent(true);
        try {
            await assignmentService.assignAgentToViewing(id, null);
            alert("Agent removed!");
            fetchDetail();
        } catch (error: any) {
            console.error(error);
            alert(`Failed to remove agent: ${getErrorMessage(error)}`);
        } finally {
            setRemovingAgent(false);
        }
    };

    // Navigation
    const handleViewAccount = (userId?: string, role?: string) => {
        if (!userId) return;
        const path = role === 'AGENT' ? 'agents' : role === 'CUSTOMER' ? 'customers' : 'property-owners';
        router.push(`/admin/${path}/${userId}`);
    };

    const handleViewProperty = (propertyId?: string) => {
        if (propertyId) router.push(`/admin/properties/${propertyId}`);
    };

    const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleString('en-US') : '---';

    const getStatusVariant = (status?: string) => {
        if (status === 'CONFIRMED' || status === 'COMPLETED') return 'success';
        if (status === 'CANCELLED') return 'failed';
        return 'pending';
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;
    if (!data) return <div className="text-center py-20">Not found</div>;

    const isTerminated = data.status === 'CANCELLED' || data.status === 'COMPLETED';

    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <Link href="/admin/appointments" className="inline-flex items-center text-gray-500 hover:text-red-600 text-xs font-medium">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Appointments
                </Link>
            </div>

            {/* MAIN CARD */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative transition-all">

                {/* Action Buttons Top-Right */}
                <div className="absolute top-6 right-6 flex gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} disabled={saving} className="px-4 py-1.5 border border-gray-300 text-gray-600 text-xs font-bold rounded hover:bg-gray-50 flex items-center gap-1">
                                <X className="w-3.5 h-3.5" /> Cancel Edit
                            </button>
                            <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 flex items-center gap-1">
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Nút Complete (Chỉ hiện khi chưa kết thúc) */}
                            {!isTerminated && (
                                <button
                                    onClick={handleComplete}
                                    disabled={completing}
                                    className="px-4 py-1.5 border border-green-200 text-green-700 text-xs font-bold rounded hover:bg-green-50 bg-white transition-colors flex items-center gap-1"
                                >
                                    {completing ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle className="w-3.5 h-3.5" /> Complete</>}
                                </button>
                            )}

                            {/* Nút Cancel (Chỉ hiện khi chưa kết thúc) */}
                            {!isTerminated && (
                                <button onClick={() => setIsCancelModalOpen(true)} className="px-4 py-1.5 border border-red-200 text-red-600 text-xs font-bold rounded hover:bg-red-50 bg-white transition-colors">
                                    Cancel
                                </button>
                            )}

                            {/* Nút Edit */}
                            <button onClick={() => setIsEditing(true)} className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 flex items-center gap-1 transition-colors">
                                <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                        </>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointment Details</h1>
                <p className="text-sm text-gray-500 mb-4">ID: {data.id}</p>

                {/* Status */}
                <div className="mb-6">
                    {isEditing ? (
                        <select
                            className="border border-gray-300 rounded px-2 py-1 text-xs font-bold text-gray-700 focus:outline-none focus:border-red-500 bg-white"
                            value={editData.status}
                            onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                        >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                    ) : (
                        <Badge variant={getStatusVariant(data.status) as any}>{data.status}</Badge>
                    )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mb-8">
                    <InfoRow icon={Calendar} label="Requested day" value={formatDate(data.requestedDate)} />
                    <InfoRow icon={Calendar} label="Confirmed day" value={formatDate(data.confirmedDate)} />
                    <InfoRow icon={Mail} label="Customer Email" value={data.customer?.email} />
                    <InfoRow icon={Phone} label="Customer Phone" value={data.customer?.phoneNumber} />
                    <InfoRow icon={Star} label="Rating" value={data.rating?.toString()} />

                    <div className="flex gap-3 items-start">
                        <User className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Customer Interest Level</p>
                            {isEditing ? (
                                <select
                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-red-500 bg-white"
                                    value={editData.customerInterestLevel || ''}
                                    onChange={(e) => setEditData({ ...editData, customerInterestLevel: e.target.value })}
                                >
                                    <option value="">-- Select --</option>
                                    <option value="VERY_INTERESTED">Very Interested</option>
                                    <option value="SOMEWHAT_INTERESTED">Somewhat Interested</option>
                                    <option value="NOT_INTERESTED">Not Interested</option>
                                </select>
                            ) : (
                                data.customerInterestLevel ? (
                                    <span className="inline-flex px-2 py-0.5 bg-green-100 text-green-700 border border-green-200 text-[10px] font-bold rounded uppercase">
                                        {data.customerInterestLevel}
                                    </span>
                                ) : <span className="text-sm font-bold text-gray-900">---</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Full Content Blocks */}
                <div className="space-y-4">
                    <ContentBlock icon={MessageSquare} title="Customer comment" content={data.comment} />
                    <ContentBlock icon={ClipboardList} title="Customer requirements" content={data.customerRequirements} />

                    {/* Agent Notes - Editable */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 transition-colors hover:border-gray-200">
                        <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                            <Edit className="w-3.5 h-3.5" /> Agent notes
                        </p>
                        {isEditing ? (
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-red-500 outline-none bg-white"
                                rows={4} placeholder="Add notes here..."
                                value={editData.agentNotes || ''}
                                onChange={(e) => setEditData({ ...editData, agentNotes: e.target.value })}
                            />
                        ) : (
                            data.agentNotes ? (
                                <ul className="text-sm text-gray-800 list-disc pl-4 space-y-1">
                                    {data.agentNotes.split('\n').map((line, i) => <li key={i}>{line}</li>)}
                                </ul>
                            ) : <p className="text-sm text-gray-500 italic">No notes</p>
                        )}
                    </div>

                    {/* Viewing Outcome - Editable */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 transition-colors hover:border-gray-200">
                        <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5" /> Viewing outcome
                        </p>
                        {isEditing ? (
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-red-500 outline-none bg-white"
                                placeholder="e.g. Customer signed contract..."
                                value={editData.viewingOutcome || ''}
                                onChange={(e) => setEditData({ ...editData, viewingOutcome: e.target.value })}
                            />
                        ) : (
                            <p className="text-sm text-gray-800">{data.viewingOutcome || '---'}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* --- GRID CARDS (Property, Customer, Owner, Agent) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CardContainer title="Property">
                    <div className="flex gap-3">
                        <div className="w-24 h-16 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                            {data.propertyCard?.thumbnailUrl && <img src={data.propertyCard.thumbnailUrl} className="w-full h-full object-cover" alt="Property" />}
                        </div>
                        <div>
                            <p className="font-bold text-sm text-gray-900 line-clamp-1">{data.propertyCard?.title}</p>
                            <div className="flex gap-1 my-1.5"><Badge variant="sale">{data.propertyCard?.transactionType || 'SALE'}</Badge></div>
                            <p className="text-xs text-gray-500 line-clamp-1">{data.propertyCard?.fullAddress}</p>
                        </div>
                    </div>
                    <button onClick={() => handleViewProperty(data.propertyCard?.id)} className="w-full mt-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors">View property</button>
                </CardContainer>

                <CardContainer title="Customer">
                    <UserRow name={data.customer?.fullName} tier={data.customer?.tier} phone={data.customer?.phoneNumber} avatarChar={data.customer?.fullName?.charAt(0)} />
                    <button onClick={() => handleViewAccount(data.customer?.id, 'CUSTOMER')} className="w-full mt-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors">View Account</button>
                </CardContainer>

                <CardContainer title="Property Owner">
                    <UserRow name={data.propertyOwner?.fullName} tier={data.propertyOwner?.tier} phone={data.propertyOwner?.phoneNumber} avatarChar={data.propertyOwner?.fullName?.charAt(0)} />
                    <button onClick={() => handleViewAccount(data.propertyOwner?.id, 'OWNER')} className="w-full mt-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors">View Account</button>
                </CardContainer>

                {/* Sales Agent Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 text-sm">Sales Agent</h3>
                        {data.salesAgent ? (
                            <div className="flex justify-between items-start">
                                <UserRow name={data.salesAgent.fullName} tier={data.salesAgent.tier} phone={data.salesAgent.phoneNumber} avatarChar={data.salesAgent.fullName?.charAt(0)} />
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 mb-1">Rating</p>
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                        <Star className="w-4 h-4 fill-yellow-500" /> {data.salesAgent.rating || 0} ({data.salesAgent.totalRates || 0})
                                    </div>
                                </div>
                            </div>
                        ) : <p className="text-sm text-gray-500 italic py-4 text-center">No agent assigned</p>}
                    </div>
                    <div className="flex items-center gap-3 mt-5">
                        <Link href={`/admin/appointments/${id}/change-agent`} className="flex-1 flex items-center justify-center py-2 border border-red-200 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-50 transition-colors">
                            {data.salesAgent ? 'Change agent' : 'Assign agent'}
                        </Link>
                        {data.salesAgent && (
                            <button onClick={handleRemoveAgent} disabled={removingAgent} className="flex-1 py-2 border border-red-200 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-50 transition-colors flex justify-center items-center gap-2">
                                {removingAgent ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Remove agent'}
                            </button>
                        )}
                        <button onClick={() => handleViewAccount(data.salesAgent?.id, 'AGENT')} disabled={!data.salesAgent} className="flex-1 py-2 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
                            View Account
                        </button>
                    </div>
                </div>
            </div>

            {/* --- CANCEL CONFIRMATION MODAL --- */}
            <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Appointment">
                <div className="space-y-4">
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex gap-3 text-sm text-yellow-800">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p>Are you sure you want to cancel this appointment? This action cannot be undone.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Reason for cancellation <span className="text-red-500">*</span></label>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-red-500 outline-none focus:ring-1 focus:ring-red-200 transition-all"
                            rows={4}
                            placeholder="Enter reason (e.g. Customer busy, Property sold)..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setIsCancelModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-bold">Close</button>
                        <button onClick={handleCancelSubmit} disabled={canceling} className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                            {canceling && <Loader2 className="w-3 h-3 animate-spin" />} Confirm Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// Helpers
const InfoRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex gap-3 items-start"><Icon className="w-4 h-4 text-gray-500 mt-0.5" /><div><p className="text-xs text-gray-500">{label}</p><p className="text-sm font-bold text-gray-900">{value || '---'}</p></div></div>
);
const ContentBlock = ({ icon: Icon, title, content }: any) => (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100"><p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2"><Icon className="w-3.5 h-3.5" /> {title}</p><p className="text-sm text-gray-800 whitespace-pre-wrap">{content || `No ${title.toLowerCase()}`}</p></div>
);
const CardContainer = ({ title, children }: any) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col justify-between"><div><h3 className="font-bold text-gray-900 mb-4 text-sm">{title}</h3>{children}</div></div>
);
const UserRow = ({ name, tier, phone, avatarChar }: any) => (
    <div className="flex gap-3 items-center">
        <div className="w-14 h-14 bg-gray-200 rounded-full shrink-0 overflow-hidden border border-gray-100"><div className="w-full h-full bg-gray-300 flex items-center justify-center"><span className="text-gray-600 font-bold">{avatarChar || '?'}</span></div></div>
        <div><p className="font-bold text-sm text-gray-900">{name || '---'}</p><Badge variant="gold" className="my-1">{tier || '---'}</Badge><p className="text-xs text-gray-500">{phone || '---'}</p></div>
    </div>
);