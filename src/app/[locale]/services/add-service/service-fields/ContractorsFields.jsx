import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ContractorsFields = ({
  formData,
  handleNestedChange,
  errors,
  isRTL
}) => {
  // Make sure we're working with a properly initialized contractors object
  React.useEffect(() => {
    if (!formData.service_details.contractorsDetails) {
      handleNestedChange('contractorsDetails', '', {});
    }
  }, []);

  const contractorsDetails = formData.service_details.contractorsDetails || {};
  const serviceTypes = contractorsDetails.serviceTypes || [];
  const portfolioLink = contractorsDetails.portfolioLink || {};

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

  const updatePortfolioLink = (field, value) => {
    handleNestedChange('contractorsDetails', 'portfolioLink', {
      ...portfolioLink,
      [field]: value
    });
  };

  const handleServiceTypeChange = (type, checked) => {
    const updatedTypes = checked
      ? [...serviceTypes, type]
      : serviceTypes.filter(t => t !== type);
    
    handleNestedChange('contractorsDetails', 'serviceTypes', updatedTypes);
  };

  const serviceTypeOptions = [
    { value: 'barn_construction', label: 'Barn Construction' },
    { value: 'fence_installation', label: 'Fence Installation' },
    { value: 'arena_construction', label: 'Arena Construction' },
    { value: 'stable_maintenance', label: 'Stable Maintenance' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-6">
      <div className="relative">
        <Label className={labelClass} htmlFor="contractorsDetails.serviceTypes">
          Service Types*
        </Label>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
          {serviceTypeOptions.map((type) => (
            <div key={type.value} className="flex items-center">
              <input
                id={`service-type-${type.value}`}
                type="checkbox"
                checked={serviceTypes.includes(type.value)}
                onChange={(e) => handleServiceTypeChange(type.value, e.target.checked)}
                className={checkboxClass}
              />
              <label htmlFor={`service-type-${type.value}`} className="ml-2 block text-sm text-gray-700">
                {type.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="font-medium text-sm mb-4">Portfolio Link</h3>
        
        <div className="space-y-4">
          <div>
            <Label className={labelClass} htmlFor="portfolioLink-url">
              URL*
            </Label>
            <input
              id="portfolioLink-url"
              type="url"
              value={portfolioLink.url || ""}
              onChange={(e) => updatePortfolioLink('url', e.target.value)}
              className={inputClass('contractorsDetails.portfolioLink.url')}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label className={labelClass} htmlFor="portfolioLink-description_ar">
              Description (Arabic)
            </Label>
            <Textarea
              id="portfolioLink-description_ar"
              value={portfolioLink.description_ar || ""}
              onChange={(e) => updatePortfolioLink('description_ar', e.target.value)}
              className={inputClass('contractorsDetails.portfolioLink.description_ar')}
              dir="rtl"
              placeholder="وصف الرابط"
            />
          </div>
          <div>
            <Label className={labelClass} htmlFor="portfolioLink-description_en">
              Description (English)
            </Label>
            <Textarea
              id="portfolioLink-description_en"
              value={portfolioLink.description_en || ""}
              onChange={(e) => updatePortfolioLink('description_en', e.target.value)}
              className={inputClass('contractorsDetails.portfolioLink.description_en')}
              placeholder="Link description"
            />
          </div>
        </div>
      </div>

      <div className="relative">
        <Label className={labelClass} htmlFor="certifications">
          Certifications
        </Label>
        <input
          type="file"
          id="certifications"
          onChange={(e) => {
            if (e.target.files) {
              handleNestedChange('contractorsDetails', 'certifications', e.target.files);
            }
          }}
          className={`${inputClass('certifications')} py-2`}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          multiple
        />
        <p className="text-xs text-gray-500 mt-1">
          Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF
        </p>
      </div>
    </div>
  );
};

export default ContractorsFields;
