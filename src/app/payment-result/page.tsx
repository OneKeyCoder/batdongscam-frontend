'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, X, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  
  const isSuccess = status === 'succeeded' || status === 'success';
  const isCanceled = status === 'canceled' || status === 'cancelled';
  
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/my/payments');
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Icon */}
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
          isSuccess ? 'bg-green-100' : isCanceled ? 'bg-yellow-100' : 'bg-red-100'
        }`}>
          {isSuccess ? (
            <Check className="w-10 h-10 text-green-600" />
          ) : isCanceled ? (
            <X className="w-10 h-10 text-yellow-600" />
          ) : (
            <X className="w-10 h-10 text-red-600" />
          )}
        </div>

        {/* Title */}
        <h1 className={`mt-6 text-2xl font-bold ${
          isSuccess ? 'text-green-800' : isCanceled ? 'text-yellow-800' : 'text-red-800'
        }`}>
          {isSuccess ? 'Payment Successful!' : isCanceled ? 'Payment Cancelled' : 'Payment Failed'}
        </h1>

        {/* Description */}
        <p className="mt-3 text-gray-600">
          {isSuccess 
            ? 'Your payment has been processed successfully. Thank you for your payment!'
            : isCanceled
            ? 'Your payment was cancelled. No charges were made.'
            : 'There was an issue processing your payment. Please try again.'}
        </p>

        {/* Payment ID */}
        {paymentId && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Payment Reference</p>
            <p className="font-mono text-sm text-gray-700">{paymentId.slice(0, 8).toUpperCase()}</p>
          </div>
        )}

        {/* Countdown */}
        <p className="mt-6 text-sm text-gray-500">
          Redirecting to payments in {countdown} seconds...
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <Link 
            href="/my/payments"
            className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Payments
          </Link>
          
          {!isSuccess && (
            <button
              onClick={() => router.back()}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}
