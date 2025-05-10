import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { client } from '../../src/lib/sanity';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { renderServiceTypeFields } from "./ServiceForm/renderServiceTypeFields";
import {
  Check, X, FileText, DollarSign, Map, Star, Info, ArrowLeft, ArrowRight, Upload,
  Home, Stethoscope, Trophy, Building, Utensils, Truck, HardHat, Package, Dumbbell,
  Scissors, Plus, Trash, Book, Library, Gavel, Briefcase, Megaphone, Mic, Camera, Phone, Mail,Lightbulb, CheckCircle
} from 'lucide-react';

// Step Navigation Component
const StepNavigation = ({ step, totalSteps, getStepTitle, getStepDescription, isRTL }) => {
  const { t } = useTranslation();
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">{getStepTitle(step)}</h3>
        <span className="text-sm text-gray-500">
          {t('profile:step')} {step} {t('profile:of')} {totalSteps}
        </span>
      </div>
      <div className="relative w-full h-2 bg-gray-200 rounded-full">
        <div
          className="absolute top-0 left-0 h-2 bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-gray-500">{getStepDescription(step)}</p>
    </div>
  );
};

// Form Actions Component
const FormActions = ({ step, totalSteps, handlePrevious, handleNext, handleSubmit, isSubmitting, isRTL, t }) => {
  return (
    <div className="mt-8 flex justify-between">
      {step > 1 && (
        <button
          type="button"
          onClick={handlePrevious}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
          disabled={isSubmitting}
        >
          <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
          {t('profile:previous')}
        </button>
      )}
      {step < totalSteps ? (
        <button
          type="button"
          onClick={handleNext}
          className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
          disabled={isSubmitting}
        >
          {t('profile:next')}
          <ArrowRight size={20} className={isRTL ? 'rotate-180' : ''} />
        </button>
      ) : (
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`ml-auto px-6 py-3 rounded-xl transition-colors flex items-center gap-2 
            ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                />
              </svg>
              {t('profile:saving')}
            </>
          ) : (
            <>
              <Check size={20} />
              {t('profile:saveService')}
            </>
          )}
        </button>
      )}
    </div>
  );
};

// Service Type Selector Component
const ServiceTypeSelector = ({ formData, setFormData, errors, setErrors, getServiceTypeLabel, t }) => {
  const serviceTypeIcons = {
    horse_stable: <Home className="w-5 h-5" />,
    veterinary: <Stethoscope className="w-5 h-5" />,
    competitions: <Trophy className="w-5 h-5" />,
    housing: <Building className="w-5 h-5" />,
    trip_coordinator: <Map className="w-5 h-5" />,
    horse_catering: <Utensils className="w-5 h-5" />,
    horse_transport: <Truck className="w-5 h-5" />,
    contractors: <HardHat className="w-5 h-5" />,
    suppliers: <Package className="w-5 h-5" />,
    horse_trainer: <Dumbbell className="w-5 h-5" />,
    hoof_trimmer: <Scissors className="w-5 h-5" />,
    horse_grooming: <Scissors className="w-5 h-5" />,
    horse_course_provider: <Book className="w-5 h-5" />,
    digital_library_services: <Library className="w-5 h-5" />,
    event_judging: <Gavel className="w-5 h-5" />,
    marketing_promotion: <Megaphone className="w-5 h-5" />,
    event_commentary: <Mic className="w-5 h-5" />,
    consulting_services: <Briefcase className="w-5 h-5" />,
    photography_services: <Camera className="w-5 h-5" />,
  };

  return (
    <div className="relative">
      <p className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600 z-10">
        {t('profile:serviceType')}*
      </p>
      <div className={`grid grid-cols-2 gap-3 ${errors.serviceType ? 'border-red-500' : ''}`}>
        {Object.keys(serviceTypeIcons).map((type) => (
          <div
            key={type}
            onClick={() => {
              setFormData({ ...formData, serviceType: type });
              if (errors.serviceType) {
                setErrors({ ...errors, serviceType: null });
              }
            }}
            className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all 
              ${formData.serviceType === type ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
            role="radio"
            aria-checked={formData.serviceType === type}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setFormData({ ...formData, serviceType: type });
                if (errors.serviceType) {
                  setErrors({ ...errors, serviceType: null });
                }
              }
            }}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 
                ${formData.serviceType === type ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {formData.serviceType === type && <Check size={14} />}
              </div>
              <span className="text-sm font-medium capitalize">{getServiceTypeLabel(type)}</span>
            </div>
          </div>
        ))}
      </div>
      {errors.serviceType && <p className="text-red-500 text-sm mt-1 ml-2">{errors.serviceType}</p>}
    </div>
  );
};

// Location Selector Component
const LocationSelector = ({ selectedCountry, setSelectedCountry, selectedGovernorate, setSelectedGovernorate, selectedCity, setSelectedCity, formData, setFormData, errors, setErrors, countries, governorates, cities, isRTL, t }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="relative">
        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="country">
          {t('profile:country')}*
        </label>
        <select
          id="country"
          value={selectedCountry}
          onChange={(e) => {
            setSelectedCountry(e.target.value);
            setFormData({ ...formData, country: e.target.value });
            if (errors.country) {
              setErrors({ ...errors, country: null });
            }
          }}
          className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.country ? 'border-red-500' : 'border-gray-200'}`}
          aria-required="true"
        >
          <option value="">{t('profile:selectCountry')}</option>
          {countries.map(country => (
            <option key={country._id} value={country._id}>
              {isRTL ? country.name_ar : country.name_en}
            </option>
          ))}
        </select>
        {errors.country && <p className="text-red-500 text-sm mt-1 ml-2">{errors.country}</p>}
      </div>
      <div className="relative">
        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="government">
          {t('profile:governorate')}*
        </label>
        <select
          id="government"
          value={selectedGovernorate}
          onChange={(e) => {
            setSelectedGovernorate(e.target.value);
            setFormData({ ...formData, government: e.target.value });
            if (errors.government) {
              setErrors({ ...errors, government: null });
            }
          }}
          className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.government ? 'border-red-500' : 'border-gray-200'}`}
          disabled={!selectedCountry}
          aria-required="true"
        >
          <option value="">{t('profile:selectGovernorate')}</option>
          {governorates.map(governorate => (
            <option key={governorate._id} value={governorate._id}>
              {isRTL ? governorate.name_ar : governorate.name_en}
            </option>
          ))}
        </select>
        {errors.government && <p className="text-red-500 text-sm mt-1 ml-2">{errors.government}</p>}
      </div>
      <div className="relative">
        <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600" htmlFor="city">
          {t('profile:city')}*
        </label>
        <select
          id="city"
          value={selectedCity}
          onChange={(e) => {
            setSelectedCity(e.target.value);
            setFormData({ ...formData, city: e.target.value });
            if (errors.city) {
              setErrors({ ...errors, city: null });
            }
          }}
          className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.city ? 'border-red-500' : 'border-gray-200'}`}
          disabled={!selectedGovernorate}
          aria-required="true"
        >
          <option value="">{t('profile:selectCity')}</option>
          {cities.map(city => (
            <option key={city._id} value={city._id}>
              {isRTL ? city.name_ar : city.name_en}
            </option>
          ))}
        </select>
        {errors.city && <p className="text-red-500 text-sm mt-1 ml-2">{errors.city}</p>}
      </div>
    </div>
  );
};

