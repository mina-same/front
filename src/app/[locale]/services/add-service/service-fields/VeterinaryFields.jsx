import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const VeterinaryFields = ({
  formData,
  handleNestedChange,
  handleNestedArrayChange,
  addNestedArrayItem,
  removeNestedArrayItem,
  handleChange,
  errors,
  isRTL
}) => {
  // Make sure we're working with a properly initialized veterinary object
  React.useEffect(() => {
    if (!formData.service_details.VeterinaryDetails) {
      handleNestedChange('VeterinaryDetails', '', {});
    }
  }, [formData.service_details.VeterinaryDetails, handleNestedChange]);

  const veterinaryDetails = formData.service_details.VeterinaryDetails || {};
  const additionalServices = veterinaryDetails.additionalServices || [];
  const specialties = veterinaryDetails.specialties || [];
  
  const specialtyOptions = [
    { id: 'surgery', label: 'Surgery' },
    { id: 'general_medicine', label: 'General Medicine' },
    { id: 'dentistry', label: 'Dentistry' },
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'physical_therapy', label: 'Physical Therapy' }
  ];
  
  const handleSpecialtyChange = (specialty, isChecked) => {
    // Only store string IDs
    const updatedSpecialties = isChecked 
      ? [...(specialties || []), specialty] 
      : (specialties || []).filter(s => s !== specialty);
    handleNestedChange('VeterinaryDetails', 'specialties', updatedSpecialties);
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <label className="block text-sm font-medium mb-2">Specialties</label>
        <div className="border border-gray-300 rounded-xl p-4 space-y-3">
          {specialtyOptions.map((specialty) => (
            <div key={specialty.id} className="flex items-center">
              <Checkbox
                id={`specialty-${specialty.id}`}
                checked={specialties?.includes(specialty.id)}
                onCheckedChange={(checked) => 
                  handleSpecialtyChange(specialty.id, checked === true)
                }
                className="mr-2"
              />
              <label
                htmlFor={`specialty-${specialty.id}`}
                className="text-sm text-gray-700"
              >
                {specialty.label}
              </label>
            </div>
          ))}
        </div>
        {errors['VeterinaryDetails.specialties'] && (
          <p className="text-red-500 text-sm mt-1">{errors['VeterinaryDetails.specialties']}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium mb-1" htmlFor="licenseNumber">
            License Number
          </label>
          <Input
            id="licenseNumber"
            value={(veterinaryDetails.professionalLicense?.licenseNumber) || ''}
            onChange={(e) => handleNestedChange('VeterinaryDetails.professionalLicense', 'licenseNumber', e.target.value)}
            className="w-full border-2 rounded-xl p-3 border-gray-300"
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-medium mb-1" htmlFor="licenseDate">
            License Date
          </label>
          <Input
            type="date"
            id="licenseDate"
            value={(veterinaryDetails.professionalLicense?.licenseDate) || ''}
            onChange={(e) => handleNestedChange('VeterinaryDetails.professionalLicense', 'licenseDate', e.target.value)}
            className="w-full border-2 rounded-xl p-3 border-gray-300"
          />
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium mb-1" htmlFor="graduationCertificate">
          Graduation/Accreditation Certificate
        </label>
        <Input
          type="file"
          id="graduationCertificate"
          onChange={handleChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          className="w-full border-2 rounded-xl p-3 border-gray-300"
        />
        <p className="text-xs text-gray-500 mt-1">
          Accepted formats, DOC, JPG, PNG, GIF
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium">Additional Services</label>
        {additionalServices.map((service, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name (Arabic)</label>
              <Input
                value={service.name_ar || ''}
                onChange={(e) => handleNestedArrayChange('VeterinaryDetails.additionalServices', index, 'name_ar', e.target.value)}
                placeholder="Service name in Arabic"
                className="w-full border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name (English)</label>
              <Input
                value={service.name_en || ''}
                onChange={(e) => handleNestedArrayChange('VeterinaryDetails.additionalServices', index, 'name_en', e.target.value)}
                placeholder="Service name in English"
                className="w-full border rounded-lg"
              />
            </div>
            <div className="relative">
              <label className="block text-xs text-gray-500 mb-1">Additional Price</label>
              <Input
                type="number"
                value={service.additional_price || ''}
                onChange={(e) => handleNestedArrayChange('VeterinaryDetails.additionalServices', index, 'additional_price', e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="0.00"
                className="w-full border rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeNestedArrayItem('VeterinaryDetails.additionalServices', index)}
                className="absolute right-0 top-7 text-red-500 p-2"
                aria-label="Remove service"
              >
                &times;
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addNestedArrayItem('VeterinaryDetails.additionalServices')}
          className="mt-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-sm flex items-center"
        >
          <span className="mr-1">+</span> Add Service
        </button>
      </div>
    </div>
  );
};

export default VeterinaryFields;
