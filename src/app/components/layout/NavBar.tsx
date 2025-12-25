'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/api/types';
import {
  Building,
  Heart,
  Home,
  Calendar,
  FileText,
  Wallet,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Settings,
  MapPin,
  Search,
  Menu,
  X,
  AlertTriangle,
  Briefcase,
  Users,
  LayoutDashboard,
  Plus,
  DollarSign,
  Shield,
} from 'lucide-react';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

// Define menu items for each role
const roleMenuItems: Record<UserRole, MenuItem[]> = {
  CUSTOMER: [
    { href: '/my/properties', label: 'Properties', icon: Building },
    { href: '/my/favorites', label: 'Favorites', icon: Heart },
    { href: '/my/profile', label: 'My Profile', icon: User },
    { href: '/my/viewings', label: 'Viewings', icon: Calendar },
    { href: '/my/payments', label: 'Payments', icon: Wallet },
    { href: '/my/reports', label: 'Violation Reports', icon: AlertTriangle },
    { href: '/my/notifications', label: 'Notifications', icon: Bell },
  ],
  PROPERTY_OWNER: [
    { href: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/my/properties', label: 'My Properties', icon: Building },
    { href: '/my/profile', label: 'My Profile', icon: User },
    { href: '/my/contracts', label: 'Contracts', icon: FileText },
    { href: '/my/payments', label: 'Payments', icon: Wallet },
    { href: '/my/reports', label: 'Reports', icon: AlertTriangle },
  ],
  SALESAGENT: [
    { href: '/agent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/agent/assignments', label: 'Assignments', icon: Briefcase },
    { href: '/agent/appointments', label: 'Appointments', icon: Calendar },
    { href: '/agent/customers', label: 'Customers', icon: Users },
    { href: '/my/contracts', label: 'Contracts', icon: FileText },
  ],
  ACCOUNTANT: [
    { href: '/accountant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/accountant/payments', label: 'Payments', icon: DollarSign },
    { href: '/accountant/reports', label: 'Financial Reports', icon: FileText },
    { href: '/my/notifications', label: 'Notifications', icon: Bell },
  ],
  ADMIN: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/properties', label: 'Properties', icon: Building },
    { href: '/admin/reports', label: 'Reports', icon: AlertTriangle },
    { href: '/admin/settings', label: 'System Settings', icon: Settings },
  ],
  GUEST: [
    { href: '/properties', label: 'Browse Properties', icon: Building },
  ],
};

