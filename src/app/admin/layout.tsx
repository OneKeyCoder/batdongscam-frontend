// app/admin/layout.tsx
import React from 'react';
import AdminSidebarNav from '@/app/admin/AdminSidebar'; // Nhớ import đúng đường dẫn file sidebar bạn vừa tạo

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Container chính: Chiều cao full màn hình, không scroll ở body
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      
      {/* Sidebar: Cố định bên trái */}
      <aside className="w-64 flex-shrink-0 h-full border-r border-gray-200 bg-white">
        <AdminSidebarNav />
      </aside>

      {/* Main Content: Phần nội dung bên phải sẽ cuộn độc lập */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Wrapper cho nội dung scroll */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {children}
        </div>
      </main>
      
    </div>
  );
}