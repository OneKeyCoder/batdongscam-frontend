'use client';

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Star, X, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import StarRating from '@/app/components/ui/StarRating';

type ViewingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

interface Viewing {
  id: number;
  propertyName: string;
  propertyImage: string;
  propertyAddress: string;
  date: string;
  time: string;
  status: ViewingStatus;
  agent: { name: string; phone: string; email: string };
  notes: string;
  rating: number | null;
}

// Mock data
const mockViewings: Viewing[] = [
  {
    id: 1,
    propertyName: 'Modern Villa with Pool',
    propertyImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    propertyAddress: 'District 7, Ho Chi Minh City',
    date: '2024-01-20',
    time: '10:00 AM',
    status: 'Confirmed',
    agent: { name: 'Trần Văn Agent', phone: '0909123456', email: 'agent@batdongscam.vn' },
    notes: 'Please bring your ID card for verification',
    rating: null,
  },
  {
    id: 2,
    propertyName: 'Luxury Apartment Downtown',
    propertyImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    propertyAddress: 'District 1, Ho Chi Minh City',
    date: '2024-01-18',
    time: '02:30 PM',
    status: 'Completed',
    agent: { name: 'Nguyễn Thị Agent', phone: '0909654321', email: 'agent2@batdongscam.vn' },
    notes: '',
    rating: 4,
  },
  {
    id: 3,
    propertyName: 'Family House with Garden',
    propertyImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
    propertyAddress: 'Thu Duc City, Ho Chi Minh',
    date: '2024-01-22',
    time: '09:00 AM',
    status: 'Pending',
    agent: { name: 'Lê Văn Agent', phone: '0909111222', email: 'agent3@batdongscam.vn' },
    notes: 'Waiting for owner confirmation',
    rating: null,
  },
  {
    id: 4,
    propertyName: 'Cozy Studio Near Park',
    propertyImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    propertyAddress: 'Binh Thanh District',
    date: '2024-01-10',
    time: '11:00 AM',
    status: 'Cancelled',
    agent: { name: 'Phạm Văn Agent', phone: '0909333444', email: 'agent4@batdongscam.vn' },
    notes: 'Cancelled by customer',
    rating: null,
  },
];

const statusVariants: Record<ViewingStatus, 'warning' | 'info' | 'success' | 'danger'> = {
  Pending: 'warning',
  Confirmed: 'info',
  Completed: 'success',
  Cancelled: 'danger',
};

export default function ViewingsPage() {
  const [viewings, setViewings] = useState<Viewing[]>(mockViewings);
  const [selectedViewing, setSelectedViewing] = useState<Viewing | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingViewing, setRatingViewing] = useState<Viewing | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [cancelConfirmViewing, setCancelConfirmViewing] = useState<Viewing | null>(null);

  const handleCancelViewing = (viewing: Viewing) => {
    setViewings(viewings.map(v => 
      v.id === viewing.id ? { ...v, status: 'Cancelled' as ViewingStatus } : v
    ));
    setCancelConfirmViewing(null);
  };

  const filteredViewings = viewings.filter(v => {
    if (filter === 'upcoming') return v.status === 'Pending' || v.status === 'Confirmed';
    if (filter === 'completed') return v.status === 'Completed' || v.status === 'Cancelled';
    return true;
  });

  const handleRateViewing = (viewing: Viewing) => {
    setRatingViewing(viewing);
    setNewRating(0);
    setRatingComment('');
    setShowRatingModal(true);
  };

  const submitRating = () => {
    if (ratingViewing) {
      setViewings(viewings.map(v => 
        v.id === ratingViewing.id ? { ...v, rating: newRating } : v
      ));
      setShowRatingModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-red-600" />
            My Viewings
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {viewings.length} appointments scheduled
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'completed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Viewings List */}
      <div className="space-y-4">
        {filteredViewings.map((viewing) => (
          <div 
            key={viewing.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Property Image */}
              <div className="w-full sm:w-40 h-32 sm:h-auto shrink-0">
                <img
                  src={viewing.propertyImage}
                  alt={viewing.propertyName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{viewing.propertyName}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {viewing.propertyAddress}
                    </p>
                  </div>
                  <Badge variant={statusVariants[viewing.status]}>{viewing.status}</Badge>
                </div>

                {/* Schedule */}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-red-500" />
                    {viewing.date}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-red-500" />
                    {viewing.time}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    {viewing.agent.name}
                  </div>
                </div>

                {/* Rating (if completed) */}
                {viewing.status === 'Completed' && viewing.rating && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-gray-500">Your Rating:</span>
                    <StarRating rating={viewing.rating} size="sm" />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedViewing(viewing)}
                    className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                  {viewing.status === 'Completed' && !viewing.rating && (
                    <button
                      onClick={() => handleRateViewing(viewing)}
                      className="px-4 py-2 text-xs font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      Rate
                    </button>
                  )}
                  {(viewing.status === 'Pending' || viewing.status === 'Confirmed') && (
                    <button 
                      onClick={() => setCancelConfirmViewing(viewing)}
                      className="px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredViewings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <Calendar className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No viewings found</h3>
          <p className="text-gray-500 text-sm">Try changing your filter or book a new viewing</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedViewing && (
        <Modal
          isOpen={!!selectedViewing}
          onClose={() => setSelectedViewing(null)}
          title="Viewing Details"
        >
          <div className="space-y-4">
            {/* Property */}
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={selectedViewing.propertyImage}
                alt={selectedViewing.propertyName}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-bold text-gray-900">{selectedViewing.propertyName}</h4>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {selectedViewing.propertyAddress}
                </p>
                <Badge variant={statusVariants[selectedViewing.status]} className="mt-2">
                  {selectedViewing.status}
                </Badge>
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Date</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-500" />
                  {selectedViewing.date}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Time</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-500" />
                  {selectedViewing.time}
                </p>
              </div>
            </div>

            {/* Agent Info */}
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-2">Sales Agent</h5>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-900">{selectedViewing.agent.name}</p>
                <div className="flex flex-col gap-1 mt-2">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {selectedViewing.agent.phone}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {selectedViewing.agent.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedViewing.notes && (
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Notes</h5>
                <p className="text-sm text-gray-600 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  {selectedViewing.notes}
                </p>
              </div>
            )}

            {/* Rating */}
            {selectedViewing.status === 'Completed' && selectedViewing.rating && (
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Your Rating</h5>
                <div className="flex items-center gap-2">
                  <StarRating rating={selectedViewing.rating} size="md" />
                  <span className="text-sm text-gray-500">({selectedViewing.rating}/5)</span>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Rating Modal */}
      {showRatingModal && ratingViewing && (
        <Modal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          title="Rate Your Viewing Experience"
        >
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-4">
                How was your viewing experience at <strong>{ratingViewing.propertyName}</strong>?
              </p>
              <div className="flex justify-center">
                <StarRating
                  rating={newRating}
                  size="lg"
                  interactive
                  onChange={setNewRating}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={3}
                placeholder="Share your experience..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm resize-none text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                disabled={newRating === 0}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelConfirmViewing && (
        <Modal
          isOpen={!!cancelConfirmViewing}
          onClose={() => setCancelConfirmViewing(null)}
          title="Cancel Viewing"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to cancel this viewing appointment? This action cannot be undone.
            </p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{cancelConfirmViewing.propertyName}</p>
              <p className="text-sm text-gray-500 mt-1">
                {cancelConfirmViewing.date} at {cancelConfirmViewing.time}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelConfirmViewing(null)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={() => handleCancelViewing(cancelConfirmViewing)}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
