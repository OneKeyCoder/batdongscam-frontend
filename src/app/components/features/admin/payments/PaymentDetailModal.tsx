import React, { useEffect, useState } from 'react';
import { X, Calendar, Wallet, Banknote, Mail, Phone, User, Loader2, FileText, MapPin } from 'lucide-react';
import { paymentService, PaymentDetailResponse } from '@/lib/api/services/payment.service';

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDateTime = (dateInput: string | undefined | null) => {
  if (!dateInput) return '---';
  return new Date(dateInput).toLocaleDateString('en-US', { 
    month: 'long', day: 'numeric', year: 'numeric' 
  });
};

export default function PaymentDetailModal({ isOpen, onClose, paymentId }: PaymentDetailModalProps) {
  const [data, setData] = useState<PaymentDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && paymentId) {
      setLoading(true);
      
      paymentService.getPaymentById(paymentId)
        .then((res) => {
          setData(res); 
        })
        .catch((err) => {
          console.error("Error fetching detail:", err);
          setData(null);
        })
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [isOpen, paymentId]);

  if (!isOpen) return null;

  // Ghép tên an toàn
  const payerFullName = data ? `${data.payerFirstName || ''} ${data.payerLastName || ''}`.trim() : '---';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500 gap-3">
             <Loader2 className="w-8 h-8 animate-spin text-red-600" />
             <p>Loading transaction details...</p>
          </div>
        ) : data ? (
          <>
            <div className="overflow-y-auto custom-scrollbar p-8 flex-1">
              
              {/* --- HEADER --- */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Payment information</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-500 text-sm">Transaction ID:</span>
                    <span className="font-mono text-sm font-medium text-gray-900">{data.id}</span>
                  </div>

                  {data.contractNumber && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <FileText className="w-3 h-3" />
                      <span>Contract: {data.contractNumber}</span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-md text-xs font-bold uppercase">
                      {data.paymentType}
                    </span>
                    <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${
                        data.status === 'SUCCESS' ? 'bg-green-50 text-green-700' :
                        data.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                    }`}>
                      {data.status}
                    </span>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                    <X className="w-6 h-6" />
                </button>
              </div>

              {/* --- GRID INFO --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8">
                <InfoItem icon={<Calendar className="w-5 h-5" />} label="Installment number" value={data.installmentNumber?.toString()} />
                <InfoItem icon={<Calendar className="w-5 h-5" />} label="Paid date" value={formatDateTime(data.paidDate)} />
                <InfoItem icon={<Calendar className="w-5 h-5" />} label="Overdue days" value={data.overdueDays ? `${data.overdueDays} days` : '0'} />
                <InfoItem icon={<Mail className="w-5 h-5" />} label="Payment type" value={data.paymentType} />
                <InfoItem icon={<Banknote className="w-5 h-5" />} label="Payment method" value={data.paymentMethod} />

                <InfoItem icon={<Wallet className="w-5 h-5" />} label="Total amount" value={formatCurrency(data.amount)} />
                <InfoItem icon={<Calendar className="w-5 h-5" />} label="Due date" value={formatDateTime(data.dueDate)} />
                <InfoItem icon={<Banknote className="w-5 h-5" />} label="Penalty apply" value={formatCurrency(data.penaltyAmount || 0)} />
                <InfoItem icon={<Phone className="w-5 h-5" />} label="Payment status" value={data.status} />
              </div>

              {/* --- NOTE --- */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500 font-bold">Note</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-900 text-sm font-medium min-h-[60px]">
                  {data.notes || "No notes available."}
                </div>
              </div>

              {/* --- PAYER INFO --- */}
              <div>
                  <h3 className="text-base font-bold text-gray-900 mb-4">Payer information</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-100 flex items-center justify-center text-gray-400">
                       <User className="w-8 h-8" />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-gray-900 text-lg">{payerFullName}</span>
                      
                      <div className="flex items-center gap-2">
                         <span className="text-sm text-gray-600">{data.payerRole || 'Unknown Role'}</span>
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                         <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{data.payerPhone || '---'}</span>
                         </div>
                         <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>---</span>
                         </div>
                      </div>
                    </div>
                  </div>
              </div>

              {/* --- PROPERTY INFO --- */}
              {data.propertyTitle && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Property details</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-bold text-gray-900">{data.propertyTitle}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              {data.propertyAddress}
                          </div>
                      </div>
                  </div>
              )}

            </div>
            
            {/* FOOTER */}
            <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0 z-10">
              <button className="w-full bg-[#D31010] hover:bg-red-800 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm">
                View Account
              </button>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-gray-500">Data not found.</div>
        )}
      </div>
    </div>
  );
}

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-gray-900 shrink-0">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-900 break-all">{value || '---'}</p>
    </div>
  </div>
);