import React from 'react';
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';

export const ReviewStep = ({ 
  formData, 
  getServiceTypeLabel, 
  getPriceUnitLabel,
  additionalImagePreviews,
  imagePreview
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Review Your Service</h2>
      <p className="text-muted-foreground">
        Please review your service details before submitting
      </p>
      
      <div className="space-y-8">
        <Section title="Basic Information">
          <InfoRow label="Name (English)" value={formData.name_en} />
          <InfoRow label="Name (Arabic)" value={formData.name_ar} />
          <InfoRow label="Years of Experience" value={formData.years_of_experience} />
        </Section>

        <Section title="Description">
          <InfoRow label="About (English)" value={formData.about_en} />
          <InfoRow label="About (Arabic)" value={formData.about_ar} />
          <InfoRow label="Past Experience (English)" value={formData.past_experience_en} />
          <InfoRow label="Past Experience (Arabic)" value={formData.past_experience_ar} />
        </Section>

        <Section title="Contact & Location">
          <InfoRow label="Phone" value={formData.servicePhone} />
          <InfoRow label="Email" value={formData.serviceEmail} />
          <InfoRow label="Address Details" value={formData.address_details} />
        </Section>

        <Section title="Service Details">
          <InfoRow label="Service Type" value={getServiceTypeLabel(formData.service_type)} />
          <InfoRow label="Price" value={`${formData.price} ${getPriceUnitLabel(formData.priceUnit)}`} />
        </Section>

        <Section title="Media">
          {/* Profile Image */}
          <div>
            <h3 className="text-sm font-medium mb-2">Profile Image</h3>
            {imagePreview ? (
              <div className="w-32 h-32 rounded border overflow-hidden mb-4">
                <Image
                  fill
                  src={imagePreview} 
                  alt="Profile image" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground mb-4">No profile image added</div>
            )}
          </div>
          
          {/* Additional Images */}
          <div>
            <h3 className="text-sm font-medium mb-2">Additional Images</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {additionalImagePreviews && additionalImagePreviews.map((url, index) => (
                <div 
                  key={index}
                  className="aspect-square rounded border overflow-hidden"
                >
                  <Image
                    fill
                    src={url} 
                    alt={`Service image ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {(!additionalImagePreviews || additionalImagePreviews.length === 0) && (
                <div className="text-sm text-muted-foreground">No additional images added</div>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Links</h3>
            <div className="space-y-1">
              {formData.social_links.filter(link => link.url.trim() !== '').map((link, index) => (
                <div key={index} className="text-sm flex items-center gap-2">
                  <span className="capitalize font-medium">{link.linkType}:</span> 
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                    {link.url}
                  </a>
                </div>
              ))}
              {formData.social_links.filter(link => link.url.trim() !== '').length === 0 && (
                <div className="text-sm text-muted-foreground">No links added</div>
              )}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};

const Section = ({title, children}) => (
  <div>
    <h3 className="font-semibold text-lg mb-3">{title}</h3>
    <div className="bg-gray-50 rounded-md p-4 space-y-3">
      {children}
    </div>
  </div>
);

const InfoRow = ({label, value}) => (
  <div>
    <div className="text-sm font-medium text-gray-500">{label}</div>
    <div className="mt-1">{value || <span className="text-muted-foreground text-sm">Not provided</span>}</div>
    <Separator className="mt-2" />
  </div>
);
