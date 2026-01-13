import React from 'react';
import NavBar from '@/app/components/layout/NavBar';
import Footer from '@/app/components/layout/Footer';

export default function ContractsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
