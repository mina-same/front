import React from 'react';
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';

export const ReviewStep = ({ formData, getServiceTypeLabel, getPriceUnitLabel }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review Your Service</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium">Service Management</h4>
          <p>
            <span className="font-semibold">Type:</span>{" "}
            {formData.serviceManagementType === "fulltime" ? "Full-time (Stable-Managed)" : "Freelancer"}
          </p>
        </div>

        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium">Basic Information</h4>
          <p>
            <span className="font-semibold">Name (English):</span>{" "}
            {formData.name_en}
          </p>
          <p>
            <span className="font-semibold">Name (Arabic):</span>{" "}
            {formData.name_ar}
          </p>
          <p>
            <span className="font-semibold">Years of Experience:</span>{" "}
            {formData.years_of_experience}
          </p>
        </div>

        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium">Description</h4>
          <div>
            <span className="font-semibold">About (English):</span>
            <p className="mt-1 text-sm">{formData.about_en}</p>
          </div>
          <div>
            <span className="font-semibold">About (Arabic):</span>
            <p className="mt-1 text-sm" dir="rtl">{formData.about_ar}</p>
          </div>
        </div>

        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium">Contact & Location</h4>
          <p>
            <span className="font-semibold">Phone:</span> {formData.servicePhone}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {formData.serviceEmail}
          </p>
          <p>
            <span className="font-semibold">Address:</span> {formData.address_details}
          </p>
        </div>

        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium">Service Details</h4>
          <p>
            <span className="font-semibold">Service Type:</span>{" "}
            {getServiceTypeLabel(formData.service_type)}
          </p>
          <p>
            <span className="font-semibold">Price:</span>{" "}
            {formData.price} {getPriceUnitLabel(formData.priceUnit)}
          </p>
        </div>

        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium">Media</h4>
          <p>
            <span className="font-semibold">Images:</span>{" "}
            {formData.images?.length || 0} uploaded
          </p>
          <div>
            <span className="font-semibold">Social Links:</span>
            <ul className="mt-1 text-sm space-y-1">
              {formData.social_links.map((link, index) => (
                link.url && (
                  <li key={index}>
                    {link.linkType}: {link.url}
                  </li>
                )
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <span className="font-semibold">Note:</span> Please review all information carefully before submitting. Once submitted, your service will be reviewed by our team before being published.
        </p>
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
