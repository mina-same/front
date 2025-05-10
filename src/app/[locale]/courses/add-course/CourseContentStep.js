"use client";

import { FileText, Plus, X, Upload } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const categoryOptions = [
  { value: "equine_anatomy_physiology", label: "addCourse:categories.equine_anatomy_physiology" },
  { value: "equine_nutrition", label: "addCourse:categories.equine_nutrition" },
  { value: "stable_management", label: "addCourse:categories.stable_management" },
  { value: "horse_care_grooming", label: "addCourse:categories.horse_care_grooming" },
  { value: "riding_instruction", label: "addCourse:categories.riding_instruction" },
  { value: "equine_health_first_aid", label: "addCourse:categories.equine_health_first_aid" },
  { value: "equine_reproduction_breeding", label: "addCourse:categories.equine_reproduction_breeding" },
  { value: "horse_training_behavior", label: "addCourse:categories.horse_training_behavior" },
  { value: "equine_business_management", label: "addCourse:categories.equine_business_management" },
  { value: "equine_law_ethics", label: "addCourse:categories.equine_law_ethics" },
  { value: "horse_show_management_judging", label: "addCourse:categories.horse_show_management_judging" },
  { value: "equine_assisted_services", label: "addCourse:categories.equine_assisted_services" },
  { value: "equine_competition_disciplines", label: "addCourse:categories.equine_competition_disciplines" },
  { value: "equine_recreation_tourism", label: "addCourse:categories.equine_recreation_tourism" },
  { value: "equine_rescue_rehabilitation", label: "addCourse:categories.equine_rescue_rehabilitation" },
  { value: "equine_sports_medicine", label: "addCourse:categories.equine_sports_medicine" },
  { value: "equine_facility_design_management", label: "addCourse:categories.equine_facility_design_management" },
  { value: "equine_marketing_promotion", label: "addCourse:categories.equine_marketing_promotion" },
  { value: "equine_photography_videography", label: "addCourse:categories.equine_photography_videography" },
  { value: "equine_journalism_writing", label: "addCourse:categories.equine_journalism_writing" },
  { value: "equine_history_culture", label: "addCourse:categories.equine_history_culture" },
  { value: "equine_environmental_stewardship", label: "addCourse:categories.equine_environmental_stewardship" },
  { value: "equine_technology_innovation", label: "addCourse:categories.equine_technology_innovation" },
  { value: "equine_entrepreneurship", label: "addCourse:categories.equine_entrepreneurship" },
  { value: "equine_dentistry", label: "addCourse:categories.equine_dentistry" },
  { value: "equine_podiatry", label: "addCourse:categories.equine_podiatry" },
  { value: "english_riding", label: "addCourse:categories.english_riding" },
  { value: "western_riding", label: "addCourse:categories.western_riding" },
  { value: "jumping_hunter", label: "addCourse:categories.jumping_hunter" },
  { value: "other", label: "addCourse:categories.other" },
];