export default function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get menu items based on user role
  const menuItems = user?.role ? roleMenuItems[user.role] : roleMenuItems.GUEST;
  
  // Debug logging
  useEffect(() => {
    console.log('NavBar - User state:', user);
    console.log('NavBar - Menu items:', menuItems);
  }, [user, menuItems]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    
    // Determine redirect based on current route
    const currentPath = window.location.pathname;
    
    // Public routes that should redirect to home
    const publicRoutes = ['/', '/properties', '/property', '/register'];
    const isPublicRoute = publicRoutes.some(route => 
      currentPath === route || currentPath.startsWith(route + '/')
    );
    
    // Redirect to home for public pages, login for protected pages
    if (isPublicRoute) {
      window.location.href = '/';
    } else {
      window.location.href = '/login';
    }
  };

  // If not authenticated, show guest navbar
  if (!user) {
    return (
      <>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
          <div className="max-w-[95%] mx-auto">
            <div className="flex items-center justify-between h-16 px-4">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-xl text-gray-900">
                    BatDong<span className="text-red-600">Scam</span>
                  </span>
                </Link>
                
                <div className="hidden lg:flex items-center gap-6">
                  <Link href="/properties?type=rent" className="text-sm font-bold text-gray-900 hover:text-gray-700">
                    Rent
                  </Link>
                  <Link href="/properties?type=sale" className="text-sm font-bold text-gray-900 hover:text-gray-700">
                    Buy
                  </Link>
                  <Link href="/locations" className="text-sm font-bold text-gray-900 hover:text-gray-700">
                    Locations
                  </Link>
                </div>
              </div>
              
              <div className="hidden lg:flex items-center gap-3">
                <Link href="/login" className="text-sm font-bold text-gray-900 hover:text-gray-700">
                  Sign In
                </Link>
                <Link href="/register" className="text-sm font-bold text-gray-900 hover:text-gray-700">
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Post new listing
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 text-gray-900"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden bg-white border-t border-gray-100 py-4">
              <div className="max-w-[90%] mx-auto px-4 space-y-3">
                <Link href="/properties?type=rent" className="block py-2 text-sm font-bold text-gray-900">
                  Rent
                </Link>
                <Link href="/properties?type=sale" className="block py-2 text-sm font-bold text-gray-900">
                  Buy
                </Link>
                <Link href="/locations" className="block py-2 text-sm font-bold text-gray-900">
                  Locations
                </Link>
                <div className="pt-4 space-y-2">
                  <Link href="/login" className="block py-2 text-center text-sm font-bold text-gray-900 border border-gray-300 rounded-lg">
                    Sign In
                  </Link>
                  <Link href="/register" className="block py-2 text-center text-sm font-bold text-gray-900 border border-gray-300 rounded-lg">
                    Sign Up
                  </Link>
                  <Link href="/login" className="block py-2 text-center text-sm font-bold text-white bg-red-600 rounded-lg">
                    Post new listing
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
        <div className="h-16" />
      </>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[95%] mx-auto">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Left Side: Logo + Nav Links */}
            <div className="flex items-center gap-8">
              {/* Logo - matching guest style */}
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">
                  BatDong<span className="text-red-600">Scam</span>
                </span>
              </Link>

              {/* Desktop Navigation - RIGHT of logo */}
              <div className="hidden lg:flex items-center gap-6">
                <Link
                  href="/properties?type=rent"
                  className="text-sm font-bold text-gray-900 hover:text-gray-700 transition-colors"
                >
                  Rent
                </Link>
                <Link
                  href="/properties?type=sale"
                  className="text-sm font-bold text-gray-900 hover:text-gray-700 transition-colors"
                >
                  Buy
                </Link>
                <Link
                  href="/locations"
                  className="text-sm font-bold text-gray-900 hover:text-gray-700 transition-colors"
                >
                  Locations
                </Link>
              </div>
            </div>

            {/* Right Side: Favorites + Notifications + User */}
            <div className="flex items-center gap-4">

              {/* Favorites */}
              <Link
                href="/my/favorites"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Notifications */}
              <Link
                href="/my/notifications"
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
              </Link>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user.email}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.email}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {menuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setShowDropdown(false)}
                          className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                            pathname === item.href || pathname.startsWith(item.href + '/')
                              ? 'text-red-600 bg-red-50'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    {/* Owner Quick Action */}
                    {user.role === 'PROPERTY_OWNER' && (
                      <div className="px-4 py-2 border-t border-gray-100">
                        <Link
                          href="/my/properties/new"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 w-full px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add New Property
                        </Link>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="border-t border-gray-100 pt-2 mt-2">
                      <Link
                        href="/settings"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 text-gray-900"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-2">
              <Link
                href="/properties?type=rent"
                onClick={() => setShowMobileMenu(false)}
                className="block py-2 text-sm font-bold text-gray-900 hover:text-gray-700"
              >
                Rent
              </Link>
              <Link
                href="/properties?type=sale"
                onClick={() => setShowMobileMenu(false)}
                className="block py-2 text-sm font-bold text-gray-900 hover:text-gray-700"
              >
                Buy
              </Link>
              <Link
                href="/locations"
                onClick={() => setShowMobileMenu(false)}
                className="block py-2 text-sm font-bold text-gray-900 hover:text-gray-700"
              >
                Locations
              </Link>
            </div>
          </div>
        )}
      </nav>
      
      {/* Spacer for fixed navbar */}
      <div className="h-14" />
    </>
  );
}
