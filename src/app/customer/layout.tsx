import React from 'react';
import NavBar from '@/app/components/layout/NavBar';
import Footer from '@/app/components/layout/Footer';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar role="customer" />
      <main className="flex-1 w-full max-w-[85%] mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
