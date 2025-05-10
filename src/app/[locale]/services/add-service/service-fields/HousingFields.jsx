
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

const HousingFields = ({
  formData,
  handleNestedChange,
  errors
}) => {
  // Make sure we're working with a properly initialized housing object
  React.useEffect(() => {
    if (!formData.service_details.housingDetails) {
      handleNestedChange('housingDetails', '', {});
    }
  }, []);

  const housingDetails = formData.service_details.housingDetails || {};
  
  return (
    <div className="space-y-6">
      <div className="relative mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="accommodationType">
          Accommodation Type
        </label>
        <select
          id="accommodationType"
          value={housingDetails.accommodationType || ''}
          onChange={(e) => handleNestedChange('housingDetails', 'accommodationType', e.target.value)}
          className={`w-full border-2 rounded-xl p-3 ${errors['housingDetails.accommodationType'] ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="">Select Accommodation Type</option>
          <option value="moving_housing">Moving Housing</option>
          <option value="caravan">Caravan</option>
          <option value="apartment">Apartment</option>
        </select>
        {errors['housingDetails.accommodationType'] && (
          <p className="text-red-500 text-sm mt-1">{errors['housingDetails.accommodationType']}</p>
        )}
      </div>
      
      <div className="relative mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="housingDetails">
          Housing Details
        </label>
        <Textarea
          id="housingDetails"
          value={housingDetails.housingDetails || ''}
          onChange={(e) => handleNestedChange('housingDetails', 'housingDetails', e.target.value)}
          placeholder="Describe the housing facilities and services..."
          className={`w-full border-2 rounded-xl p-3 ${errors['housingDetails.housingDetails'] ? 'border-red-500' : 'border-gray-300'}`}
          rows={6}
        />
        {errors['housingDetails.housingDetails'] && (
          <p className="text-red-500 text-sm mt-1">{errors['housingDetails.housingDetails']}</p>
        )}
      </div>
    </div>
  );
};

export default HousingFields;
