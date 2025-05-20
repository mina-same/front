"use client";

import { useState } from "react";
import { Image as LucideImage, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import Image from 'next/image';

const categories = [
  { value: "feed_nutrition", label: { en: "Feed and Nutrition", ar: "الأعلاف والتغذية" } },
  { value: "tack_equipment", label: { en: "Tack and Equipment", ar: "الأدوات والمعدات" } },
  {
    value: "apparel_accessories",
    label: { en: "Apparel and Accessories", ar: "الملابس والإكسسوارات" },
  },
  { value: "health_wellness", label: { en: "Health and Wellness", ar: "الصحة والرفاهية" } },
  {
    value: "barn_stable",
    label: { en: "Barn and Stable Supplies", ar: "مستلزمات الإسطبل" },
  },
  {
    value: "riding_competition",
    label: { en: "Riding and Competition", ar: "الركوب والمنافسات" },
  },
  { value: "other", label: { en: "Other", ar: "أخرى" } },
];

export default function ProductImagesStep({ formData, setFormData, setErrors }) {
  const { t, i18n } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [localErrors, setLocalErrors] = useState({ images: "", category: "" });
  const isRTL = i18n.language === "ar";

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
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    for (const file of validFiles) {
      if (file.size > maxFileSize) {
        setLocalErrors((prev) => ({
          ...prev,
          images: t("addProduct:imageTooLarge"),
        }));
        setErrors((prev) => ({ ...prev, images: t("addProduct:imageTooLarge") }));
        return;
      }
    }

    if (validFiles.length < files.length) {
      setLocalErrors((prev) => ({
        ...prev,
        images: t("addProduct:onlyImagesAllowed"),
      }));
      setErrors((prev) => ({ ...prev, images: t("addProduct:onlyImagesAllowed") }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));
    setLocalErrors((prev) => ({ ...prev, images: "" }));
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setLocalErrors((prev) => ({ ...prev, images: "" }));
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalErrors((prev) => ({ ...prev, [name]: "" }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = { images: "", category: "" };

    if (formData.images.length === 0) {
      newErrors.images = t("addProduct:errors.imagesRequired");
      isValid = false;
    }
    if (!formData.category) {
      newErrors.category = t("addProduct:errors.categoryRequired");
      isValid = false;
    }

    setLocalErrors(newErrors);
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  return (
    <div className={isRTL ? "rtl" : "ltr"}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
        <LucideImage className={`text-gold ${isRTL ? "ml-2" : "mr-2"}`} size={28} />
        {t("addProduct:imagesCategory")}
      </h2>
      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20 mb-6">
        <p className="text-gold font-medium">
          {t("addProduct:imagesCategoryDescription")}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addProduct:category")} <span className="text-red-500">*</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className={`w-full p-3 border rounded-xl ${
            localErrors.category ? "border-red-500" : "border-gray-300"
          }`}
          required
        >
          <option value="">{t("addProduct:selectCategory")}</option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label[i18n.language] || category.label.en}
            </option>
          ))}
        </select>
        {localErrors.category && (
          <p className="text-red-500 text-sm mt-1">{localErrors.category}</p>
        )}
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center ${
          dragActive
            ? "border-gold bg-gold/10"
            : localErrors.images
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
            <p className="font-medium">{t("addProduct:dragDrop")}</p>
            <p className="text-sm text-gray-500">{t("addProduct:orBrowse")}</p>
          </div>
          <Button
            variant="outline"
            className="mt-2 border-gold/20 text-black hover:bg-gold/30 hover:text-gold rounded-xl"
            onClick={() => document.getElementById("productImages")?.click()}
          >
            {t("addProduct:selectImages")}
          </Button>
          <input
            id="productImages"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-xs text-gray-500">
            {t("addProduct:imageRequirements")}
          </p>
        </div>
        {localErrors.images && (
          <p className="text-red-500 text-sm mt-2">{localErrors.images}</p>
        )}
      </div>

      {formData.images.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-gray-700 mb-3">
            {t("addProduct:uploadedImages", { count: formData.images.length })}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div
                key={index}
                className="relative group rounded-xl overflow-hidden border border-gray-200"
              >
                <Image
                  fill
                  src={URL.createObjectURL(image)}
                  alt={`${t("addProduct:image")} ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeImage(index)}
                  className={`absolute top-1 ${
                    isRTL ? "left-1" : "right-1"
                  } bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <X size={18} />
                </Button>
                <div className="p-2 text-xs truncate bg-white">{image.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20 mt-8">
        <p className="text-gold text-sm">
          {t("addProduct:imageTips")}
        </p>
      </div>
    </div>
  );
}

export const validateStep = (formData, t, setErrors) => {
  let isValid = true;
  const newErrors = { images: "", category: "" };

  if (formData.images.length === 0) {
    newErrors.images = t("addProduct:errors.imagesRequired");
    isValid = false;
  }
  if (!formData.category) {
    newErrors.category = t("addProduct:errors.categoryRequired");
    isValid = false;
  }

  setErrors((prev) => ({ ...prev, ...newErrors }));
  return isValid;
};
