
import React from 'react';
import { Label } from "@/components/ui/label";

const ConsultingServicesFields = ({
  formData,
  handleNestedChange,
  errors,
  isRTL
}) => {
  // Make sure we're working with a properly initialized consulting services object
  React.useEffect(() => {
    if (!formData.service_details.consultingServicesDetails) {
      handleNestedChange('consultingServicesDetails', '', {});
    }
  }, [formData.service_details.consultingServicesDetails, handleNestedChange]);

  const inputClass = (errorField) => `
    w-full p-4 pt-3 pb-3 rounded-xl transition-all duration-200
    shadow-sm focus:shadow-md mt-2
    ${errors[errorField] 
      ? 'border-red-400 border-2 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
      : 'border border-gray-200 hover:border-gray-300 focus:border-gold focus:ring-1 focus:ring-gold/30'}
    focus:outline-none
  `;

  const labelClass = "text-xs font-medium text-black rounded-md";

  return (
    <div className="space-y-6">
      <div className="relative">
        <Label className={labelClass} htmlFor="certifications">
          Certifications
        </Label>
        <input
          type="file"
          id="certifications"
          onChange={(e) => {
            if (e.target.files) {
              handleNestedChange('consultingServicesDetails', 'certifications', e.target.files);
            }
          }}
          className={`${inputClass('certifications')} py-2`}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          multiple
        />
        <p className="text-xs text-gray-500 mt-1">
          Accepted formats, DOC, DOCX, JPG, JPEG, PNG, GIF
        </p>
      </div>
    </div>
  );
};

export default ConsultingServicesFields;
