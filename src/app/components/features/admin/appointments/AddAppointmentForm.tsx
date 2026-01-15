'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Search, ChevronDown, Calendar, Clock, AlertCircle } from 'lucide-react';
import { appointmentService, CreateAppointmentRequest } from '@/lib/api/services/appointment.service';
import { accountService } from '@/lib/api/services/account.service';
import { propertyService } from '@/lib/api/services/property.service';

interface Option { value: string; label: string; subLabel?: string; }
interface AsyncSelectProps {
    label: string; value: string; onChange: (value: string) => void;
    fetchOptions: (keyword: string) => Promise<Option[]>; placeholder?: string; required?: boolean;
}
const AsyncSelect = ({ label, value, onChange, fetchOptions, placeholder, required }: AsyncSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<Option[]>([]);

    const handleOpen = async () => {
        setIsOpen(!isOpen);
        if (!isOpen) { const data = await fetchOptions(''); setOptions(data); }
    }

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && '*'}</label>
            <div onClick={handleOpen} className="w-full border border-gray-300 rounded-lg px-3 py-2 cursor-pointer bg-white flex justify-between items-center">
                <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-400'} truncate`}>
                    {options.find(o => o.value === value)?.label || placeholder || 'Select...'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto p-1">
                    <input autoFocus type="text" className="w-full p-2 text-sm border-b mb-1 outline-none" placeholder="Search..."
                        onChange={async (e) => setOptions(await fetchOptions(e.target.value))} />
                    {options.map(opt => (
                        <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0">
                            <div className="font-medium">{opt.label}</div>
                            {opt.subLabel && <div className="text-xs text-gray-500">{opt.subLabel}</div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface AddAppointmentFormProps { onSuccess: () => void; onCancel: () => void; }

export default function AddAppointmentForm({ onSuccess, onCancel }: AddAppointmentFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // State quản lý form
    const [formData, setFormData] = useState({
        propertyId: '',
        customerId: '',
        agentId: '',
        date: '', // YYYY-MM-DD
        time: '', // HH:mm
        message: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // 1. Validate Input
        if (!formData.propertyId || !formData.customerId || !formData.date || !formData.time) {
            setError("Please fill in all required fields.");
            return;
        }

        // 2. Validate Time (Frontend)
        const scheduledTime = new Date(`${formData.date}T${formData.time}`);
        const now = new Date();
        if (scheduledTime <= now) {
            setError("Appointment time must be in the future.");
            return;
        }

        setLoading(true);
        try {
            const year = scheduledTime.getFullYear();
            const month = String(scheduledTime.getMonth() + 1).padStart(2, '0');
            const day = String(scheduledTime.getDate()).padStart(2, '0');
            const hours = String(scheduledTime.getHours()).padStart(2, '0');
            const minutes = String(scheduledTime.getMinutes()).padStart(2, '0');
            const seconds = '00';

            const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

            const payload: any = {
                propertyId: formData.propertyId,
                customerId: formData.customerId,
                requestedDate: localDateTime, 
            };

            // Only add agentId if provided (it's optional)
            if (formData.agentId) {
                payload.agentId = formData.agentId;
            }

            // Only add customerRequirements if provided
            if (formData.message && formData.message.trim()) {
                payload.customerRequirements = formData.message.trim();
            }

            console.log("✅ Submitting Payload:", payload);

            await appointmentService.createAppointment(payload);
            onSuccess();
        } catch (err: any) {
            console.error("❌ Create Appointment Error:", err);
            const msg = err.response?.data?.message || err.message || "Failed to create appointment.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Fetchers
    const fetchProps = async (k: string) => (await propertyService.getPropertyCards({ search: k, page: 1, limit: 10 } as any)).data.map(p => ({ value: p.id, label: p.title, subLabel: p.location }));
    const fetchCust = async (k: string) => (await accountService.getAllCustomers({ name: k, page: 1, limit: 10 })).data.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}`, subLabel: c.location }));
    const fetchAgents = async (k: string) => (await accountService.getAllSaleAgents({ name: k, page: 1, limit: 10 })).data.map(a => ({ value: a.id, label: `${a.firstName} ${a.lastName}`, subLabel: a.employeeCode }));

    return (
        <form onSubmit={handleSubmit} className="space-y-5 px-1 pb-2">
            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 font-medium">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span>
                </div>
            )}

            {/* Select Entities */}
            <div className="space-y-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <AsyncSelect label="Property" placeholder="Search property..." value={formData.propertyId} onChange={v => setFormData(p => ({ ...p, propertyId: v }))} fetchOptions={fetchProps} required />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AsyncSelect label="Customer" placeholder="Search customer..." value={formData.customerId} onChange={v => setFormData(p => ({ ...p, customerId: v }))} fetchOptions={fetchCust} required />
                    <AsyncSelect label="Agent (Optional)" placeholder="Assign agent..." value={formData.agentId} onChange={v => setFormData(p => ({ ...p, agentId: v }))} fetchOptions={fetchAgents} />
                </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <div className="relative">
                        <input
                            type="date" name="date" required
                            value={formData.date} onChange={handleChange}
                            onClick={(e) => e.currentTarget.showPicker()}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                    <div className="relative">
                        <input
                            type="time" name="time" required
                            value={formData.time} onChange={handleChange}
                            onClick={(e) => e.currentTarget.showPicker()}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm"
                        />
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Requirements */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Requirements / Message</label>
                <textarea
                    name="message"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="E.g. Need wheelchair access, prefers morning viewing..."
                    value={formData.message}
                    onChange={handleChange}
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                <button type="button" onClick={onCancel} disabled={loading} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold flex items-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />} Book Appointment
                </button>
            </div>
        </form>
    );
}