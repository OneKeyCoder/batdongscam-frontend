'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Edit, XCircle, Save, X } from 'lucide-react';
import OverviewTab from '@/app/components/features/admin/contracts/detail/OverviewTab';
import PaymentDetailsTab from '@/app/components/features/admin/contracts/detail/PaymentDetailsTab';
import PartiesTab from '@/app/components/features/admin/contracts/detail/PartiesTab';
import TimelineTab from '@/app/components/features/admin/contracts/detail/TimelineTab';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import { contractService, ContractDetailResponse, UpdateContractRequest } from '@/lib/api/services/contract.service';

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'payment' | 'parties' | 'timeline'>('overview');
  const [data, setData] = useState<ContractDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit State - Only editable fields from UpdateContractRequest 
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateContractRequest>({});
  const [saving, setSaving] = useState(false);

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [canceling, setCanceling] = useState(false);

  const fetchData = async () => {
    try {
      const res = await contractService.getContractById(id);
      setData(res);

      setEditData({
        endDate: res.endDate ? res.endDate.split('T')[0] : undefined,
        specialTerms: res.specialTerms,
        status: res.status as any,
        latePaymentPenaltyRate: res.latePaymentPenaltyRate ? res.latePaymentPenaltyRate * 100 : 0, 
        specialConditions: res.specialConditions
      });
    } catch (error) {
      console.error("Fetch contract error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: UpdateContractRequest = {
        ...editData,
        endDate: editData.endDate ? new Date(editData.endDate).toISOString() : undefined,
        latePaymentPenaltyRate: editData.latePaymentPenaltyRate ? Number(editData.latePaymentPenaltyRate) / 100 : 0,
      };

      await contractService.updateContract(id, payload);
      alert("Contract updated successfully!");
      setIsEditing(false);
      fetchData(); 
    } catch (error) {
      console.error(error);
      alert("Failed to update contract.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelContract = async () => {
    if (!cancelReason.trim()) return alert("Please enter a cancellation reason.");
    setCanceling(true);
    try {
      await contractService.cancelContract(id, { reason: cancelReason });
      alert("Contract cancelled.");
      setIsCancelModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to cancel contract.");
    } finally {
      setCanceling(false);
    }
  };

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'blue';
      case 'CANCELLED': return 'failed';
      case 'PENDING_SIGNING': return 'warning';
      default: return 'default';
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;
  if (!data) return <div className="text-center py-20">Contract not found</div>;

  return (
    <div className="space-y-6 pb-10">
      <Link href="/admin/contracts" className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors text-sm font-medium">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Contracts
      </Link>

      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Contract Details</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-lg font-medium text-gray-700">{data.contractNumber}</span>
              <Badge variant={getStatusVariant(data.status) as any}>{data.status}</Badge>
            </div>
          </div>

          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} disabled={saving} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </>
            ) : (
              <>
                {data.status !== 'CANCELLED' && data.status !== 'COMPLETED' && (
                  <button onClick={() => setIsCancelModalOpen(true)} className="px-4 py-2 border border-red-200 text-red-600 font-bold rounded-lg text-sm hover:bg-red-50 transition-colors flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Cancel Contract
                  </button>
                )}
                <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-2">
                  <Edit className="w-4 h-4" /> Edit
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-8 border-b border-gray-200">
          {[{ id: 'overview', label: 'Overview' }, { id: 'payment', label: 'Payment details' }, { id: 'parties', label: 'Parties' }, { id: 'timeline', label: 'Timeline' }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.id ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div className="animate-in fade-in duration-300">
        {activeTab === 'overview' && <OverviewTab data={data} isEditing={isEditing} editData={editData} onEditChange={setEditData} />}
        {activeTab === 'payment' && <PaymentDetailsTab data={data} isEditing={isEditing} editData={editData} onEditChange={setEditData} />}
        {activeTab === 'parties' && <PartiesTab data={data} onReload={fetchData} />}
        {activeTab === 'timeline' && <TimelineTab data={data} />}
      </div>

      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Contract">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Are you sure you want to cancel this contract?</p>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Reason <span className="text-red-500">*</span></label>
            <textarea className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-red-500 outline-none" rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Enter reason..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setIsCancelModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-bold">Close</button>
            <button onClick={handleCancelContract} disabled={canceling} className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
              {canceling && <Loader2 className="w-3 h-3 animate-spin" />} Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}