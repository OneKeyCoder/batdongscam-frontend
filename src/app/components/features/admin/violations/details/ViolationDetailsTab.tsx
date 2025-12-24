import React from 'react';
import { AlertTriangle, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

export default function ViolationDetailsTab() {
  return (
    <div className="space-y-6">
      {/* Violation Info Box */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Violation information</h3>
          <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Violation type</p>
                  <p className="font-bold text-gray-900">SCAM ATTEMPT</p>
              </div>
              <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Reported at</p>
                  <p className="font-bold text-gray-900">January 2nd, 2022 - 7:00PM</p>
              </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-2 font-bold">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                  The property listing claims to have ocean view but the actual location is 5km inland...
                  (Nội dung mô tả dài...)
              </p>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reporter Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Reporter - Customer</h3>
              <div className="flex gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" className="w-full h-full object-cover" />
                  </div>
                  <div>
                      <p className="font-bold text-gray-900">Phan Đình Minh - Customer</p>
                      <Badge variant="pink" className="mt-1">PLATINUM</Badge>
                      <div className="mt-2 space-y-1 text-xs text-gray-500">
                          <p className="flex items-center gap-2"><Phone className="w-3 h-3"/> 0865 8***</p>
                          <p className="flex items-center gap-2"><Mail className="w-3 h-3"/> phandinhminh48@gmail.com</p>
                      </div>
                  </div>
              </div>
              <button className="w-full py-2 bg-red-700 text-white font-bold rounded-lg text-xs hover:bg-red-800">View Account</button>
          </div>

          {/* Reported Property Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Reported - Property</h3>
              <div className="flex gap-4 mb-4">
                  <div className="w-24 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                      <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200" className="w-full h-full object-cover" />
                  </div>
                  <div>
                      <p className="font-bold text-gray-900 text-sm">Apartment hello 123</p>
                      <div className="flex gap-1 my-1">
                          <Badge variant="sale">Sale</Badge>
                          <Badge variant="default">Apartment</Badge>
                      </div>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> 123 Main Street...</p>
                      <div className="flex gap-4 mt-1 text-sm font-bold">
                          <span className="text-red-600">541k $</span>
                          <span className="text-red-600">120 m²</span>
                      </div>
                  </div>
              </div>
              <button className="w-full py-2 bg-red-700 text-white font-bold rounded-lg text-xs hover:bg-red-800">View property</button>
          </div>
      </div>
    </div>
  );
}