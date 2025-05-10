"use client";

import { Book } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function BookBasicInfoStep({ formData, setFormData, setErrors }) {
  const { t, i18n } = useTranslation();
  const [localErrors, setLocalErrors] = useState({ title: "", description: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    setLocalErrors((prev) => ({ ...prev, [name]: "" }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = { title: "", description: "" };

    if (!formData.title.trim()) {
      newErrors.title = t("addBook:errors.titleRequired");
      isValid = false;
    }
    if (!formData.description.trim()) {
      newErrors.description = t("addBook:errors.descriptionRequired");
      isValid = false;
    }

    setLocalErrors(newErrors);
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  return (
    <div className={`container ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
        <Book className={`text-gold ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} size={28} />
        {t("addBook:basicBookInformation")}
      </h2>
      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20 mb-6">
        <p className="text-gold font-medium">
          {t("addBook:basicInfoDescription")}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addBook:bookTitle")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-xl ${localErrors.title ? "border-red-500" : "border-gray-300"}`}
          placeholder={t("addBook:enterBookTitle")}
          required
        />
        {localErrors.title && (
          <p className="text-red-500 text-sm mt-1">{localErrors.title}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addBook:description")} <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={5}
          className={`w-full p-3 border rounded-xl ${localErrors.description ? "border-red-500" : "border-gray-300"}`}
          placeholder={t("addBook:descriptionPlaceholder")}
          required
        />
        {localErrors.description && (
          <p className="text-red-500 text-sm mt-1">{localErrors.description}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addBook:language")}
        </label>
        <input
          type="text"
          name="language"
          value={formData.language}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-xl"
          placeholder={t("addBook:languagePlaceholder")}
        />
      </div>
    </div>
  );
}

// Export validateStep as a named export
export const validateStep = (formData, t, setErrors) => {
  let isValid = true;
  const newErrors = { title: "", description: "" };

  if (!formData.title.trim()) {
    newErrors.title = t("addBook:errors.titleRequired");
    isValid = false;
  }
  if (!formData.description.trim()) {
    newErrors.description = t("addBook:errors.descriptionRequired");
    isValid = false;
  }

  setErrors((prev) => ({ ...prev, ...newErrors }));
  return isValid;
};
