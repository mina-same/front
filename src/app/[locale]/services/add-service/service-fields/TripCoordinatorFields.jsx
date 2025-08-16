import React from 'react';
import { Label } from "@/components/ui/label";
import { ScrollArea } from '@/components/ui/scroll-area';

const TripCoordinatorFields = ({
  formData,
  handleNestedChange,
  handleNestedArrayChange,
  addNestedArrayItem,
  removeNestedArrayItem,
  errors,
  isRTL = false,
}) => {
  // Make sure we're working with a properly initialized trip coordinator object
  React.useEffect(() => {
    if (!formData.service_details.tripCoordinator) {
      handleNestedChange('tripCoordinator', '', {});
    }
  }, [formData.service_details.tripCoordinator, handleNestedChange]);

  const meals = formData.service_details?.tripCoordinator?.meals || [];
  const labelClass = "absolute -top-2.5 left-4 bg-white px-2 text-xs font-medium text-black rounded-md";
  const inputClass = "w-full p-4 rounded-xl border border-gray-200 hover:border-gray-300 focus:border-gold focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Trip Coordination Details</h3>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Label className={labelClass}>
                Location of Horses
              </Label>
              <input
                type="text"
                value={formData.service_details?.tripCoordinator?.locationOfHorses || ""}
                onChange={(e) => handleNestedChange('tripCoordinator', 'locationOfHorses', e.target.value)}
                className={inputClass}
              />
            </div>
            
            <div className="relative">
              <Label className={labelClass}>
                Location of Tent
              </Label>
              <input
                type="text"
                value={formData.service_details?.tripCoordinator?.locationOfTent || ""}
                onChange={(e) => handleNestedChange('tripCoordinator', 'locationOfTent', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Label className={labelClass}>
                Start Date
              </Label>
              <input
                type="date"
                value={formData.service_details?.tripCoordinator?.startDate || ""}
                onChange={(e) => handleNestedChange('tripCoordinator', 'startDate', e.target.value)}
                className={inputClass}
              />
            </div>
            
            <div className="relative">
              <Label className={labelClass}>
                End Date
              </Label>
              <input
                type="date"
                value={formData.service_details?.tripCoordinator?.endDate || ""}
                onChange={(e) => handleNestedChange('tripCoordinator', 'endDate', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          
          <div className="relative">
            <Label className={labelClass}>
              Break Times
            </Label>
            <input
              type="text"
              value={formData.service_details?.tripCoordinator?.breakTimes || ""}
              onChange={(e) => handleNestedChange('tripCoordinator', 'breakTimes', e.target.value)}
              className={inputClass}
              placeholder="e.g., 10:00 AM, 2:00 PM, 6:00 PM"
            />
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Meals</h4>
            <ScrollArea className="h-auto max-h-[300px] pr-4">
              {meals.length > 0 ? (
                <div className="space-y-4">
                  {meals.map((meal, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="relative">
                        <Label className={labelClass}>
                          Meal Name (Arabic)
                        </Label>
                        <input
                          type="text"
                          value={meal.name_ar || ""}
                          onChange={(e) => handleNestedArrayChange('tripCoordinator', index, 'name_ar', e.target.value)}
                          className={inputClass}
                          dir={isRTL ? "rtl" : "ltr"}
                        />
                      </div>
                      
                      <div className="relative">
                        <Label className={labelClass}>
                          Meal Name (English)
                        </Label>
                        <input
                          type="text"
                          value={meal.name_en || ""}
                          onChange={(e) => handleNestedArrayChange('tripCoordinator', index, 'name_en', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeNestedArrayItem('tripCoordinator', index)}
                        className="md:col-span-2 text-sm text-red-500 hover:text-red-700 mt-2"
                      >
                        Remove Meal
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No meals added yet. Add your first meal below.</p>
              )}
            </ScrollArea>
            
            <button
              type="button"
              onClick={() => addNestedArrayItem('tripCoordinator.meals')}
              className="mt-4 px-4 py-2 bg-gold/10 text-gold hover:bg-gold/20 rounded-lg text-sm font-medium transition-colors"
            >
              + Add Meal
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="containsAidBag"
              checked={formData.service_details?.tripCoordinator?.containsAidBag || false}
              onChange={(e) => handleNestedChange('tripCoordinator', 'containsAidBag', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
            />
            <Label htmlFor="containsAidBag" className="text-sm">
              First Aid Kit Provided
            </Label>
          </div>
          
          <div className="relative">
            <Label className={labelClass}>
              Activities
            </Label>
            <textarea
              value={formData.service_details?.tripCoordinator?.activities || ""}
              onChange={(e) => handleNestedChange('tripCoordinator', 'activities', e.target.value)}
              className={`${inputClass} resize-none`}
              rows={4}
              placeholder="Describe the activities planned for the trip"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <Label className={labelClass}>
                Price for Family of 2
              </Label>
              <input
                type="number"
                min="0"
                value={formData.service_details?.tripCoordinator?.priceForFamilyOf2 || ""}
                onChange={(e) => handleNestedChange('tripCoordinator', 'priceForFamilyOf2', e.target.value)}
                className={inputClass}
              />
            </div>
            
            <div className="relative">
              <Label className={labelClass}>
                Price for Family of 3
              </Label>
              <input
                type="number"
                min="0"
                value={formData.service_details?.tripCoordinator?.priceForFamilyOf3 || ""}
                onChange={(e) => handleNestedChange('tripCoordinator', 'priceForFamilyOf3', e.target.value)}
                className={inputClass}
              />
            </div>
            
            <div className="relative">
              <Label className={labelClass}>
                Price for Family of 4
              </Label>
              <input
                type="number"
                min="0"
                value={formData.service_details?.tripCoordinator?.priceForFamilyOf4 || ""}
                onChange={(e) => handleNestedChange('tripCoordinator', 'priceForFamilyOf4', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          
          <div className="relative">
            <Label className={labelClass}>
              Trip Program
            </Label>
            <textarea
              value={formData.service_details?.tripCoordinator?.tripProgram || ""}
              onChange={(e) => handleNestedChange('tripCoordinator', 'tripProgram', e.target.value)}
              className={`${inputClass} resize-none`}
              rows={4}
              placeholder="Detailed trip itinerary and schedule"
            />
          </div>
          
          <div className="relative">
            <Label className={labelClass}>
              Level of Hardship
            </Label>
            <select
              value={formData.service_details?.tripCoordinator?.levelOfHardship || ""}
              onChange={(e) => handleNestedChange('tripCoordinator', 'levelOfHardship', e.target.value)}
              className={`${inputClass} appearance-none pr-10`}
            >
              <option value="" disabled>Select level</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="difficult">Difficult</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          
          <div className="relative">
            <Label className={labelClass}>
              Conditions and Requirements
            </Label>
            <textarea
              value={formData.service_details?.tripCoordinator?.conditionsAndRequirements || ""}
              onChange={(e) => handleNestedChange('tripCoordinator', 'conditionsAndRequirements', e.target.value)}
              className={`${inputClass} resize-none`}
              rows={4}
              placeholder="Any specific conditions or requirements for participants"
            />
          </div>
          
          <div className="relative">
            <Label className={labelClass}>
              Safety and Equipment
            </Label>
            <textarea
              value={formData.service_details?.tripCoordinator?.safetyAndEquipment || ""}
              onChange={(e) => handleNestedChange('tripCoordinator', 'safetyAndEquipment', e.target.value)}
              className={`${inputClass} resize-none`}
              rows={4}
              placeholder="Safety measures and required equipment"
            />
          </div>
          
          <div className="relative">
            <Label className={labelClass}>
              Cancellation and Refund Policy
            </Label>
            <textarea
              value={formData.service_details?.tripCoordinator?.cancellationAndRefundPolicy || ""}
              onChange={(e) => handleNestedChange('tripCoordinator', 'cancellationAndRefundPolicy', e.target.value)}
              className={`${inputClass} resize-none`}
              rows={4}
              placeholder="Detailed cancellation and refund policy"
            />
          </div>
          
          <div className="relative">
            <Label className={labelClass}>
              Additional Details
            </Label>
            <textarea
              value={formData.service_details?.tripCoordinator?.moreDetails || ""}
              onChange={(e) => handleNestedChange('tripCoordinator', 'moreDetails', e.target.value)}
              className={`${inputClass} resize-none`}
              rows={4}
              placeholder="Any other relevant information about the trip"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCoordinatorFields;
