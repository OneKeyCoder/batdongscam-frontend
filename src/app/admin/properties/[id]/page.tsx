'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation'; // Import router
import { 
    ChevronLeft, ChevronRight, MapPin, Share2, Loader2, Calendar,
    Building2, DollarSign, Maximize, DoorOpen, Bath, Briefcase, BedDouble, Layers, Compass
} from 'lucide-react';
import DetailLayout from '@/app/components/DetailLayout';
import ContactCard from '@/app/components/features/admin/properties/details/ContactCard'; 
import DocumentList from '@/app/components/features/admin/properties/details/DocumentList';
import { propertyService, PropertyDetails } from '@/lib/api/services/property.service';
import apiClient from '@/lib/api/client'; // Dùng client để gọi remove
import { getFullUrl } from '@/lib/utils/urlUtils';

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch Data
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

  // Handle Remove Agent (API Thật)
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
                        <button 
                            onClick={handleGoToSelectAgent}
                            className="text-sm font-bold text-red-600 hover:underline"
                        >
                            + Assign Agent
                        </button>
                    </div>
                )}

                <DocumentList 
                    documents={property.documentList.map((doc, idx) => ({
                        id: idx,
                        name: doc.filePath.split('/').pop() || `Document ${idx + 1}`,
                        type: doc.documentType,
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
            </div>

            {/* Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                 <div className="flex justify-between items-start mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
                        <Calendar className="w-4 h-4" /> View Bookings
                    </button>
                 </div>
                 <p className="text-gray-500 text-sm mb-4">{property.fullAddress}</p>
                 <hr className="border-gray-100 mb-4" />
                 
                 {/* ... Stats & Description ... */}
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
                 
                 <hr className="border-gray-100 my-6" />
                 
                 <div className="flex gap-12 text-xs text-gray-500">
                    <div>
                        <p className="mb-1">Created day</p>
                        <p className="font-bold text-gray-900">{new Date(property.createdAt).toLocaleString('en-GB')}</p>
                    </div>
                    <div>
                        <p className="mb-1">Last updated day</p>
                        <p className="font-bold text-gray-900">{new Date(property.updatedAt).toLocaleString('en-GB')}</p>
                    </div>
                 </div>
            </div>
        </div>
      </DetailLayout>
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