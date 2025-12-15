'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Calendar, Mail, Phone, Edit, Star, User, MessageSquare, ClipboardList, FileText } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">
      {/* Back Link */}
      <div>
         <Link href="/admin/appointments" className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors text-xs font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Appointments
         </Link>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative">
          {/* Action Buttons Top-Right */}
          <div className="absolute top-6 right-6 flex gap-2">
              <button className="px-4 py-1.5 border border-red-200 text-red-600 text-xs font-bold rounded bg-white hover:bg-red-50 transition-colors">Cancel</button>
              <button className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors">Edit</button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointment Details</h1>
          <p className="text-sm text-gray-500 mb-4">ID: usef-qqfc-123s</p>
          <Badge variant="success" className="mb-6">Completed</Badge>

          {/* Info Grid - 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-12 mb-8">
              <div className="flex gap-3 items-start">
                  <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                      <p className="text-xs text-gray-500">Requested day</p>
                      <p className="text-sm font-bold text-gray-900">January 2nd, 2022 - 7:00PM</p>
                  </div>
              </div>
              <div className="flex gap-3 items-start">
                  <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                      <p className="text-xs text-gray-500">Confirmed day</p>
                      <p className="text-sm font-bold text-gray-900">January 2nd, 2022 - 8:12 PM</p>
                  </div>
              </div>
              <div className="flex gap-3 items-start">
                  <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                      <p className="text-xs text-gray-500">Customer Email</p>
                      <p className="text-sm font-bold text-gray-900">phandinhminh48@gmail.com</p>
                  </div>
              </div>
              <div className="flex gap-3 items-start">
                  <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                      <p className="text-xs text-gray-500">Customer Phone</p>
                      <p className="text-sm font-bold text-gray-900">+84 865 832 440</p>
                  </div>
              </div>
              <div className="flex gap-3 items-start">
                  <Star className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                      <p className="text-xs text-gray-500">Rating</p>
                      <p className="text-sm font-bold text-gray-900">4.8</p>
                  </div>
              </div>
              {/* Customer Interest Level - Green Badge */}
              <div className="flex gap-3 items-start">
                  <User className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                      <p className="text-xs text-gray-500">Customer Interest Level</p>
                      <span className="inline-flex mt-1 px-2 py-0.5 bg-green-100 text-green-700 border border-green-200 text-[10px] font-bold rounded">
                          Very Interested
                      </span>
                  </div>
              </div>
          </div>

          {/* Text Areas Section (Gray Boxes) */}
          <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5"/> Customer comment
                  </p>
                  <p className="text-sm text-gray-800">I want to view this apartment ASAP. The location seems perfect for my work.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                      <ClipboardList className="w-3.5 h-3.5"/> Customer requirements
                  </p>
                  <p className="text-sm text-gray-800">Need fully furnished, 2 bedrooms, high floor.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                      <Edit className="w-3.5 h-3.5"/> Agent notes
                  </p>
                  <ul className="text-sm text-gray-800 list-disc pl-4 space-y-1">
                      <li>Client is very serious.</li>
                      <li>Budget is flexible.</li>
                      <li>Call 30 mins before arrival.</li>
                  </ul>
              </div>
              {/* Viewing Outcome Field */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5"/> Viewing outcome
                  </p>
                  <p className="text-sm text-gray-800">Customer signed a contract.</p>
              </div>
          </div>
      </div>

      {/* --- BOTTOM GRID CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Property Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-sm">Property</h3>
                <div className="flex gap-3">
                    <div className="w-24 h-16 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200" className="w-full h-full object-cover"/>
                    </div>
                    <div>
                        <p className="font-bold text-sm text-gray-900 line-clamp-1">Apartment hello 123</p>
                        <div className="flex gap-1 my-1.5"><Badge variant="sale">Sale</Badge></div>
                        <p className="text-xs text-gray-500">123 Main Street, District 1, HCMC</p>
                    </div>
                </div>
              </div>
              <button className="w-full mt-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors">
                  View property
              </button>
          </div>

          {/* 2. Customer Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-sm">Customer</h3>
                <div className="flex gap-3 items-center">
                    <div className="w-14 h-14 bg-gray-200 rounded-full shrink-0 overflow-hidden border border-gray-100">
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" className="w-full h-full object-cover"/>
                    </div>
                    <div>
                        <p className="font-bold text-sm text-gray-900">Nguyễn Văn A</p>
                        <Badge variant="gold" className="my-1">GOLD</Badge>
                        <p className="text-xs text-gray-500">0909 123 ***</p>
                    </div>
                </div>
              </div>
              <button className="w-full mt-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors">
                  View Account
              </button>
          </div>

          {/* 3. Property Owner Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-sm">Property Owner</h3>
                <div className="flex gap-3 items-center">
                    <div className="w-14 h-14 bg-gray-200 rounded-full shrink-0 overflow-hidden border border-gray-100">
                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" className="w-full h-full object-cover"/>
                    </div>
                    <div>
                        <p className="font-bold text-sm text-gray-900">Trần Thị B</p>
                        <Badge variant="pink" className="my-1">PLATINUM</Badge>
                        <p className="text-xs text-gray-500">0865 8***</p>
                    </div>
                </div>
              </div>
              <button className="w-full mt-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors">
                  View Account
              </button>
          </div>

          {/* 4. Sales Agent Card (With Buttons) */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
              <div>
                  <h3 className="font-bold text-gray-900 mb-4 text-sm">Sales Agent</h3>
                  <div className="flex justify-between items-start">
                      <div className="flex gap-3 items-center">
                          <div className="w-14 h-14 bg-gray-200 rounded-full shrink-0 overflow-hidden border border-gray-100">
                              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100" className="w-full h-full object-cover"/>
                          </div>
                          <div>
                              <p className="font-bold text-sm text-gray-900">Phan Đình Minh</p>
                              <Badge variant="pink" className="my-1">PLATINUM</Badge>
                              <p className="text-xs text-gray-500">0865 8***</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Rating</p>
                          <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                              <Star className="w-4 h-4 fill-yellow-500"/> 4.8 (172)
                          </div>
                      </div>
                  </div>
              </div>
              
              {/* Action Buttons Row */}
              <div className="flex items-center gap-3 mt-5">
                  <Link 
                    href={`/admin/appointments/${id}/change-agent`} 
                    className="flex-1 flex items-center justify-center py-2 border border-red-200 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-50 transition-colors"
                  >
                      Change agent
                  </Link>
                  <button className="flex-1 py-2 border border-red-200 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-50 transition-colors">
                      Remove agent
                  </button>
                  <button className="flex-1 py-2 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-colors">
                      View Account
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
}