import React from 'react';
import NavBar from '@/app/components/layout/NavBar';
import Footer from '@/app/components/layout/Footer';

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Determine role from URL or context - for now defaulting to customer
  // In a real app, this would come from auth context
  const role = 'customer'; // This should be dynamic based on logged-in user
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar role={role as any} />
      <main className="flex-1 w-full max-w-[85%] mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
