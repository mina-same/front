import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const HoofTrimmerFields = ({
  formData,
  handleNestedChange,
  handleNestedArrayChange,
  addNestedArrayItem,
  removeNestedArrayItem,
  errors,
  isRTL,
  serviceDetailKey = 'hoofTrimmerDetails'
}) => {
  React.useEffect(() => {
    if (!formData.service_details[serviceDetailKey]) {
      handleNestedChange(serviceDetailKey, '', {});
    }
  }, [serviceDetailKey, formData, handleNestedChange]);

  const hoofDetails = formData.service_details[serviceDetailKey] || {};
  const additionalServices = hoofDetails.additionalServices || [];

  const inputClass = (errorField) => `
    w-full p-4 pt-3 pb-3 rounded-xl transition-all duration-200
    shadow-sm focus:shadow-md mt-2
    ${errors[errorField] 
      ? 'border-red-400 border-2 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
      : 'border border-gray-200 hover:border-gray-300 focus:border-gold focus:ring-1 focus:ring-gold/30'}
    focus:outline-none
  `;

  const labelClass = "text-xs font-medium text-black rounded-md";
  const errorClass = "text-red-500 text-sm mt-1 ml-2 font-medium";

  return (
    <div className="space-y-6">
      <div className="relative">
        <Label className={labelClass} htmlFor={`${serviceDetailKey}.specialization`}>
          Specialization*
        </Label>
        <select
          id={`${serviceDetailKey}.specialization`}
          value={hoofDetails.specialization || ""}
          onChange={(e) => handleNestedChange(serviceDetailKey, 'specialization', e.target.value)}
          className={inputClass(`${serviceDetailKey}.specialization`)}
        >
          <option value="" disabled>Select your specialization</option>
          <option value="hoof_trimmer">Hoof Trimmer</option>
          <option value="farrier">Farrier</option>
          <option value="horseshoe_fitting">Horseshoe Fitting</option>
        </select>
        {errors[`${serviceDetailKey}.specialization`] && (
          <p className={errorClass}>{errors[`${serviceDetailKey}.specialization`]}</p>
        )}
      </div>

      <div className="relative">
        <Label className={labelClass} htmlFor={`${serviceDetailKey}.methodsAndTools`}>
          Methods and Tools*
        </Label>
        <Textarea
          id={`${serviceDetailKey}.methodsAndTools`}
          value={hoofDetails.methodsAndTools || ""}
          onChange={(e) => handleNestedChange(serviceDetailKey, 'methodsAndTools', e.target.value)}
          className={inputClass(`${serviceDetailKey}.methodsAndTools`)}
          placeholder="Describe your methods and tools"
          rows={4}
        />
        {errors[`${serviceDetailKey}.methodsAndTools`] && (
          <p className={errorClass}>{errors[`${serviceDetailKey}.methodsAndTools`]}</p>
        )}
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
              handleNestedChange(serviceDetailKey, 'certifications', Array.from(e.target.files));
            }
          }}
          className={`${inputClass(`${serviceDetailKey}.certifications`)} py-2`}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          multiple
        />
        <p className="text-xs text-gray-500 mt-1">
          Accepted formats: DOC, DOCX, JPG, JPEG, PNG, GIF
        </p>
      </div>

      <div className="relative">
        <div className="flex justify-between items-center mb-2">
          <Label className={labelClass} htmlFor="additionalServices">
            Additional Services
          </Label>
          <button
            type="button"
            onClick={() => addNestedArrayItem(`${serviceDetailKey}.additionalServices`)}
            className="px-3 py-1 bg-gold/10 hover:bg-gold/20 text-gold/90 text-sm rounded-md transition-colors"
          >
            + Add Service
          </button>
        </div>

        {additionalServices.length > 0 ? (
          <div className="space-y-4 mt-2">
            {additionalServices.map((service, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                <button
                  type="button"
                  onClick={() => removeNestedArrayItem(`${serviceDetailKey}.additionalServices`, index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                  </svg>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className={labelClass} htmlFor={`additionalServices-${index}-name_ar`}>
                      Service Name (Arabic)
                    </Label>
                    <input
                      id={`additionalServices-${index}-name_ar`}
                      type="text"
                      value={service.name_ar || ""}
                      onChange={(e) => handleNestedArrayChange(`${serviceDetailKey}.additionalServices`, index, 'name_ar', e.target.value)}
                      className={inputClass('')}
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label className={labelClass} htmlFor={`additionalServices-${index}-name_en`}>
                      Service Name (English)
                    </Label>
                    <input
                      id={`additionalServices-${index}-name_en`}
                      type="text"
                      value={service.name_en || ""}
                      onChange={(e) => handleNestedArrayChange(`${serviceDetailKey}.additionalServices`, index, 'name_en', e.target.value)}
                      className={inputClass('')}
                    />
                  </div>
                  <div>
                    <Label className={labelClass} htmlFor={`additionalServices-${index}-price`}>
                      Price
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none mt-2">
                        <span className="text-gold font-bold text-lg">$</span>
                      </div>
                      <input
                        id={`additionalServices-${index}-price`}
                        type="number"
                        value={service.price || ""}
                        onChange={(e) => handleNestedArrayChange(`${serviceDetailKey}.additionalServices`, index, 'price', e.target.value)}
                        className={`${inputClass('')} pl-10`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No additional services added yet</p>
            <p className="text-sm text-gray-400 mt-1">Click the button above to add a service</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HoofTrimmerFields;