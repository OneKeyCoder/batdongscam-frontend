'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Skeleton from '@/app/components/ui/Skeleton';

/**
 * My Contracts page - Redirects to the appropriate contracts page based on user role
 */
export default function MyContractsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Redirect based on user role
    switch (user.role) {
      case 'SALESAGENT':
        router.push('/agent/contracts');
        break;
      case 'PROPERTY_OWNER':
        router.push('/owner/contracts');
        break;
      case 'CUSTOMER':
        router.push('/customer/contracts');
        break;
      default:
        // Fallback to customer contracts for unknown roles
        router.push('/customer/contracts');
    }
  }, [user, isLoading, router]);

  // Show loading state while redirecting
  return (
    <div className="space-y-6">
      <Skeleton height={60} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton height={100} />
        <Skeleton height={100} />
        <Skeleton height={100} />
      </div>
      <Skeleton height={400} />
    </div>
  );
}
