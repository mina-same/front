
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const HorseTrainerFields = ({
  formData,
  handleNestedChange,
  handleNestedArrayChange,
  addNestedArrayItem,
  removeNestedArrayItem,
  errors
}) => {
  // Make sure we're working with a properly initialized horse_trainer object
  React.useEffect(() => {
    if (!formData.service_details.horse_trainer) {
      handleNestedChange('horse_trainer', '', {});
    }
  }, [formData.service_details.horse_trainer, handleNestedChange]);

  const trainerDetails = formData.service_details.horse_trainer || {};
  const additionalServices = trainerDetails.additionalServices || [];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium mb-1" htmlFor="trainerLevel">
            Trainer Level
          </label>
          <select
            id="trainerLevel"
            value={trainerDetails.trainerLevel || ''}
            onChange={(e) => handleNestedChange('horse_trainer', 'trainerLevel', e.target.value)}
            className="w-full border-2 rounded-xl p-3 border-gray-300"
          >
            <option value="">Select Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        
        <div className="relative">
          <label className="block text-sm font-medium mb-1" htmlFor="specialization">
            Specialization
          </label>
          <select
            id="specialization"
            value={trainerDetails.specialization || ''}
            onChange={(e) => handleNestedChange('horse_trainer', 'specialization', e.target.value)}
            className="w-full border-2 rounded-xl p-3 border-gray-300"
          >
            <option value="">Select Specialization</option>
            <option value="show_jumping">Show Jumping</option>
            <option value="endurance_racing">Endurance Racing</option>
            <option value="horseback_riding_lessons">Horseback Riding Lessons</option>
            <option value="horse_breaking_training">Horse Breaking Training</option>
            <option value="speed_racing">Speed Racing</option>
            <option value="cross_country_jumping">Cross Country Jumping</option>
          </select>
        </div>
      </div>
      
      <div className="relative">
        <label className="block text-sm font-medium mb-1" htmlFor="yearsOfExperience">
          Years of Experience
        </label>
        <Input
          type="number"
          id="yearsOfExperience"
          min="0"
          value={trainerDetails.yearsOfExperience || ''}
          onChange={(e) => handleNestedChange('horse_trainer', 'yearsOfExperience', e.target.value)}
          className="w-full border-2 rounded-xl p-3 border-gray-300"
        />
      </div>
      
      <div className="relative">
        <label className="block text-sm font-medium mb-1" htmlFor="qualifications">
          Qualifications
        </label>
        <Textarea
          id="qualifications"
          value={trainerDetails.qualifications || ''}
          onChange={(e) => handleNestedChange('horse_trainer', 'qualifications', e.target.value)}
          placeholder="List your qualifications, certifications and achievements..."
          className="w-full border-2 rounded-xl p-3 border-gray-300"
          rows={4}
        />
      </div>
      
      <div className="space-y-4">
        <label className="block text-sm font-medium">Additional Services</label>
        {additionalServices.map((service, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name (Arabic)</label>
              <Input
                value={service.name_ar || ''}
                onChange={(e) => handleNestedArrayChange('horse_trainer.additionalServices', index, 'name_ar', e.target.value)}
                placeholder="Service name in Arabic"
                className="w-full border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name (English)</label>
              <Input
                value={service.name_en || ''}
                onChange={(e) => handleNestedArrayChange('horse_trainer.additionalServices', index, 'name_en', e.target.value)}
                placeholder="Service name in English"
                className="w-full border rounded-lg"
              />
            </div>
            <div className="relative">
              <label className="block text-xs text-gray-500 mb-1">Price</label>
              <Input
                type="number"
                value={service.price || ''}
                onChange={(e) => handleNestedArrayChange('horse_trainer.additionalServices', index, 'price', e.target.value)}
                placeholder="0.00"
                className="w-full border rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeNestedArrayItem('horse_trainer.additionalServices', index)}
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
          onClick={() => addNestedArrayItem('horse_trainer.additionalServices')}
          className="mt-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-sm flex items-center"
        >
          <span className="mr-1">+</span> Add Service
        </button>
      </div>
    </div>
  );
};

export default HorseTrainerFields;
