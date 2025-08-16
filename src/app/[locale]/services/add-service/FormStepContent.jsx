import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Upload,
  X,
  Image as ImageIcon,
  Globe,
  Facebook,
  Youtube,
  Linkedin,
  Instagram,
  Twitter,
  Plus,
  Minus,
  PinIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

const FormStepContent = ({
  step,
  animateDirection,
  formData,
  setFormData,
  errors,
  setErrors,
  showTips,
  toggleTip,
  handleChange,
  handleFileChange,
  imagePreview,
  setImagePreview,
  fileInputRef,
  handleLinkChange,
  addLink,
  removeLink,
  selectedCountry,
  selectedGovernorate,
  selectedCity,
  countries,
  governorates,
  cities,
  handleCountryChange,
  handleGovernorateChange,
  handleCityChange,
  isRTL,
  handleNestedChange,
  handleNestedArrayChange,
  addNestedArrayItem,
  removeNestedArrayItem,
  getServiceTypeLabel,
  getPriceUnitLabel,
  additionalImagePreviews,
  removeProfileImage,
  removeAdditionalImage,
}) => {
  const renderStepContent = () => {
    console.log('Current step in FormStepContent:', step);
    console.log('Step type:', typeof step);
    console.log('Step value:', step);
    switch (step) {
      case 1: // Service Management
        return (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="serviceManagementType"
                className="block text-sm font-medium mb-1"
              >
                Service Management Type
              </label>
              <select
                id="serviceManagementType"
                name="serviceManagementType"
                value={formData.serviceManagementType || ""}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.serviceManagementType ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select Service Management Type</option>
                <option value="individual">Individual</option>
                <option value="company">Company</option>
              </select>
              {errors.serviceManagementType && (
                <p className="text-red-500 text-sm mt-1">{errors.serviceManagementType}</p>
              )}
            </div>
          </div>
        );

      case 2: // Basic Info
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name_en"
                  className="block text-sm font-medium mb-1"
                >
                  Service Name (English)
                </label>
                <input
                  type="text"
                  id="name_en"
                  name="name_en"
                  value={formData.name_en || ""}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.name_en ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter service name in English"
                />
                {errors.name_en && (
                  <p className="text-red-500 text-sm mt-1">{errors.name_en}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="name_ar"
                  className="block text-sm font-medium mb-1"
                >
                  Service Name (Arabic)
                </label>
                <input
                  type="text"
                  id="name_ar"
                  name="name_ar"
                  value={formData.name_ar || ""}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.name_ar ? "border-red-500" : "border-gray-300"}`}
                  placeholder="أدخل اسم الخدمة بالعربية"
                  dir="rtl"
                />
                {errors.name_ar && (
                  <p className="text-red-500 text-sm mt-1">{errors.name_ar}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="years_of_experience"
                className="block text-sm font-medium mb-1"
              >
                Years of Experience
              </label>
              <input
                type="number"
                id="years_of_experience"
                name="years_of_experience"
                value={formData.years_of_experience || ""}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.years_of_experience ? "border-red-500" : "border-gray-300"}`}
                placeholder="Enter years of experience"
                min="0"
              />
              {errors.years_of_experience && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.years_of_experience}
                </p>
              )}
            </div>
          </div>
        );

      case 3: // Description
        return (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="about_en"
                  className="block text-sm font-medium"
                >
                  Description (English)
                </label>
                <button
                  type="button"
                  onClick={() => toggleTip("about_en")}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showTips.about_en ? "Hide Tips" : "Show Tips"}
                </button>
              </div>
              {showTips.about_en && (
                <div className="bg-blue-50 p-3 rounded-md mb-2 text-sm">
                  <p>
                    Provide a detailed description of your service in English.
                    Include what makes your service unique, your approach, and
                    what clients can expect.
                  </p>
                </div>
              )}
              <textarea
                id="about_en"
                name="about_en"
                value={formData.about_en || ""}
                onChange={handleChange}
                rows="4"
                className={`w-full p-2 border rounded-md ${errors.about_en ? "border-red-500" : "border-gray-300"}`}
                placeholder="Describe your service in detail (minimum 50 characters)"
              ></textarea>
              {errors.about_en && (
                <p className="text-red-500 text-sm mt-1">{errors.about_en}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.about_en?.length}/500 characters
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="about_ar"
                  className="block text-sm font-medium"
                >
                  Description (Arabic)
                </label>
                <button
                  type="button"
                  onClick={() => toggleTip("about_ar")}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showTips.about_ar ? "Hide Tips" : "Show Tips"}
                </button>
              </div>
              {showTips.about_ar && (
                <div className="bg-blue-50 p-3 rounded-md mb-2 text-sm">
                  <p dir="rtl">
                    قدم وصفًا مفصلاً لخدمتك باللغة العربية. اشرح ما يجعل خدمتك
                    فريدة من نوعها، ونهجك، وما يمكن للعملاء توقعه.
                  </p>
                </div>
              )}
              <textarea
                id="about_ar"
                name="about_ar"
                value={formData.about_ar || ""}
                onChange={handleChange}
                rows="4"
                className={`w-full p-2 border rounded-md ${errors.about_ar ? "border-red-500" : "border-gray-300"}`}
                placeholder="صف خدمتك بالتفصيل (الحد الأدنى 50 حرفًا)"
                dir="rtl"
              ></textarea>
              {errors.about_ar && (
                <p className="text-red-500 text-sm mt-1">{errors.about_ar}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.about_ar?.length}/500 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="past_experience_en"
                className="block text-sm font-medium mb-1"
              >
                Past Experience (English)
              </label>
              <textarea
                id="past_experience_en"
                name="past_experience_en"
                value={formData.past_experience_en || ""}
                onChange={handleChange}
                rows="3"
                className={`w-full p-2 border rounded-md ${errors.past_experience_en ? "border-red-500" : "border-gray-300"}`}
                placeholder="Describe your past experience and notable achievements"
              ></textarea>
              {errors.past_experience_en && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.past_experience_en}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="past_experience_ar"
                className="block text-sm font-medium mb-1"
              >
                Past Experience (Arabic)
              </label>
              <textarea
                id="past_experience_ar"
                name="past_experience_ar"
                value={formData.past_experience_ar || ""}
                onChange={handleChange}
                rows="3"
                className={`w-full p-2 border rounded-md ${errors.past_experience_ar ? "border-red-500" : "border-gray-300"}`}
                placeholder="صف خبرتك السابقة وإنجازاتك البارزة"
                dir="rtl"
              ></textarea>
              {errors.past_experience_ar && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.past_experience_ar}
                </p>
              )}
            </div>
          </div>
        );

      case 4: // Contact & Location
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="servicePhone"
                  className="block text-sm font-medium mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="servicePhone"
                  name="servicePhone"
                  value={formData.servicePhone || ""}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.servicePhone ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter phone number"
                />
                {errors.servicePhone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.servicePhone}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="serviceEmail"
                  className="block text-sm font-medium mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="serviceEmail"
                  name="serviceEmail"
                  value={formData.serviceEmail || ""}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.serviceEmail ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter email address"
                />
                {errors.serviceEmail && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.serviceEmail}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium mb-1"
                >
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country || ""}
                  onChange={handleCountryChange}
                  className={`w-full p-2 border rounded-md ${errors.country ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country._id} value={country._id}>
                      {isRTL ? country.name_ar : country.name_en}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="governorate"
                  className="block text-sm font-medium mb-1"
                >
                  Governorate
                </label>
                <select
                  id="governorate"
                  name="governorate"
                  value={formData.governorate || ""}
                  onChange={handleGovernorateChange}
                  className={`w-full p-2 border rounded-md ${errors.governorate ? "border-red-500" : "border-gray-300"}`}
                  disabled={!selectedCountry}
                >
                  <option value="">Select Governorate</option>
                  {governorates.map((governorate) => (
                    <option key={governorate._id} value={governorate._id}>
                      {isRTL ? governorate.name_ar : governorate.name_en}
                    </option>
                  ))}
                </select>
                {errors.governorate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.governorate}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium mb-1"
                >
                  City
                </label>
                <select
                  id="city"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleCityChange}
                  className={`w-full p-2 border rounded-md ${errors.city ? "border-red-500" : "border-gray-300"}`}
                  disabled={!selectedGovernorate}
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {isRTL ? city.name_ar : city.name_en}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="address_details"
                className="block text-sm font-medium mb-1"
              >
                Address Details
              </label>
              <textarea
                id="address_details"
                name="address_details"
                value={formData.address_details || ""}
                onChange={handleChange}
                rows="2"
                className={`w-full p-2 border rounded-md ${errors.address_details ? "border-red-500" : "border-gray-300"}`}
                placeholder="Enter detailed address"
              ></textarea>
              {errors.address_details && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.address_details}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="address_link"
                className="block text-sm font-medium mb-1"
              >
                Google Maps Link (Optional)
              </label>
              <input
                type="url"
                id="address_link"
                name="address_link"
                value={formData.address_link || ""}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.address_link ? "border-red-500" : "border-gray-300"}`}
                placeholder="Enter Google Maps link"
              />
              {errors.address_link && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.address_link}
                </p>
              )}
            </div>
          </div>
        );

      case 5: // Media & Files
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Profile Image
              </label>
              <div className="flex items-center space-x-4">
                <div
                  className={`w-32 h-32 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer ${errors.profileImage ? "border-red-500" : "border-gray-300"}`}
                  onClick={() => fileInputRef.current.click()}
                >
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={imagePreview}
                        alt="Profile Preview"
                        className="w-full h-full object-cover rounded-md"
                        width={128}
                        height={128}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProfileImage();
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm text-center">
                      Click to upload
                      <br />
                      profile image
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e, "profile")}
                  className="hidden"
                  accept="image/*"
                />
                <div className="text-sm text-gray-500">
                  <p>Upload a clear, professional image</p>
                  <p>Maximum size: 5MB</p>
                  <p>Formats: JPG, PNG</p>
                </div>
              </div>
              {errors.profileImage && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.profileImage}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Additional Images (Optional)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {additionalImagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative w-full h-24 border rounded-md overflow-hidden"
                  >
                    <Image
                      src={preview}
                      alt={`Additional ${index + 1}`}
                      className="w-full h-full object-cover"
                      width={96}
                      height={96}
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {additionalImagePreviews.length < 5 && (
                  <div
                    className="w-full h-24 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer"
                    onClick={() =>
                      document
                        .getElementById("additionalImagesInput")
                        .click()
                    }
                  >
                    <span className="text-gray-500 text-sm text-center">
                      + Add Image
                    </span>
                  </div>
                )}
              </div>
              <input
                type="file"
                id="additionalImagesInput"
                onChange={(e) => handleFileChange(e, "additional")}
                className="hidden"
                accept="image/*"
              />
              <p className="text-sm text-gray-500 mt-2">
                You can upload up to 5 additional images
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Social Media & Website Links
              </label>
              {(formData.social_links || []).map((link, index) => (
                <div key={index} className="mb-3">
                  <div className="flex space-x-2">
                    <select
                      value={link.linkType || ""}
                      onChange={(e) =>
                        handleLinkChange(index, "linkType", e.target.value)
                      }
                      className="p-2 border rounded-md w-1/3"
                    >
                      <option value="website">Website</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                    <input
                      type="url"
                      value={link.url || ""}
                      onChange={(e) =>
                        handleLinkChange(index, "url", e.target.value)
                      }
                      className={`p-2 border rounded-md flex-1 ${errors[`social_links_${index}`] ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Enter URL"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {errors[`social_links_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`social_links_${index}`]}
                    </p>
                  )}
                </div>
              ))}
              {formData.social_links.length < 5 && (
                <button
                  type="button"
                  onClick={addLink}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add another link
                </button>
              )}
            </div>
          </div>
        );

      case 6: // Service Type
        return (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="service_type"
                className="block text-sm font-medium mb-1"
              >
                Service Type
              </label>
              <select
                id="service_type"
                name="service_type"
                value={formData.service_type || ""}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.service_type ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select Service Type</option>
                <option value="horse_stable">Horse Stable</option>
                <option value="veterinary">Veterinary</option>
                <option value="competitions">Competitions</option>
                <option value="housing">Housing</option>
                <option value="trip_coordinator">Trip Coordinator</option>
                <option value="horse_catering">Horse Catering</option>
                <option value="horse_transport">Horse Transport</option>
                <option value="contractors">Contractors</option>
                <option value="horse_trainer">Horse Trainer</option>
                <option value="hoof_trimmer">Hoof Trimmer</option>
                <option value="horse_grooming">Horse Grooming</option>
                <option value="event_judging">Event Judging</option>
                <option value="marketing_promotion">Marketing & Promotion</option>
                <option value="event_commentary">Event Commentary</option>
                <option value="consulting_services">Consulting Services</option>
                <option value="photography_services">Photography Services</option>
                <option value="suppliers">Suppliers</option>
              </select>
              {errors.service_type && (
                <p className="text-red-500 text-sm mt-1">{errors.service_type}</p>
              )}
            </div>
          </div>
        );

      case 7: // Pricing
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium mb-1"
                >
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.price ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="priceUnit"
                  className="block text-sm font-medium mb-1"
                >
                  Price Unit
                </label>
                <select
                  id="priceUnit"
                  name="priceUnit"
                  value={formData.priceUnit || ""}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.priceUnit ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="per_hour">Per Hour</option>
                  <option value="per_day">Per Day</option>
                  <option value="per_week">Per Week</option>
                  <option value="per_month">Per Month</option>
                  <option value="per_service">Per Service</option>
                  <option value="fixed">Fixed Price</option>
                </select>
                {errors.priceUnit && (
                  <p className="text-red-500 text-sm mt-1">{errors.priceUnit}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 8: // Review & Submit
        return <div>Review & Submit</div>;

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="w-full">
      {renderStepContent()}
    </div>
  );
};

export default FormStepContent;
