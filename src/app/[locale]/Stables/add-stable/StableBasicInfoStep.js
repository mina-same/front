"use client";

import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function StableBasicInfoStep({ formData, setFormData, setErrors }) {
  const { t, i18n } = useTranslation();
  const [localErrors, setLocalErrors] = useState({
    name_ar: "",
    name_en: "",
    about_ar: "",
    about_en: "",
    yearsOfExperience: "",
    pastExperience_ar: "",
    pastExperience_en: "",
  });
  const isRTL = i18n.language === "ar";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalErrors((prev) => ({ ...prev, [name]: "" }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = {
      name_ar: "",
      name_en: "",
      about_ar: "",
      about_en: "",
      yearsOfExperience: "",
      pastExperience_ar: "",
      pastExperience_en: "",
    };

    if (!formData.name_ar.trim()) {
      newErrors.name_ar = t("addStable:errors.nameArRequired");
      isValid = false;
    }
    if (!formData.name_en.trim()) {
      newErrors.name_en = t("addStable:errors.nameEnRequired");
      isValid = false;
    }
    if (!formData.about_ar.trim()) {
      newErrors.about_ar = t("addStable:errors.aboutArRequired");
      isValid = false;
    }
    if (!formData.about_en.trim()) {
      newErrors.about_en = t("addStable:errors.aboutEnRequired");
      isValid = false;
    }
    if (!formData.yearsOfExperience || formData.yearsOfExperience <= 0) {
      newErrors.yearsOfExperience = t("addStable:errors.yearsOfExperienceRequired");
      isValid = false;
    }

    setLocalErrors(newErrors);
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  return (
    <div className={isRTL ? "rtl" : "ltr"}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
        <Info className={`text-gold ${isRTL ? "ml-2" : "mr-2"}`} size={28} />
        {t("addStable:basicInformation")}
      </h2>
      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20 mb-6">
        <p className="text-gold font-medium">
          {t("addStable:basicInfoDescription")}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addStable:nameAr")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name_ar"
          value={formData.name_ar}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-xl ${localErrors.name_ar ? "border-red-500" : "border-gray-300"}`}
          placeholder={t("addStable:enterNameAr")}
          required
        />
        {localErrors.name_ar && (
          <p className="text-red-500 text-sm mt-1">{localErrors.name_ar}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addStable:nameEn")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name_en"
          value={formData.name_en}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-xl ${localErrors.name_en ? "border-red-500" : "border-gray-300"}`}
          placeholder={t("addStable:enterNameEn")}
          required
        />
        {localErrors.name_en && (
          <p className="text-red-500 text-sm mt-1">{localErrors.name_en}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addStable:aboutAr")} <span className="text-red-500">*</span>
        </label>
        <textarea
          name="about_ar"
          value={formData.about_ar}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-xl ${localErrors.about_ar ? "border-red-500" : "border-gray-300"}`}
          placeholder={t("addStable:aboutArPlaceholder")}
          rows={4}
          required
        />
        {localErrors.about_ar && (
          <p className="text-red-500 text-sm mt-1">{localErrors.about_ar}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addStable:aboutEn")} <span className="text-red-500">*</span>
        </label>
        <textarea
          name="about_en"
          value={formData.about_en}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-xl ${localErrors.about_en ? "border-red-500" : "border-gray-300"}`}
          placeholder={t("addStable:aboutEnPlaceholder")}
          rows={4}
          required
        />
        {localErrors.about_en && (
          <p className="text-red-500 text-sm mt-1">{localErrors.about_en}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addStable:yearsOfExperience")} <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="yearsOfExperience"
          value={formData.yearsOfExperience}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-xl ${localErrors.yearsOfExperience ? "border-red-500" : "border-gray-300"}`}
          placeholder={t("addStable:yearsOfExperiencePlaceholder")}
          min="0"
          required
        />
        {localErrors.yearsOfExperience && (
          <p className="text-red-500 text-sm mt-1">{localErrors.yearsOfExperience}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addStable:pastExperienceAr")}
        </label>
        <textarea
          name="pastExperience_ar"
          value={formData.pastExperience_ar}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-xl ${localErrors.pastExperience_ar ? "border-red-500" : "border-gray-300"}`}
          placeholder={t("addStable:pastExperienceArPlaceholder")}
          rows={4}
        />
        {localErrors.pastExperience_ar && (
          <p className="text-red-500 text-sm mt-1">{localErrors.pastExperience_ar}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addStable:pastExperienceEn")}
        </label>
        <textarea
          name="pastExperience_en"
          value={formData.pastExperience_en}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-xl ${localErrors.pastExperience_en ? "border-red-500" : "border-gray-300"}`}
          placeholder={t("addStable:pastExperienceEnPlaceholder")}
          rows={4}
        />
        {localErrors.pastExperience_en && (
          <p className="text-red-500 text-sm mt-1">{localErrors.pastExperience_en}</p>
        )}
      </div>
    </div>
  );
}

export const validateStep = (formData, t, setErrors) => {
  let isValid = true;
  const newErrors = {
    name_ar: "",
    name_en: "",
    about_ar: "",
    about_en: "",
    yearsOfExperience: "",
    pastExperience_ar: "",
    pastExperience_en: "",
  };

  if (!formData.name_ar.trim()) {
    newErrors.name_ar = t("addStable:errors.nameArRequired");
    isValid = false;
  }
  if (!formData.name_en.trim()) {
    newErrors.name_en = t("addStable:errors.nameEnRequired");
    isValid = false;
  }
  if (!formData.about_ar.trim()) {
    newErrors.about_ar = t("addStable:errors.aboutArRequired");
    isValid = false;
  }
  if (!formData.about_en.trim()) {
    newErrors.about_en = t("addStable:errors.aboutEnRequired");
    isValid = false;
  }
  if (!formData.yearsOfExperience || formData.yearsOfExperience <= 0) {
    newErrors.yearsOfExperience = t("addStable:errors.yearsOfExperienceRequired");
    isValid = false;
  }

  setErrors((prev) => ({ ...prev, ...newErrors }));
  return isValid;
};