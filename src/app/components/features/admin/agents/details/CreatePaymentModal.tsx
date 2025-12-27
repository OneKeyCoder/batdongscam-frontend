import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import Modal from '@/app/components/ui/Modal';
import { paymentService } from '@/lib/api/services/payment.service';

interface CreatePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    agentId: string;
    onSuccess: () => void; 
}

export default function CreatePaymentModal({ isOpen, onClose, agentId, onSuccess }: CreatePaymentModalProps) {
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'SALARY' | 'BONUS'>('SALARY');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const numAmount = Number(amount); // Convert string to number

        if (!amount || isNaN(numAmount) || numAmount <= 0) {
            alert("Amount must be a positive number.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                agentId,
                amount: numAmount,
                notes: notes.trim()
            };

            // 2. Call API based on type
            if (type === 'SALARY') {
                await paymentService.createSalaryPayment(payload);
            } else {
                await paymentService.createBonusPayment(payload);
            }

            // 3. Success Handling
            alert("Payment created successfully!");

            onSuccess();

            onClose();

            // Reset form
            setAmount('');
            setNotes('');
            setType('SALARY');

        } catch (error) {
            console.error(error);
            alert("Failed to create payment.");
        } finally {
            setLoading(false);
        }
    };

    // Helper: Prevent typing invalid characters like e, -, +
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['-', '+', 'e', 'E'].includes(e.key)) {
            e.preventDefault();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Payment">
            <div className="space-y-5">
                {/* Payment Type */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Payment Type</label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer select-none group">
                            <div className="relative flex items-center">
                                <input
                                    type="radio"
                                    className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-300 checked:border-red-600 checked:bg-red-600 transition-all"
                                    checked={type === 'SALARY'}
                                    onChange={() => setType('SALARY')}
                                />
                                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">Salary Payment</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none group">
                            <div className="relative flex items-center">
                                <input
                                    type="radio"
                                    className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-300 checked:border-red-600 checked:bg-red-600 transition-all"
                                    checked={type === 'BONUS'}
                                    onChange={() => setType('BONUS')}
                                />
                                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">Bonus / Commission</span>
                        </label>
                    </div>
                </div>

                {/* Amount Input */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        Amount (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            step="1000"
                            className="w-full border border-gray-300 rounded-lg py-2.5 pl-3 pr-12 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                            placeholder="e.g. 10,000,000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">VNĐ</span>
                    </div>
                    {/* Live Preview Format */}
                    {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
                        <p className="text-xs text-green-600 mt-1 font-medium text-right">
                            Preview: {Number(amount).toLocaleString('vi-VN')} VNĐ
                        </p>
                    )}
                </div>

                {/* Notes Input */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none h-24 resize-none transition-all"
                        placeholder="Reason for this payment..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !amount || Number(amount) <= 0}
                        className="px-6 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Processing...' : 'Confirm Payment'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}