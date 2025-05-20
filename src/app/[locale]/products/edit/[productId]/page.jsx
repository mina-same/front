"use client";

import React, { useState, useEffect } from "react";
import Layout from "../../../../../../components/layout/Layout";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import { client, urlFor } from "../../../../../lib/sanity";
import { toast } from "@/components/ui new/sonner";
import { Package, Image, DollarSign, Tag, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

const categories = [
  { value: "feed_nutrition", label: { en: "Feed and Nutrition", ar: "الأعلاف والتغذية" } },
  { value: "tack_equipment", label: { en: "Tack and Equipment", ar: "الأدوات والمعدات" } },
  { value: "apparel_accessories", label: { en: "Apparel and Accessories", ar: "الملابس والإكسسوارات" } },
  { value: "health_wellness", label: { en: "Health and Wellness", ar: "الصحة والرفاهية" } },
  { value: "barn_stable", label: { en: "Barn and Stable Supplies", ar: "مستلزمات الإسطبل" } },
  { value: "riding_competition", label: { en: "Riding and Competition", ar: "الركوب والمنافسات" } },
  { value: "other", label: { en: "Other", ar: "أخرى" } },
];

// Utility function to generate a unique key
const generateKey = () => Math.random().toString(36).substr(2, 9);

export default function EditProduct() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { productId } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
    images: [],
    existingImages: [],
    price: "",
    listingType: "sell",
    stock: "",
    rentalDurationUnit: "",
    category: "",
  });
  const [localErrors, setLocalErrors] = useState({
    name_ar: "",
    name_en: "",
    price: "",
    rentalDurationUnit: "",
    images: "",
    category: "",
  });
  const [dragActive, setDragActive] = useState(false);

  // Fetch authenticated user and product data
  useEffect(() => {
    const verifyAuthAndFetchProduct = async () => {
      try {
        // Verify authentication
        const authResponse = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const authData = await authResponse.json();
        if (!authResponse.ok || !authData.authenticated) {
          throw new Error(t("addProduct:errors.userNotAuthenticated"));
        }

        const userId = authData.user.id;

        // Fetch product data including supplier reference
        const productQuery = `*[_type == "product" && _id == $productId][0]{
          _id,
          name_ar,
          name_en,
          description_ar,
          description_en,
          price,
          listingType,
          stock,
          rentalDurationUnit,
          category,
          supplier,
          images
        }`;
        const productData = await client.fetch(productQuery, { productId });

        if (!productData) {
          throw new Error(t("addProduct:errors.productNotFound"));
        }

        // Debug log to inspect fetched images
        console.log("Fetched product images:", productData.images);

        // Check if the authenticated user is the supplier of the product
        if (productData.supplier._ref !== userId) {
          throw new Error(t("addProduct:errors.unauthorizedEdit"));
        }

        setIsAuthenticated(true);

        setFormData({
          name_ar: productData.name_ar || "",
          name_en: productData.name_en || "",
          description_ar: productData.description_ar || "",
          description_en: productData.description_en || "",
          images: [],
          existingImages: productData.images || [],
          price: productData.price ? productData.price.toString() : "",
          listingType: productData.listingType || "sell",
          stock: productData.stock ? productData.stock.toString() : "",
          rentalDurationUnit: productData.rentalDurationUnit || "",
          category: productData.category || "",
        });
      } catch (error) {
        console.error("Error:", error.message);
        setError(error.message);
        router.push(`/login?error=${encodeURIComponent(error.message)}`);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuthAndFetchProduct();
  }, [productId, router, t]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? (value === "" ? "" : Number(value)) : value,
    }));
    setLocalErrors((prev) => ({ ...prev, [name]: "" }));
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
        return;
      }
    }

    if (validFiles.length < files.length) {
      setLocalErrors((prev) => ({
        ...prev,
        images: t("addProduct:onlyImagesAllowed"),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));
    setLocalErrors((prev) => ({ ...prev, images: "" }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setLocalErrors((prev) => ({ ...prev, images: "" }));
  };

  const removeExistingImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
    }));
  };

  const validateFormData = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name_ar.trim()) {
      newErrors.name_ar = t("addProduct:errors.nameArRequired");
      isValid = false;
    }
    if (!formData.name_en.trim()) {
      newErrors.name_en = t("addProduct:errors.nameEnRequired");
      isValid = false;
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      newErrors.price = t("addProduct:errors.priceRequired");
      isValid = false;
    }
    if (formData.listingType === "rent" && !formData.rentalDurationUnit) {
      newErrors.rentalDurationUnit = t("addProduct:errors.rentalDurationUnitRequired");
      isValid = false;
    }
    if (formData.images.length === 0 && formData.existingImages.length === 0) {
      newErrors.images = t("addProduct:errors.imagesRequired");
      isValid = false;
    }
    if (!formData.category) {
      newErrors.category = t("addProduct:errors.categoryRequired");
      isValid = false;
    }

    setLocalErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormData()) {
      toast.error(t("addProduct:errors.formInvalid"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new images to Sanity
      const imageAssets = [...formData.existingImages];
      for (const image of formData.images) {
        const imageAsset = await client.assets.upload("image", image, {
          filename: image.name,
        });
        imageAssets.push({
          _type: "image",
          _key: generateKey(),
          asset: {
            _type: "reference",
            _ref: imageAsset._id,
          },
        });
      }

      // Update product document
      const productData = {
        name_ar: formData.name_ar,
        name_en: formData.name_en,
        description_ar: formData.description_ar || "",
        description_en: formData.description_en || "",
        price: parseFloat(formData.price) || 0,
        listingType: formData.listingType,
        stock: formData.stock ? parseInt(formData.stock) : null,
        rentalDurationUnit: formData.listingType === "rent" ? formData.rentalDurationUnit : null,
        category: formData.category,
        images: imageAssets,
      };

      // Update product in Sanity
      await client
        .patch(productId)
        .set(productData)
        .commit();

      toast.success(t("addProduct:productUpdatedSuccess"));
      router.push("/profile?tab=supplier_products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(t("addProduct:errors.submissionFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-medium text-gray-600">{t("addProduct:loading")}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isRTL = i18n.language === "ar";

  return (
    <Layout>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {t("addProduct:authError")}: {error}
        </div>
      )}
      <div className={`container max-w-4xl py-8 px-4 sm:px-6 ${isRTL ? "rtl" : "ltr"}`}>
        <div className="mb-10 flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            {t("addProduct:editProduct")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("addProduct:productDescription")}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-12" encType="multipart/form-data">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gold/20">
            {/* Basic Information */}
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
              <Package className={`text-gold ${isRTL ? "ml-2" : "mr-2"}`} size={28} />
              {t("addProduct:basicInformation")}
            </h2>
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

            {/* Images and Category */}
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4 mt-12">
              <Image className={`text-gold ${isRTL ? "ml-2" : "mr-2"}`} size={28} />
              {t("addProduct:imagesCategory")}
            </h2>
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
                <p className="text-xs text-gray-500">{t("addProduct:imageRequirements")}</p>
              </div>
              {localErrors.images && (
                <p className="text-red-500 text-sm mt-2">{localErrors.images}</p>
              )}
            </div>
            {(formData.existingImages.length > 0 || formData.images.length > 0) && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-700 mb-3">
                  {t("addProduct:uploadedImages", {
                    count: formData.existingImages.length + formData.images.length,
                  })}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.existingImages.length > 0 ? (
                    formData.existingImages.map((image, index) => (
                      image && image.asset ? (
                        <div
                          key={`existing-${index}`}
                          className="relative group rounded-xl overflow-hidden border border-gray-200"
                        >
                          <Image
                            width={200}
                            height={200}
                            src={urlFor(image.asset).width(200).height(200).url()}
                            alt={`${t("addProduct:image")} ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeExistingImage(index)}
                            className={`absolute top-1 ${
                              isRTL ? "left-1" : "right-1"
                            } bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
                          >
                            <X size={18} />
                          </Button>
                          <div className="p-2 text-xs truncate bg-white">Existing Image</div>
                        </div>
                      ) : null
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">{t("addProduct:noImagesAvailable")}</p>
                  )}
                  {formData.images.map((image, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative group rounded-xl overflow-hidden border border-gray-200"
                    >
                      <Image
                        width={200} 
                        height={200}
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
            {/* Pricing and Stock */}
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4 mt-12">
              <DollarSign className={`text-gold ${isRTL ? "ml-2" : "mr-2"}`} size={28} />
              {t("addProduct:pricingStock")}
            </h2>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                {t("addProduct:listingType")} <span className="text-red-500">*</span>
              </label>
              <select
                name="listingType"
                value={formData.listingType}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-xl border-gray-300"
                required
              >
                <option value="sell">{t("addProduct:forSale")}</option>
                <option value="rent">{t("addProduct:forRent")}</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                {t("addProduct:price")} (SAR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 ${
                    isRTL ? "left-5" : "right-5"
                  } pl-3 flex items-center pointer-events-none`}
                >
                  <span className="text-gray-500">SAR</span>
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full p-3 ${isRTL ? "pl-12" : "pr-12"} border rounded-xl ${
                    localErrors.price ? "border-red-500" : "border-gray-300"
                  }`}
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
                {formData.listingType === "rent"
                  ? t("addProduct:pricePerRental")
                  : t("addProduct:priceForSale")}
              </p>
            </div>
            {formData.listingType === "rent" && (
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  {t("addProduct:rentalDurationUnit")} <span className="text-red-500">*</span>
                </label>
                <select
                  name="rentalDurationUnit"
                  value={formData.rentalDurationUnit}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-xl ${
                    localErrors.rentalDurationUnit ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                >
                  <option value="">{t("addProduct:selectRentalDuration")}</option>
                  <option value="hour">{t("addProduct:perHour")}</option>
                  <option value="day">{t("addProduct:perDay")}</option>
                  <option value="week">{t("addProduct:perWeek")}</option>
                  <option value="month">{t("addProduct:perMonth")}</option>
                  <option value="year">{t("addProduct:perYear")}</option>
                </select>
                {localErrors.rentalDurationUnit && (
                  <p className="text-red-500 text-sm mt-1">{localErrors.rentalDurationUnit}</p>
                )}
              </div>
            )}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                {t("addProduct:stock")}
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-xl border-gray-300"
                placeholder={t("addProduct:stockPlaceholder")}
                min="0"
                step="1"
              />
              <p className="text-sm text-gray-500 mt-1">{t("addProduct:stockNote")}</p>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl flex items-center gap-2 bg-black hover:bg-black/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-xl border-2 border-white border-t-transparent"></div>
                  <span>{t("addProduct:submitting")}</span>
                </>
              ) : (
                <>
                  <span>{t("addProduct:saveChanges")}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}