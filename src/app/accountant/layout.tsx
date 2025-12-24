import React from 'react';
import AccountantSidebar from './AccountantSidebar'; 

export default function AccountantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <AccountantSidebar />

      {/* Main Content Area */}
      <main className="pl-64 transition-all duration-300">
        <div className="p-8 max-w-[1600px] mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
}