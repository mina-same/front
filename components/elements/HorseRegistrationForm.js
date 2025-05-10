"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Save, Award, Camera, FileText, Heart, Shield, CreditCard, Clipboard, Star, User, Trophy, Medal, AlertTriangle, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { client } from "../../src/lib/sanity";
import SearchableBreedDropdown from './SearchableBreedDropdown.js';

// Custom Alert Component
const Alert = ({ message, isVisible, onClose, type }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-auto"
      >
        <div
          className={`bg-white shadow-lg rounded-lg p-4 flex items-start ${type === "success" ? "border-l-4 border-green-500" : "border-l-4 border-red-500"
            }`}
        >
          {type === "success" ? (
            <CheckCircle className="text-green-500 mr-3" size={24} />
          ) : (
            <AlertTriangle className="text-red-500 mr-3" size={24} />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            ×
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function HorseRegistrationForm({ userId }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [stables, setStables] = useState([]);
  const [trainersList, setTrainersList] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    breed: "",
    birthDate: "",
    gender: "",
    images: [],
    mainColor: "",
    additionalColors: [],
    distinctiveMarkArabic: "",
    distinctiveMarkEnglish: "",
    electronicChipNumber: "",
    passportNumber: "",
    nationalID: "",
    fatherRegistrationNumber: "",
    motherRegistrationNumber: "",
    lineageDetailsArabic: "",
    lineageDetailsEnglish: "",
    previousOwner: "",
    stableLocation: "",
    healthCertificates: [],
    vaccinationCertificates: [],
    geneticAnalysis: null,
    ownershipCertificate: null,
    internationalTransportPermit: null,
    passportImage: null,
    insurancePolicyNumber: "",
    insuranceDetailsArabic: "",
    insuranceDetailsEnglish: "",
    insuranceEndDate: "",
    horseActivities: [],
    achievements: "",
    trainers: [],
    listingPurpose: "",
    marketValue: 0,
    loveCounter: 0,
    profileLevel: "basic",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [alert, setAlert] = useState({ isVisible: false, message: "", type: "error" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const totalSteps = 6;

  useEffect(() => {
    const totalFields = Object.keys(formData).length;
    let filledFields = 0;

    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) filledFields++;
      } else if (value !== null && value !== "" && value !== 0 && value !== "basic") {
        filledFields++;
      }
    });

    const percentage = Math.floor((filledFields / totalFields) * 100);
    setCompletionPercentage(percentage);
  }, [formData]);

  useEffect(() => {
    const fetchStables = async () => {
      const query = `*[_type == "services" && serviceType == "horse_stable" && statusAdminApproved == true && isMainService == true] {
        _id,
        name_en,
        name_ar,
      }`;
      const result = await client.fetch(query);
      setStables(result);
    };

    const fetchTrainers = async () => {
      const query = `*[_type == "services" && serviceType == "horse_trainer" && statusAdminApproved == true && isMainService == true] {
        _id,
        name_en,
        name_ar,
      }`;
      const result = await client.fetch(query);
      setTrainersList(result);
    };

    fetchStables();
    fetchTrainers();
  }, []);

  const getProfileTier = (percentage) => {
    if (percentage > 90)
      return {
        name: t("user:horseRegistration.profileTier.gold"),
        level: "gold",
        color: "text-amber-500",
        message: t("user:horseRegistration.profileTier.goldMessage"),
        icon: <Trophy className="text-amber-500" size={20} />,
      };
    if (percentage > 75)
      return {
        name: t("user:horseRegistration.profileTier.silver"),
        level: "silver",
        color: "text-gray-400",
        message: t("user:horseRegistration.profileTier.silverMessage"),
        icon: <Award className="text-gray-400" size={20} />,
      };
    if (percentage > 50)
      return {
        name: t("user:horseRegistration.profileTier.bronze"),
        level: "bronze",
        color: "text-orange-400",
        message: t("user:horseRegistration.profileTier.bronzeMessage"),
        icon: <Medal className="text-orange-400" size={20} />,
      };
    return {
      name: t("user:horseRegistration.profileTier.basic"),
      level: "basic",
      color: "text-gray-600",
      message: t("user:horseRegistration.profileTier.basicMessage"),
      icon: <Shield className="text-gray-600" size={20} />,
    };
  };

  const tier = getProfileTier(completionPercentage);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData({
        ...formData,
        [name]: files ? Array.from(files) : null,
      });
    } else if (type === "checkbox") {
      if (e.target.checked) {
        setFormData({
          ...formData,
          [name]: [...formData[name], value],
        });
      } else {
        setFormData({
          ...formData,
          [name]: formData[name].filter((item) => item !== value),
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleMultiSelect = (name, value) => {
    if (formData[name].includes(value)) {
      setFormData({
        ...formData,
        [name]: formData[name].filter((item) => item !== value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: [...formData[name], value],
      });
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const uploadFileToSanity = async (file) => {
    const response = await client.assets.upload("file", file);
    return response._id;
  };

  const uploadImageToSanity = async (image) => {
    const response = await client.assets.upload("image", image);
    return response._id;
  };

  const showAlert = (message, type = "error") => {
    setAlert({ isVisible: true, message, type });
    setTimeout(() => setAlert({ isVisible: false, message: "", type: "error" }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    const step1RequiredFields = ["fullName", "breed", "birthDate", "gender", "images", "mainColor"];
    const isStep1Complete = step1RequiredFields.every((field) =>
      Array.isArray(formData[field]) ? formData[field].length > 0 : formData[field] !== ""
    );
  
    if (!isStep1Complete) {
      showAlert(t("user:horseRegistration.alerts.step1Incomplete"), "error");
      setCurrentStep(1);
      setIsSubmitting(false);
      return;
    }
  
    if (!formData.listingPurpose || formData.marketValue <= 0) {
      showAlert(t("user:horseRegistration.alerts.listingPurposeAndValueRequired"), "error");
      setCurrentStep(6);
      setIsSubmitting(false);
      return;
    }
  
    try {
      const profileTier = getProfileTier(completionPercentage);
  
      const horseData = {
        _type: "horse",
        fullName: formData.fullName,
        breed: formData.breed,
        birthDate: formData.birthDate,
        gender: formData.gender,
        images: await Promise.all(
          Array.from(formData.images).map(async (image) => ({
            _type: "image",
            _key: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
            asset: { _ref: await uploadImageToSanity(image) },
          }))
        ),
        mainColor: formData.mainColor,
        additionalColors: formData.additionalColors,
        distinctiveMarkArabic: formData.distinctiveMarkArabic,
        distinctiveMarkEnglish: formData.distinctiveMarkEnglish,
        electronicChipNumber: formData.electronicChipNumber,
        passportNumber: formData.passportNumber,
        nationalID: formData.nationalID,
        fatherRegistrationNumber: formData.fatherRegistrationNumber,
        motherRegistrationNumber: formData.motherRegistrationNumber,
        lineageDetailsArabic: formData.lineageDetailsArabic,
        lineageDetailsEnglish: formData.lineageDetailsEnglish,
        previousOwner: formData.previousOwner,
        owner: { _type: "reference", _ref: userId },
        healthCertificates: await Promise.all(
          Array.from(formData.healthCertificates).map(async (file) => ({
            _type: "file",
            _key: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
            asset: { _ref: await uploadFileToSanity(file) },
          }))
        ),
        vaccinationCertificates: await Promise.all(
          Array.from(formData.vaccinationCertificates).map(async (file) => ({
            _type: "file",
            _key: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
            asset: { _ref: await uploadFileToSanity(file) },
          }))
        ),
        insurancePolicyNumber: formData.insurancePolicyNumber,
        insuranceDetailsArabic: formData.insuranceDetailsArabic,
        insuranceDetailsEnglish: formData.insuranceDetailsEnglish,
        insuranceEndDate: formData.insuranceEndDate,
        horseActivities: formData.horseActivities,
        achievements: formData.achievements,
        trainers: formData.trainers,
        listingPurpose: formData.listingPurpose,
        marketValue: Number(formData.marketValue),
        loveCounter: formData.loveCounter,
        profileLevel: profileTier.level,
      };
  
      // Conditionally add stableLocation only if a valid stable is selected
      if (formData.stableLocation && formData.stableLocation !== "") {
        horseData.stableLocation = {
          _type: "reference",
          _ref: formData.stableLocation,
        };
      }
  
      // Conditionally add optional file fields
      if (formData.geneticAnalysis?.[0]) {
        horseData.geneticAnalysis = {
          _type: "file",
          _key: `${Date.now()}-genetic`,
          asset: { _ref: await uploadFileToSanity(formData.geneticAnalysis[0]) },
        };
      }
  
      if (formData.ownershipCertificate?.[0]) {
        horseData.ownershipCertificate = {
          _type: "file",
          _key: `${Date.now()}-ownership`,
          asset: { _ref: await uploadFileToSanity(formData.ownershipCertificate[0]) },
        };
      }
  
      if (formData.internationalTransportPermit?.[0]) {
        horseData.internationalTransportPermit = {
          _type: "file",
          _key: `${Date.now()}-transport`,
          asset: { _ref: await uploadFileToSanity(formData.internationalTransportPermit[0]) },
        };
      }
  
      if (formData.passportImage?.[0]) {
        horseData.passportImage = {
          _type: "image",
          _key: `${Date.now()}-passport`,
          asset: { _ref: await uploadImageToSanity(formData.passportImage[0]) },
        };
      }
  
      const horseDoc = await client.create(horseData);
      await client
        .patch(userId)
        .setIfMissing({ horses: [] })
        .append("horses", [{ _type: "reference", _ref: horseDoc._id }])
        .commit();
  
      console.log("Horse registered successfully:", horseDoc);
      showAlert(t("user:horseRegistration.alerts.success"), "success");
      
      // Show confetti and refresh
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error submitting horse registration:", error);
      showAlert(t("user:horseRegistration.alerts.error"), "error");
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIconMargin = () => (isRTL ? "ml-2" : "mr-2");
  const formGroupClass = `form-group ${isRTL ? "text-right" : "text-left"}`;

  const renderStep = () => {
    // ... (Previous renderStep content remains unchanged)
    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <h2 className={`text-2xl font-bold text-gray-800 flex items-center`}>
              <Star className={`${getIconMargin()} text-amber-500`} size={28} />
              {t("user:horseRegistration.basicInformation")}
            </h2>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-6">
              <p className="text-amber-800 font-medium">{t("user:horseRegistration.basicInfoIntro")}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={formGroupClass}>
                <label className="block text-gray-700 font-medium mb-2">
                  {t("user:horseRegistration.fullName")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>
              <SearchableBreedDropdown
                formData={formData}
                handleChange={handleChange}
                t={t}
                isRTL={isRTL}
                formGroupClass={formGroupClass}
              />
              <div className={formGroupClass}>
                <label className="block text-gray-700 font-medium mb-2">
                  {t("user:horseRegistration.birthDate")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div className={formGroupClass}>
                <label className="block text-gray-700 font-medium mb-2">
                  {t("user:horseRegistration.gender")} <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <option value="">{t("user:horseRegistration.selectGender")}</option>
                  <option value="male">{t("user:horseRegistration.male")}</option>
                  <option value="female">{t("user:horseRegistration.female")}</option>
                </select>
              </div>
            </div>
            <div className={formGroupClass}>
              <label className="block text-gray-700 font-medium mb-2">
                {t("user:horseRegistration.horseImages")} <span className="text-red-500">*</span>
                <span className={`${isRTL ? "mr-2" : "ml-2"} text-sm text-gray-500`}>({t("user:horseRegistration.imagesRequired")})</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-40">
                    {formData.images[index] ? (
                      <div className="text-center">
                        <p className="text-green-600">{t("user:horseRegistration.imageUploaded")}</p>
                        <button
                          type="button"
                          className="text-red-600 text-sm mt-2"
                          onClick={() => {
                            const newImages = [...formData.images];
                            newImages.splice(index, 1);
                            setFormData({ ...formData, images: newImages });
                          }}
                        >
                          {t("user:horseRegistration.remove")}
                        </button>
                      </div>
                    ) : (
                      <>
                        <Camera className="text-gray-400 mb-2" size={36} />
                        <label className="cursor-pointer text-[#333] hover:text-black text-sm text-center">
                          {t("user:horseRegistration.uploadImage")}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                const newImages = [...formData.images];
                                newImages[index] = e.target.files[0];
                                setFormData({ ...formData, images: newImages });
                              }
                            }}
                          />
                        </label>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className={formGroupClass}>
              <label className="block text-gray-700 font-medium mb-2">
                {t("user:horseRegistration.mainColor")} <span className="text-red-500">*</span>
              </label>
              <select
                name="mainColor"
                value={formData.mainColor}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                dir={isRTL ? "rtl" : "ltr"}
              >
                <option value="">{t("user:horseRegistration.selectMainColor")}</option>
                <option value="grey">{t("user:horseRegistration.grey")}</option>
                <option value="black">{t("user:horseRegistration.black")}</option>
                <option value="bay">{t("user:horseRegistration.bay")}</option>
                <option value="chestnut">{t("user:horseRegistration.chestnut")}</option>
                <option value="dappleGrey">{t("user:horseRegistration.dappleGrey")}</option>
                <option value="pinto">{t("user:horseRegistration.pinto")}</option>
                <option value="darkBlack">{t("user:horseRegistration.darkBlack")}</option>
                <option value="lightGrey">{t("user:horseRegistration.lightGrey")}</option>
                <option value="reddishBay">{t("user:horseRegistration.reddishBay")}</option>
                <option value="goldenChestnut">{t("user:horseRegistration.goldenChestnut")}</option>
                <option value="goldenYellow">{t("user:horseRegistration.goldenYellow")}</option>
                <option value="blazedWhite">{t("user:horseRegistration.blazedWhite")}</option>
              </select>
              {formData.mainColor && (
                <p className="mt-2 text-sm text-gray-600 italic">{t(`user:horseRegistration.mainColorDescriptions.${formData.mainColor}`)}</p>
              )}
            </div>
            <div className={formGroupClass}>
              <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.additionalColors")}</label>
              <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-2">
                {["palomino", "buckskin", "roan", "dun", "grullo", "cremello"].map((color) => (
                  <div key={color} className="flex items-center">
                    <input
                      type="checkbox"
                      id={color}
                      checked={formData.additionalColors.includes(color)}
                      onChange={() => handleMultiSelect("additionalColors", color)}
                      className={`w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded ${isRTL ? "ml-2" : "mr-2"}`}
                    />
                    <label htmlFor={color} className="text-sm text-gray-700">{t(`user:horseRegistration.${color}`)}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className={formGroupClass}>
              <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.distinctiveMarkArabic")}</label>
              <input
                type="text"
                name="distinctiveMarkArabic"
                value={formData.distinctiveMarkArabic}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                dir="rtl"
              />
            </div>
            <div className={formGroupClass}>
              <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.distinctiveMarkEnglish")}</label>
              <input
                type="text"
                name="distinctiveMarkEnglish"
                value={formData.distinctiveMarkEnglish}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                dir="ltr"
              />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <h2 className={`text-2xl font-bold text-gray-800 flex items-center`}>
              <FileText className={`${getIconMargin()} text-blue-500`} size={28} />
              {t("user:horseRegistration.identificationAndLineage")}
            </h2>
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 mb-6">
              <p className="text-indigo-800 font-medium">{t("user:horseRegistration.identificationIntro")}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={formGroupClass}>
                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.electronicChipNumber")}</label>
                <input
                  type="text"
                  name="electronicChipNumber"
                  value={formData.electronicChipNumber}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>
              <div className={formGroupClass}>
                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.passportNumber")}</label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>
              <div className={formGroupClass}>
                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.nationalID")}</label>
                <input
                  type="text"
                  name="nationalID"
                  value={formData.nationalID}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-xl text-gray-800 mb-4">{t("user:horseRegistration.lineageInfo")}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className={formGroupClass}>
                  <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.fatherRegistrationNumber")}</label>
                  <input
                    type="text"
                    name="fatherRegistrationNumber"
                    value={formData.fatherRegistrationNumber}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </div>
                <div className={formGroupClass}>
                  <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.motherRegistrationNumber")}</label>
                  <input
                    type="text"
                    name="motherRegistrationNumber"
                    value={formData.motherRegistrationNumber}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </div>
              </div>
              <div className={formGroupClass + " mt-4"}>
                <label className="block text-gray-700 font-medium mb-2">
                  {t("user:horseRegistration.lineageDetailsArabic")}
                  <span className={`${isRTL ? "mr-2" : "ml-2"} text-sm text-gray-500`}>({t("user:horseRegistration.maxWords", { count: 180 })})</span>
                </label>
                <textarea
                  name="lineageDetailsArabic"
                  value={formData.lineageDetailsArabic}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  maxLength={180}
                  dir="rtl"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.lineageDetailsArabic.split(/\s+/).filter(Boolean).length}/180 {t("user:horseRegistration.words")}
                </p>
              </div>
              <div className={formGroupClass + " mt-4"}>
                <label className="block text-gray-700 font-medium mb-2">
                  {t("user:horseRegistration.lineageDetailsEnglish")}
                  <span className={`${isRTL ? "mr-2" : "ml-2"} text-sm text-gray-500`}>({t("user:horseRegistration.maxWords", { count: 180 })})</span>
                </label>
                <textarea
                  name="lineageDetailsEnglish"
                  value={formData.lineageDetailsEnglish}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  maxLength={180}
                  dir="ltr"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.lineageDetailsEnglish.split(/\s+/).filter(Boolean).length}/180 {t("user:horseRegistration.words")}
                </p>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className={`text-yellow-800 flex items-center`}>
                <Award className={`${getIconMargin()}`} size={20} />
                <span>{t("user:horseRegistration.lineageBoost")}</span>
              </p>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <h2 className={`text-2xl font-bold text-gray-800 flex items-center`}>
              <Heart className={`${getIconMargin()} text-rose-500`} size={28} />
              {t("user:horseRegistration.healthAndDocumentation")}
            </h2>
            <div className="p-4 bg-rose-50 rounded-lg border border-rose-200 mb-6">
              <p className="text-rose-800 font-medium">{t("user:horseRegistration.healthIntro")}</p>
            </div>
            <div className={formGroupClass}>
              <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.healthCertificates")}</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileText className="mx-auto text-gray-400 mb-2" size={36} />
                <p className="text-gray-500 mb-2">{t("user:horseRegistration.uploadHealthCertificates")}</p>
                <input
                  type="file"
                  name="healthCertificates"
                  onChange={handleChange}
                  className="hidden"
                  id="healthCertificates"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="healthCertificates"
                  className="inline-block px-4 py-2 bg-[#333] text-white rounded-md cursor-pointer hover:bg-black transition"
                >
                  {t("user:horseRegistration.selectFiles")}
                </label>
                {formData.healthCertificates.length > 0 && (
                  <div className={`mt-4 ${isRTL ? "text-right" : "text-left"}`}>
                    <p className="font-medium text-gray-700">{t("user:horseRegistration.selectedFiles")}</p>
                    <ul className={`list-disc ${isRTL ? "pr-5" : "pl-5"} mt-1`}>
                      {Array.from(formData.healthCertificates).map((file, index) => (
                        <li key={index} className="text-sm text-gray-600">{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className={formGroupClass}>
              <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.vaccinationCertificates")}</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Shield className="mx-auto text-gray-400 mb-2" size={36} />
                <p className="text-gray-500 mb-2">{t("user:horseRegistration.uploadVaccinationCertificates")}</p>
                <input
                  type="file"
                  name="vaccinationCertificates"
                  onChange={handleChange}
                  className="hidden"
                  id="vaccinationCertificates"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="vaccinationCertificates"
                  className="inline-block px-4 py-2 bg-[#333] text-white rounded-md cursor-pointer hover:bg-black transition"
                >
                  {t("user:horseRegistration.selectFiles")}
                </label>
                {formData.vaccinationCertificates.length > 0 && (
                  <div className={`mt-4 ${isRTL ? "text-right" : "text-left"}`}>
                    <p className="font-medium text-gray-700">{t("user:horseRegistration.selectedFiles")}</p>
                    <ul className={`list-disc ${isRTL ? "pr-5" : "pl-5"} mt-1`}>
                      {Array.from(formData.vaccinationCertificates).map((file, index) => (
                        <li key={index} className="text-sm text-gray-600">{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={formGroupClass}>
                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.geneticAnalysis")}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <FileText className="mx-auto text-gray-400 mb-2" size={28} />
                  <input
                    type="file"
                    name="geneticAnalysis"
                    onChange={handleChange}
                    className="hidden"
                    id="geneticAnalysis"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="geneticAnalysis"
                    className="inline-block px-3 py-2 bg-[#333] text-white rounded-md cursor-pointer hover:bg-black transition text-sm"
                  >
                    {t("user:horseRegistration.uploadFile")}
                  </label>
                  {formData.geneticAnalysis && (
                    <p className="mt-2 text-sm text-green-600">
                      {t("user:horseRegistration.fileUploaded", { fileName: formData.geneticAnalysis[0].name })}
                    </p>
                  )}
                </div>
              </div>
              <div className={formGroupClass}>
                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.ownershipCertificate")}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Clipboard className="mx-auto text-gray-400 mb-2" size={28} />
                  <input
                    type="file"
                    name="ownershipCertificate"
                    onChange={handleChange}
                    className="hidden"
                    id="ownershipCertificate"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="ownershipCertificate"
                    className="inline-block px-3 py-2 bg-[#333] text-white rounded-md cursor-pointer hover:bg-black transition text-sm"
                  >
                    {t("user:horseRegistration.uploadFile")}
                  </label>
                  {formData.ownershipCertificate && (
                    <p className="mt-2 text-sm text-green-600">
                      {t("user:horseRegistration.fileUploaded", { fileName: formData.ownershipCertificate[0].name })}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className={`text-green-800 flex items-center`}>
                <Shield className={`${getIconMargin()}`} size={20} />
                <span>{t("user:horseRegistration.healthDocsBenefit")}</span>
              </p>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <h2 className={`text-2xl font-bold text-gray-800 flex items-center`}>
              <User className={`${getIconMargin()} text-violet-500`} size={28} />
              {t("user:horseRegistration.ownershipAndLocation")}
            </h2>
            <div className="p-4 bg-violet-50 rounded-lg border border-violet-200 mb-6">
              <p className="text-violet-800 font-medium">{t("user:horseRegistration.ownershipIntro")}</p>
            </div>
            <div className={formGroupClass}>
              <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.previousOwner")}</label>
              <input
                type="text"
                name="previousOwner"
                value={formData.previousOwner}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
            <div className={formGroupClass}>
              <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.stableLocation")}</label>
              <select
                name="stableLocation"
                value={formData.stableLocation}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                dir={isRTL ? "rtl" : "ltr"}
              >
                <option value="">{t("user:horseRegistration.selectStable")}</option>
                {stables.map((stable) => (
                  <option key={stable._id} value={stable._id}>
                    {isRTL ? stable.name_ar : stable.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-6">
              <p className={`text-blue-800 flex items-center`}>
                <FileText className={`${getIconMargin()}`} size={20} />
                <span>{t("user:horseRegistration.ownershipBenefit")}</span>
              </p>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <h2 className={`text-2xl font-bold text-gray-800 flex items-center`}>
              <CreditCard className={`${getIconMargin()} text-emerald-500`} size={28} />
              {t("user:horseRegistration.internationalAndInsurance")}
            </h2>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 mb-6">
              <p className="text-emerald-800 font-medium">{t("user:horseRegistration.internationalIntro")}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={formGroupClass}>
                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.internationalTransportPermit")}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <FileText className="mx-auto text-gray-400 mb-2" size={28} />
                  <input
                    type="file"
                    name="internationalTransportPermit"
                    onChange={handleChange}
                    className="hidden"
                    id="internationalTransportPermit"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="internationalTransportPermit"
                    className="inline-block px-3 py-2 bg-[#333] text-white rounded-md cursor-pointer hover:bg-black transition text-sm"
                  >
                    {t("user:horseRegistration.uploadPermit")}
                  </label>
                  {formData.internationalTransportPermit && (
                    <p className="mt-2 text-sm text-green-600">
                      {t("user:horseRegistration.fileUploaded", { fileName: formData.internationalTransportPermit[0].name })}
                    </p>
                  )}
                </div>
              </div>
              <div className={formGroupClass}>
                <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.passportImage")}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <FileText className="mx-auto text-gray-400 mb-2" size={28} />
                  <input
                    type="file"
                    name="passportImage"
                    onChange={handleChange}
                    className="hidden"
                    id="passportImage"
                    accept=".jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="passportImage"
                    className="inline-block px-3 py-2 bg-[#333] text-white rounded-md cursor-pointer hover:bg-black transition text-sm"
                  >
                    {t("user:horseRegistration.uploadImage")}
                  </label>
                  {formData.passportImage && (
                    <p className="mt-2 text-sm text-green-600">
                      {t("user:horseRegistration.fileUploaded", { fileName: formData.passportImage[0].name })}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className={formGroupClass}>
              <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.insurancePolicyNumber")}</label>
              <input
                type="text"
                name="insurancePolicyNumber"
                value={formData.insurancePolicyNumber}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
            <div className={formGroupClass}>
              <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.insuranceDetailsArabic")}</label>
              <textarea
                name="insuranceDetailsArabic"
                value={formData.insuranceDetailsArabic}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                dir="rtl"
              />
            </div>
            <div className={formGroupClass}>
              <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.insuranceDetailsEnglish")}</label>
              <textarea
                name="insuranceDetailsEnglish"
                value={formData.insuranceDetailsEnglish}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                dir="ltr"
              />
            </div>
            <div className={formGroupClass}>
              <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.insuranceEndDate")}</label>
              <input
                type="date"
                name="insuranceEndDate"
                value={formData.insuranceEndDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className={`text-yellow-800 flex items-center`}>
                <Shield className={`${getIconMargin()}`} size={20} />
                <span>{t("user:horseRegistration.internationalBenefit")}</span>
              </p>
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <h2 className={`text-2xl font-bold text-gray-800 flex items-center`}>
              <Award className={`${getIconMargin()} text-amber-500`} size={28} />
              {t("user:horseRegistration.activitiesAndValue")}
            </h2>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-6">
              <p className="text-amber-800 font-medium">{t("user:horseRegistration.activitiesIntro")}</p>
              <p className="text-amber-700 text-sm mt-2">{t("user:horseRegistration.requiredFieldsNote")}</p>
            </div>
            <div className={formGroupClass}>
              <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.horseActivities")}</label>
              <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
                {[
                  "shortRace",
                  "enduranceRace",
                  "jumping",
                  "training",
                  "tours",
                  "parades",
                  "dancing",
                  "taming",
                  "polo",
                  "archery",
                  "entertainmentGames",
                  "individualSkills",
                  "circus",
                  "security",
                  "beautyAndShow",
                ].map((activity) => (
                  <div key={activity} className="border rounded-lg p-3 hover:bg-gray-50 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={activity}
                        checked={formData.horseActivities.some((item) => item.activity === activity)}
                        onChange={() => {
                          if (formData.horseActivities.some((item) => item.activity === activity)) {
                            setFormData({
                              ...formData,
                              horseActivities: formData.horseActivities.filter((item) => item.activity !== activity),
                            });
                          } else {
                            setFormData({
                              ...formData,
                              horseActivities: [
                                ...formData.horseActivities,
                                { _key: `${activity}-${Date.now()}`, activity, level: "beginner" },
                              ],
                            });
                          }
                        }}
                        className={`w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded ${isRTL ? "ml-2" : "mr-2"}`}
                      />
                      <label htmlFor={activity} className="text-sm text-gray-700">{t(`user:horseRegistration.${activity}`)}</label>
                    </div>
                    {formData.horseActivities.some((item) => item.activity === activity) && (
                      <div className="mt-2 pl-6">
                        <label className="block text-xs text-gray-600 mb-1">{t("user:horseRegistration.level")}</label>
                        <select
                          value={formData.horseActivities.find((item) => item.activity === activity).level}
                          onChange={(e) => {
                            const updatedActivities = formData.horseActivities.map((item) =>
                              item.activity === activity ? { ...item, level: e.target.value } : item
                            );
                            setFormData({ ...formData, horseActivities: updatedActivities });
                          }}
                          className="w-full p-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          dir={isRTL ? "rtl" : "ltr"}
                        >
                          <option value="beginner">{t("user:horseRegistration.beginner")}</option>
                          <option value="intermediate">{t("user:horseRegistration.intermediate")}</option>
                          <option value="advanced">{t("user:horseRegistration.advanced")}</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className={formGroupClass}>
              <label className="block text-gray-700 font-medium mb-2">
                {t("user:horseRegistration.achievements")}
                <span className={`${isRTL ? "mr-2" : "ml-2"} text-sm text-gray-500`}>
                  ({t("user:horseRegistration.maxCharacters", { count: 300 })})
                </span>
              </label>
              <textarea
                name="achievements"
                value={formData.achievements}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                maxLength={300}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.achievements.length}/300 {t("user:horseRegistration.characters")}
              </p>
            </div>
            <div className={formGroupClass}>
              <label className="block text-gray-700 font-medium mb-2">{t("user:horseRegistration.trainers")}</label>
              <select
                name="trainers"
                value=""
                onChange={(e) => {
                  if (e.target.value && !formData.trainers.some((t) => t._ref === e.target.value)) {
                    setFormData({
                      ...formData,
                      trainers: [...formData.trainers, { _key: `${e.target.value}-${Date.now()}`, _type: "reference", _ref: e.target.value }],
                    });
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                dir={isRTL ? "rtl" : "ltr"}
              >
                <option value="">{t("user:horseRegistration.selectTrainer")}</option>
                {trainersList.map((trainer) => (
                  <option key={trainer._id} value={trainer._id}>
                    {isRTL ? trainer.name_ar : trainer.name_en}
                  </option>
                ))}
              </select>
              {formData.trainers.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">{t("user:horseRegistration.selectedTrainers")}</p>
                  <div className={`flex flex-wrap gap-2 ${isRTL ? "justify-end" : "justify-start"}`}>
                    {formData.trainers.map((trainer, index) => (
                      <div key={trainer._key} className="bg-indigo-100 px-3 py-1 rounded-full flex items-center">
                        <span className="text-sm text-indigo-800">
                          {trainersList.find(t => t._id === trainer._ref)?.[isRTL ? "name_ar" : "name_en"] || "Unknown Trainer"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, trainers: formData.trainers.filter((_, i) => i !== index) });
                          }}
                          className={`${isRTL ? "mr-2" : "ml-2"} text-indigo-600 hover:text-indigo-800`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={formGroupClass}>
                <label className="block text-gray-700 font-medium mb-2">
                  {t("user:horseRegistration.listingPurpose")} <span className="text-red-500">*</span>
                </label>
                <select
                  name="listingPurpose"
                  value={formData.listingPurpose}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  dir={isRTL ? "rtl" : "ltr"}
                  required
                >
                  <option value="">{t("user:horseRegistration.selectPurpose")}</option>
                  <option value="sale">{t("user:horseRegistration.sale")}</option>
                  <option value="stud">{t("user:horseRegistration.stud")}</option>
                  <option value="lease">{t("user:horseRegistration.lease")}</option>
                  <option value="sharing">{t("user:horseRegistration.sharing")}</option>
                </select>
              </div>
              <div className={formGroupClass}>
                <label className="block text-gray-700 font-medium mb-2">
                  {t("user:horseRegistration.marketValue")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="marketValue"
                  value={formData.marketValue}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  dir={isRTL ? "rtl" : "ltr"}
                  required
                />
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className={`text-green-800 flex items-center`}>
                <Award className={`${getIconMargin()}`} size={20} />
                <span>{t("user:horseRegistration.activitiesBenefit")}</span>
              </p>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`mx-auto px-4 pb-8 ${isRTL ? "text-right" : "text-left"}`} dir={isRTL ? "rtl" : "ltr"}>
      <Alert
        message={alert.message}
        isVisible={alert.isVisible}
        type={alert.type}
        onClose={() => setAlert({ isVisible: false, message: "", type: "error" })}
      />
      <div className="bg-white rounded-xl shadow-lg p-6 relative">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("user:horseRegistration.title")}</h1>
          <p className="text-gray-600">{t("user:horseRegistration.subtitle")}</p>
          <div className="mt-4">
            <div className="bg-gray-200 h-2 rounded-full">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${completionPercentage === 100 ? "bg-green-600" : "bg-black"}`}
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className={`flex justify-between mt-2`}>
              <div className={`flex items-center`}>
                {tier.icon}
                <span className={`text-sm font-medium ${tier.color}`}>{tier.name}</span>
              </div>
              <span className="text-sm text-gray-600">
                {t("user:horseRegistration.trustScore")}: {completionPercentage}/100
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{tier.message}</p>
          </div>
        </div>
        <div className={`flex items-center ${isRTL ? "justify-between" : "justify-between"} mb-8`}>
          <div className={`flex ${isRTL ? "space-x-reverse space-x-2" : "space-x-2"}`}>
            {[...Array(totalSteps)].map((_, index) => (
              <button
                key={index}
                className={`rounded-full w-8 h-8 flex items-center justify-center text-sm ${currentStep === index + 1
                  ? "bg-black text-white"
                  : index + 1 < currentStep
                    ? "bg-blue-200 text-blue-500"
                    : "bg-gray-100 text-gray-400"
                  }`}
                onClick={() => setCurrentStep(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-600">{t("user:horseRegistration.stepOf", { current: currentStep, total: totalSteps })}</div>
        </div>
        <form onSubmit={handleSubmit}>
          {renderStep()}
          <div className={`flex ${isRTL ? "justify-between" : "justify-between"} mt-10 pt-6 border-t border-gray-200`}>
            <button
              type="button"
              className={`px-6 py-3 rounded-md flex items-center ${currentStep === 1 ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-black bg-gray-300 hover:bg-gray-400"
                }`}
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              {isRTL ? <ChevronRight className={`${getIconMargin()}`} size={18} /> : <ChevronLeft className={`${getIconMargin()}`} size={18} />}
              {t("user:horseRegistration.previous")}
            </button>
            {currentStep < totalSteps ? (
              <button
                type="button"
                className={`px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-black flex items-center`}
                onClick={handleNext}
              >
                {t("user:horseRegistration.next")}
                {isRTL ? <ChevronLeft className={`${getIconMargin()}`} size={18} /> : <ChevronRight className={`${getIconMargin()}`} size={18} />}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-md flex items-center ${isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
              >
                <Save className={`${getIconMargin()}`} size={18} />
                {isSubmitting
                  ? t("user:horseRegistration.submitting")
                  : t("user:horseRegistration.submitRegistration")}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            <div className="absolute w-full h-full overflow-hidden">
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                    left: `${Math.random() * 100}%`,
                    top: '-10%',
                  }}
                  animate={{ y: '110vh', rotate: Math.random() * 360 }}
                  transition={{ duration: 2 + Math.random() * 2, ease: 'linear' }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}