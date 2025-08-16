import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const HorseTransportFields = ({
  formData,
  handleNestedChange,
  errors,
  isRTL
}) => {
  // Initialize transportDetails if not present
  React.useEffect(() => {
    if (!formData.service_details.transportDetails) {
      handleNestedChange('transportDetails', '', {});
    }
  }, [formData.service_details.transportDetails, handleNestedChange]);

  const transportDetails = formData.service_details.transportDetails || {};

  const inputClass = (errorField) => `
    w-full p-4 pt-3 pb-3 rounded-xl transition-all duration-200
    shadow-sm focus:shadow-md mt-2
    ${errors[errorField] 
      ? 'border-red-400 border-2 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
      : 'border border-gray-200 hover:border-gray-300 focus:border-gold focus:ring-1 focus:ring-gold/30'}
    focus:outline-none
  `;

  const labelClass = "text-xs font-medium text-black rounded-md";
  const checkboxClass = "h-4 w-4 text-gold focus:ring-gold/30 border-gray-300 rounded";

  const features = [
    { key: 'suspensionSystem', label: 'Suspension System' },
    { key: 'ventilationAndLighting', label: 'Ventilation & Lighting' },
    { key: 'internalBarriers', label: 'Internal Barriers' },
    { key: 'advancedVentilation', label: 'Advanced Ventilation' },
    { key: 'wallUpholstery', label: 'Wall Upholstery' },
    { key: 'horseInsurance', label: 'Horse Insurance' },
    { key: 'waterAndFood', label: 'Water & Food' },
    { key: 'emergencyVetServices', label: 'Emergency Veterinary Services' },
  ];

  return (
    <div className="space-y-6">
      <div className="relative">
        <Label className={labelClass} htmlFor="transportDetails.maxLoad">
          Maximum Load Capacity* (horses)
        </Label>
        <input
          id="transportDetails.maxLoad"
          type="number"
          value={transportDetails.maxLoad || ""}
          onChange={(e) => handleNestedChange('transportDetails', 'maxLoad', parseInt(e.target.value) || '')}
          className={inputClass('transportDetails.maxLoad')}
          placeholder="Number of horses"
          min="1"
        />
      </div>

      <div className="relative">
        <Label className={labelClass} htmlFor="transportDetails.features">
          Transport Features
        </Label>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((feature) => (
            <div key={feature.key} className="flex items-center">
              <input
                id={`feature-${feature.key}`}
                type="checkbox"
                checked={!!transportDetails[feature.key]}
                onChange={(e) => handleNestedChange('transportDetails', feature.key, e.target.checked)}
                className={checkboxClass} // Fixed: Use checkboxClass instead of handleNestedChange
              />
              <label htmlFor={`feature-${feature.key}`} className="ml-2 block text-sm text-gray-700">
                {feature.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <Label className={labelClass} htmlFor="transportDetails.experienceYears">
          Years of Experience in Transport*
        </Label>
        <input
          id="transportDetails.experienceYears"
          type="number"
          value={transportDetails.experienceYears || ""}
          onChange={(e) => handleNestedChange('transportDetails', 'experienceYears', parseInt(e.target.value) || '')}
          className={inputClass('transportDetails.experienceYears')}
          placeholder="Years of experience"
          min="0"
        />
      </div>

      <div className="relative">
        <Label className={labelClass} htmlFor="certifications">
          Certifications & Licenses
        </Label>
        <input
          type="file"
          id="certifications"
          onChange={(e) => {
            if (e.target.files) {
              handleNestedChange('transportDetails', 'certifications', Array.from(e.target.files));
            }
          }}
          className={`${inputClass('certifications')} py-2`}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          multiple
        />
        <p className="text-xs text-gray-500 mt-1">
          Accepted formats: DOC, DOCX, JPG, JPEG, PNG, GIF
        </p>
      </div>

      <div className="relative">
        <Label className={labelClass} htmlFor="transportDetails.relevantLicenses">
          Relevant Licenses & Permits
        </Label>
        <Textarea
          id="transportDetails.relevantLicenses"
          value={transportDetails.relevantLicenses || ""}
          onChange={(e) => handleNestedChange('transportDetails', 'relevantLicenses', e.target.value)}
          className={inputClass('transportDetails.relevantLicenses')}
          placeholder="List all relevant licenses and permits"
          rows={3}
        />
      </div>

      <div className="relative">
        <Label className={labelClass} htmlFor="transportDetails.termsAndPolicies">
          Terms & Policies
        </Label>
        <Textarea
          id="transportDetails.termsAndPolicies"
          value={transportDetails.termsAndPolicies || ""}
          onChange={(e) => handleNestedChange('transportDetails', 'termsAndPolicies', e.target.value)}
          className={inputClass('transportDetails.termsAndPolicies')}
          placeholder="Describe your transport terms and policies"
          rows={4}
        />
      </div>
    </div>
  );
};

export default HorseTransportFields;