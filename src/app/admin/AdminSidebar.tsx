'use client';

import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building,
  MapPin,
  Users,
  Calendar,
  FileText,
  Wallet,
  MessageSquareWarning,
  BarChart3,
  Bell,
  LogOut,
  Settings,
  ChevronRight,
  UserCircle
} from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho Menu Item
interface MenuItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: string | number; // Thêm prop badge để hiện số (ví dụ: 12, 99+)
}

// 1. Component con: SidebarItem
// Sử dụng memo để tối ưu render
const SidebarItem = memo(({ item, isActive }: { item: MenuItemProps; isActive: boolean }) => {
  const { href, icon: Icon, label, badge } = item;

  return (
    <Link
      href={href}
      className={`group flex items-center justify-between px-3 py-2.5 mb-1 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-red-50 text-red-600 font-medium' // Active state: Nền hồng nhạt, chữ đỏ
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' // Inactive state
      }`}
    >
      <div className="flex items-center">
        {/* Icon */}
        <Icon
          className={`w-5 h-5 mr-3 transition-colors ${
            isActive ? 'text-red-600' : 'text-gray-500 group-hover:text-gray-700'
          }`}
        />
        {/* Label */}
        <span className="text-sm">{label}</span>
      </div>

      {/* Badge Logic (Số thông báo bên phải) */}
      {badge && (
        <span
          className={`px-2 py-0.5 text-[10px] font-bold rounded-md min-w-[20px] text-center ${
            isActive
              ? 'bg-red-600 text-white' // Active: Badge đỏ đậm, chữ trắng
              : 'bg-red-100 text-red-600 group-hover:bg-red-200' // Inactive: Badge hồng nhạt
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
});

SidebarItem.displayName = 'SidebarItem';

// 2. Component chính: Sidebar
export default function AdminSidebarNav() {
  const currentPath = usePathname();

  // Mock data User (Thay thế bằng logic lấy từ API/AuthService của bạn sau này)
  const userInfo = {
    fullName: 'ADMIN',
    email: 'admin@batdongscam.vn',
    avatarUrl: null, // Để null sẽ hiện placeholder
    role: 'Quản trị viên',
  };

  // Danh sách menu - Cấu hình icon và link tại đây
  // Note: Badge là số cứng demo, bạn có thể truyền biến dynamic vào đây sau
  const menuItems: MenuItemProps[] = useMemo(() => [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview', badge: 12 },
    { href: '/admin/properties', icon: Building, label: 'Properties', badge: 5 },
    { href: '/admin/locations', icon: MapPin, label: 'Locations' },
    { href: '/admin/agents', icon: Users, label: 'Agents', badge: 12 },
    { href: '/admin/appointments', icon: Calendar, label: 'Appointments', badge: 99 },
    { href: '/admin/customers', icon: UserCircle, label: 'Customers & Owners', badge: 2 },
    { href: '/admin/contracts', icon: FileText, label: 'Contracts' },
    { href: '/admin/payments', icon: Wallet, label: 'Payments' },
    { href: '/admin/violations', icon: MessageSquareWarning, label: 'Violations' },
    { href: '/admin/reports', icon: BarChart3, label: 'Statistic Reports' },
    { href: '/admin/notifications', icon: Bell, label: 'Notifications', badge: '99+' },
  ], []);

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      {/* --- HEADER LOGO --- */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Logo tam giác đỏ giả lập */}
          <div className="w-8 h-8 bg-red-600 rounded-tl-lg rounded-br-lg flex items-center justify-center shadow-sm">
             <Building className="text-white w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-red-600 leading-tight tracking-wide">
              BATDONGSCAM
            </h1>
            <span className="text-[10px] text-gray-400 font-medium tracking-wider">
              ADMIN DASHBOARD
            </span>
          </div>
        </div>
      </div>

      {/* --- MENU SCROLLABLE --- */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            isActive={currentPath === item.href}
          />
        ))}
      </nav>

      {/* --- USER FOOTER --- */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                {userInfo.avatarUrl ? (
                    <img src={userInfo.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-xs font-bold text-gray-500">AD</span>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{userInfo.fullName}</p>
                <p className="text-[10px] text-gray-500 truncate">{userInfo.email}</p>
            </div>

            {/* Actions (Logout/Setting) */}
            <div className="flex flex-col gap-1">
                 <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut className="w-4 h-4" />
                 </button>
                 <button className="text-gray-400 hover:text-gray-700 transition-colors">
                    <Settings className="w-4 h-4" />
                 </button>
            </div>
        </div>
      </div>
    </div>
  );
}