// Links Input Component
const LinksInput = ({ formData, setFormData, errors, setErrors, addLink, removeLink, handleLinkChange, t }) => {
  return (
    <div className="relative">
      <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600">
        {t('profile:links')}
      </label>
      <div className="p-4 border-2 border-gray-200 rounded-xl">
        {formData.links.map((link, index) => (
          <div key={link._key} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={link.url}
              onChange={(e) => handleLinkChange(index, e.target.value)}
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm ${errors[`link-${index}`] ? 'border-red-500' : ''}`}
              placeholder={t('profile:enterValidURL')}
            />
            {index >= 3 && (
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="p-2 text-red-500 hover:text-red-600"
                aria-label={`Remove link ${index + 1}`}
              >
                <X size={16} />
              </button>
            )}
            {errors[`link-${index}`] && <p className="text-red-500 text-sm mt-1 ml-2">{errors[`link-${index}`]}</p>}
          </div>
        ))}
        {formData.links.length < 6 && (
          <button
            type="button"
            onClick={addLink}
            className="mt-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} /> {t('profile:addAnotherLink')}
          </button>
        )}
      </div>
    </div>
  );
};

// Image Upload Component
const ImageUpload = ({ imagePreview, setImagePreview, formData, setFormData, fileInputRef, handleChange, t }) => {
  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image: null });
  };

  return (
    <div className="relative">
      <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-blue-600">
        {t('profile:uploadImage')}
      </label>
      <div className="p-4 border-2 border-gray-200 rounded-xl">
        {imagePreview ? (
          <div className="relative w-48 h-48 mx-auto">
            <Image
              src={imagePreview}
              alt="Preview"
              layout="fill"
              objectFit="cover"
              className="rounded-xl"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              aria-label="Remove image"
            >
              <Trash size={16} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center w-full h-48 border-4 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-500"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
          >
            <Upload className="w-10 h-10 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500">{t('profile:uploadImage')}</span>
          </div>
        )}
        <input
          type="file"
          id="image"
          name="image"
          onChange={handleChange}
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
        />
      </div>
    </div>
  );
};

// Review Step Component
const ReviewStep = ({ formData, getServiceTypeLabel, imagePreview, selectedCountry, selectedGovernorate, selectedCity, countries, governorates, cities, isRTL, t }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('profile:reviewServiceDetails')}</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{t('profile:serviceNameArabic')}</p>
          <p className="text-gray-800 dir-rtl">{formData.name_ar || t('profile:notAvailable')}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{t('profile:serviceNameEnglish')}</p>
          <p className="text-gray-800">{formData.name_en || t('profile:notAvailable')}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{t('profile:serviceType')}</p>
          <p className="text-gray-800">{getServiceTypeLabel(formData.serviceType) || t('profile:notAvailable')}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{t('profile:serviceDescriptionArabic')}</p>
          <p className="text-gray-800 dir-rtl">{formData.about_ar || t('profile:notAvailable')}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{t('profile:serviceDescriptionEnglish')}</p>
          <p className="text-gray-800">{formData.about_en || t('profile:notAvailable')}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{t('profile:servicePrice')}</p>
          <p className="text-gray-800">{formData.price ? `${formData.price} ${formData.priceUnit}` : t('profile:notAvailable')}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{t('profile:serviceNumber')}</p>
          <p className="text-gray-800">{formData.servicePhone || t('profile:notAvailable')}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{t('profile:serviceEmail')}</p>
          <p className="text-gray-800">{formData.serviceEmail || t('profile:notAvailable')}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{t('profile:location')}</p>
          <p className="text-gray-800">
            {[
              cities.find(c => c._id === selectedCity)?.[isRTL ? 'name_ar' : 'name_en'],
              governorates.find(g => g._id === selectedGovernorate)?.[isRTL ? 'name_ar' : 'name_en'],
              countries.find(c => c._id === selectedCountry)?.[isRTL ? 'name_ar' : 'name_en'],
            ]
              .filter(Boolean)
              .join(', ') || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{t('profile:links')}</p>
          <p className="text-gray-800">
            {formData.links.filter(link => link.url).map(link => link.url).join(', ') || 'N/A'}
          </p>
        </div>
        {imagePreview && (
          <div>
            <p className="text-sm font-medium text-gray-600">{t('profile:image')}</p>
            <div className="w-24 h-24 relative">
              <Image
                src={imagePreview}
                alt="Service image"
                layout="fill"
                objectFit="cover"
                className="rounded"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StepContent = ({
  step,
  animateDirection,
  formData,
  setFormData,
  errors,
  setErrors,
  showTips,
  toggleTip,
  handleChange,
  imagePreview,
  setImagePreview,
  fileInputRef,
  handleLinkChange,
  addLink,
  removeLink,
  selectedCountry,
  setSelectedCountry,
  selectedGovernorate,
  setSelectedGovernorate,
  selectedCity,
  setSelectedCity,
  countries,
  governorates,
  cities,
  handleNestedChange,
  handleNestedArrayChange,
  addNestedArrayItem,
  removeNestedArrayItem,
  getServiceTypeLabel,
  isRTL,
  t
}) => {
  // Enhanced animation variants with smoother transitions
  const variants = {
    enterFromRight: { x: 100, opacity: 0 },
    enterFromLeft: { x: -100, opacity: 0 },
    center: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exitToLeft: { x: -100, opacity: 0 },
    exitToRight: { x: 100, opacity: 0 },
  };

  // Common input class with enhanced styling
  const inputClass = (errorField) => `
    w-full p-4 rounded-xl transition-all duration-200
    shadow-sm focus:shadow-md
    ${errors[errorField] 
      ? 'border-red-400 border-2 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
      : 'border-2 border-gray-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}
    focus:outline-none
  `;

  // Enhanced label styling
  const labelClass = "absolute -top-2.5 left-4 bg-white px-2 text-xs font-semibold text-blue-600 rounded-md";

  // Enhanced tip button styling
  const tipButtonClass = "absolute -top-2.5 right-2 bg-white p-1 text-gray-400 hover:text-blue-500 transition-colors duration-200 z-10";
  
  // Enhanced tips box styling
  const tipsBoxClass = "mt-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl text-sm text-blue-700 border border-blue-100 shadow-sm";

  // Error message styling
  const errorClass = "text-red-500 text-sm mt-1 ml-2 font-medium";

  switch (step) {
    case 1:
      return (
        <motion.div
          key="step1"
          initial={animateDirection === 'next' ? 'enterFromRight' : 'enterFromLeft'}
          animate="center"
          exit={animateDirection === 'next' ? 'exitToLeft' : 'exitToRight'}
          variants={variants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-8"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{t('profile:basicInfo')}</h2>
            <p className="text-gray-600">{t('profile:basicInfoDescription')}</p>
          </div>

          <div className="relative transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex justify-between items-center mb-1">
              <label className={labelClass} htmlFor="name_ar">
                {t('profile:serviceNameArabic')}*
              </label>
              <button
                type="button"
                onClick={() => toggleTip('name_ar')}
                className={tipButtonClass}
                aria-label="Service name Arabic tips"
              >
                <Info size={16} className="text-blue-400 hover:text-blue-600" />
              </button>
            </div>
            <input
              type="text"
              id="name_ar"
              name="name_ar"
              value={formData.name_ar}
              onChange={handleChange}
              className={inputClass('name_ar')}
              placeholder={t('profile:serviceNameArabic')}
              dir="rtl"
              aria-required="true"
            />
            {showTips.name_ar && (
              <div className={tipsBoxClass}>
                <p className="font-medium mb-2 text-blue-700">{t('profile:serviceNameTips')}</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>{t('profile:tipConcise')}</li>
                  <li>{t('profile:tipSpecialization')}</li>
                  <li>{t('profile:tipMemorable')}</li>
                </ul>
              </div>
            )}
            {errors.name_ar && <p className={errorClass}>{errors.name_ar}</p>}
          </div>

          <div className="relative transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex justify-between items-center mb-1">
              <label className={labelClass} htmlFor="name_en">
                {t('profile:serviceNameEnglish')}*
              </label>
              <button
                type="button"
                onClick={() => toggleTip('name_en')}
                className={tipButtonClass}
                aria-label="Service name English tips"
              >
                <Info size={16} className="text-blue-400 hover:text-blue-600" />
              </button>
            </div>
            <input
              type="text"
              id="name_en"
              name="name_en"
              value={formData.name_en}
              onChange={handleChange}
              className={inputClass('name_en')}
              placeholder={t('profile:serviceNameEnglish')}
              aria-required="true"
            />
            {errors.name_en && <p className={errorClass}>{errors.name_en}</p>}
          </div>

          <div className="relative transform hover:scale-[1.01] transition-transform duration-300">
            <label className={labelClass} htmlFor="years_of_experience">
              {t('profile:yearsOfExperience')}*
            </label>
            <div className="relative">
              <input
                type="number"
                id="years_of_experience"
                name="years_of_experience"
                value={formData.years_of_experience}
                onChange={handleChange}
                min="0"
                className={inputClass('years_of_experience')}
                placeholder={t('profile:yearsOfExperience')}
                aria-required="true"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                {t('profile:years')}
              </div>
            </div>
            {errors.years_of_experience && <p className={errorClass}>{errors.years_of_experience}</p>}
          </div>
        </motion.div>
      );

    case 2:
      return (
        <motion.div
          key="step2"
          initial={animateDirection === 'next' ? 'enterFromRight' : 'enterFromLeft'}
          animate="center"
          exit={animateDirection === 'next' ? 'exitToLeft' : 'exitToRight'}
          variants={variants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-8"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{t('profile:aboutYourService')}</h2>
            <p className="text-gray-600">{t('profile:describeYourService')}</p>
          </div>

          <div className="relative transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex justify-between items-center mb-1">
              <label className={labelClass} htmlFor="about_ar">
                {t('profile:serviceDescriptionArabic')}*
              </label>
              <button
                type="button"
                onClick={() => toggleTip('about_ar')}
                className={tipButtonClass}
                aria-label="Description Arabic tips"
              >
                <Info size={16} className="text-blue-400 hover:text-blue-600" />
              </button>
            </div>
            <textarea
              id="about_ar"
              name="about_ar"
              value={formData.about_ar}
              onChange={handleChange}
              rows="5"
              className={`${inputClass('about_ar')} resize-none`}
              placeholder={t('profile:serviceDescriptionArabic')}
              dir="rtl"
              aria-required="true"
            />
            {showTips.about_ar && (
              <div className={tipsBoxClass}>
                <p className="font-medium mb-2 text-blue-700">{t('profile:descriptionTips')}</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>{t('profile:tipSpecific')}</li>
                  <li>{t('profile:tipExpertise')}</li>
                  <li>{t('profile:tipBenefits')}</li>
                  <li>{t('profile:tipMinLength')}</li>
                </ul>
              </div>
            )}
            {errors.about_ar && <p className={errorClass}>{errors.about_ar}</p>}
            <div className="flex justify-between mt-2 text-xs font-medium">
              <span className="text-gray-500">{formData.about_ar.length} {t('profile:characters')}</span>
              <span className={`${formData.about_ar.length < 50 ? 'text-amber-500' : 'text-green-500'} font-semibold`}>
                {formData.about_ar.length < 50 ? t('profile:minLengthWarning') : t('profile:goodLength')}
              </span>
            </div>
          </div>

          <div className="relative transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex justify-between items-center mb-1">
              <label className={labelClass} htmlFor="about_en">
                {t('profile:serviceDescriptionEnglish')}*
              </label>
              <button
                type="button"
                onClick={() => toggleTip('about_en')}
                className={tipButtonClass}
                aria-label="Description English tips"
              >
                <Info size={16} className="text-blue-400 hover:text-blue-600" />
              </button>
            </div>
            <textarea
              id="about_en"
              name="about_en"
              value={formData.about_en}
              onChange={handleChange}
              rows="5"
              className={`${inputClass('about_en')} resize-none`}
              placeholder={t('profile:serviceDescriptionEnglish')}
              aria-required="true"
            />
            {errors.about_en && <p className={errorClass}>{errors.about_en}</p>}
            <div className="flex justify-between mt-2 text-xs font-medium">
              <span className="text-gray-500">{formData.about_en.length} {t('profile:characters')}</span>
              <span className={`${formData.about_en.length < 50 ? 'text-amber-500' : 'text-green-500'} font-semibold`}>
                {formData.about_en.length < 50 ? t('profile:minLengthWarning') : t('profile:goodLength')}
              </span>
            </div>
          </div>

          <div className="relative transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex justify-between items-center mb-1">
              <label className={labelClass} htmlFor="past_experience_ar">
                {t('profile:pastExperienceArabic')}*
              </label>
              <button
                type="button"
                onClick={() => toggleTip('past_experience_ar')}
                className={tipButtonClass}
                aria-label="Past Experience Arabic tips"
              >
                <Info size={16} className="text-blue-400 hover:text-blue-600" />
              </button>
            </div>
            <textarea
              id="past_experience_ar"
              name="past_experience_ar"
              value={formData.past_experience_ar}
              onChange={handleChange}
              rows="4"
              className={`${inputClass('past_experience_ar')} resize-none`}
              placeholder={t('profile:pastExperienceArabic')}
              dir="rtl"
              aria-required="true"
            />
            {errors.past_experience_ar && <p className={errorClass}>{errors.past_experience_ar}</p>}
          </div>

          <div className="relative transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex justify-between items-center mb-1">
              <label className={labelClass} htmlFor="past_experience_en">
                {t('profile:pastExperienceEnglish')}*
              </label>
              <button
                type="button"
                onClick={() => toggleTip('past_experience_en')}
                className={tipButtonClass}
                aria-label="Past Experience English tips"
              >
                <Info size={16} className="text-blue-400 hover:text-blue-600" />
              </button>
            </div>
            <textarea
              id="past_experience_en"
              name="past_experience_en"
              value={formData.past_experience_en}
              onChange={handleChange}
              rows="4"
              className={`${inputClass('past_experience_en')} resize-none`}
              placeholder={t('profile:pastExperienceEnglish')}
              aria-required="true"
            />
            {errors.past_experience_en && <p className={errorClass}>{errors.past_experience_en}</p>}
          </div>
        </motion.div>
      );

    case 3:
      return (
        <motion.div
          key="step3"
          initial={animateDirection === 'next' ? 'enterFromRight' : 'enterFromLeft'}
          animate="center"
          exit={animateDirection === 'next' ? 'exitToLeft' : 'exitToRight'}
          variants={variants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-8"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{t('profile:contactInfo')}</h2>
            <p className="text-gray-600">{t('profile:contactInfoDescription')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative transform hover:scale-[1.01] transition-transform duration-300">
              <label className={labelClass} htmlFor="servicePhone">
                {t('profile:serviceNumber')}*
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="servicePhone"
                  name="servicePhone"
                  value={formData.servicePhone}
                  onChange={handleChange}
                  className={inputClass('servicePhone')}
                  placeholder={t('profile:serviceNumber')}
                  aria-required="true"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500">
                  <Phone size={18} />
                </div>
              </div>
              {errors.servicePhone && <p className={errorClass}>{errors.servicePhone}</p>}
            </div>
            
            <div className="relative transform hover:scale-[1.01] transition-transform duration-300">
              <label className={labelClass} htmlFor="serviceEmail">
                {t('profile:serviceEmail')}*
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="serviceEmail"
                  name="serviceEmail"
                  value={formData.serviceEmail}
                  onChange={handleChange}
                  className={inputClass('serviceEmail')}
                  placeholder={t('profile:serviceEmail')}
                  aria-required="true"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500">
                  <Mail size={18} />
                </div>
              </div>
              {errors.serviceEmail && <p className={errorClass}>{errors.serviceEmail}</p>}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-blue-700 mb-4">{t('profile:location')}</h3>
            <LocationSelector
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              selectedGovernorate={selectedGovernorate}
              setSelectedGovernorate={setSelectedGovernorate}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              countries={countries}
              governorates={governorates}
              cities={cities}
              isRTL={isRTL}
              t={t}
              inputClass={inputClass}
              labelClass={labelClass}
            />
          </div>
        </motion.div>
      );

    case 4:
      return (
        <motion.div
          key="step4"
          initial={animateDirection === 'next' ? 'enterFromRight' : 'enterFromLeft'}
          animate="center"
          exit={animateDirection === 'next' ? 'exitToLeft' : 'exitToRight'}
          variants={variants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-8"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{t('profile:mediaAndLinks')}</h2>
            <p className="text-gray-600">{t('profile:mediaAndLinksDescription')}</p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-blue-700 mb-4">{t('profile:socialMedia')}</h3>
            <LinksInput
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              addLink={addLink}
              removeLink={removeLink}
              handleLinkChange={handleLinkChange}
              t={t}
              inputClass={inputClass}
            />
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-indigo-700 mb-4">{t('profile:profileImage')}</h3>
            <ImageUpload
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
              formData={formData}
              setFormData={setFormData}
              fileInputRef={fileInputRef}
              handleChange={handleChange}
              t={t}
            />
          </div>

          {renderServiceTypeFields({
            formData,
            handleNestedChange,
            handleNestedArrayChange,
            addNestedArrayItem,
            removeNestedArrayItem,
            errors,
            t,
            inputClass,
            labelClass
          })}
        </motion.div>
      );

    case 5:
      return (
        <motion.div
          key="step5"
          initial={animateDirection === 'next' ? 'enterFromRight' : 'enterFromLeft'}
          animate="center"
          exit={animateDirection === 'next' ? 'exitToLeft' : 'exitToRight'}
          variants={variants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-8"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{t('profile:serviceType')}</h2>
            <p className="text-gray-600">{t('profile:serviceTypeDescription')}</p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl shadow-sm">
            <ServiceTypeSelector
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              getServiceTypeLabel={getServiceTypeLabel}
              t={t}
            />
          </div>

          {renderServiceTypeFields({
            formData,
            handleNestedChange,
            handleNestedArrayChange,
            addNestedArrayItem,
            removeNestedArrayItem,
            errors,
            t,
            inputClass,
            labelClass
          })}
        </motion.div>
      );

    case 6:
      return (
        <motion.div
          key="step6"
          initial={animateDirection === 'next' ? 'enterFromRight' : 'enterFromLeft'}
          animate="center"
          exit={animateDirection === 'next' ? 'exitToLeft' : 'exitToRight'}
          variants={variants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-8"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{t('profile:pricing')}</h2>
            <p className="text-gray-600">{t('profile:pricingDescription')}</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl shadow-sm">
            <div className="relative transform hover:scale-[1.01] transition-transform duration-300 mb-6">
              <label className={`${labelClass} bg-gradient-to-r from-green-50 to-blue-50`} htmlFor="price">
                {t('profile:servicePrice')}*
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-green-600 font-bold text-lg">$</span>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`${inputClass('price')} pl-10`}
                  placeholder="0.00"
                  aria-required="true"
                />
              </div>
              {errors.price && <p className={errorClass}>{errors.price}</p>}
            </div>

            <div className="relative transform hover:scale-[1.01] transition-transform duration-300">
              <label className={`${labelClass} bg-gradient-to-r from-green-50 to-blue-50`} htmlFor="priceUnit">
                {t('profile:priceUnit')}*
              </label>
              <div className="relative mt-1">
                <select
                  id="priceUnit"
                  name="priceUnit"
                  value={formData.priceUnit}
                  onChange={handleChange}
                  className={`${inputClass('priceUnit')} appearance-none bg-white`}
                  aria-required="true"
                >
                  <option value="" disabled>{t('profile:selectPriceUnit')}</option>
                  <option value="per_half_hour">{t('profile:perHalfHour')}</option>
                  <option value="per_hour">{t('profile:perHour')}</option>
                  <option value="per_day">{t('profile:perDay')}</option>
                  <option value="per_project">{t('profile:perProject')}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-500">
                  <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
              {errors.priceUnit && <p className={errorClass}>{errors.priceUnit}</p>}
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="bg-amber-100 p-2 rounded-full mr-3">
                <Lightbulb size={20} className="text-amber-600" />
              </div>
              <p className="text-amber-700 text-sm">{t('profile:pricingTip')}</p>
            </div>
          </div>
        </motion.div>
      );

    case 7:
      return (
        <motion.div
          key="step7"
          initial={animateDirection === 'next' ? 'enterFromRight' : 'enterFromLeft'}
          animate="center"
          exit={animateDirection === 'next' ? 'exitToLeft' : 'exitToRight'}
          variants={variants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-6"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{t('profile:reviewYourProfile')}</h2>
            <p className="text-gray-600">{t('profile:reviewDescription')}</p>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl shadow-sm">
            <ReviewStep
              formData={formData}
              getServiceTypeLabel={getServiceTypeLabel}
              imagePreview={imagePreview}
              selectedCountry={selectedCountry}
              selectedGovernorate={selectedGovernorate}
              selectedCity={selectedCity}
              countries={countries}
              governorates={governorates}
              cities={cities}
              isRTL={isRTL}
              t={t}
            />
          </div>
          
          <div className="bg-blue-50 p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
            <div className="flex items-start">
              <div className="text-blue-500 mr-3 mt-0.5">
                <CheckCircle size={20} />
              </div>
              <div>
                <h4 className="font-medium text-blue-700">{t('profile:almostDone')}</h4>
                <p className="text-sm text-blue-600 mt-1">{t('profile:reviewBeforeSubmit')}</p>
              </div>
            </div>
          </div>
        </motion.div>
      );

    default:
      return null;
  }
};

// Main ServiceFormPopup Component
const ServiceFormPopup = ({ isOpen, onClose, onSubmit, initialData = {}, providerId }) => {
  const [step, setStep] = useState(1);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    about_ar: '',
    about_en: '',
    past_experience_ar: '',
    past_experience_en: '',
    years_of_experience: '',
    address_details: '',
    address_link: '',
    servicePhone: '',
    serviceEmail: '',
    price: '',
    priceUnit: '',
    links: [
      { _key: `link-${Date.now()}-0`, url: '' },
      { _key: `link-${Date.now()}-1`, url: '' },
      { _key: `link-${Date.now()}-2`, url: '' },
    ],
    image: null,
    images: [],
    country: null,
    government: null,
    city: null,
    statusAdminApproved: false,
    isMainService: false,
    serviceAverageRating: 0,
    serviceRatingCount: 0,
    serviceType: '',
    termsAccepted: false,
    confirmDataAccuracy: false,
    horseStableDetails: {
      horses: [],
      additionalBenefits: [],
      dateOfEstablishment: null,
      licensesAndCertificates: [],
      kindOfStable: '',
      stableDescription: '',
      listingPurpose: '',
    },
    VeterinaryDetails: {
      specialties: [],
      professionalLicense: { licenseNumber: '', licenseDate: null },
      additionalServices: [],
      graduationOrAccreditationCertificate: null,
    },
    competitions: {
      level: '',
      heightDistance: '',
      organiserName: '',
      mainReferee: '',
      coReferee1: '',
      coReferee2: '',
      raceType: '',
      prize: '',
      sponsor: '',
      sponsorLogo: null,
      sponsorshipValue: 0,
    },
    housingDetails: { housingDetails: '' },
    horseTrainerDetails: {
      trainerLevel: '',
      specialization: '',
      yearsOfExperience: 0,
      qualifications: '',
      additionalServices: [],
    },
    hoofTrimmerDetails: {
      specialization: '',
      methodsAndTools: '',
      certifications: null,
      additionalServices: [],
    },
    horseGroomingDetails: {
      methodsAndTools: '',
      certifications: null,
      additionalServices: [],
    },
    eventJudgingDetails: {
      eventTypes: [],
      certifications: [],
      judgingLevel: '',
    },
    marketingPromotionDetails: {
      portfolioLinks: [],
      certifications: [],
    },
    eventCommentaryDetails: {
      portfolioLink: { url: '', description_ar: '', description_en: '' },
      certifications: [],
    },
    consultingServicesDetails: {
      certifications: [],
    },
    photographyServicesDetails: {
      photographyTypes: [],
      portfolioLink: { url: '', description_ar: '', description_en: '' },
      certifications: [],
    },
    transportDetails: {
      maxLoad: 0,
      suspensionSystem: false,
      ventilationAndLighting: false,
      internalBarriers: false,
      advancedVentilation: false,
      wallUpholstery: false,
      horseInsurance: false,
      waterAndFood: false,
      emergencyVetServices: false,
      experienceYears: 0,
      certifications: '',
      relevantLicenses: '',
      termsAndPolicies: '',
    },
    contractorsDetails: {
      serviceTypes: [],
      portfolioLink: { url: '', description_ar: '', description_en: '' },
      certifications: [],
    },
    supplierDetails: {
      certifications: null,
      products: [],
    },
    horseCateringDetails: {
      additionalServices: [],
    },
    tripCoordinator: {
      locationOfHorses: '',
      locationOfTent: '',
      startDate: null,
      endDate: null,
      breakTimes: '',
      meals: [],
      containsAidBag: false,
      activities: '',
      priceForFamilyOf2: 0,
      priceForFamilyOf3: 0,
      priceForFamilyOf4: 0,
      tripProgram: '',
      levelOfHardship: '',
      conditionsAndRequirements: '',
      safetyAndEquipment: '',
      cancellationAndRefundPolicy: '',
      moreDetails: '',
    },
    ...initialData,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [animateDirection, setAnimateDirection] = useState('next');
  const [showTips, setShowTips] = useState({});
  const [autoSaved, setAutoSaved] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [countries, setCountries] = useState([]);
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Refs
  const formContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch countries from Sanity
  useEffect(() => {
    client.fetch('*[_type == "country"]{_id, name_en, name_ar}')
      .then(data => setCountries(data))
      .catch(error => console.error(error));
  }, []);

  // Fetch governorates based on selected country
  useEffect(() => {
    if (selectedCountry) {
      client.fetch(`*[_type == "governorate" && country._ref == $countryId]{_id, name_en, name_ar}`, { countryId: selectedCountry })
        .then(data => setGovernorates(data))
        .catch(error => console.error(error));
      setSelectedGovernorate('');
      setSelectedCity('');
    } else {
      setGovernorates([]);
      setCities([]);
    }
  }, [selectedCountry]);

  // Fetch cities based on selected governorate
  useEffect(() => {
    if (selectedGovernorate) {
      client.fetch(`*[_type == "city" && governorate._ref == $governorateId]{_id, name_en, name_ar}`, { governorateId: selectedGovernorate })
        .then(data => setCities(data))
        .catch(error => console.error(error));
      setSelectedCity('');
    } else {
      setCities([]);
    }
  }, [selectedGovernorate]);

  // Auto-save to localStorage
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (isOpen && Object.keys(formData).some(key => formData[key])) {
        localStorage.setItem('serviceFormDraft', JSON.stringify(formData));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 3000);
      }
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [formData, isOpen]);

  // Load saved draft
  useEffect(() => {
    const savedDraft = localStorage.getItem('serviceFormDraft');
    if (savedDraft) {
      try {
        const parsedData = JSON.parse(savedDraft);
        setFormData(parsedData);
        if (parsedData.country) setSelectedCountry(parsedData.country);
        if (parsedData.government) setSelectedGovernorate(parsedData.government);
        if (parsedData.city) setSelectedCity(parsedData.city);
        if (parsedData.imageUrl) setImagePreview(parsedData.imageUrl);
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, []);

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setFormData({
          name_ar: '',
          name_en: '',
          about_ar: '',
          about_en: '',
          past_experience_ar: '',
          past_experience_en: '',
          years_of_experience: '',
          address_details: '',
          address_link: '',
          servicePhone: '',
          serviceEmail: '',
          price: '',
          priceUnit: '',
          links: [
            { _key: `link-${Date.now()}-0`, url: '' },
            { _key: `link-${Date.now()}-1`, url: '' },
            { _key: `link-${Date.now()}-2`, url: '' },
          ],
          image: null,
          images: [],
          country: null,
          government: null,
          city: null,
          statusAdminApproved: false,
          isMainService: false,
          serviceAverageRating: 0,
          serviceRatingCount: 0,
          serviceType: '',
          termsAccepted: false,
          confirmDataAccuracy: false,
          horseStableDetails: {
            horses: [],
            additionalBenefits: [],
            dateOfEstablishment: null,
            licensesAndCertificates: [],
            kindOfStable: '',
            stableDescription: '',
            listingPurpose: '',
          },
          VeterinaryDetails: {
            specialties: [],
            professionalLicense: { licenseNumber: '', licenseDate: null },
            additionalServices: [],
            graduationOrAccreditationCertificate: null,
          },
          competitions: {
            level: '',
            heightDistance: '',
            organiserName: '',
            mainReferee: '',
            coReferee1: '',
            coReferee2: '',
            raceType: '',
            prize: '',
            sponsor: '',
            sponsorLogo: null,
            sponsorshipValue: 0,
          },
          housingDetails: { housingDetails: '' },
          horseTrainerDetails: {
            trainerLevel: '',
            specialization: '',
            yearsOfExperience: 0,
            qualifications: '',
            additionalServices: [],
          },
          hoofTrimmerDetails: {
            specialization: '',
            methodsAndTools: '',
            certifications: null,
            additionalServices: [],
          },
          horseGroomingDetails: {
            methodsAndTools: '',
            certifications: null,
            additionalServices: [],
          },
          eventJudgingDetails: {
            eventTypes: [],
            certifications: [],
            judgingLevel: '',
          },
          marketingPromotionDetails: {
            portfolioLinks: [],
            certifications: [],
          },
          eventCommentaryDetails: {
            portfolioLink: { url: '', description_ar: '', description_en: '' },
            certifications: [],
          },
          consultingServicesDetails: {
            certifications: [],
          },
          photographyServicesDetails: {
            photographyTypes: [],
            portfolioLink: { url: '', description_ar: '', description_en: '' },
            certifications: [],
          },
          transportDetails: {
            maxLoad: 0,
            suspensionSystem: false,
            ventilationAndLighting: false,
            internalBarriers: false,
            advancedVentilation: false,
            wallUpholstery: false,
            horseInsurance: false,
            waterAndFood: false,
            emergencyVetServices: false,
            experienceYears: 0,
            certifications: '',
            relevantLicenses: '',
            termsAndPolicies: '',
          },
          contractorsDetails: {
            serviceTypes: [],
            portfolioLink: { url: '', description_ar: '', description_en: '' },
            certifications: [],
          },
          supplierDetails: {
            certifications: null,
            products: [],
          },
          horseCateringDetails: {
            additionalServices: [],
          },
          tripCoordinator: {
            locationOfHorses: '',
            locationOfTent: '',
            startDate: null,
            endDate: null,
            breakTimes: '',
            meals: [],
            containsAidBag: false,
            activities: '',
            priceForFamilyOf2: 0,
            priceForFamilyOf3: 0,
            priceForFamilyOf4: 0,
            tripProgram: '',
            levelOfHardship: '',
            conditionsAndRequirements: '',
            safetyAndEquipment: '',
            cancellationAndRefundPolicy: '',
            moreDetails: '',
          },
          ...initialData,
        });
        setErrors({});
        setIsSubmitting(false);
        setIsSuccess(false);
        setShowTips({});
        setImagePreview(null);
        setSelectedCountry('');
        setSelectedGovernorate('');
        setSelectedCity('');
      }, 300);
    }
  }, [isOpen, initialData]);

  // Scroll to top on step change
  useEffect(() => {
    if (formContainerRef.current) {
      formContainerRef.current.scrollTop = 0;
    }
  }, [step]);

  // Validate URL
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validate step
  const totalSteps = 7;

  const validateStep = (currentStep) => {
    let stepErrors = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.name_ar.trim()) {
        stepErrors.name_ar = t('profile:serviceNameArabicRequired');
        isValid = false;
      }
      if (!formData.name_en.trim()) {
        stepErrors.name_en = t('profile:serviceNameEnglishRequired');
        isValid = false;
      }
      if (!formData.years_of_experience) {
        stepErrors.years_of_experience = t('profile:yearsOfExperienceRequired');
        isValid = false;
      }
    } else if (currentStep === 2) {
      if (!formData.about_ar.trim()) {
        stepErrors.about_ar = t('profile:serviceDescriptionArabicRequired');
        isValid = false;
      } else if (formData.about_ar.length < 50) {
        stepErrors.about_ar = t('profile:serviceDescriptionMinLength');
        isValid = false;
      }
      if (!formData.about_en.trim()) {
        stepErrors.about_en = t('profile:serviceDescriptionEnglishRequired');
        isValid = false;
      } else if (formData.about_en.length < 50) {
        stepErrors.about_en = t('profile:serviceDescriptionMinLength');
        isValid = false;
      }
      if (!formData.past_experience_ar.trim()) {
        stepErrors.past_experience_ar = t('profile:pastExperienceArabicRequired');
        isValid = false;
      }
      if (!formData.past_experience_en.trim()) {
        stepErrors.past_experience_en = t('profile:pastExperienceEnglishRequired');
        isValid = false;
      }
    } else if (currentStep === 3) {
      if (!formData.servicePhone.trim()) {
        stepErrors.servicePhone = t('profile:serviceNumberRequired');
        isValid = false;
      }
      if (!formData.serviceEmail.trim()) {
        stepErrors.serviceEmail = t('profile:serviceEmailRequired');
        isValid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(formData.serviceEmail)) {
        stepErrors.serviceEmail = t('profile:serviceEmailInvalid');
        isValid = false;
      }
      if (!selectedCountry) {
        stepErrors.country = t('profile:countryRequired');
        isValid = false;
      }
      if (!selectedGovernorate) {
        stepErrors.government = t('profile:governorateRequired');
        isValid = false;
      }
      if (!selectedCity) {
        stepErrors.city = t('profile:cityRequired');
        isValid = false;
      }
    } else if (currentStep === 4) {
      formData.links.forEach((link, index) => {
        if (link.url.trim() && !isValidUrl(link.url)) {
          stepErrors[`link-${index}`] = t('profile:invalidUrlError');
          isValid = false;
        }
      });
      if (formData.images.some(file => !['image/jpeg', 'image/png', 'image/gif'].includes(file.type))) {
        stepErrors.images = t('profile:invalidImageFormat');
        isValid = false;
      }
    } else if (currentStep === 5) {
      if (!formData.serviceType) {
        stepErrors.serviceType = t('profile:serviceTypeRequired');
        isValid = false;
      }
      if (formData.serviceType === 'veterinary') {
        if (!formData.VeterinaryDetails.specialties.length) {
          stepErrors.specialties = t('profile:specialtiesRequired');
          isValid = false;
        }
      }
      if (formData.serviceType === 'horse_stable') {
        if (!formData.horseStableDetails.stableDescription.trim()) {
          stepErrors.stableDescription = t('profile:stableDescriptionRequired');
          isValid = false;
        }
      }
    } else if (currentStep === 6) {
      if (formData.serviceType !== 'suppliers') {
        if (!formData.price) {
          stepErrors.price = t('profile:servicePriceRequired');
          isValid = false;
        } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
          stepErrors.price = t('profile:servicePriceInvalid');
          isValid = false;
        }
        if (!formData.priceUnit) {
          stepErrors.priceUnit = t('profile:priceUnitRequired');
          isValid = false;
        }
      }
    }

    setErrors(stepErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setAnimateDirection('next');
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setAnimateDirection('prev');
    setStep(step - 1);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      if (name === 'termsAccepted' || name === 'confirmDataAccuracy' || name === 'statusAdminApproved' || name === 'isMainService') {
        setFormData({ ...formData, [name]: checked });
      } else if (name.startsWith('transportDetails-')) {
        const field = name.split('-')[1];
        setFormData({
          ...formData,
          transportDetails: { ...formData.transportDetails, [field]: checked },
        });
      }
    } else if (type === 'file') {
      if (name === 'image') {
        const file = files[0];
        if (file) {
          setFormData({ ...formData, image: file });
          const reader = new FileReader();
          reader.onloadend = () => setImagePreview(reader.result);
          reader.readAsDataURL(file);
        }
      } else if (name === 'images') {
        setFormData({ ...formData, images: Array.from(files) });
      } else if (name === 'graduationOrAccreditationCertificate') {
        setFormData({
          ...formData,
          VeterinaryDetails: { ...formData.VeterinaryDetails, graduationOrAccreditationCertificate: files[0] },
        });
      } else if (name === 'sponsorLogo') {
        setFormData({
          ...formData,
          competitions: { ...formData.competitions, sponsorLogo: files[0] },
        });
      } else if (name === 'certifications') {
        setFormData({
          ...formData,
          [formData.serviceType + 'Details']: {
            ...formData[formData.serviceType + 'Details'],
            certifications: Array.from(files),
          },
        });
      } else if (name === 'licensesAndCertificates') {
        setFormData({
          ...formData,
          horseStableDetails: {
            ...formData.horseStableDetails,
            licensesAndCertificates: Array.from(files),
          },
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleNestedChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleNestedArrayChange = (category, arrayField, index, field, value) => {
    const newArray = [...formData[category][arrayField]];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      [category]: { ...prev[category], [arrayField]: newArray },
    }));
    if (errors[`${arrayField}-${index}-${field}`]) {
      setErrors({ ...errors, [`${arrayField}-${index}-${field}`]: null });
    }
  };

  const addNestedArrayItem = (category, arrayField, item) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [arrayField]: [...prev[category][arrayField], item],
      },
    }));
  };

  const removeNestedArrayItem = (category, arrayField, index) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [arrayField]: prev[category][arrayField].filter((_, i) => i !== index),
      },
    }));
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...formData.links];
    newLinks[index] = { ...newLinks[index], url: value };
    setFormData({ ...formData, links: newLinks });
    if (errors[`link-${index}`]) {
      setErrors({ ...errors, [`link-${index}`]: null });
    }
  };

  const addLink = () => {
    if (formData.links.length < 6) {
      setFormData({
        ...formData,
        links: [
          ...formData.links,
          { _key: `link-${Date.now()}-${formData.links.length}`, url: '' },
        ],
      });
    }
  };

  const removeLink = (index) => {
    if (index >= 3) {
      const newLinks = formData.links.filter((_, i) => i !== index);
      setFormData({ ...formData, links: newLinks });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;
    setIsSubmitting(true);

    try {
      const payload = {
        _type: 'service',
        name_ar: formData.name_ar,
        name_en: formData.name_en,
        about_ar: formData.about_ar,
        about_en: formData.about_en,
        past_experience_ar: formData.past_experience_ar,
        past_experience_en: formData.past_experience_en,
        years_of_experience: parseInt(formData.years_of_experience) || 0,
        address_details: formData.address_details,
        address_link: formData.address_link,
        servicePhone: formData.servicePhone,
        serviceEmail: formData.serviceEmail,
        price: formData.serviceType !== 'suppliers' ? parseFloat(formData.price) : undefined,
        priceUnit: formData.serviceType !== 'suppliers' ? formData.priceUnit : undefined,
        links: formData.links.filter(link => link.url.trim()).map(link => ({ _key: link._key, url: link.url })),
        country: formData.country,
        government: formData.government,
        city: formData.city,
        statusAdminApproved: formData.statusAdminApproved,
        isMainService: formData.isMainService,
        serviceAverageRating: formData.serviceAverageRating,
        serviceRatingCount: formData.serviceRatingCount,
        serviceType: formData.serviceType,
        ...(formData.serviceType === 'horse_stable' && {
          horseStableDetails: {
            ...formData.horseStableDetails,
            additionalBenefits: formData.horseStableDetails.additionalBenefits.filter(b => b.name_ar.trim() || b.name_en.trim()),
            horses: formData.horseStableDetails.horses.filter(h => h.name_ar.trim() || h.name_en.trim()),
          }
        }),
        ...(formData.serviceType === 'veterinary' && {
          VeterinaryDetails: {
            ...formData.VeterinaryDetails,
            additionalServices: formData.VeterinaryDetails.additionalServices.filter(s => s.name_ar.trim() || s.name_en.trim()),
          }
        }),
        ...(formData.serviceType === 'trip_coordinator' && {
          tripCoordinator: {
            ...formData.tripCoordinator,
            meals: formData.tripCoordinator.meals.filter(m => m.name_ar.trim() || m.name_en.trim()),
          }
        }),
      };

      let imageAsset;
      if (formData.image) {
        imageAsset = await uploadFileToSanity(formData.image);
        payload.image = { _type: 'image', asset: { _ref: imageAsset._id } };
      }

      if (formData.images.length > 0) {
        const imageAssets = await Promise.all(
          formData.images.map(file => uploadFileToSanity(file))
        );
        payload.images = imageAssets.map(asset => ({
          _type: 'image',
          asset: { _ref: asset._id },
        }));
      }

      if (formData.serviceType === 'veterinary' && formData.VeterinaryDetails.graduationOrAccreditationCertificate) {
        const certAsset = await uploadFileToSanity(formData.VeterinaryDetails.graduationOrAccreditationCertificate);
        payload.VeterinaryDetails.graduationOrAccreditationCertificate = {
          _type: 'file',
          asset: { _ref: certAsset._id },
        };
      }

      const result = await client.createOrReplace(payload);
      setIsSuccess(true);
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: t('profile:submissionError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = (stepNumber) => {
    switch (stepNumber) {
      case 1: return t('profile:serviceBasics');
      case 2: return t('profile:serviceDetails');
      case 3: return t('profile:locationContact');
      case 4: return t('profile:additionalOptions');
      case 5: return t('profile:serviceType');
      case 6: return t('profile:pricing');
      case 7: return t('profile:reviewConfirm');
      default: return '';
    }
  };

  const getStepDescription = (stepNumber) => {
    switch (stepNumber) {
      case 1: return t('profile:basicInfoDesc');
      case 2: return t('profile:detailsPricingDesc');
      case 3: return t('profile:locationContactDesc');
      case 4: return t('profile:additionalOptionsDesc');
      case 5: return t('profile:serviceTypeAndPricing');
      case 6: return t('profile:pricing');
      case 7: return t('profile:reviewConfirmDesc');
      default: return '';
    }
  };

  const getServiceTypeLabel = (type) => {
    return t(`profile:${type}`) || type;
  };

  const toggleTip = (fieldName) => {
    setShowTips(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl m-4 relative flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData._id ? t('profile:editService') : t('profile:addNewService')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label={t('profile:close')}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto" ref={formContainerRef}>
          <StepNavigation
            step={step}
            totalSteps={totalSteps}
            getStepTitle={getStepTitle}
            getStepDescription={getStepDescription}
            isRTL={isRTL}
          />

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <StepContent
                step={step}
                animateDirection={animateDirection}
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                showTips={showTips}
                toggleTip={toggleTip}
                handleChange={handleChange}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                fileInputRef={fileInputRef}
                handleLinkChange={handleLinkChange}
                addLink={addLink}
                removeLink={removeLink}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                selectedGovernorate={selectedGovernorate}
                setSelectedGovernorate={setSelectedGovernorate}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                countries={countries}
                governorates={governorates}
                cities={cities}
                handleNestedChange={handleNestedChange}
                handleNestedArrayChange={handleNestedArrayChange}
                addNestedArrayItem={addNestedArrayItem}
                removeNestedArrayItem={removeNestedArrayItem}
                getServiceTypeLabel={getServiceTypeLabel}
                isRTL={isRTL}
                t={t}
              />
            </AnimatePresence>

            {errors.submit && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
                <Info size={20} className="mr-2" />
                <span>{errors.submit}</span>
              </div>
            )}

            {isSuccess && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
                <Check size={20} className="mr-2" />
                <span>{t('profile:serviceSavedSuccessfully')}</span>
              </div>
            )}

            <div className="mt-6">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-required="true"
                />
                <span>{t('profile:acceptTerms')}</span>
              </label>
              {errors.termsAccepted && (
                <p className="text-red-500 text-sm mt-1 ml-2">{errors.termsAccepted}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="confirmDataAccuracy"
                  checked={formData.confirmDataAccuracy}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-required="true"
                />
                <span>{t('profile:confirmDataAccuracy')}</span>
              </label>
              {errors.confirmDataAccuracy && (
                <p className="text-red-500 text-sm mt-1 ml-2">{errors.confirmDataAccuracy}</p>
              )}
            </div>

            <FormActions
              step={step}
              totalSteps={totalSteps}
              handlePrevious={handlePrevious}
              handleNext={handleNext}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isRTL={isRTL}
              t={t}
            />
          </form>

          {autoSaved && (
            <div className="fixed bottom-4 right-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg shadow flex items-center">
              <Check size={16} className="mr-2" />
              <span>{t('profile:autoSaved')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceFormPopup;