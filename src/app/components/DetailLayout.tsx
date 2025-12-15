import React from 'react';

interface DetailLayoutProps {
  children: React.ReactNode; 
  sidebar: React.ReactNode;  
}

export default function DetailLayout({ children, sidebar }: DetailLayoutProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {children}
      </div>
      
      {/* Sidebar */}
      <div className="space-y-6">
        {sidebar}
      </div>
    </div>
  );
}