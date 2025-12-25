'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Building, MapPin, Bed, Bath, Square, Heart, Share2, Phone, Mail, Calendar, ChevronLeft, ChevronRight, Star, User, Check, Clock, Shield, Menu, X, Loader2, AlertCircle, Edit, FileText, Trash2, Eye, Download } from 'lucide-react';
import NavBar from '@/app/components/layout/NavBar';
import Modal from '@/app/components/ui/Modal';
import Footer from '@/app/components/layout/Footer';
import { propertyService, PropertyDetails } from '@/lib/api/services/property.service';
import { useAuth } from '@/contexts/AuthContext';

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;

  // API state
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [currentImage, setCurrentImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{url: string; name: string} | null>(null);
  const { user } = useAuth();
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;
      
      setIsLoading(true);
      setError('');

      try {
        const data = await propertyService.getPropertyDetails(propertyId);
        setProperty(data);
        setIsFavorite(data.isFavorite || false);
      } catch (err: any) {
        console.error('Failed to fetch property:', err);
        if (err.response?.status === 404) {
          setError('Property not found');
        } else {
          setError('Failed to load property details. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const nextImage = () => {
    if (!property?.mediaList.length) return;
    setCurrentImage((prev) => (prev + 1) % property.mediaList.length);
  };

  const prevImage = () => {
    if (!property?.mediaList.length) return;
    setCurrentImage((prev) => (prev - 1 + property.mediaList.length) % property.mediaList.length);
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking:', bookingForm);
    alert('Viewing request submitted successfully!');
    setShowBookingModal(false);
  };

  const formatPrice = (amount: number, transactionType: string) => {
    const formattedAmount = amount.toLocaleString('vi-VN');
    if (transactionType === 'RENT' || transactionType === 'RENTAL') {
      return `${formattedAmount} VND/tháng`;
    }
    return `${formattedAmount} VND`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">{error || 'Property not found'}</p>
          <Link
            href="/properties"
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-block"
          >
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div>
        {/* Image Gallery */}
        <div className="relative h-[65vh] lg:h-[75vh] bg-gray-900">
          <img
            src={property.mediaList[currentImage]?.filePath || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200'}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          
          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 text-white text-sm rounded-full">
            {currentImage + 1} / {property.mediaList.length}
          </div>

          {/* Thumbnails */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            {property.mediaList.map((media, idx) => (
              <button
                key={media.id}
                onClick={() => setCurrentImage(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  currentImage === idx ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img 
                  src={media.filePath || 'https://via.placeholder.com/150'} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            {/* Favorite - Always visible */}
            <button
              onClick={() => {
                if (!user) {
                  window.location.href = '/login';
                  return;
                }
                setIsFavorite(!isFavorite);
              }}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
            
            {/* Edit & Delete - Only for owner */}
            {user && user.id === property.owner.id && (
              <>
                <Link
                  href={`/my/properties/${property.id}/edit`}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <Edit className="w-5 h-5 text-gray-600" />
                </Link>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this property?')) {
                      // TODO: Call delete API
                      alert('Property deleted!');
                    }
                  }}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors shadow-lg group"
                >
                  <Trash2 className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                </button>
              </>
            )}
          </div>

          {/* Type Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-4 py-2 text-sm font-bold rounded-full ${
              property.transactionType === 'SALE' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              For {property.transactionType === 'SALE' ? 'Sale' : 'Rent'}
            </span>
          </div>
        </div>

        <div className="max-w-[90%] mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Price & Title */}
              <div>
                <p className="text-3xl font-bold text-red-600">{formatPrice(property.priceAmount, property.transactionType)}</p>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">{property.title}</h1>
                <p className="text-gray-600 flex items-center gap-2 mt-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  {property.fullAddress}
                  {/* For some reason the fucking seed data itself has wardName in the fullAddress so we comment this */}
                  {/* {(property as any).wardName && `, ${(property as any).wardName}`} */}
                  {(property as any).districtName && `, ${(property as any).districtName}`}
                  {(property as any).cityName && `, ${(property as any).cityName}`}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                {property.bedrooms && (
                  <div className="text-center">
                    <Bed className="w-6 h-6 text-red-600 mx-auto" />
                    <p className="text-lg font-bold text-gray-900 mt-2">{property.bedrooms}</p>
                    <p className="text-sm text-gray-500">Bedrooms</p>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center">
                    <Bath className="w-6 h-6 text-red-600 mx-auto" />
                    <p className="text-lg font-bold text-gray-900 mt-2">{property.bathrooms}</p>
                    <p className="text-sm text-gray-500">Bathrooms</p>
                  </div>
                )}
                <div className="text-center">
                  <Square className="w-6 h-6 text-red-600 mx-auto" />
                  <p className="text-lg font-bold text-gray-900 mt-2">{property.area}m²</p>
                  <p className="text-sm text-gray-500">Area</p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                <div className="text-gray-600 whitespace-pre-line leading-relaxed">
                  {property.description || 'No description available.'}
                </div>
              </div>

              {/* Property Information */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Property Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  {property.propertyTypeName && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Check className="w-5 h-5 text-green-500" />
                      Type: {property.propertyTypeName}
                    </div>
                  )}
                  {property.rooms && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Check className="w-5 h-5 text-green-500" />
                      {property.rooms} Rooms
                    </div>
                  )}
                  {property.floors && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Check className="w-5 h-5 text-green-500" />
                      {property.floors} Floors
                    </div>
                  )}
                  {property.houseOrientation && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Check className="w-5 h-5 text-green-500" />
                      House: {property.houseOrientation}
                    </div>
                  )}
                  {property.balconyOrientation && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Check className="w-5 h-5 text-green-500" />
                      Balcony: {property.balconyOrientation}
                    </div>
                  )}
                  {property.yearBuilt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Check className="w-5 h-5 text-green-500" />
                      Built in {property.yearBuilt}
                    </div>
                  )}
                  {property.amenities && (
                    <div className="col-span-2">
                      <p className="font-medium text-gray-900 mb-2">Amenities:</p>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.split(',').map((amenity, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                            {amenity.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attached Documents */}
              {property.documentList && property.documentList.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    Attached Documents
                  </h2>
                  <div className="space-y-3">
                    {property.documentList.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="font-medium text-gray-900">{doc.documentTypeName}</p>
                            <p className="text-sm text-gray-500">{doc.documentName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded mr-2">
                            {doc.verificationStatus}
                          </span>
                          {/* Preview Button */}
                          <button
                            onClick={() => setPreviewDocument({ url: doc.filePath, name: doc.documentName || 'Document' })}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            title="Preview document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Download Button */}
                          <a
                            href={doc.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
                            title="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Property Owner</h3>
                
                {/* Owner Info - Primary */}
                <Link 
                  href={`/profile/${property.owner.id}`}
                  className="flex items-center gap-4 mb-4 hover:bg-gray-50 p-3 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {`${property.owner.firstName[0]}${property.owner.lastName[0]}`}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      {property.owner.firstName} {property.owner.lastName}
                      <Shield className="w-4 h-4 text-green-500" />
                    </p>
                    <p className="text-sm text-gray-500">Property Owner</p>
                    <p className="text-xs text-gray-500">{property.owner.phoneNumber}</p>
                  </div>
                </Link>

                {/* Agent Info - Matching Owner Card Style */}
                {property.assignedAgent && (
                  <div className="border-t border-gray-100 pt-4 mt-4 pb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Sales Agent</h3>
                    <Link
                      href={`/profile/${property.assignedAgent.id}`}
                      className="flex items-center gap-4 hover:bg-gray-50 p-3 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        {`${property.assignedAgent.firstName[0]}${property.assignedAgent.lastName[0]}`}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          {property.assignedAgent.firstName} {property.assignedAgent.lastName}
                          <Shield className="w-4 h-4 text-blue-500" />
                        </p>
                        <p className="text-sm text-gray-500">Sales Agent</p>
                        <p className="text-xs text-gray-500">{property.assignedAgent.phoneNumber}</p>
                      </div>
                    </Link>
                  </div>
                )}

                <div className="space-y-3 mt-3">
                  <button
                    onClick={() => {
                      if (!user) {
                        window.location.href = '/login';
                        return;
                      }
                      setShowBookingModal(true);
                    }}
                    className="w-full py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Book a Viewing
                  </button>
                  <a
                    href={`tel:${property.owner.phoneNumber}`}
                    className="w-full py-3 border border-gray-300 text-gray-900 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Call Owner
                  </a>
                  <a
                    href={`mailto:${property.owner.email}`}
                    className="w-full py-3 border border-gray-300 text-gray-900 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Send Email
                  </a>
                </div>

                {/* Property Stats */}
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Listed {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-gray-400">ID: {property.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Book a Viewing"
      >
        <form onSubmit={handleBooking} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
              <input
                type="date"
                value={bookingForm.date}
                onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
              <select
                value={bookingForm.time}
                onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                required
              >
                <option value="">Select time</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="16:00">04:00 PM</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={bookingForm.name}
              onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={bookingForm.phone}
              onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
              placeholder="Enter your phone number"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={bookingForm.email}
              onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
              placeholder="Enter your email"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
            <textarea
              value={bookingForm.message}
              onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
              placeholder="Any questions or special requests?"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            Submit Request
          </button>
        </form>
      </Modal>

      {/* Document Preview Modal */}
      {previewDocument && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setPreviewDocument(null)}
        >
          <div 
            className="relative bg-white rounded-2xl w-[90%] h-[90%] max-w-6xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 truncate pr-4">
                {previewDocument.name}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <button
                  onClick={() => setPreviewDocument(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            {/* Document Viewer */}
            <div className="h-[calc(100%-65px)]">
              <iframe
                src={previewDocument.url}
                className="w-full h-full"
                title={previewDocument.name}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
