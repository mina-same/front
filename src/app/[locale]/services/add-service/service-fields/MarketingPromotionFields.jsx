
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MarketingPromotionFields = ({
  formData,
  handleNestedChange,
  handleNestedArrayChange,
  addNestedArrayItem,
  removeNestedArrayItem,
  errors,
  isRTL
}) => {
  // Make sure we're working with a properly initialized marketing_promotion object
  React.useEffect(() => {
    if (!formData.service_details.marketing_promotion) {
      handleNestedChange('marketing_promotion', '', {});
    }
  }, [formData.service_details.marketing_promotion, handleNestedChange]);

  const marketingDetails = formData.service_details.marketing_promotion || {};
  const portfolioLinks = marketingDetails.portfolioLinks || [];

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
        <div className="flex justify-between items-center mb-2">
          <Label className={labelClass} htmlFor="portfolioLinks">
            Portfolio Links
          </Label>
          <button
            type="button"
            onClick={() => addNestedArrayItem('marketing_promotion.portfolioLinks')}
            className="px-3 py-1 bg-gold/10 hover:bg-gold/20 text-gold/90 text-sm rounded-md transition-colors"
          >
            + Add Portfolio Link
          </button>
        </div>

        {portfolioLinks.length > 0 ? (
          <div className="space-y-4 mt-2">
            {portfolioLinks.map((link, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                <button
                  type="button"
                  onClick={() => removeNestedArrayItem('marketing_promotion.portfolioLinks', index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                  </svg>
                </button>

                <div className="space-y-4">
                  <div>
                    <Label className={labelClass} htmlFor={`portfolioLinks-${index}-url`}>
                      URL*
                    </Label>
                    <input
                      id={`portfolioLinks-${index}-url`}
                      type="url"
                      value={link.url || ""}
                      onChange={(e) => handleNestedArrayChange('marketing_promotion.portfolioLinks', index, 'url', e.target.value)}
                      className={inputClass('')}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label className={labelClass} htmlFor={`portfolioLinks-${index}-description_ar`}>
                      Description (Arabic)
                    </Label>
                    <Textarea
                      id={`portfolioLinks-${index}-description_ar`}
                      value={link.description_ar || ""}
                      onChange={(e) => handleNestedArrayChange('marketing_promotion.portfolioLinks', index, 'description_ar', e.target.value)}
                      className={inputClass('')}
                      dir="rtl"
                      placeholder="وصف الرابط"
                    />
                  </div>
                  <div>
                    <Label className={labelClass} htmlFor={`portfolioLinks-${index}-description_en`}>
                      Description (English)
                    </Label>
                    <Textarea
                      id={`portfolioLinks-${index}-description_en`}
                      value={link.description_en || ""}
                      onChange={(e) => handleNestedArrayChange('marketing_promotion.portfolioLinks', index, 'description_en', e.target.value)}
                      className={inputClass('')}
                      placeholder="Link description"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No portfolio links added yet</p>
            <p className="text-sm text-gray-400 mt-1">Click the button above to add a portfolio link</p>
          </div>
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
              handleNestedChange('marketing_promotion', 'certifications', e.target.files);
            }
          }}
          className={`${inputClass('certifications')} py-2`}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          multiple
        />
        <p className="text-xs text-gray-500 mt-1">
          Accepted formats, DOC, DOCX, JPG, JPEG, PNG, GIF
        </p>
      </div>
    </div>
  );
};

export default MarketingPromotionFields;
