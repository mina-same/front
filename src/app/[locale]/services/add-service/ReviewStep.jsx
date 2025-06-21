'use client';

import { FaClipboardList, FaInfoCircle, FaAlignLeft, FaMapMarkerAlt, FaCog, FaImages, FaLink, FaPhone, FaEnvelope, FaGlobe, FaMap, FaClock, FaCalendarAlt, FaTag, FaCheck, FaTimes } from 'react-icons/fa';

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1">
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className="text-sm text-gray-900 mt-0.5">{value || '-'}</div>
    </div>
  </div>
);

const ReviewStep = ({ formData }) => {
  // Helper to build location string
  const getLocation = () => {
    const parts = [formData.country, formData.governorate, formData.city, formData.address_details];
    return parts.filter(Boolean).join(", ") || "-";
  };

  // Helper to get name
  const getName = () => {
    if (formData.name_en && formData.name_ar) {
      return `${formData.name_en} / ${formData.name_ar}`;
    }
    return formData.name_en || formData.name_ar || "-";
  };

  // Helper to get about/overview
  const getOverview = () => {
    if (formData.about_en && formData.about_ar) {
      return `${formData.about_en} / ${formData.about_ar}`;
    }
    return formData.about_en || formData.about_ar || "-";
  };

  // Helper to get past experience
  const getPastExperience = () => {
    if (formData.past_experience_en && formData.past_experience_ar) {
      return `${formData.past_experience_en} / ${formData.past_experience_ar}`;
    }
    return formData.past_experience_en || formData.past_experience_ar || "-";
  };

  // Helper to get price with unit
  const getPrice = () => {
    if (!formData.price) return "-";
    return `${formData.price} ${formData.priceUnit || ''}`.trim();
  };

  // Helper to get social links
  const getSocialLinks = () => {
    if (!formData.social_links || !Array.isArray(formData.social_links)) return [];
    return formData.social_links.filter(link => link && link.url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <FaClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Service Management</h3>
              <p className="text-sm text-gray-500">Service type and category</p>
            </div>
          </div>
          <div className="space-y-4">
            <InfoRow 
              label="Service Type" 
              value={formData.service_type || "-"} 
              icon={FaTag} 
            />
            <InfoRow 
              label="Category" 
              value={formData.category || "-"} 
              icon={FaCheck} 
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <FaInfoCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <p className="text-sm text-gray-500">Service name and overview</p>
            </div>
          </div>
          <div className="space-y-4">
            <InfoRow 
              label="Service Name" 
              value={getName()} 
              icon={FaTag} 
            />
            <InfoRow 
              label="Overview" 
              value={getOverview()} 
              icon={FaInfoCircle} 
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <FaAlignLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              <p className="text-sm text-gray-500">Detailed service description</p>
            </div>
          </div>
          <div className="prose prose-sm max-w-none">
            <div className="text-sm text-gray-900 whitespace-pre-wrap">
              {getPastExperience()}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <FaMapMarkerAlt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Contact & Location</h3>
              <p className="text-sm text-gray-500">Contact information and service location</p>
            </div>
          </div>
          <div className="space-y-4">
            <InfoRow 
              label="Phone" 
              value={formData.servicePhone || "-"} 
              icon={FaPhone} 
            />
            <InfoRow 
              label="Email" 
              value={formData.serviceEmail || "-"} 
              icon={FaEnvelope} 
            />
            <InfoRow 
              label="Website" 
              value={formData.address_link || "-"} 
              icon={FaGlobe} 
            />
            <InfoRow 
              label="Location" 
              value={getLocation()} 
              icon={FaMap} 
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <FaCog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Service Details</h3>
              <p className="text-sm text-gray-500">Service specifications and availability</p>
            </div>
          </div>
          <div className="space-y-4">
            <InfoRow 
              label="Price" 
              value={getPrice()} 
              icon={FaTag} 
            />
            {/* Add more details as needed from service_details */}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <FaImages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Media & Links</h3>
              <p className="text-sm text-gray-500">Images and social media links</p>
            </div>
          </div>
          <div className="space-y-4">
            {formData.images?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  image && (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image}
                        alt={`Service image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No images uploaded</div>
            )}
            {getSocialLinks().length > 0 && (
              <div className="space-y-2">
                {getSocialLinks().map((link, index) => (
                  <InfoRow 
                    key={index}
                    label={`Social Link ${index + 1}`}
                    value={link.url}
                    icon={FaLink}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Review Your Information</h4>
            <p className="text-sm text-blue-700 mt-1">
              Please review all the information above carefully. Once you submit, you can still edit your service details later from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep; 