export default function CourseContentStep({ formData, setFormData, setErrors }) {
  const { t, i18n } = useTranslation();
  const [localErrors, setLocalErrors] = useState({ category: "", price: "", materials: "" });
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalErrors((prev) => ({ ...prev, [name]: "" }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const addMaterialLink = () => {
    setFormData((prev) => ({
      ...prev,
      materials: [...prev.materials, { type: "link", value: "" }],
    }));
    setLocalErrors((prev) => ({ ...prev, materials: "" }));
    setErrors((prev) => ({ ...prev, materials: "" }));
  };

  const updateMaterialLink = (index, value) => {
    setFormData((prev) => {
      const updatedMaterials = [...prev.materials];
      updatedMaterials[index] = { ...updatedMaterials[index], value };
      return { ...prev, materials: updatedMaterials };
    });
    setLocalErrors((prev) => ({ ...prev, materials: "" }));
    setErrors((prev) => ({ ...prev, materials: "" }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const maxFileSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxFileSize) {
        setLocalErrors((prev) => ({
          ...prev,
          materials: t("addCourse:errors.fileTooLarge"),
        }));
        return;
      }
      if (!["application/pdf", "video/mp4", "video/webm"].includes(file.type)) {
        setLocalErrors((prev) => ({
          ...prev,
          materials: t("addCourse:errors.onlyPDFAndVideoAllowed"),
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, { type: "file", value: file }],
      }));
      setLocalErrors((prev) => ({ ...prev, materials: "" }));
      setErrors((prev) => ({ ...prev, materials: "" }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const maxFileSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxFileSize) {
        setLocalErrors((prev) => ({
          ...prev,
          materials: t("addCourse:errors.fileTooLarge"),
        }));
        return;
      }
      if (!["application/pdf", "video/mp4", "video/webm"].includes(file.type)) {
        setLocalErrors((prev) => ({
          ...prev,
          materials: t("addCourse:errors.onlyPDFAndVideoAllowed"),
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, { type: "file", value: file }],
      }));
      setLocalErrors((prev) => ({ ...prev, materials: "" }));
      setErrors((prev) => ({ ...prev, materials: "" }));
    }
  };

  const removeMaterial = (index) => {
    setFormData((prev) => {
      const updatedMaterials = [...prev.materials];
      updatedMaterials.splice(index, 1);
      return { ...prev, materials: updatedMaterials };
    });
    setLocalErrors((prev) => ({ ...prev, materials: "" }));
    setErrors((prev) => ({ ...prev, materials: "" }));
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = { category: "", price: "", materials: "" };

    if (!formData.category) {
      newErrors.category = t("addCourse:errors.categoryRequired");
      isValid = false;
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      newErrors.price = t("addCourse:errors.priceRequired");
      isValid = false;
    }
    if (formData.materials.length === 0) {
      newErrors.materials = t("addCourse:errors.materialsRequired");
      isValid = false;
    } else {
      formData.materials.forEach((material, index) => {
        if (material.type === "link" && material.value) {
          try {
            new URL(material.value);
          } catch {
            newErrors.materials = t("addCourse:errors.invalidLink");
            isValid = false;
          }
        }
      });
    }

    setLocalErrors(newErrors);
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  return (
    <div className={i18n.language === "ar" ? "rtl" : "ltr"}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
        <FileText className={`text-gold ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} size={28} />
        {t("addCourse:courseContent")}
      </h2>
      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20 mb-6">
        <p className="text-gold font-medium">
          {t("addCourse:contentDescription")}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addCourse:courseCategory")} <span className="text-red-500">*</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-xl ${localErrors.category ? "border-red-500" : "border-gray-300"}`}
          required
        >
          <option value="">{t("addCourse:selectCategory")}</option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>
        {localErrors.category && (
          <p className="text-red-500 text-sm mt-1">{localErrors.category}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addCourse:price")} (SAR) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div
            className={`absolute inset-y-0 ${i18n.language === "ar" ? "left-5" : "right-5"} pl-3 flex items-center pointer-events-none`}
          >
            <span className="text-gray-500">SAR</span>
          </div>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className={`w-full p-3 ${i18n.language === "ar" ? "pl-12" : "pr-12"} border rounded-xl ${localErrors.price ? "border-red-500" : "border-gray-300"}`}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>
        {localErrors.price && (
          <p className="text-red-500 text-sm mt-1">{localErrors.price}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          {t("addCourse:freeCourseNote")}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addCourse:courseMaterials")} <span className="text-red-500">*</span>
        </label>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center ${
            dragActive
              ? "border-indigo-500 bg-indigo-50"
              : localErrors.materials
              ? "border-red-500"
              : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 bg-gold/10 rounded-full">
              <Upload className="h-8 w-8 text-gold" />
            </div>
            <div className="text-gray-700">
              <p className="font-medium">{t("addCourse:dragDrop")}</p>
              <p className="text-sm text-gray-500">{t("addCourse:orBrowse")}</p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl mt-2 border-gold/20 bg-white hover:text-gold text-black hover:bg-gold/30"
              onClick={() => document.getElementById("materialFile")?.click()}
            >
              {t("addCourse:selectFile")}
            </Button>
            <input
              id="materialFile"
              type="file"
              accept=".pdf,video/mp4,video/webm"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-gray-500 mt-2">
              {t("addCourse:supportedFormats")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 mb-2">
          <label className="block text-gray-700 font-medium">
            {t("addCourse:materialLinks")}
          </label>
          <Button
            type="button"
            onClick={addMaterialLink}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-gold border-gold/20 hover:text-gold hover:bg-gold/30"
          >
            <Plus size={16} />
            {t("addCourse:addLink")}
          </Button>
        </div>

        {formData.materials.length === 0 ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-gray-500">
            {t("addCourse:noMaterials")}
          </div>
        ) : (
          <div className="space-y-3">
            {formData.materials.map((material, index) => (
              <div key={index} className="flex items-center gap-2">
                {material.type === "link" ? (
                  <input
                    type="url"
                    value={material.value}
                    onChange={(e) => updateMaterialLink(index, e.target.value)}
                    className="flex-1 p-3 border rounded-xl border-gray-300"
                    placeholder={t("addCourse:linkPlaceholder")}
                  />
                ) : (
                  <div className="flex-1 p-3 bg-gray-50 border rounded-xl border-gray-200 text-gray-700 truncate">
                    {material.value.name}
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMaterial(index)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <X size={18} />
                </Button>
              </div>
            ))}
          </div>
        )}
        {localErrors.materials && (
          <p className="text-red-500 text-sm mt-1">{localErrors.materials}</p>
        )}
      </div>
    </div>
  );
}

export const validateStep = (formData, t, setErrors) => {
  let isValid = true;
  const newErrors = { category: "", price: "", materials: "" };

  if (!formData.category) {
    newErrors.category = t("addCourse:errors.categoryRequired");
    isValid = false;
  }
  if (!formData.price || isNaN(parseFloat(formData.price))) {
    newErrors.price = t("addCourse:errors.priceRequired");
    isValid = false;
  }
  if (formData.materials.length === 0) {
    newErrors.materials = t("addCourse:errors.materialsRequired");
    isValid = false;
  } else {
    formData.materials.forEach((material, index) => {
      if (material.type === "link" && material.value) {
        try {
          new URL(material.value);
        } catch {
          newErrors.materials = t("addCourse:errors.invalidLink");
          isValid = false;
        }
      }
    });
  }

  setErrors((prev) => ({ ...prev, ...newErrors }));
  return isValid;
};