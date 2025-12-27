'use client';
import React, { useState } from 'react';
import { AlertTriangle, Calendar, Save, XCircle, Loader2 } from 'lucide-react';
import { violationService, ViolationAdminDetails, UpdateViolationRequest } from '@/lib/api/services/violation.service';

interface Props {
    data: ViolationAdminDetails;
    onUpdateSuccess: () => void;
}

export default function ViolationResolutionTab({ data, onUpdateSuccess }: Props) {
    const [status, setStatus] = useState(data.violationStatus);
    const [notes, setNotes] = useState(data.resolutionNotes || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async (isDismiss = false) => {
        setSaving(true);
        try {
            const payload: UpdateViolationRequest = {
                status: isDismiss ? 'DISMISSED' : status as any,
                resolutionNotes: notes
            };
            await violationService.updateViolationReport(data.id, payload);
            alert(isDismiss ? "Report dismissed." : "Updated successfully.");
            onUpdateSuccess();
        } catch (error) {
            console.error(error);
            alert("Failed to update.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Resolution details</h3>

            <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                    <label className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Current status</label>
                    <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm font-medium focus:outline-none focus:border-red-500"
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                    >
                        <option value="PENDING">PENDING</option>
                        <option value="REPORTED">REPORTED</option>
                        <option value="UNDER_REVIEW">UNDER REVIEW</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="DISMISSED">DISMISSED</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Last modified at</label>
                    <p className="font-bold text-gray-900 py-2">{new Date(data.updatedAt).toLocaleString()}</p>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Resolution Notes</label>
                <textarea
                    className="w-full h-32 border border-gray-300 rounded-xl p-4 bg-gray-50 text-sm focus:outline-none focus:border-red-500 resize-none"
                    placeholder="Enter resolution details..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                ></textarea>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => handleSave(false)}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
                </button>

                {status !== 'DISMISSED' && (
                    <button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                        <XCircle className="w-4 h-4" /> Dismiss
                    </button>
                )}
            </div>
        </div>
    );
}