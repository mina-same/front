import React from 'react';
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';
import { CheckCircle2, AlertCircle, Globe, Phone, Mail, MapPin, Clock, DollarSign, Image as ImageIcon, Link2 } from 'lucide-react';

export const ReviewStep = ({ formData, getServiceTypeLabel, getPriceUnitLabel }) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Review Your Service</h3>
        <p className="text-gray-500">Please review all information before submitting your service</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Management */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <h4 className="font-semibold">Service Management</h4>
          </div>
          <div className="p-4">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">Management Type</div>
                <div className="mt-1 text-sm">
                  {formData.serviceManagementType === "fulltime" ? "Full-time (Stable-Managed)" : "Freelancer"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <h4 className="font-semibold">Basic Information</h4>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">Name (English)</div>
                <div className="mt-1 text-sm">{formData.name_en}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">Name (Arabic)</div>
                <div className="mt-1 text-sm" dir="rtl">{formData.name_ar}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">Years of Experience</div>
                <div className="mt-1 text-sm">{formData.years_of_experience}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <h4 className="font-semibold">Description</h4>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">About (English)</div>
              <div className="text-sm bg-gray-50 p-3 rounded-md">{formData.about_en}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">About (Arabic)</div>
              <div className="text-sm bg-gray-50 p-3 rounded-md" dir="rtl">{formData.about_ar}</div>
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <h4 className="font-semibold">Contact & Location</h4>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">Phone</div>
                <div className="mt-1 text-sm">{formData.servicePhone}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">Email</div>
                <div className="mt-1 text-sm">{formData.serviceEmail}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">Address</div>
                <div className="mt-1 text-sm">{formData.address_details}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <h4 className="font-semibold">Service Details</h4>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">Service Type</div>
                <div className="mt-1 text-sm">{getServiceTypeLabel(formData.service_type)}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">Price</div>
                <div className="mt-1 text-sm">{formData.price} {getPriceUnitLabel(formData.priceUnit)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Media & Links */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            <h4 className="font-semibold">Media & Links</h4>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">Images</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {formData.images?.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                    <Image
                      src={image}
                      alt={`Service image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">Social Links</div>
              <div className="space-y-2">
                {formData.social_links.map((link, index) => (
                  link.url && (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Link2 className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{link.linkType}:</span>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {link.url}
                      </a>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-900">Important Information</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• All information will be publicly visible once approved</li>
              <li>• Your service will be reviewed by our team within 24-48 hours</li>
              <li>• You can edit your service details after submission</li>
              <li>• Make sure all contact information is accurate</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}; 