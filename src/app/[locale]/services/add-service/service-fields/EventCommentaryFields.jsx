import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const EventCommentaryFields = ({
  formData,
  handleNestedChange,
  errors,
  isRTL
}) => {
  // Make sure we're working with a properly initialized event commentary object
  React.useEffect(() => {
    if (!formData.service_details.eventCommentaryDetails) {
      handleNestedChange('eventCommentaryDetails', '', {});
    }
  }, []);

  const commentaryDetails = formData.service_details.eventCommentaryDetails || {};
  const portfolioLink = commentaryDetails.portfolioLink || {};

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

  const updatePortfolioLink = (field, value) => {
    handleNestedChange('eventCommentaryDetails', 'portfolioLink', {
      ...portfolioLink,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
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
              className={inputClass('eventCommentaryDetails.portfolioLink.url')}
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
              className={inputClass('eventCommentaryDetails.portfolioLink.description_ar')}
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
              className={inputClass('eventCommentaryDetails.portfolioLink.description_en')}
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
              handleNestedChange('eventCommentaryDetails', 'certifications', e.target.files);
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

export default EventCommentaryFields;