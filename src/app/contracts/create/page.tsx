'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AddContractForm from '@/app/components/features/admin/contracts/AddContractForm';

function CreateContractContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') || undefined;

  const handleSuccess = () => {
    router.push('/my/contracts');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleCancel}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-600" />
            Create New Contract
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {propertyId 
              ? 'Create a new contract for the selected property' 
              : 'Fill in the details to create a new contract'}
          </p>
        </div>
      </div>

      {/* Contract Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <AddContractForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          initialPropertyId={propertyId}
        />
      </div>
    </div>
  );
}

export default function CreateContractPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    }>
      <CreateContractContent />
    </Suspense>
  );
}
