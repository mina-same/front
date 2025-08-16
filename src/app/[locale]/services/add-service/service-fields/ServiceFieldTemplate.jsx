import React from 'react';
import { Label } from "@/components/ui/label";

const ServiceFieldTemplate = ({
  formData,
  handleNestedChange,
  errors,
  isRTL
}) => {
  // Make sure we're working with a properly initialized template object
  React.useEffect(() => {
    if (!formData.service_details.templateDetails) {
      handleNestedChange('templateDetails', '', {});
    }
  }, [formData.service_details.templateDetails, handleNestedChange]);

  const templateDetails = formData.service_details.templateDetails || {};
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Template Information</h3>
        
        <div className="space-y-4">
          <div className="relative">
            <Label className="block text-sm font-medium mb-1" htmlFor="field1">
              Field 1
            </Label>
            <input
              id="field1"
              type="text"
              value={templateDetails.field1 || ''}
              onChange={(e) => handleNestedChange('templateDetails', 'field1', e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 hover:border-gray-300 focus:border-gold focus:outline-none"
              dir={isRTL ? "rtl" : "ltr"}
            />
            {errors.templateDetails?.field1 && (
              <p className="text-red-500 text-sm mt-1">{errors.templateDetails.field1}</p>
            )}
          </div>
          
          <div className="relative">
            <Label className="block text-sm font-medium mb-1" htmlFor="field2">
              Field 2
            </Label>
            <input
              id="field2"
              type="text"
              value={templateDetails.field2 || ''}
              onChange={(e) => handleNestedChange('templateDetails', 'field2', e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 hover:border-gray-300 focus:border-gold focus:outline-none"
              dir={isRTL ? "rtl" : "ltr"}
            />
            {errors.templateDetails?.field2 && (
              <p className="text-red-500 text-sm mt-1">{errors.templateDetails.field2}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceFieldTemplate;