"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "../../../../components/ui new/sonner";
import ProductStepIndicator from "./ProductStepIndicator";
import ProductFormNavigation from "./ProductFormNavigation";
import ProductBasicInfoStep from "./ProductBasicInfoStep";
import ProductImagesStep from "./ProductImagesStep";
import ProductPricingStep from "./ProductPricingStep";
import { useTranslation } from "react-i18next";
import { client } from "../../../../lib/sanity";
import { useRouter } from "next/navigation";

// Utility function to generate a unique key
const generateKey = () => Math.random().toString(36).substr(2, 9);

const FORM_STEPS = [
  "addProduct:basicInformation",
  "addProduct:imagesCategory",
  "addProduct:pricingStock",
];

const defaultFormData = {
  name_ar: "",
  name_en: "",
  description_ar: "",
  description_en: "",
  images: [],
  price: "",
  listingType: "sell",
  stock: "",
  rentalDurationUnit: "",
  category: "",
};

export default function ProductFormWizard() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch authenticated user ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (response.ok && data.authenticated) {
          setUserId(data.user.id);
        } else {
          throw new Error(t("addProduct:errors.userNotAuthenticated"));
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        toast.error(error.message);
      }
    };
    fetchUser();
  }, [t]);

  const validateFormData = () => {
    const newErrors = {};

    if (!formData.name_ar.trim()) {
      newErrors.name_ar = t("addProduct:errors.nameArRequired");
    }
    if (!formData.name_en.trim()) {
      newErrors.name_en = t("addProduct:errors.nameEnRequired");
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      newErrors.price = t("addProduct:errors.priceRequired");
    }
    if (formData.listingType === "rent" && !formData.rentalDurationUnit) {
      newErrors.rentalDurationUnit = t("addProduct:errors.rentalDurationUnitRequired");
    }
    if (formData.images.length === 0) {
      newErrors.images = t("addProduct:errors.imagesRequired");
    }
    if (!formData.category) {
      newErrors.category = t("addProduct:errors.categoryRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep !== FORM_STEPS.length) {
      return;
    }

    if (!validateFormData()) {
      toast.error(t("addProduct:errors.formInvalid"));
      return;
    }

    if (!userId) {
      toast.error(t("addProduct:errors.userNotAuthenticated"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images to Sanity
      const imageAssets = [];
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

      // Create product document
      const productData = {
        _type: "product",
        name_ar: formData.name_ar,
        name_en: formData.name_en,
        description_ar: formData.description_ar || "",
        description_en: formData.description_en || "",
        price: parseFloat(formData.price) || 0,
        listingType: formData.listingType,
        stock: formData.stock ? parseInt(formData.stock) : null,
        rentalDurationUnit: formData.listingType === "rent" ? formData.rentalDurationUnit : null,
        category: formData.category,
        supplier: {
          _type: "reference",
          _ref: userId,
        },
        images: imageAssets,
      };

      // Save product to Sanity
      await client.create(productData);

      toast.success(t("addProduct:productCreatedSuccess"));
      setFormData(defaultFormData);
      setCurrentStep(1);
      setErrors({});
      router.push("/profile?tab=supplier_products"); // Redirect to supplier products tab
    } catch (error) {
      console.error("Error submitting product to Sanity:", error);
      toast.error(t("addProduct:errors.submissionFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define renderStep inside the component to access currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProductBasicInfoStep
            formData={formData}
            setFormData={setFormData}
            setErrors={setErrors}
          />
        );
      case 2:
        return (
          <ProductImagesStep
            formData={formData}
            setFormData={setFormData}
            setErrors={setErrors}
          />
        );
      case 3:
        return (
          <ProductPricingStep
            formData={formData}
            setFormData={setFormData}
            setErrors={setErrors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`container max-w-4xl py-8 px-4 sm:px-6 ${
        i18n.language === "ar" ? "rtl" : "ltr"
      }`}
    >
      <div className="mb-10 flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">
          {t("addProduct:addNewProduct")}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("addProduct:productDescription")}
        </p>
      </div>
      <ProductStepIndicator
        currentStep={currentStep}
        steps={FORM_STEPS.map((step) => t(step))}
      />
      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-12"
        encType="multipart/form-data"
      >
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gold/20">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: i18n.language === "ar" ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: i18n.language === "ar" ? -30 : 30 }}
              transition={{ duration: 0.35 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
        <ProductFormNavigation
          currentStep={currentStep}
          totalSteps={FORM_STEPS.length}
          onPrev={() => setCurrentStep((s) => Math.max(s - 1, 1))}
          onNext={() => setCurrentStep((s) => Math.min(s + 1, FORM_STEPS.length))}
          isLastStep={currentStep === FORM_STEPS.length}
          isSubmitting={isSubmitting}
          formData={formData}
          setErrors={setErrors}
        />
      </form>
    </div>
  );
}