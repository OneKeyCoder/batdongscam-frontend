'use client';

import React, { memo, useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Import useRouter
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
  UserCircle,
  Triangle,
  Sparkles
} from 'lucide-react';

import { accountService, UserProfile } from '@/lib/api/services/account.service';
import {authService} from '@/lib/api/services/auth.service'

interface MenuItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: string | number;
}

const SidebarItem = memo(({ item, isActive }: { item: MenuItemProps; isActive: boolean }) => {
  const { href, icon: Icon, label, badge } = item;

  return (
    <Link
      href={href}
      className={`group flex items-center justify-between px-3 py-2.5 mb-1 rounded-lg transition-all duration-200 ${isActive
          ? 'bg-red-50 text-red-600 font-medium'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
      <div className="flex items-center">
        <Icon
          className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-red-600' : 'text-gray-500 group-hover:text-gray-700'
            }`}
        />
        <span className="text-sm">{label}</span>
      </div>

      {badge && (
        <span
          className={`px-2 py-0.5 text-[10px] font-bold rounded-md min-w-[20px] text-center ${isActive
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-600 group-hover:bg-red-200'
            }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
});

SidebarItem.displayName = 'SidebarItem';

export default function AdminSidebarNav() {
  const currentPath = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await accountService.getMe();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchMe();
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  // Menu items (Giữ nguyên)
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
    { href: '/admin/ai-chat', icon: Sparkles, label: 'AI Assistant', badge: 'New' },
  ], []);

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Admin';
  const displayEmail = user?.email || '';
  const displayAvatar = user?.avatarUrl;

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      {/* --- HEADER LOGO --- */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-tl-lg rounded-br-lg flex items-center justify-center shadow-sm">
            <Triangle className="text-white fill-white w-5 h-5" />
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
            {displayAvatar ? (
              <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-gray-500">
                {user ? user.firstName.charAt(0) : 'A'}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate" title={displayName}>
              {displayName}
            </p>
            <p className="text-[10px] text-gray-500 truncate" title={displayEmail}>
              {displayEmail}
            </p>
          </div>

          {/* Actions (Logout/Setting) */}
          <div className="flex flex-col gap-1">
            {/* Nút Logout */}
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-gray-200"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <Link
              href="/admin/settings"
              className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-200 flex justify-center"
              title="Cài đặt tài khoản"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}