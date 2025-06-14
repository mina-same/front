"use client";

import { Upload, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function StableMediaStep({ formData, setFormData, setErrors }) {
  const { t, i18n } = useTranslation();
  const [dragActive, setDragActive] = useState({ images: false, files: false });
  const [localErrors, setLocalErrors] = useState({
    images: "",
    licensesAndCertificates: "",
  });
  const isRTL = i18n.language === "ar";

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).filter((file) => file.type.startsWith("image/"));
      if (newImages.length < e.target.files.length) {
        setLocalErrors((prev) => ({
          ...prev,
          images: t("addStable:errors.onlyImagesAllowed"),
        }));
        return;
      }
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      for (const image of newImages) {
        if (image.size > maxFileSize) {
          setLocalErrors((prev) => ({
            ...prev,
            images: t("addStable:errors.imageTooLarge"),
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
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter((file) =>
        [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".gif"].some((ext) => file.name.endsWith(ext))
      );
      if (newFiles.length < e.target.files.length) {
        setLocalErrors((prev) => ({
          ...prev,
          licensesAndCertificates: t("addStable:errors.onlyFilesAllowed"),
        }));
        return;
      }
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      for (const file of newFiles) {
        if (file.size > maxFileSize) {
          setLocalErrors((prev) => ({
            ...prev,
            licensesAndCertificates: t("addStable:errors.fileTooLarge"),
          }));
          return;
        }
      }
      setFormData((prev) => ({
        ...prev,
        licensesAndCertificates: [...prev.licensesAndCertificates, ...newFiles],
      }));
      setLocalErrors((prev) => ({ ...prev, licensesAndCertificates: "" }));
      setErrors((prev) => ({ ...prev, licensesAndCertificates: "" }));
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleDrag = (type, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive((prev) => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, images: false }));
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newImages = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
      if (newImages.length < e.dataTransfer.files.length) {
        setLocalErrors((prev) => ({
          ...prev,
          images: t("addStable:errors.onlyImagesAllowed"),
        }));
        return;
      }
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      for (const image of newImages) {
        if (image.size > maxFileSize) {
          setLocalErrors((prev) => ({
            ...prev,
            images: t("addStable:errors.imageTooLarge"),
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

  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, files: false }));
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter((file) =>
        [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".gif"].some((ext) => file.name.endsWith(ext))
      );
      if (newFiles.length < e.dataTransfer.files.length) {
        setLocalErrors((prev) => ({
          ...prev,
          licensesAndCertificates: t("addStable:errors.onlyFilesAllowed"),
        }));
        return;
      }
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      for (const file of newFiles) {
        if (file.size > maxFileSize) {
          setLocalErrors((prev) => ({
            ...prev,
            licensesAndCertificates: t("addStable:errors.fileTooLarge"),
          }));
          return;
        }
      }
      setFormData((prev) => ({
        ...prev,
        licensesAndCertificates: [...prev.licensesAndCertificates, ...newFiles],
      }));
      setLocalErrors((prev) => ({ ...prev, licensesAndCertificates: "" }));
      setErrors((prev) => ({ ...prev, licensesAndCertificates: "" }));
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

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      licensesAndCertificates: prev.licensesAndCertificates.filter((_, i) => i !== index),
    }));
    setLocalErrors((prev) => ({ ...prev, licensesAndCertificates: "" }));
    setErrors((prev) => ({ ...prev, licensesAndCertificates: "" }));
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = {
      images: "",
      licensesAndCertificates: "",
    };

    if (formData.images.length === 0) {
      newErrors.images = t("addStable:errors.imagesRequired");
      isValid = false;
    }

    setLocalErrors(newErrors);
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  return (
    <div className={isRTL ? "rtl" : "ltr"}>
      <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
        <Upload className={`text-gold ${isRTL ? "ml-2" : "mr-2"}`} size={28} />
        {t("addStable:mediaUpload")}
      </h2>
      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20 mb-6">
        <p className="text-gold font-medium">
          {t("addStable:mediaUploadDescription")}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addStable:images")} <span className="text-red-500">*</span>
        </label>
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center ${
            dragActive.images ? "border-indigo-500 bg-indigo-50" : localErrors.images ? "border-red-500" : "border-gray-300"
          }`}
          onDragEnter={(e) => handleDrag("images", e)}
          onDragLeave={(e) => handleDrag("images", e)}
          onDragOver={(e) => handleDrag("images", e)}
          onDrop={handleImageDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <Upload className="mx-auto text-gray-400 mb-2" size={36} />
            <p className="text-gray-700 font-medium">{t("addStable:dragDropImages")}</p>
            <p className="text-sm text-gray-500">{t("addStable:orBrowseImages")}</p>
            <Button
              variant="outline"
              className="rounded-xl mt-2 border-gold/20 bg-white hover:text-gold text-black hover:bg-gold/30"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                document.getElementById("stableImages")?.click();
              }}
            >
              {t("addStable:selectImages")}
            </Button>
            <input
              id="stableImages"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              onClick={(e) => e.stopPropagation()}
            />
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
                  alt={`${t("addStable:image")} ${index + 1}`}
                  className="w-full h-32 object-cover"
                  width={200}
                  height={128}
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

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addStable:licensesAndCertificates")}
        </label>
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center ${
            dragActive.files ? "border-indigo-500 bg-indigo-50" : localErrors.licensesAndCertificates ? "border-red-500" : "border-gray-300"
          }`}
          onDragEnter={(e) => handleDrag("files", e)}
          onDragLeave={(e) => handleDrag("files", e)}
          onDragOver={(e) => handleDrag("files", e)}
          onDrop={handleFileDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <FileText className="mx-auto text-gray-400 mb-2" size={36} />
            <p className="text-gray-700 font-medium">{t("addStable:dragDropFiles")}</p>
            <p className="text-sm text-gray-500">{t("addStable:orBrowseFiles")}</p>
            <Button
              variant="outline"
              className="rounded-xl mt-2 border-gold/20 bg-white hover:text-gold text-black hover:bg-gold/30"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                document.getElementById("stableFiles")?.click();
              }}
            >
              {t("addStable:selectFiles")}
            </Button>
            <input
              id="stableFiles"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              className="hidden"
              onChange={handleFileUpload}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {localErrors.licensesAndCertificates && (
            <p className="text-red-500 text-sm mt-2">{localErrors.licensesAndCertificates}</p>
          )}
        </div>
        {formData.licensesAndCertificates.length > 0 && (
          <div className="mt-4 space-y-2">
            {formData.licensesAndCertificates.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded-xl">
                <span className="text-sm truncate">{file.name}</span>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeFile(index)}
                  className="rounded-xl"
                >
                  {t("addStable:removeFile")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const validateStep = (formData, t, setErrors) => {
  let isValid = true;
  const newErrors = {
    images: "",
    licensesAndCertificates: "",
  };

  if (formData.images.length === 0) {
    newErrors.images = t("addStable:errors.imagesRequired");
    isValid = false;
  }

  setErrors((prev) => ({ ...prev, ...newErrors }));
  return isValid;
};