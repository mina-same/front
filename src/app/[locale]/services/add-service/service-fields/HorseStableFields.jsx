
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const HorseStableFields = ({
  formData,
  handleNestedChange,
  handleNestedArrayChange,
  addNestedArrayItem,
  removeNestedArrayItem,
  handleChange,
  errors,
  isRTL
}) => {
  // Make sure we're working with a properly initialized horse_stable object
  React.useEffect(() => {
    if (!formData.service_details.horse_stable) {
      handleNestedChange('horse_stable', '', {});
    }
  }, []);

  const stableDetails = formData.service_details.horse_stable || {};
  const additionalBenefits = stableDetails.additionalBenefits || [];
  
  return (
    <div className="space-y-6">
      <div className="relative mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="stableDescription">
          Stable Description*
        </label>
        <Textarea
          id="stableDescription"
          value={stableDetails.stableDescription || ''}
          onChange={(e) => handleNestedChange('horse_stable', 'stableDescription', e.target.value)}
          placeholder="Describe your stable and its facilities..."
          className={`w-full border-2 rounded-xl p-3 ${errors['horse_stable.stableDescription'] ? 'border-red-500' : 'border-gray-300'}`}
          rows={4}
        />
        {errors['horse_stable.stableDescription'] && (
          <p className="text-red-500 text-sm mt-1">{errors['horse_stable.stableDescription']}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium mb-1" htmlFor="kindOfStable">
            Kind of Stable
          </label>
          <select
            id="kindOfStable"
            value={stableDetails.kindOfStable || ''}
            onChange={(e) => handleNestedChange('horse_stable', 'kindOfStable', e.target.value)}
            className="w-full border-2 rounded-xl p-3 border-gray-300"
          >
            <option value="">Select Kind</option>
            <option value="educational">Educational</option>
            <option value="entertainment">Entertainment</option>
            <option value="competitions">Competitions</option>
            <option value="events">Events</option>
          </select>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium mb-1" htmlFor="listingPurpose">
            Listing Purpose
          </label>
          <select
            id="listingPurpose"
            value={stableDetails.listingPurpose || ''}
            onChange={(e) => handleNestedChange('horse_stable', 'listingPurpose', e.target.value)}
            className="w-full border-2 rounded-xl p-3 border-gray-300"
          >
            <option value="">Select Purpose</option>
            <option value="for_sale">For Sale</option>
            <option value="for_rent">For Rent</option>
          </select>
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium mb-1" htmlFor="dateOfEstablishment">
          Date of Establishment
        </label>
        <Input
          type="date"
          id="dateOfEstablishment"
          value={stableDetails.dateOfEstablishment || ''}
          onChange={(e) => handleNestedChange('horse_stable', 'dateOfEstablishment', e.target.value)}
          className="w-full border-2 rounded-xl p-3 border-gray-300"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium">Additional Benefits</label>
        {additionalBenefits.map((benefit, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name (Arabic)</label>
              <Input
                value={benefit.name_ar || ''}
                onChange={(e) => handleNestedArrayChange('horse_stable.additionalBenefits', index, 'name_ar', e.target.value)}
                placeholder="Benefit name in Arabic"
                className="w-full border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name (English)</label>
              <Input
                value={benefit.name_en || ''}
                onChange={(e) => handleNestedArrayChange('horse_stable.additionalBenefits', index, 'name_en', e.target.value)}
                placeholder="Benefit name in English"
                className="w-full border rounded-lg"
              />
            </div>
            <div className="relative">
              <label className="block text-xs text-gray-500 mb-1">Additional Price</label>
              <Input
                type="number"
                value={benefit.additional_price || ''}
                onChange={(e) => handleNestedArrayChange('horse_stable.additionalBenefits', index, 'additional_price', e.target.value)}
                placeholder="0.00"
                className="w-full border rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeNestedArrayItem('horse_stable.additionalBenefits', index)}
                className="absolute right-0 top-7 text-red-500 p-2"
                aria-label="Remove benefit"
              >
                &times;
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addNestedArrayItem('horse_stable.additionalBenefits')}
          className="mt-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-sm flex items-center"
        >
          <span className="mr-1">+</span> Add Benefit
        </button>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium mb-1" htmlFor="licensesAndCertificates">
          Licenses & Certificates
        </label>
        <Input
          type="file"
          id="licensesAndCertificates"
          onChange={handleChange}
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          className="w-full border-2 rounded-xl p-3 border-gray-300"
        />
        <p className="text-xs text-gray-500 mt-1">
          Accepted formats, DOC, JPG, PNG, GIF
        </p>
      </div>
    </div>
  );
};

export default HorseStableFields;
