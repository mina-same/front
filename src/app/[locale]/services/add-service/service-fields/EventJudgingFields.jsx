
import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const EventJudgingFields = ({
  formData,
  handleNestedChange,
  handleChange,
  errors
}) => {
  // Make sure we're working with a properly initialized event judging object
  React.useEffect(() => {
    if (!formData.service_details.eventJudgingDetails) {
      handleNestedChange('eventJudgingDetails', '', {});
    }
  }, []);

  const eventJudgingDetails = formData.service_details.eventJudgingDetails || {};
  const eventTypes = eventJudgingDetails.eventTypes || [];
  
  const eventTypeOptions = [
    { id: 'show_jumping', label: 'Show Jumping' },
    { id: 'endurance_racing', label: 'Endurance Racing' },
    { id: 'horseback_riding_lessons', label: 'Horseback Riding Lessons' },
    { id: 'horse_breaking_training', label: 'Horse Breaking Training' },
    { id: 'speed_racing', label: 'Speed Racing' },
    { id: 'cross_country_jumping', label: 'Cross Country Jumping' },
    { id: 'other', label: 'Other' }
  ];
  
  const handleEventTypeChange = (eventType, isChecked) => {
    const updatedEventTypes = isChecked 
      ? [...(eventTypes || []), eventType] 
      : (eventTypes || []).filter(et => et !== eventType);
    
    handleNestedChange('eventJudgingDetails', 'eventTypes', updatedEventTypes);
  };
  
  return (
    <div className="space-y-6">
      <div className="relative">
        <label className="block text-sm font-medium mb-2">Event Types</label>
        <div className="border border-gray-300 rounded-xl p-4 space-y-3">
          {eventTypeOptions.map((eventType) => (
            <div key={eventType.id} className="flex items-center">
              <Checkbox
                id={`eventType-${eventType.id}`}
                checked={eventTypes?.includes(eventType.id)}
                onCheckedChange={(checked) => 
                  handleEventTypeChange(eventType.id, checked === true)
                }
                className="mr-2"
              />
              <label
                htmlFor={`eventType-${eventType.id}`}
                className="text-sm text-gray-700"
              >
                {eventType.label}
              </label>
            </div>
          ))}
        </div>
        {errors['eventJudgingDetails.eventTypes'] && (
          <p className="text-red-500 text-sm mt-1">{errors['eventJudgingDetails.eventTypes']}</p>
        )}
      </div>
      
      <div className="relative">
        <label className="block text-sm font-medium mb-1" htmlFor="judgingLevel">
          Judging Level
        </label>
        <select
          id="judgingLevel"
          value={eventJudgingDetails.judgingLevel || ''}
          onChange={(e) => handleNestedChange('eventJudgingDetails', 'judgingLevel', e.target.value)}
          className="w-full border-2 rounded-xl p-3 border-gray-300"
        >
          <option value="">Select Level</option>
          <option value="local">Local</option>
          <option value="national">National</option>
          <option value="international">International</option>
        </select>
      </div>
      
      <div className="relative">
        <label className="block text-sm font-medium mb-1" htmlFor="certifications">
          Certifications
        </label>
        <Input
          type="file"
          id="certifications"
          onChange={handleChange}
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          className="w-full border-2 rounded-xl p-3 border-gray-300"
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload your judging certifications. Accepted formats, DOC, JPG, PNG, GIF
        </p>
      </div>
    </div>
  );
};

export default EventJudgingFields;
