import React from 'react';
import NavBar from '@/app/components/layout/NavBar';
import Footer from '@/app/components/layout/Footer';

export default function MyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, get role from auth context
  // For now, default to customer
  const role = 'customer';
  
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
