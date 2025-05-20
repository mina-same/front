"use client";

import { Upload, Image } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { useTranslation } from "react-i18next";
import Image from 'next/image';


export default function CourseMediaStep({ formData, setFormData, setErrors }) {
  const { t, i18n } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [localErrors, setLocalErrors] = useState({ images: "" });
  const isRTL = i18n.language === "ar";

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (newImages.length < e.target.files.length) {
        setLocalErrors((prev) => ({
          ...prev,
          images: t("addCourse:errors.onlyImagesAllowed"),
        }));
        return;
      }
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      for (const image of newImages) {
        if (image.size > maxFileSize) {
          setLocalErrors((prev) => ({
            ...prev,
            images: t("addCourse:errors.imageTooLarge"),
          }));
          return;
        }
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
      setLocalErrors((prev) => ({ ...prev, images: "" }));
      setErrors((prev) => ({ ...prev, images: "" }));
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
      const newImages = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (newImages.length < e.dataTransfer.files.length) {
        setLocalErrors((prev) => ({
          ...prev,
          images: t("addCourse:errors.onlyImagesAllowed"),
        }));
        return;
      }
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      for (const image of newImages) {
        if (image.size > maxFileSize) {
          setLocalErrors((prev) => ({
            ...prev,
            images: t("addCourse:errors.imageTooLarge"),
          }));
          return;
        }
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
      setLocalErrors((prev) => ({ ...prev, images: "" }));
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setLocalErrors((prev) => ({ ...prev, images: "" }));
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = { images: "" };

    if (formData.images.length === 0) {
      newErrors.images = t("addCourse:errors.imagesRequired");
      isValid = false;
    }

    setLocalErrors(newErrors);
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  return (
    <div className={i18n.language === "ar" ? "rtl" : "ltr"}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
        <Image className={`text-gold ${isRTL ? "ml-2" : "mr-2"}`} size={28} />
        {t("addCourse:mediaMaterials")}
      </h2>
      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20 mb-6">
        <p className="text-gold font-medium">
          {t("addCourse:mediaUploadDescription")}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addCourse:courseImages")} <span className="text-red-500">*</span>
        </label>
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center ${
            dragActive
              ? "border-indigo-500 bg-indigo-50"
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
              <p className="font-medium">{t("addCourse:dragDrop")}</p>
              <p className="text-sm text-gray-500">{t("addCourse:orBrowse")}</p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl mt-2 border-gold/20 bg-white hover:text-gold text-black hover:bg-gold/30"
              onClick={() => document.getElementById("courseImages")?.click()}
            >
              {t("addCourse:selectImages")}
            </Button>
            <input
              id="courseImages"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <p className="text-xs text-gray-500 mt-2">
              {t("addCourse:supportedImageFormats")}
            </p>
          </div>
        </div>
        {localErrors.images && (
          <p className="text-red-500 text-sm mt-2">{localErrors.images}</p>
        )}
      </div>

      {formData.images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {formData.images.map((image, index) => (
            <div key={index} className="relative border rounded-xl overflow-hidden group">
              <Image
                src={URL.createObjectURL(image)}
                alt={`${t("addCourse:image")} ${index + 1}`}
                className="w-full h-32 object-cover"
                height={128}
                width={128}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className={`absolute top-1 ${isRTL ? "left-1" : "right-1"} bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                ×
              </button>
              <p className="text-xs truncate p-1 bg-white">{image.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const validateStep = (formData, t, setErrors) => {
  let isValid = true;
  const newErrors = { images: "" };

  if (formData.images.length === 0) {
    newErrors.images = t("addCourse:errors.imagesRequired");
    isValid = false;
  }

  setErrors((prev) => ({ ...prev, ...newErrors }));
  return isValid;
};