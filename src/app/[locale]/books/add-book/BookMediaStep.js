"use client";

import { Upload, FileText, Image } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { useTranslation } from "react-i18next";

export default function BookMediaStep({ formData, setFormData, setErrors }) {
  const { t, i18n } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [localErrors, setLocalErrors] = useState({
    file: "",
    accessLink: "",
    images: "",
  });
  const isRTL = i18n.language === "ar";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalErrors((prev) => ({ ...prev, [name]: "" }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateURL = (url) => {
    if (!url) return true; // Empty URL is valid (optional if file is provided)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxFileSize) {
        setLocalErrors((prev) => ({
          ...prev,
          file: t("addBook:fileTooLarge"),
        }));
        return;
      }
      if (!["application/pdf", "application/epub+zip"].includes(file.type)) {
        setLocalErrors((prev) => ({
          ...prev,
          file: t("addBook:onlyPDFAndEPUBAllowed"),
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        file,
        accessLink: "", // Clear accessLink if file is selected
      }));
      setLocalErrors((prev) => ({ ...prev, file: "", accessLink: "" }));
      setErrors((prev) => ({ ...prev, file: "", accessLink: "" }));
      e.stopPropagation();
      e.preventDefault();
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
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxFileSize) {
        setLocalErrors((prev) => ({
          ...prev,
          file: t("addBook:fileTooLarge"),
        }));
        return;
      }
      if (!["application/pdf", "application/epub+zip"].includes(file.type)) {
        setLocalErrors((prev) => ({
          ...prev,
          file: t("addBook:onlyPDFAndEPUBAllowed"),
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        file,
        accessLink: "", // Clear accessLink if file is selected
      }));
      setLocalErrors((prev) => ({ ...prev, file: "", accessLink: "" }));
      setErrors((prev) => ({ ...prev, file: "", accessLink: "" }));
      return false;
    }
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (newImages.length < e.target.files.length) {
        setLocalErrors((prev) => ({
          ...prev,
          images: t("addBook:onlyImagesAllowed"),
        }));
        return;
      }
      const maxFileSize = 10 * 1024 * 1024; // 10MB for images
      for (const image of newImages) {
        if (image.size > maxFileSize) {
          setLocalErrors((prev) => ({
            ...prev,
            images: t("addBook:imageTooLarge"),
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

  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
    setLocalErrors((prev) => ({ ...prev, images: "" }));
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = { file: "", accessLink: "", images: "" };

    if (formData.images.length === 0) {
      newErrors.images = t("addBook:errors.imagesRequired");
      isValid = false;
    }
    if (!formData.file && !formData.accessLink) {
      newErrors.file = t("addBook:errors.fileOrLinkRequired");
      newErrors.accessLink = t("addBook:errors.fileOrLinkRequired");
      isValid = false;
    }
    if (formData.file && formData.accessLink) {
      newErrors.file = t("addBook:errors.fileOrLinkExclusive");
      newErrors.accessLink = t("addBook:errors.fileOrLinkExclusive");
      isValid = false;
    }
    if (formData.accessLink && !validateURL(formData.accessLink)) {
      newErrors.accessLink = t("addBook:errors.invalidLink");
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
        {t("addBook:mediaFileUpload")}
      </h2>
      <div className="p-4 bg-blue-50 rounded-xl border border-gold/20 mb-6">
        <p className="text-gold font-medium">
          {t("addBook:mediaUploadDescription")}
        </p>
      </div>

      {/* Book File Upload */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addBook:bookFile")}
        </label>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center ${
            dragActive
              ? "border-indigo-500 bg-indigo-50"
              : localErrors.file
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
              <FileText className="h-8 w-8 text-gold" />
            </div>
            <div className="text-gray-700">
              <p className="font-medium">{t("addBook:dragDrop")}</p>
              <p className="text-sm text-gray-500">{t("addBook:orBrowse")}</p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl mt-2 border-gold/20 bg-white hover:text-gold text-black hover:bg-gold/30"
              onClick={() => document.getElementById("bookFile")?.click()}
            >
              {t("addBook:selectFile")}
            </Button>
            <input
              id="bookFile"
              type="file"
              accept=".pdf,.epub"
              className="hidden"
              onChange={handleFileChange}
            />
            {formData.file && (
              <p className="text-sm text-green-600 mt-2">
                {t("addBook:selectedFile")}: {formData.file.name}
              </p>
            )}
            {localErrors.file && (
              <p className="text-red-500 text-sm mt-2">{localErrors.file}</p>
            )}
          </div>
        </div>
      </div>

      {/* Book Cover Images */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addBook:bookCoverImages")} <span className="text-red-500">*</span>
        </label>
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center ${
            localErrors.images ? "border-red-500" : "border-gray-300"
          }`}
        >
          <Upload className="mx-auto text-gray-400 mb-2" size={36} />
          <p className="text-gray-500 mb-2">{t("addBook:uploadCoverImages")}</p>
          <input
            type="file"
            id="bookImages"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
          />
          <Button
            variant="outline"
            className="rounded-xl mt-2 border-gold/20 bg-white hover:text-gold text-black hover:bg-gold/30"
            onClick={() => document.getElementById("bookImages")?.click()}
          >
            {t("addBook:selectImages")}
          </Button>
          {localErrors.images && (
            <p className="text-red-500 text-sm mt-2">{localErrors.images}</p>
          )}
        </div>

        {formData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative border rounded-xl overflow-hidden group">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`${t("addBook:cover")} ${index + 1}`}
                  className="w-full h-32 object-cover"
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

      {/* Access Link */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {t("addBook:accessLink")}
        </label>
        <input
          type="url"
          name="accessLink"
          value={formData.accessLink}
          onChange={handleInputChange}
          className={`rounded-xl w-full p-3 border ${
            localErrors.accessLink ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="https://example.com/your-book"
          disabled={!!formData.file} // Disable if file is selected
        />
        <p className="text-sm text-gray-500 mt-1">
          {t("addBook:accessLinkDescription")}
        </p>
        {localErrors.accessLink && (
          <p className="text-red-500 text-sm mt-1">{localErrors.accessLink}</p>
        )}
      </div>
    </div>
  );
}

// Export validateStep as a named export
export const validateStep = (formData, t, setErrors) => {
  let isValid = true;
  const newErrors = { file: "", accessLink: "", images: "" };

  if (formData.images.length === 0) {
    newErrors.images = t("addBook:errors.imagesRequired");
    isValid = false;
  }
  if (!formData.file && !formData.accessLink) {
    newErrors.file = t("addBook:errors.fileOrLinkRequired");
    newErrors.accessLink = t("addBook:errors.fileOrLinkRequired");
    isValid = false;
  }
  if (formData.file && formData.accessLink) {
    newErrors.file = t("addBook:errors.fileOrLinkExclusive");
    newErrors.accessLink = t("addBook:errors.fileOrLinkExclusive");
    isValid = false;
  }
  if (formData.accessLink) {
    try {
      new URL(formData.accessLink);
    } catch {
      newErrors.accessLink = t("addBook:errors.invalidLink");
      isValid = false;
    }
  }

  setErrors((prev) => ({ ...prev, ...newErrors }));
  return isValid;
};
