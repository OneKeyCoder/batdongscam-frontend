'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Building, MapPin, Bed, Bath, Square, Heart, Share2, Phone, Mail, Calendar, ChevronLeft, ChevronRight, Star, User, Check, Clock, Shield, Menu, X, Loader2, AlertCircle, Edit, FileText, Trash2, Eye, Download, AlertTriangle } from 'lucide-react';
import NavBar from '@/app/components/layout/NavBar';
import Modal from '@/app/components/ui/Modal';
import Badge from '@/app/components/ui/Badge';
import Footer from '@/app/components/layout/Footer';
import { propertyService, PropertyDetails } from '@/lib/api/services/property.service';
import { appointmentService } from '@/lib/api/services/appointment.service';
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
  
  // Booking form state - simplified to match backend API
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    customerRequirements: '',
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // Status change state (for property owners)
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');
  
  // Owner can set these statuses
  const ownerStatusOptions = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'UNAVAILABLE', label: 'Unavailable' },
    { value: 'SOLD', label: 'Sold' },
    { value: 'RENTED', label: 'Rented' },
  ];
  
  // Check if current user is the assigned sales agent
  const isAssignedAgent = user && property?.assignedAgent?.id === user.id;

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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !bookingForm.date || !bookingForm.time) return;
    
    setIsBooking(true);
    setBookingError('');
    
    try {
      await appointmentService.createAppointment({
        propertyId,
        preferredDate: bookingForm.date,
        preferredTime: bookingForm.time,
        message: bookingForm.customerRequirements || undefined,
      });
      
      setBookingSuccess(true);
      setBookingForm({ date: '', time: '', customerRequirements: '' });
    } catch (err: any) {
      console.error('Failed to book appointment:', err);
      setBookingError(err.response?.data?.message || 'Failed to book viewing. Please try again.');
    } finally {
      setIsBooking(false);
    }
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

            {/* Report a Violation - visible to logged in users (except owner) */}
            {user && user.id !== property.owner.id && (
              <Link
                href={`/my/reports?type=Property&targetId=${property.id}`}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-yellow-50 transition-colors shadow-lg group"
                title="Report a Violation"
              >
                <AlertTriangle className="w-5 h-5 text-gray-600 group-hover:text-yellow-600" />
              </Link>
            )}
            
            {/* Edit & Delete - Only for owner */}
            {user && user.id === property.owner.id && (
              <>
                {/* Change Status */}
                <button
                  onClick={() => {
                    setSelectedStatus(property.status);
                    setShowStatusModal(true);
                  }}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                  title="Change Status"
                >
                  <Shield className="w-5 h-5 text-gray-600" />
                </button>
                <Link
                  href={`/my/properties/${property.id}/edit`}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <Edit className="w-5 h-5 text-gray-600" />
                </Link>
                <button
                  onClick={async () => {
                    if (!confirm('Are you sure you want to delete this property?')) return;
                    setIsDeleting(true);
                    try {
                      await propertyService.deleteProperty(property.id);
                      window.location.href = '/my/properties';
                    } catch (err: any) {
                      alert(err.response?.data?.message || 'Failed to delete property');
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors shadow-lg group disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin text-gray-600" /> : <Trash2 className="w-5 h-5 text-gray-600 group-hover:text-red-600" />}
                </button>
              </>
            )}
            
            {/* Create Contract - For any sales agent on AVAILABLE/APPROVED properties */}
            {user?.role === 'SALESAGENT' && ['AVAILABLE', 'APPROVED'].includes(property.status) && (
              <Link
                href={`/contracts/create?propertyId=${property.id}`}
                className="px-4 py-2 bg-white rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg text-sm font-medium text-gray-700"
              >
                <FileText className="w-4 h-4" />
                Create Contract
              </Link>
            )}
          </div>

          {/* Type Badge */}
          <div className="absolute top-4 left-4">
            <Badge variant={property.transactionType === 'SALE' ? 'danger' : 'info'} className="!px-4 !py-2 !text-sm">
              FOR {property.transactionType === 'SALE' ? 'SALE' : 'RENT'}
            </Badge>
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
                    {property.documentList.map((doc) => {
                      const handleDocClick = () => {
                        // Open file in new tab - browser handles viewing/download
                        window.open(doc.filePath, '_blank', 'noopener,noreferrer');
                      };
                      
                      return (
                        <button
                          key={doc.id}
                          onClick={handleDocClick}
                          className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50/50 transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-red-600" />
                            <div>
                              <p className="font-medium text-gray-900">{doc.documentTypeName}</p>
                              <p className="text-sm text-gray-500">{doc.documentName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                              {doc.verificationStatus}
                            </span>
                          </div>
                        </button>
                      );
                    })}
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
        onClose={() => {
          setShowBookingModal(false);
          setBookingSuccess(false);
          setBookingError('');
        }}
        title="Book a Viewing"
      >
        {bookingSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Submitted!</h3>
            <p className="text-gray-600 mb-6">
              Your viewing request has been submitted successfully. We will contact you shortly to confirm the appointment.
            </p>
            <button
              onClick={() => {
                setShowBookingModal(false);
                setBookingSuccess(false);
              }}
              className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-4">
            {bookingError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {bookingError}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time *</label>
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
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Requirements (Optional)</label>
              <textarea
                value={bookingForm.customerRequirements}
                onChange={(e) => setBookingForm({ ...bookingForm, customerRequirements: e.target.value })}
                placeholder="Any special requirements or questions about the property?"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isBooking}
              className="w-full py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isBooking && <Loader2 className="w-4 h-4 animate-spin" />}
              {isBooking ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}
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
                {/* Open in new tab */}
                <a
                  href={previewDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Open in New Tab
                </a>
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
      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setStatusError('');
        }}
        title="Change Property Status"
      >
        <div className="space-y-4">
          {statusError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {statusError}
            </div>
          )}
          
          <p className="text-gray-600 text-sm">
            Select a new status for your property. This will affect how your property appears to potential buyers/renters.
          </p>
          
          <div className="space-y-2">
            {ownerStatusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedStatus === option.value
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowStatusModal(false);
                setStatusError('');
              }}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!selectedStatus || selectedStatus === property?.status) {
                  setShowStatusModal(false);
                  return;
                }
                
                setIsUpdatingStatus(true);
                setStatusError('');
                
                try {
                  const updated = await propertyService.updatePropertyStatus(propertyId, {
                    status: selectedStatus as any
                  });
                  setProperty(updated);
                  setShowStatusModal(false);
                } catch (err: any) {
                  console.error('Failed to update status:', err);
                  setStatusError(err.response?.data?.message || 'Failed to update property status');
                } finally {
                  setIsUpdatingStatus(false);
                }
              }}
              disabled={isUpdatingStatus || selectedStatus === property?.status}
              className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUpdatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
              {isUpdatingStatus ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <Footer />
    </div>
  );
}
