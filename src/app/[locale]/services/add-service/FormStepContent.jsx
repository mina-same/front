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

const FormStepContent = ({
  formData,
  handleChange,
  errors,
  step,
  animateDirection,
  handleNestedChange,
  handleNestedArrayChange,
  addNestedArrayItem,
  removeNestedArrayItem,
  selectedCountry,
  selectedGovernorate,
  selectedCity,
  countries,
  governorates,
  cities,
  handleCountryChange,
  handleGovernorateChange,
  handleCityChange,
  handleFileChange,
  imagePreview,
  setImagePreview,
  fileInputRef,
  handleLinkChange,
  addLink,
  removeLink,
  additionalImagePreviews,
  removeProfileImage,
  removeAdditionalImage,
}) => {
  const variants = {
    enter: (direction) => ({
      x: direction === "next" ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction === "next" ? -1000 : 1000,
      opacity: 0,
    }),
  };

  const getLinkIcon = (linkType) => {
    switch (linkType) {
      case "facebook":
        return <Facebook className="h-5 w-5 text-blue-600" />;
      case "youtube":
        return <Youtube className="h-5 w-5 text-red-600" />;
      case "linkedin":
        return <Linkedin className="h-5 w-5 text-blue-700" />;
      case "x":
        return <Twitter className="h-5 w-5 text-black" />;
      case "instagram":
        return <Instagram className="h-5 w-5 text-pink-600" />;
      case "website":
      default:
        return <Globe className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderMediaFields = () => {
    const linkTypes = [
      {
        value: "website",
        label: "Website",
        icon: <Globe className="h-4 w-4" />,
      },
      {
        value: "facebook",
        label: "Facebook",
        icon: <Facebook className="h-4 w-4" />,
      },
      {
        value: "youtube",
        label: "YouTube",
        icon: <Youtube className="h-4 w-4" />,
      },
      {
        value: "linkedin",
        label: "LinkedIn",
        icon: <Linkedin className="h-4 w-4" />,
      },
      {
        value: "x",
        label: "X (Twitter)",
        icon: <Twitter className="h-4 w-4" />,
      },
      {
        value: "instagram",
        label: "Instagram",
        icon: <Instagram className="h-4 w-4" />,
      },
      {
        value: "pinterest",
        label: "Pinterest",
        icon: <PinIcon className="h-4 w-4" />,
      },
      {
        value: "tiktok",
        label: "TikTok",
        icon: <Plus className="h-4 w-4 rotate-45" />,
      },
    ];

    return (
      <motion.div
        key={step}
        custom={animateDirection}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        className="grid gap-8"
      >
        <div className="grid gap-4">
          <Label htmlFor="profile_image" className="text-lg font-medium">
            Profile Image
          </Label>
          <div className="flex flex-col items-center gap-4">
            <Input
              type="file"
              id="profile_image"
              name="profile_image"
              onChange={handleFileChange}
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative w-40 h-40 rounded-lg overflow-hidden border-4 border-primary/10">
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-white/90"
                      onClick={() => fileInputRef?.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Change
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (removeProfileImage) removeProfileImage();
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef?.current?.click()}
                className="w-40 h-40 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary/70 transition-colors bg-gray-50"
              >
                <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload</span>
                <span className="text-xs text-gray-400 mt-1">
                  JPG, PNG, GIF
                </span>
              </div>
            )}
          </div>
          {errors.images && !imagePreview && (
            <p className="text-destructive text-sm mt-1">
              Profile image is required
            </p>
          )}
        </div>

        <div className="grid gap-4">
          <Label htmlFor="additional-images" className="text-lg font-medium">
            Additional Images
          </Label>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {additionalImagePreviews &&
                additionalImagePreviews.map((preview, index) => (
                  <div
                    key={`img-${index}`}
                    className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200"
                  >
                    <img
                      src={preview}
                      alt={`Additional image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        removeAdditionalImage && removeAdditionalImage(index)
                      }
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                    >
                      <X className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                ))}

              <label
                htmlFor="images"
                className="w-24 h-24 rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary/70 transition-colors bg-gray-50"
              >
                <Plus className="h-6 w-6 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Add Image</span>
              </label>

              <Input
                type="file"
                id="images"
                name="images"
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <Label className="text-lg font-medium">Social Links</Label>
          <div className="space-y-3">
            {formData.social_links &&
              formData.social_links.map((link, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-1/3">
                    <Select
                      value={link.linkType || ""}
                      onValueChange={(value) =>
                        handleLinkChange &&
                        handleLinkChange(index, "linkType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type">
                          {link.linkType && (
                            <div className="flex items-center gap-2">
                              {getLinkIcon(link.linkType)}
                              <span>
                                {linkTypes.find(
                                  (p) => p.value === link.linkType
                                )?.label || "Select type"}
                              </span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {linkTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 relative">
                    <div className="flex-1 relative">
                      <Input
                        type="url"
                        placeholder={`Enter ${
                          linkTypes.find((p) => p.value === link.linkType)
                            ?.label || "website"
                        } URL`}
                        value={link.url || ""}
                        onChange={(e) =>
                          handleLinkChange &&
                          handleLinkChange(index, "url", e.target.value)
                        }
                        className="pl-8 placeholder:pl-6" // 32px padding, placeholder starts at 24px
                      />
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        {getLinkIcon(link.linkType)}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLink && removeLink(index)}
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addLink && addLink()}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
            {errors.social_links && (
              <p className="text-destructive text-sm mt-2">
                {errors.social_links}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key={step}
            custom={animateDirection}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="grid gap-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name_ar">اسم الخدمة (AR)</Label>
                <Input
                  type="text"
                  id="name_ar"
                  name="name_ar"
                  value={formData.name_ar || ""}
                  onChange={handleChange}
                  className="mt-1"
                />
                {errors.name_ar && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.name_ar}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="name_en">Service Name (EN)</Label>
                <Input
                  type="text"
                  id="name_en"
                  name="name_en"
                  value={formData.name_en || ""}
                  onChange={handleChange}
                  className="mt-1"
                />
                {errors.name_en && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.name_en}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="years_of_experience">Years of Experience</Label>
              <Input
                type="number"
                id="years_of_experience"
                name="years_of_experience"
                value={formData.years_of_experience || ""}
                onChange={handleChange}
                className="mt-1"
              />
              {errors.years_of_experience && (
                <p className="text-destructive text-sm mt-1">
                  {errors.years_of_experience}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key={step}
            custom={animateDirection}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="grid gap-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="about_ar">عن الخدمة (AR)</Label>
                <Textarea
                  id="about_ar"
                  name="about_ar"
                  value={formData.about_ar || ""}
                  onChange={handleChange}
                  className="mt-1"
                />
                {errors.about_ar && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.about_ar}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="about_en">About Service (EN)</Label>
                <Textarea
                  id="about_en"
                  name="about_en"
                  value={formData.about_en || ""}
                  onChange={handleChange}
                  className="mt-1"
                />
                {errors.about_en && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.about_en}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="past_experience_ar">الخبرة السابقة (AR)</Label>
                <Textarea
                  id="past_experience_ar"
                  name="past_experience_ar"
                  value={formData.past_experience_ar || ""}
                  onChange={handleChange}
                  className="mt-1"
                />
                {errors.past_experience_ar && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.past_experience_ar}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="past_experience_en">Past Experience (EN)</Label>
                <Textarea
                  id="past_experience_en"
                  name="past_experience_en"
                  value={formData.past_experience_en || ""}
                  onChange={handleChange}
                  className="mt-1"
                />
                {errors.past_experience_en && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.past_experience_en}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key={step}
            custom={animateDirection}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="space-y-6"
          >
            <div className="grid gap-4">
              <Label htmlFor="serviceEmail">Service Email</Label>
              <Input
                type="email"
                id="serviceEmail"
                name="serviceEmail"
                value={formData.serviceEmail || ""}
                onChange={handleChange}
              />
              {errors.serviceEmail && (
                <p className="text-destructive text-sm">
                  {errors.serviceEmail}
                </p>
              )}
            </div>

            <div className="grid gap-4">
              <Label htmlFor="servicePhone">Service Phone</Label>
              <Input
                type="tel"
                id="servicePhone"
                name="servicePhone"
                value={formData.servicePhone || ""}
                onChange={handleChange}
              />
              {errors.servicePhone && (
                <p className="text-destructive text-sm">
                  {errors.servicePhone}
                </p>
              )}
            </div>

            <div className="grid gap-4">
              <Label htmlFor="country">Country</Label>
              <Select
                value={selectedCountry}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((country) => (
                    <SelectItem key={country._id} value={country._id}>
                      {country.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-destructive text-sm">{errors.country}</p>
              )}
            </div>

            <div className="grid gap-4">
              <Label htmlFor="governorate">Governorate</Label>
              <Select
                value={selectedGovernorate}
                onValueChange={handleGovernorateChange}
                disabled={!selectedCountry || !governorates?.length}
              >
                <SelectTrigger id="governorate">
                  <SelectValue placeholder="Select governorate" />
                </SelectTrigger>
                <SelectContent>
                  {governorates?.map((governorate) => (
                    <SelectItem key={governorate._id} value={governorate._id}>
                      {governorate.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.governorate && (
                <p className="text-destructive text-sm">{errors.governorate}</p>
              )}
            </div>

            <div className="grid gap-4">
              <Label htmlFor="city">City</Label>
              <Select
                value={selectedCity}
                onValueChange={handleCityChange}
                disabled={!selectedGovernorate || !cities?.length}
              >
                <SelectTrigger id="city">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities?.map((city) => (
                    <SelectItem key={city._id} value={city._id}>
                      {city.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && (
                <p className="text-destructive text-sm">{errors.city}</p>
              )}
            </div>

            <div className="grid gap-4">
              <Label htmlFor="address_details">Address Details</Label>
              <Textarea
                id="address_details"
                name="address_details"
                value={formData.address_details || ""}
                onChange={handleChange}
                placeholder="Enter detailed address"
              />
              {errors.address_details && (
                <p className="text-destructive text-sm">
                  {errors.address_details}
                </p>
              )}
            </div>

            <div className="grid gap-4">
              <Label htmlFor="address_link">Maps Link (Optional)</Label>
              <Input
                type="url"
                id="address_link"
                name="address_link"
                value={formData.address_link || ""}
                onChange={handleChange}
                placeholder="https://maps.google.com/..."
              />
              {errors.address_link && (
                <p className="text-destructive text-sm">
                  {errors.address_link}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 4:
        return renderMediaFields();

      case 5:
        return (
          <motion.div
            key={step}
            custom={animateDirection}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="grid gap-4"
          >
            <div>
              <Label htmlFor="service_type">Service Type</Label>
              <Select
                value={formData.service_type || ""}
                onValueChange={(value) => {
                  handleChange({
                    target: {
                      name: "service_type",
                      value,
                      addEventListener: function () {},
                      dispatchEvent: function () {
                        return true;
                      },
                      removeEventListener: function () {},
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horse_stable">Horse Stable</SelectItem>
                  <SelectItem value="veterinary">
                    Veterinary Services
                  </SelectItem>
                  <SelectItem value="competitions">
                    Horse Competitions
                  </SelectItem>
                  <SelectItem value="housing">Horse Housing</SelectItem>
                  <SelectItem value="horse_trainer">Horse Trainer</SelectItem>
                  <SelectItem value="hoof_trimmer">Hoof Trimmer</SelectItem>
                  <SelectItem value="horse_grooming">Horse Grooming</SelectItem>
                  <SelectItem value="event_judging">Event Judging</SelectItem>
                  <SelectItem value="marketing_promotion">
                    Marketing & Promotion
                  </SelectItem>
                  <SelectItem value="event_commentary">
                    Event Commentary
                  </SelectItem>
                  <SelectItem value="consulting_services">
                    Consulting Services
                  </SelectItem>
                  <SelectItem value="photography_services">
                    Photography Services
                  </SelectItem>
                  <SelectItem value="horse_transport">
                    Horse Transport
                  </SelectItem>
                  <SelectItem value="contractors">Contractors</SelectItem>
                  <SelectItem value="horse_catering">Horse Catering</SelectItem>
                  <SelectItem value="trip_coordinator">
                    Trip Coordinator
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.service_type && (
                <p className="text-destructive text-sm mt-1">
                  {errors.service_type}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key={step}
            custom={animateDirection}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                type="number"
                id="price"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                className="mt-1"
              />
              {errors.price && (
                <p className="text-destructive text-sm mt-1">{errors.price}</p>
              )}
            </div>
            <div>
              <Label htmlFor="priceUnit">Price Unit</Label>
              <Select
                value={formData.priceUnit || ""}
                onValueChange={(value) => {
                  handleChange({
                    target: {
                      name: "priceUnit",
                      value,
                      addEventListener: function () {},
                      dispatchEvent: function () {
                        return true;
                      },
                      removeEventListener: function () {},
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select price unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_half_hour">
                    Per Half-Hour || لكل نصف ساعة
                  </SelectItem>
                  <SelectItem value="per_hour">Per Hour || لكل ساعة</SelectItem>
                  <SelectItem value="per_day">Per Day || لكل يوم</SelectItem>
                  <SelectItem value="per_project">
                    Per Project || لكل مشروع
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.priceUnit && (
                <p className="text-destructive text-sm mt-1">
                  {errors.priceUnit}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            key={step}
            custom={animateDirection}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="grid gap-6"
          >
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <p>
                    <strong>Name (AR):</strong> {formData.name_ar}
                  </p>
                  <p>
                    <strong>Name (EN):</strong> {formData.name_en}
                  </p>
                  <p>
                    <strong>Years of Experience:</strong>{" "}
                    {formData.years_of_experience}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Contact Details</h4>
                  <p>
                    <strong>Phone:</strong> {formData.servicePhone}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.serviceEmail}
                  </p>
                  <p>
                    <strong>Address:</strong> {formData.address_details}
                  </p>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Service Details</h4>
                <p>
                  <strong>Service Type:</strong> {formData.service_type}
                </p>
                <p>
                  <strong>Price:</strong> {formData.price} {formData.priceUnit}
                </p>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderStepContent()}
      {step === 5 && formData.service_type && renderServiceTypeFields()}
    </div>
  );
};

export default FormStepContent;
