'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    ChevronLeft, ChevronRight, MapPin, Loader2, Calendar,
    Building2, DollarSign, Maximize, DoorOpen, Bath, Briefcase, BedDouble, Layers, Compass
} from 'lucide-react';
import DetailLayout from '@/app/components/DetailLayout';
import ContactCard from '@/app/components/features/admin/properties/details/ContactCard'; 
import DocumentList from '@/app/components/features/admin/properties/details/DocumentList';
import PropertyBookingsModal from '@/app/components/features/admin/properties/details/PropertyBookingsModal';
import { propertyService, PropertyDetails } from '@/lib/api/services/property.service';
import apiClient from '@/lib/api/client';
import { getFullUrl } from '@/lib/utils/urlUtils';

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const fetchDetail = async () => {
      setLoading(true);
      try {
          const data = await propertyService.getPropertyDetails(id);
          setProperty(data);
      } catch (error) {
          console.error("Failed to load property details", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => { if (id) fetchDetail(); }, [id]);

  const handleRemoveAgent = async () => {
      if (confirm("Are you sure you want to remove the assigned agent?")) {
          try {
              await apiClient.delete(`/properties/${id}/assign-agent`);
              alert("Agent removed successfully."); 
              fetchDetail();
          } catch (error) {
              console.error(error);
              alert("Failed to remove agent.");
          }
      }
  };

  const handleGoToSelectAgent = () => {
      router.push(`/admin/properties/${id}/agents`);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;
  if (!property) return <div className="text-center py-10">Property not found</div>;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      {/* Back Button */}
      <div className="mb-2">
         <Link 
            href="/admin/properties" 
            className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors text-sm font-medium"
         >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Properties
         </Link>
      </div>

      <div className="mb-6">
         <h2 className="text-2xl font-bold text-gray-900">Properties Management</h2>
         <p className="text-sm text-gray-500">Manage all your property listings</p>
      </div>

      <DetailLayout
        sidebar={
            <>
                <ContactCard 
                    title="Property Owner"
                    name={`${property.owner.firstName} ${property.owner.lastName}`}
                    tier={property.owner.tier || 'MEMBER'}
                    phone={property.owner.phoneNumber || 'N/A'}
                    avatar={getFullUrl(property.owner.avatarUrl)}
                />
                
                {property.assignedAgent ? (
                    <ContactCard 
                        title="Sales Agent"
                        name={`${property.assignedAgent.firstName} ${property.assignedAgent.lastName}`}
                        tier={property.assignedAgent.tier || 'SILVER'}
                        phone={property.assignedAgent.phoneNumber || 'N/A'}
                        avatar={getFullUrl(property.assignedAgent.avatarUrl)}
                        isAgent={true}
                        onChange={handleGoToSelectAgent}
                        onRemove={handleRemoveAgent}
                    />
                ) : (
                    <div className="bg-white p-4 rounded-xl border border-dashed border-gray-300 text-center">
                        <p className="text-sm text-gray-500 mb-3">No agent assigned</p>
                        <button onClick={handleGoToSelectAgent} className="text-sm font-bold text-red-600 hover:underline">
                            + Assign Agent
                        </button>
                    </div>
                )}

                <DocumentList 
                    documents={property.documentList.map((doc, idx) => ({
                        id: idx,
                        name: doc.filePath.split('/').pop() || `Document ${idx + 1}`,
                        type: doc.documentTypeName || 'Document',
                        size: 'PDF', 
                        url: getFullUrl(doc.filePath) 
                    }))} 
                />
            </>
        }
      >
        <div className="space-y-6">
            {/* Gallery */}
            <div className="relative h-[400px] bg-gray-100 rounded-xl overflow-hidden group">
                {property.mediaList.length > 0 ? (
                    <img src={getFullUrl(property.mediaList[0].filePath)} className="w-full h-full object-cover" alt="Property" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No images</div>
                )}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                    1/{property.mediaList.length || 1}
                </div>
            </div>

            {/* Info Block */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                 <div className="flex justify-between items-start mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                    
                    {/* View Bookings Button */}
                    <button 
                        onClick={() => setIsBookingModalOpen(true)}
                        title="View Bookings" 
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg shadow-sm active:scale-95 transition-all"
                    >
                        <Calendar className="w-5 h-5" /> 
                    </button>
                 </div>
                 
                 <p className="text-gray-500 text-sm mb-4">{property.fullAddress}</p>
                 <hr className="border-gray-100 mb-4" />

                 <div className="flex gap-12 mb-6">
                    <div>
                        <span className="text-sm text-gray-500 font-medium block mb-1">Price</span>
                        <span className="text-xl font-bold text-red-600">{property.priceAmount.toLocaleString()} VND</span>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500 font-medium block mb-1">Area</span>
                        <span className="text-xl font-bold text-red-600">{property.area} m²</span>
                    </div>
                 </div>

                 <div className="mb-6">
                     <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                     <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line text-justify">
                        {property.description}
                     </p>
                 </div>
                 <hr className="border-gray-100 mb-6" />
                 
                 <h3 className="font-bold text-gray-900 mb-4">Property Features</h3>
                 <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <FeatureItem icon={Building2} label="Property type" value={property.propertyTypeName} />
                    <FeatureItem icon={Briefcase} label="Transaction type" value={property.transactionType} />
                    <FeatureItem icon={DollarSign} label="Price" value={`${property.priceAmount.toLocaleString()} VND`} />
                    <FeatureItem icon={BedDouble} label="Bedrooms" value={property.bedrooms} />
                    <FeatureItem icon={Maximize} label="Area" value={`${property.area} m²`} />
                    <FeatureItem icon={Layers} label="Floors" value={property.floors} />
                    <FeatureItem icon={DoorOpen} label="Rooms" value={property.rooms} />
                    <FeatureItem icon={Compass} label="House Orientation" value={property.houseOrientation || 'N/A'} />
                    <FeatureItem icon={Bath} label="Bathrooms" value={property.bathrooms} />
                    <FeatureItem icon={Compass} label="Balcony Orientation" value={property.balconyOrientation || 'N/A'} />
                 </div>
            </div>
        </div>
      </DetailLayout>

      {/* Bookings Modal */}
      <PropertyBookingsModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        propertyName={property.title} 
      />
    </div>
  );
}

function FeatureItem({ icon: Icon, label, value }: any) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-bold text-gray-900">{label}</span>
            </div>
            <span className="text-sm text-gray-500">{value ?? '-'}</span>
        </div>
    );
}