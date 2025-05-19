"use client";

import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function ProductBasicInfoStep({ formData, setFormData, setErrors }) {
  const { t, i18n } = useTranslation();
  const [localErrors, setLocalErrors] = useState({ name_ar: "", name_en: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalErrors((prev) => ({ ...prev, [name]: "" }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = { name_ar: "", name_en: "" };

    if (!formData.name_ar.trim()) {
      newErrors.name_ar = t("addProduct:errors.nameArRequired");
      isValid = false;
    }
    if (!formData.name_en.trim()) {
      newErrors.name_en = t("addProduct:errors.nameEnRequired");
      isValid = false;
    }

    setLocalErrors(newErrors);
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  return (
    <div className={i18n.language === "ar" ? "rtl" : "ltr"}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
        <Package
          className={`text-gold ${i18n.language === "ar" ? "ml-2" : "mr-2"}`}
          size={28}
        />
        {t("addProduct:basicInformation")}
      </h2>
      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20 mb-6">
        <p className="text-gold font-medium">
          {t("addProduct:basicInfoDescription")}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addProduct:nameAr")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name_ar"
          value={formData.name_ar}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-xl ${
            localErrors.name_ar ? "border-red-500" : "border-gray-300"
          }`}
          placeholder={t("addProduct:nameArPlaceholder")}
          dir="rtl"
          required
        />
        {localErrors.name_ar && (
          <p className="text-red-500 text-sm mt-1">{localErrors.name_ar}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addProduct:nameEn")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name_en"
          value={formData.name_en}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-xl ${
            localErrors.name_en ? "border-red-500" : "border-gray-300"
          }`}
          placeholder={t("addProduct:nameEnPlaceholder")}
          required
        />
        {localErrors.name_en && (
          <p className="text-red-500 text-sm mt-1">{localErrors.name_en}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addProduct:descriptionAr")}
        </label>
        <textarea
          name="description_ar"
          value={formData.description_ar}
          onChange={handleInputChange}
          rows={4}
          className="w-full p-3 border rounded-xl border-gray-300"
          placeholder={t("addProduct:descriptionArPlaceholder")}
          dir="rtl"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addProduct:descriptionEn")}
        </label>
        <textarea
          name="description_en"
          value={formData.description_en}
          onChange={handleInputChange}
          rows={4}
          className="w-full p-3 border rounded-xl border-gray-300"
          placeholder={t("addProduct:descriptionEnPlaceholder")}
        />
      </div>

      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20 mt-8">
        <p className="text-gold text-sm">
          {t("addProduct:basicInfoTips")}
        </p>
      </div>
    </div>
  );
}

export const validateStep = (formData, t, setErrors) => {
  let isValid = true;
  const newErrors = { name_ar: "", name_en: "" };

  if (!formData.name_ar.trim()) {
    newErrors.name_ar = t("addProduct:errors.nameArRequired");
    isValid = false;
  }
  if (!formData.name_en.trim()) {
    newErrors.name_en = t("addProduct:errors.nameEnRequired");
    isValid = false;
  }

  setErrors((prev) => ({ ...prev, ...newErrors }));
  return isValid;
};
