'use client';

import React from 'react';
import Link from 'next/link';
import { Building, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">BatDongScam</span>
            </div>
            <p className="text-gray-600 text-sm">
              Vietnam's trusted real estate platform connecting buyers, renters, and property owners.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/properties?type=sale" className="block text-sm text-gray-600 hover:text-red-600">Buy Property</Link>
              <Link href="/properties?type=rent" className="block text-sm text-gray-600 hover:text-red-600">Rent Property</Link>
              <Link href="/projects" className="block text-sm text-gray-600 hover:text-red-600">Projects</Link>
              <Link href="/about" className="block text-sm text-gray-600 hover:text-red-600">About Us</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">For Users</h4>
            <div className="space-y-2">
              <Link href="/my/profile" className="block text-sm text-gray-600 hover:text-red-600">My Profile</Link>
              <Link href="/owner/dashboard" className="block text-sm text-gray-600 hover:text-red-600">Owner Portal</Link>
              <Link href="/agent/dashboard" className="block text-sm text-gray-600 hover:text-red-600">Agent Portal</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Contact</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Ho Chi Minh City, Vietnam
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +84 909 123 456
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                info@batdongscam.vn
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
          © 2024 BatDongScam. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
