"use client";

import { Book } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const levelOptions = [
  { value: "beginner", label: "addCourse:levels.beginner" },
  { value: "intermediate", label: "addCourse:levels.intermediate" },
  { value: "advanced", label: "addCourse:levels.advanced" },
];

const languageOptions = [
  { value: "english", label: "addCourse:languages.english" },
  { value: "arabic", label: "addCourse:languages.arabic" },
  { value: "both", label: "addCourse:languages.both" },
];

export default function CourseBasicInfoStep({ formData, setFormData, setErrors }) {
  const { t, i18n } = useTranslation();
  const [localErrors, setLocalErrors] = useState({ title: "", description: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalErrors((prev) => ({ ...prev, [name]: "" }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = { title: "", description: "" };

    if (!formData.title.trim()) {
      newErrors.title = t("addCourse:errors.titleRequired");
      isValid = false;
    }
    if (!formData.description.trim()) {
      newErrors.description = t("addCourse:errors.descriptionRequired");
      isValid = false;
    }

    setLocalErrors(newErrors);
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  return (
    <div className={i18n.language === "ar" ? "rtl" : "ltr"}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
        <Book className={`text-gold ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} size={28} />
        {t("addCourse:basicCourseInformation")}
      </h2>
      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20 mb-6">
        <p className="text-gold font-medium">
          {t("addCourse:basicInfoDescription")}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addCourse:courseTitle")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-xl ${localErrors.title ? "border-red-500" : "border-gray-300"}`}
          placeholder={t("addCourse:enterCourseTitle")}
          required
        />
        {localErrors.title && (
          <p className="text-red-500 text-sm mt-1">{localErrors.title}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addCourse:description")} <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={5}
          className={`w-full p-3 border rounded-xl ${localErrors.description ? "border-red-500" : "border-gray-300"}`}
          placeholder={t("addCourse:descriptionPlaceholder")}
          required
        />
        {localErrors.description && (
          <p className="text-red-500 text-sm mt-1">{localErrors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            {t("addCourse:duration")}
          </label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
            placeholder={t("addCourse:durationPlaceholder")}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            {t("addCourse:courseLevel")}
          </label>
          <select
            name="level"
            value={formData.level}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
          >
            <option value="">{t("addCourse:selectLevel")}</option>
            {levelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.label)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addCourse:courseLanguage")}
        </label>
        <select
          name="language"
          value={formData.language}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-xl"
        >
          <option value="">{t("addCourse:selectLanguage")}</option>
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export const validateStep = (formData, t, setErrors) => {
  let isValid = true;
  const newErrors = { title: "", description: "" };

  if (!formData.title.trim()) {
    newErrors.title = t("addCourse:errors.titleRequired");
    isValid = false;
  }
  if (!formData.description.trim()) {
    newErrors.description = t("addCourse:errors.descriptionRequired");
    isValid = false;
  }

  setErrors((prev) => ({ ...prev, ...newErrors }));
  return isValid;
};